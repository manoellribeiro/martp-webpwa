<script lang="ts">
	import colorfulMapIcon from '#lib/assets/ic_colorful_map.svg';
	import pointillismIcon from '#lib/assets/ic_pointllism.svg';
	import logo from '#lib/assets/martp_logo.svg';
	import {
		getArtStylePreference,
		getColorPalettePreference,
		getMapZoomPreference,
		setColorPalettePreference,
		setMapArtStylePreference,
		setMapZoomPreference
	} from '#lib/data/artSettings.ts';
	import { colorPaletteByNameOrDefault, colorPalettes } from '#lib/domain/colorPalettes.ts';
	import {
		sliderPositionToZoom,
		zoomToSliderPosition,
		type SketchArtType
	} from '#lib/domain/sketchArtType.ts';
	import SelectableCard from '#lib/features/artStyleSettings/SelectableCard.svelte';
	import { strings, type Strings } from '#lib/strings.ts';

	// Port of ArtStyleSettingsFragment and the art style parts of MainViewModel. The app's
	// loading state is not needed: the settings come from localStorage synchronously.
	// The app saves each change after 1.5s without changes; localStorage writes are cheap,
	// so they are saved right away and a new art never starts from stale settings.

	interface MapArtStyleModel {
		titleId: keyof Strings;
		descriptionId: keyof Strings;
		icon: string;
		sketchArtType: SketchArtType;
	}

	// The app also lists WATER_FLOW and PARTICLE_SYSTEM, commented out as work in progress.
	const mapArtStyles: MapArtStyleModel[] = [
		{ titleId: 'classic', descriptionId: 'classic_description', icon: logo, sketchArtType: 'DEFAULT' },
		{
			titleId: 'colorful_map',
			descriptionId: 'colorful_map_description',
			icon: colorfulMapIcon,
			sketchArtType: 'COLORFUL_MAP'
		},
		{
			titleId: 'pointillism',
			descriptionId: 'pointillism_colorful_description',
			icon: pointillismIcon,
			sketchArtType: 'POINTILLISM'
		}
	];

	let selectedArtStyle = $state(getArtStylePreference());
	let selectedColorPalette = $state(colorPaletteByNameOrDefault(getColorPalettePreference()).name);
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
		selectedColorPalette = name;
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
			{#each mapArtStyles as mapArtStyle (mapArtStyle.sketchArtType)}
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
		</section>
	{/if}
</div>

<style>
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
		flex-direction: column;
		min-width: 0;
	}

	.color-palette-name {
		padding-bottom: 8px;
	}

	.colors {
		display: flex;
		gap: 8px;
		overflow-x: auto;
	}

	.color {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}
</style>
