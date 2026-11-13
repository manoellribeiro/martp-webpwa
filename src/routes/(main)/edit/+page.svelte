<script lang="ts">
	import logo from '#lib/assets/martp_logo.svg';
	import {
		getArtStylePreference,
		getColorPalettePreference,
		getMapZoomPreference,
		setColorPalettePreference,
		setMapArtStylePreference,
		setMapZoomPreference
	} from '#lib/data/artSettings.ts';
	import {
		sliderPositionToZoom,
		zoomToSliderPosition,
		type SketchArtType
	} from '#lib/domain/sketchArtType.ts';
	import { artStyleModels } from '#lib/features/artStyleSettings/mapArtStyleModels.ts';
	import SelectableCard from '#lib/features/artStyleSettings/SelectableCard.svelte';
	import { mainViewModel } from '#lib/features/main/main.viewmodel.svelte.ts';
	import { strings } from '#lib/strings.ts';

	// Port of ArtStyleSettingsFragment and the art style parts of MainViewModel. The settings
	// come from localStorage synchronously; only the color palettes, which come from the
	// Martp API (or its localStorage cache), are loaded by the main view model, and their
	// section shows a loading indicator until they arrive.
	// The app saves each change after 1.5s without changes; localStorage writes are cheap,
	// so they are saved right away and a new art never starts from stale settings.

	let selectedArtStyle = $state(getArtStylePreference());
	const colorPalettes = $derived(mainViewModel.colorPalettes);
	/** The palette tapped on this screen; until then the saved one, or the first. */
	let chosenColorPalette = $state<string | null>(null);
	const selectedColorPalette = $derived.by(() => {
		if (chosenColorPalette) return chosenColorPalette;
		const savedColorPaletteName = getColorPalettePreference();
		return (
			colorPalettes?.find((colorPalette) => colorPalette.name === savedColorPaletteName)?.name ??
			colorPalettes?.[0].name ??
			null
		);
	});

	mainViewModel.loadColorPalettes();
	// The slider holds its position (0..1) instead of the zoom itself, so switching to an
	// art style with another zoom range keeps the thumb where it was
	let sliderPosition = $state(zoomToSliderPosition(getArtStylePreference(), getMapZoomPreference()));

	$effect(() => {
		setMapZoomPreference(sliderPositionToZoom(selectedArtStyle, sliderPosition));
	});

	function setMapStyle(sketchArtType: SketchArtType) {
		selectedArtStyle = sketchArtType;
		setMapArtStylePreference(sketchArtType);
	}

	function setColorPalette(name: string) {
		chosenColorPalette = name;
		setColorPalettePreference(name);
	}
</script>

<div class="art-style-settings">
	<header class="header">
		<img class="logo" src={logo} alt={strings.app_name} />
		<h1 class="text-screen-title title">{strings.art_settings}</h1>
		<p class="text-middle-screen-info subtitle">{strings.customize_next_art}</p>
	</header>

	<section class="section map-zoom">
		<h2 class="text-screen-title section-title">{strings.map_zoom}</h2>
		<p class="text-middle-screen-info section-description">{strings.control_map_zoom}</p>
		<input
			class="slider"
			type="range"
			min="0"
			max="1"
			step="any"
			aria-label={strings.map_zoom}
			style:--slider-position={sliderPosition}
			bind:value={sliderPosition}
		/>
		<div class="slider-labels">
			<span class="text-middle-screen-info section-description">{strings.far}</span>
			<span class="text-middle-screen-info section-description">{strings.close}</span>
		</div>
	</section>

	<section class="section">
		<h2 class="text-screen-title section-title">{strings.art_style}</h2>
		<p class="text-middle-screen-info section-description list-description">
			{strings.choose_visual_style}
		</p>
		<div class="cards" role="radiogroup" aria-label={strings.art_style}>
			{#each artStyleModels as mapArtStyle (mapArtStyle.sketchArtType)}
				{@const isSelected = mapArtStyle.sketchArtType === selectedArtStyle}
				<SelectableCard
					name="art-style"
					value={mapArtStyle.sketchArtType}
					selected={isSelected}
					padding={[8, 8]}
					onselect={() => setMapStyle(mapArtStyle.sketchArtType)}
				>
					<span class="art-style-icon-box" class:selected={isSelected}>
						<span class="art-style-icon" style:--icon={`url("${mapArtStyle.icon}")`}></span>
					</span>
					<span class="art-style-texts">
						<span class="text-screen-title card-title">{strings[mapArtStyle.titleId]}</span>
						<span class="text-middle-screen-info card-description">
							{strings[mapArtStyle.descriptionId]}
						</span>
					</span>
				</SelectableCard>
			{/each}
		</div>
	</section>

	{#if selectedArtStyle === 'COLORFUL_MAP'}
		<section class="section">
			<h2 class="text-screen-title section-title">{strings.color_palette}</h2>
			<p class="text-middle-screen-info section-description list-description">
				{strings.choose_complete_color_set}
			</p>
			{#if !colorPalettes}
				<p class="color-palettes-loading" role="status">
					<span class="spinner" aria-hidden="true"></span>
					{strings.loading_color_palettes}
				</p>
			{:else}
				<div class="cards" role="radiogroup" aria-label={strings.color_palette}>
					{#each colorPalettes as colorPalette (colorPalette.name)}
						<SelectableCard
							name="color-palette"
							value={colorPalette.name}
							selected={colorPalette.name === selectedColorPalette}
							padding={[12, 12]}
							onselect={() => setColorPalette(colorPalette.name)}
						>
							<span class="color-palette">
								<span class="text-screen-title card-title color-palette-name">{colorPalette.name}</span>
								<span class="colors">
									{#each colorPalette.colors as color, index (index)}
										<span class="color" style:background={color}></span>
									{/each}
								</span>
							</span>
						</SelectableCard>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.color-palettes-loading {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 16px 0 0;
		color: var(--dark-d4);
		font-size: 14px;
	}

	.spinner {
		width: 20px;
		height: 20px;
		box-sizing: border-box;
		border: 2.5px solid var(--light-l1);
		border-top-color: var(--blue);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.header {
		padding-top: 16px;
	}

	.logo {
		display: block;
		width: 100px;
		height: 50px;
		margin-left: 11px;
	}

	.title {
		padding: 0 16px;
		font-size: 20px;
	}

	.subtitle {
		padding-left: 16px;
		color: var(--dark-d4);
	}

	.section {
		padding: 16px 16px 0;
	}

	.map-zoom {
		padding-top: 8px;
	}

	.section-title {
		font-size: 18px;
	}

	.section-description {
		color: var(--dark-d4);
	}

	.list-description {
		padding: 4px 0;
	}

	/* Material 3 Slider: 20px thumb on a 4px track */
	.slider {
		--active-track: var(--yellow) calc(var(--slider-position) * 100%);
		--inactive-track: var(--light-l1) calc(var(--slider-position) * 100%);
		display: block;
		width: 100%;
		height: 48px;
		margin: 0;
		background: transparent;
		appearance: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(to right, var(--active-track), var(--inactive-track));
	}

	.slider::-moz-range-track {
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(to right, var(--active-track), var(--inactive-track));
	}

	.slider::-webkit-slider-thumb {
		width: 20px;
		height: 20px;
		margin-top: -8px;
		border: none;
		border-radius: 50%;
		background: var(--yellow);
		appearance: none;
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border: none;
		border-radius: 50%;
		background: var(--yellow);
	}

	.slider:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.cards:last-child {
		padding-bottom: 8px;
	}

	.art-style-icon-box {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: var(--light-l1);
		color: var(--dark-d4);
	}

	.art-style-icon-box.selected {
		background: var(--light-yellow);
		color: var(--yellow);
	}

	/* Icon tint: the drawable is a mask over the current color. The URL is quoted because
	   Vite inlines small SVGs as data URLs, which contain quotes. */
	.art-style-icon {
		width: 28px;
		height: 28px;
		background: currentColor;
		-webkit-mask: var(--icon) center / contain no-repeat;
		mask: var(--icon) center / contain no-repeat;
	}

	.art-style-texts {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 0 4px 0 8px;
	}

	.card-title {
		font-size: 14px;
	}

	.card-description {
		font-size: 12px;
		color: var(--dark-d4);
	}

	.color-palette {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.color-palette-name {
		padding-bottom: 8px;
	}

	.colors {
		display: flex;
		gap: 8px;
		overflow: hidden;
	}

	.color {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}
</style>
