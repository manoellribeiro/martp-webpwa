<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import errorImage from '#lib/assets/ic_error_general.svg';
	import MartpButton from '#lib/components/MartpButton.svelte';
	import type { UserInfo } from '#lib/data/userInfo.ts';
	import { CreateNewMapArtViewModel } from '#lib/features/createNewMapArt/createNewMapArt.viewmodel.svelte.ts';
	import { startColorfulMapSketch, type ColorLayerHolder } from '#lib/sketches/colorfulMapSketch.ts';
	import { startDefaultMartpSketch } from '#lib/sketches/defaultMartpSketch.ts';
	import { MAX_CANVAS_SIZE, type MartpSketch } from '#lib/sketches/martpSketch.ts';
	import { startPointillismMartpSketch } from '#lib/sketches/pointillismMartpSketch.ts';
	import { setSavedArt } from '#lib/features/success/savedArt.ts';
	import SetUserInfoBottomSheet from '#lib/features/userInfoBottomSheet/SetUserInfoBottomSheet.svelte';
	import { strings, type Strings } from '#lib/strings.ts';

	// Port of CreateNewMapArtActivity + activity_create_new_map_art.xml.
	const viewModel = new CreateNewMapArtViewModel();
	const uiState = $derived(viewModel.state);

	let mapArtsContainer: HTMLElement;
	let sketch: MartpSketch | null = null;
	let colorLayerHolder = $state<ColorLayerHolder | null>(null);
	let isSetUserInfoBottomSheetOpen = $state(false);
	// Measured once, like the app does in doOnLayout: "try again" reuses it while the
	// container is hidden. Canvas pixels are device pixels, as on Android.
	let canvasWidth = 0;
	let canvasHeight = 0;
	// The art's ratio once measured. Before that the box is the layout's 200px tall.
	let artAspectRatio = $state<string | null>(null);

	// The app's art is 200dp tall at any width. Here the height grows with the width in a
	// landscape ratio, so big screens get bigger arts; phones keep the 200px minimum.
	const ART_ASPECT_RATIO = 16 / 9;
	const MIN_ART_HEIGHT = 200;

	onMount(() => {
		canvasWidth = Math.min(
			Math.round(mapArtsContainer.clientWidth * devicePixelRatio),
			MAX_CANVAS_SIZE
		);
		canvasHeight = Math.min(
			Math.round(Math.max(MIN_ART_HEIGHT * devicePixelRatio, canvasWidth / ART_ASPECT_RATIO)),
			MAX_CANVAS_SIZE
		);
		// The box keeps the canvas ratio, so it shrinks instead of overflowing if the window
		// gets narrower after the art is drawn.
		artAspectRatio = `${canvasWidth} / ${canvasHeight}`;
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
					if (!uiState.colorPalette) throw new Error('COLORFUL_MAP art without a color palette');
					return startColorfulMapSketch(mapArtsContainer, {
						...options,
						colorPalette: uiState.colorPalette,
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
			case 'error':
				return null;
		}
	});

	/** The app shows every decimal; five (about 1m) are enough. */
	function formatCoordinate(coordinate: number): string {
		return coordinate.toFixed(5);
	}

	async function saveArt(user: UserInfo) {
		const currentSketch = sketch;
		if (!currentSketch) return;
		const savedArt = await viewModel.saveArt(colorLayerHolder, user, () => currentSketch.toPng());
		if (savedArt) openSuccessScreen(savedArt);
	}

	/** startActivity(SuccessActivity) + finish(): the success screen takes this one's place. */
	function openSuccessScreen(savedArt: Blob) {
		setSavedArt(savedArt);
		goto(resolve('/success'), { replaceState: true });
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
		style:height={artAspectRatio && 'auto'}
		style:aspect-ratio={artAspectRatio}
		bind:this={mapArtsContainer}
	></div>

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
				{strings.color_palette_value.replace('%s', uiState.colorPalette?.name ?? '')}
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

	{#if uiState.type === 'loading' || uiState.type === 'error'}
		<div class="state-error-space"></div>
	{/if}

	{#if uiState.type === 'error'}
		<img class="error-image" src={errorImage} alt="" />
		<p class="text-middle-screen-info error-text" role="alert">
			{strings[uiState.failure.messageToBeDisplayedToUserId].replace(
				'%s',
				uiState.failure.messageArgument ?? ''
			)}
		</p>
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
		{@const user = uiState.user}
		{@const hasUsername = !!user.username}
		<!-- background_set_username_card.xml -->
		<div class="username-info-container">
			<div class="username-info">
				<p class="text-gray-subtitle">{strings.author_in_digital_exhibition}</p>
				<p class="text-title username">{hasUsername ? user.username : strings.anonymous}</p>
			</div>
			<div class="add-username">
				<MartpButton
					title={strings.menu_edit}
					variant="pill"
					width="wrap_content"
					cornerRadius={50}
					buttonBackgroundColor={hasUsername ? 'var(--white)' : undefined}
					strokeColor={hasUsername ? 'var(--light-l3)' : undefined}
					onclick={() => (isSetUserInfoBottomSheetOpen = true)}
				>
					{#snippet startIcon()}
						<!-- ic_person_edit.xml -->
						<svg viewBox="0 0 960 960" fill="currentColor" aria-hidden="true">
							<path
								d="M160,800L160,688Q160,654 177.5,625.5Q195,597 224,582Q286,551 350,535.5Q414,520 480,520Q517,520 553,524.5Q589,529 625,539L558,607Q538,604 519,602Q500,600 480,600Q424,600 369,613.5Q314,627 260,654Q251,659 245.5,668Q240,677 240,688L240,720L480,720L480,800L160,800ZM560,840L560,717L781,497Q790,488 801,484Q812,480 823,480Q835,480 846,484.5Q857,489 866,498L903,535Q911,544 915.5,555Q920,566 920,577Q920,588 916,599.5Q912,611 903,620L683,840L560,840ZM860,577L860,577L823,540L823,540L860,577ZM620,780L658,780L779,658L761,639L742,621L620,742L620,780ZM761,639L742,621L742,621L779,658L779,658L761,639ZM367,433Q320,386 320,320Q320,254 367,207Q414,160 480,160Q546,160 593,207Q640,254 640,320Q640,386 593,433Q546,480 480,480Q414,480 367,433ZM536.5,376.5Q560,353 560,320Q560,287 536.5,263.5Q513,240 480,240Q447,240 423.5,263.5Q400,287 400,320Q400,353 423.5,376.5Q447,400 480,400Q513,400 536.5,376.5Z"
							/>
						</svg>
					{/snippet}
				</MartpButton>
			</div>
		</div>

		<div class="action">
			<MartpButton
				title={strings.save_art}
				cornerRadius={50}
				loading={viewModel.isActionButtonLoading}
				onclick={() => saveArt(user)}
			/>
		</div>

		{#if isSetUserInfoBottomSheetOpen}
			<SetUserInfoBottomSheet
				userInfo={user}
				onSaveAnonymously={() => saveArt(user)}
				onSaveWithMyName={(updatedUser) => saveArt(updatedUser)}
				onDismiss={() => (isSetUserInfoBottomSheetOpen = false)}
			/>
		{/if}
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
		margin: 8px auto 16px;
		padding: 0 16px;
		text-align: center;
	}

	.map-arts-container {
		flex-shrink: 0;
		height: 200px;
		margin: 8px 16px 0;
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

	.username-info-container {
		display: flex;
		align-items: center;
		margin: 0 16px;
		border: 1px solid var(--light-l3);
		border-radius: 8px;
		background: var(--white);
	}

	.username-info {
		flex: 1;
		min-width: 0;
		margin: 8px 0 8px 16px;
	}

	.username {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 16px;
	}

	.add-username {
		flex-shrink: 0;
		margin: 8px 16px;
	}

	.action {
		margin: 8px 16px;
	}
</style>
