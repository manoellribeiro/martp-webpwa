<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import errorImage from '#lib/assets/ic_error_general.svg';
	import MartpButton from '#lib/components/MartpButton.svelte';
	import { colorPaletteByNameOrDefault } from '#lib/domain/colorPalettes.ts';
	import { CreateNewMapArtViewModel } from '#lib/features/createNewMapArt/createNewMapArt.viewmodel.svelte.ts';
	import { startColorfulMapSketch, type ColorLayerHolder } from '#lib/sketches/colorfulMapSketch.ts';
	import { startDefaultMartpSketch } from '#lib/sketches/defaultMartpSketch.ts';
	import type { MartpSketch } from '#lib/sketches/martpSketch.ts';
	import { startPointillismMartpSketch } from '#lib/sketches/pointillismMartpSketch.ts';
	import { strings, type Strings } from '#lib/strings.ts';

	// Port of CreateNewMapArtActivity + activity_create_new_map_art.xml.
	const viewModel = new CreateNewMapArtViewModel();
	const uiState = $derived(viewModel.state);

	let mapArtsContainer: HTMLElement;
	let sketch: MartpSketch | null = null;
	let colorLayerHolder = $state<ColorLayerHolder | null>(null);
	// Measured once, like the app does in doOnLayout: "try again" reuses it while the
	// container is hidden. Canvas pixels are device pixels, as on Android.
	let canvasWidth = 0;
	let canvasHeight = 0;
	let openedFromTheApp = false;

	afterNavigate(({ from }) => {
		openedFromTheApp ||= from != null;
	});

	onMount(() => {
		canvasWidth = Math.round(mapArtsContainer.clientWidth * devicePixelRatio);
		canvasHeight = Math.round(mapArtsContainer.clientHeight * devicePixelRatio);
		startToGenerateMapArt();
		return () => viewModel.clear();
	});

	function startToGenerateMapArt() {
		viewModel.startToGenerateMapArt(canvasWidth, canvasHeight);
	}

	// handleImageDownloadedState: starts the sketch of the chosen art style.
	$effect(() => {
		if (uiState.type !== 'imageDownloaded') return;
		const options = { canvasWidth, canvasHeight, imageUrl: uiState.staticMapImageUrl };
		const newSketch = (() => {
			switch (uiState.sketchArtType) {
				case 'DEFAULT':
					return startDefaultMartpSketch(mapArtsContainer, options);
				case 'POINTILLISM':
					return startPointillismMartpSketch(mapArtsContainer, options);
				case 'COLORFUL_MAP':
					return startColorfulMapSketch(mapArtsContainer, {
						...options,
						colorPalette: colorPaletteByNameOrDefault(uiState.colorPalette),
						onColorsShuffled: (holder) => (colorLayerHolder = holder)
					});
			}
		})();
		sketch = newSketch;
		return () => {
			newSketch.remove();
			sketch = null;
			colorLayerHolder = null;
		};
	});

	interface MapLayer {
		nameId: keyof Strings;
		color: string;
	}

	// The "color legend" lines (layout_map_layer_line.xml).
	const mapLayers: MapLayer[] = $derived.by(() => {
		if (uiState.type !== 'imageDownloaded') return [];
		if (uiState.sketchArtType !== 'COLORFUL_MAP') {
			return [
				{ nameId: 'layer_roads_bridges_footpaths', color: 'var(--blue)' },
				{ nameId: 'layer_everything_else', color: 'var(--yellow)' }
			];
		}
		if (!colorLayerHolder) return [];
		const layers: [string | null, keyof Strings][] = [
			[colorLayerHolder.buildingColor, 'layer_buildings'],
			[colorLayerHolder.buildingStrokeColor, 'layer_building_delimitations'],
			[colorLayerHolder.waterColor, 'layer_water'],
			[colorLayerHolder.roadsColor, 'layer_roads_tunnels_bridges'],
			[colorLayerHolder.roadsPathColor, 'layer_road_paths'],
			[colorLayerHolder.landOthersColor, 'layer_land_other']
		];
		return layers
			.filter((layer): layer is [string, keyof Strings] => layer[0] != null)
			.map(([color, nameId]) => ({ nameId, color }));
	});

	const title = $derived.by(() => {
		switch (uiState.type) {
			case 'idle':
				return strings.create_new_art;
			case 'loading':
				return strings.we_are_generating_your_art;
			case 'imageDownloaded':
				return strings.this_is_your_new_art;
			case 'error':
				return null;
		}
	});

	/** The app shows every decimal; five (about 1m) are enough. */
	function formatCoordinate(coordinate: number): string {
		return coordinate.toFixed(5);
	}

	async function saveArt() {
		const currentSketch = sketch;
		if (!currentSketch) return;
		if (await viewModel.saveArt((fileName) => currentSketch.save(fileName))) finish();
	}

	/** Activity.finish(): back to the screen that opened this one. */
	function finish() {
		if (openedFromTheApp) history.back();
		else goto('/', { replaceState: true });
	}
</script>

<div class="create-new-map-art">
	{#if title}
		<h1 class="text-screen-title title">{title}</h1>
	{/if}

	<div
		class="map-arts-container"
		class:invisible={uiState.type === 'idle'}
		class:gone={uiState.type === 'loading' || uiState.type === 'error'}
		bind:this={mapArtsContainer}
	></div>

	{#if uiState.type === 'loading' || uiState.type === 'error'}
		<div class="state-error-space"></div>
	{/if}

	{#if uiState.type === 'error'}
		<img class="error-image" src={errorImage} alt="" />
		<p class="text-middle-screen-info error-text" role="alert">
			{strings[uiState.failure.messageToBeDisplayedToUserId]}
		</p>
	{/if}

	{#if uiState.type === 'imageDownloaded'}
		{#if uiState.title}
			<p class="text-title city-country">{uiState.title}</p>
		{/if}
		<p class="text-gray-subtitle art-detail">
			{strings.latitude_value.replace('%s', formatCoordinate(uiState.latitude))}
		</p>
		<p class="text-gray-subtitle art-detail">
			{strings.longitude_value.replace('%s', formatCoordinate(uiState.longitude))}
		</p>
		{#if uiState.sketchArtType === 'COLORFUL_MAP'}
			<p class="text-gray-subtitle art-detail">
				{strings.color_palette_value.replace('%s', uiState.colorPalette ?? '')}
			</p>
		{/if}

		<h2 class="text-title map-layers-title">{strings.color_legend}</h2>
		{#if uiState.sketchArtType === 'COLORFUL_MAP'}
			<p class="text-gray-subtitle map-layers-subtitle">{strings.tap_map_to_shuffle_colors}</p>
		{/if}
		<ul class="map-colors-holders">
			{#each mapLayers as mapLayer (mapLayer.nameId)}
				<li class="map-layer-line">
					<span class="color-holder" style:background={mapLayer.color}></span>
					<span class="text-gray-subtitle layer-name">{strings[mapLayer.nameId]}</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#if uiState.type === 'loading'}
		<!-- The app plays the loading_globe Lottie animation here. -->
		<div class="loading-indicator" role="progressbar" aria-label={strings[uiState.loadingMessageId]}>
			<span class="spinner"></span>
		</div>
		<p class="text-gray-subtitle loading-message">{strings[uiState.loadingMessageId]}</p>
	{/if}

	<div class="space"></div>

	{#if uiState.type === 'error'}
		<div class="action">
			<MartpButton title={strings.try_again} cornerRadius={50} onclick={startToGenerateMapArt} />
		</div>
	{:else if uiState.type === 'imageDownloaded'}
		<div class="action">
			<MartpButton
				title={strings.save_art}
				cornerRadius={50}
				loading={viewModel.isActionButtonLoading}
				onclick={saveArt}
			/>
		</div>
	{/if}
</div>

<style>
	.create-new-map-art {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
		background: var(--light-cream);
	}

	.title {
		margin: 16px auto;
		padding: 0 16px;
		text-align: center;
	}

	.map-arts-container {
		flex-shrink: 0;
		height: 200px;
		margin: 0 16px;
		overflow: hidden;
		background: var(--dark-d5);
	}

	.map-arts-container :global(canvas) {
		display: block;
	}

	.invisible {
		visibility: hidden;
	}

	.gone {
		display: none;
	}

	.state-error-space {
		flex: 0.5;
	}

	.error-image {
		align-self: center;
		width: 150px;
		height: 150px;
		margin-top: 56px;
	}

	.error-text {
		margin: 16px 16px 0;
		font-size: 12px;
		text-align: center;
	}

	.city-country {
		margin: 8px 16px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.art-detail {
		margin: 0 16px;
	}

	.map-layers-title {
		margin: 8px 16px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.map-layers-subtitle {
		margin: 0 16px;
	}

	.map-colors-holders {
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
	}

	.map-layer-line {
		display: flex;
		align-items: center;
		padding: 0 16px 8px;
	}

	/* background_map_layer_color_holder.xml */
	.color-holder {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}

	.layer-name {
		margin: 0 8px;
	}

	.loading-indicator {
		display: grid;
		place-items: center;
		align-self: center;
		width: 150px;
		height: 150px;
	}

	.spinner {
		width: 64px;
		height: 64px;
		border: 4px solid var(--blue);
		border-top-color: var(--dark-d4);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-message {
		align-self: center;
	}

	.space {
		flex: 1;
	}

	.action {
		margin: 8px 16px;
	}
</style>
