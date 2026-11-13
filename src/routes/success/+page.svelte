<script lang="ts">
	import { onMount } from 'svelte';
	import ShareArtIcon from '#lib/components/ShareArtIcon.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ArtSettingRow from '#lib/components/ArtSettingRow.svelte';
	import ArtStyleIndicator from '#lib/components/ArtStyleIndicator.svelte';
	import ColorPaletteIndicator from '#lib/components/ColorPaletteIndicator.svelte';
	import MapZoomIndicator from '#lib/components/MapZoomIndicator.svelte';
	import MartpPrimaryButton from '#lib/components/MartpPrimaryButton.svelte';
	import { canShareArtImage, shareArtImage } from '#lib/data/shareArtImage.ts';
	import { getSavedArt } from '#lib/features/success/savedArt.ts';
	import { framePadding, frameThickness } from '#lib/sketches/martpSketch.ts';
	import { formatString, strings } from '#lib/strings.ts';

	// Port of SuccessActivity + SuccessScreen.kt. A separate activity on Android, so a
	// top-level route here, without the bottom navigation bar.

	// The share button keeps the same proportion to the art on every screen size
	const SHARE_BUTTON_ART_WIDTH_FRACTION = 0.116;
	const SHARE_BUTTON_GAP_ART_WIDTH_FRACTION = 0.012;
	const SHARE_BUTTON_MIN_SIZE = 24;

	const savedArt = getSavedArt();
	let artImageUrl = $state<string | null>(null);
	let artImageSize = $state<{ width: number; height: number } | null>(null);

	onMount(() => {
		// Like the activity without IMAGE_PATH_LOCATION_EXTRA (e.g. after a reload): closes.
		if (!savedArt) {
			openEditTab();
			return;
		}
		const url = URL.createObjectURL(savedArt);
		artImageUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	// The art's shape when its size can't be read, so it never collapses to nothing
	const FALLBACK_ART_SIZE = { width: 16, height: 9 };

	/**
	 * The size of the loaded art. Some browsers have reported 0 here, which made the ratio
	 * invalid and the art 0px wide, so it is checked and read from the PNG itself if needed.
	 */
	async function onArtImageLoad(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		if (isValidSize(image.naturalWidth, image.naturalHeight)) {
			artImageSize = { width: image.naturalWidth, height: image.naturalHeight };
			return;
		}
		try {
			const bitmap = await createImageBitmap(savedArt!);
			const size = { width: bitmap.width, height: bitmap.height };
			bitmap.close();
			artImageSize = isValidSize(size.width, size.height) ? size : FALLBACK_ART_SIZE;
		} catch (e) {
			console.error('Success.onArtImageLoad', e);
			artImageSize = FALLBACK_ART_SIZE;
		}
	}

	function isValidSize(width: number, height: number): boolean {
		return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
	}

	/** MainActivity.newIntentOpeningEditTab + finish(). */
	function openEditTab() {
		goto(resolve('/(main)/edit'), { replaceState: true });
	}

	// Browsers that can't share files download the art, and the button says so
	const canShare = canShareArtImage();
</script>

<div class="success">
	<!-- The yellow band goes behind the status bar and ends right below the art status -->
	<div class="band">
		<header class="header">
			<p class="text-title saved">
				<!-- ic_check_circle.xml -->
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM10,17l-5,-5 1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z"
					/>
				</svg>
				{strings.success_saved_to_gallery}
			</p>
			<h1 class="text-screen-title title">{strings.success_title}</h1>
		</header>

		<!-- The art and its status are centered together, so extra height goes around them -->
		<div class="saved-art-with-status">
			{#if artImageUrl}
				<div
					class="saved-art"
					class:loaded={artImageSize}
					style:--art-ratio={artImageSize && artImageSize.width / artImageSize.height}
					style:--frame-fraction={artImageSize &&
						(frameThickness + framePadding) / artImageSize.width}
					style:--share-size-fraction={SHARE_BUTTON_ART_WIDTH_FRACTION}
					style:--share-gap-fraction={SHARE_BUTTON_GAP_ART_WIDTH_FRACTION}
					style:--share-min-size="{SHARE_BUTTON_MIN_SIZE}px"
				>
					<img
						src={artImageUrl}
						alt={strings.success_saved_art_description}
						onload={onArtImageLoad}
					/>
					<button
						type="button"
						class="share"
						aria-label={canShare ? strings.success_share : strings.download_art}
						onclick={() => savedArt && shareArtImage(savedArt)}
					>
						<ShareArtIcon canShare={canShare} />
					</button>
				</div>
			{/if}
			<div class="approval-status">
				<p class="text-title awaiting-approval">
					<span class="dot" aria-hidden="true"></span>
					{strings.success_awaiting_approval}
				</p>
				<p class="text-gray-subtitle awaiting-approval-description">
					{strings.success_awaiting_approval_description}
				</p>
			</div>
		</div>
	</div>

	<div class="bottom">
		<section class="remix">
			<h2 class="text-title remix-title">{strings.success_remix_title}</h2>
			<p class="text-gray-subtitle remix-body">
				{formatString(strings.success_remix_body, strings.menu_edit)}
			</p>

			<ArtSettingRow
				title={strings.art_style}
				description={formatString(
					strings.success_remix_art_style_description,
					strings.colorful_map,
					strings.classic,
					strings.pointillism
				)}
				showTopDivider={false}
			>
				{#snippet indicator()}
					<ArtStyleIndicator />
				{/snippet}
			</ArtSettingRow>
			<ArtSettingRow
				title={strings.color_palette}
				description={strings.success_remix_color_palette_description}
				showTopDivider
			>
				{#snippet indicator()}
					<ColorPaletteIndicator />
				{/snippet}
			</ArtSettingRow>
			<ArtSettingRow
				title={strings.map_zoom}
				description={strings.success_remix_map_zoom_description}
				showTopDivider
			>
				{#snippet indicator()}
					<MapZoomIndicator />
				{/snippet}
			</ArtSettingRow>
		</section>

		<div class="create-another-art">
			<MartpPrimaryButton text={strings.success_create_another_art} onclick={openEditTab} />
		</div>
	</div>
</div>

<style>
	.success {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--light-cream);
	}

	.band {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: calc(4px + env(safe-area-inset-top)) 24px 20px;
		background: var(--yellow);
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.saved {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		letter-spacing: 1.2px;
		text-transform: uppercase;
		color: var(--blue);
	}

	.saved svg {
		width: 16px;
		height: 16px;
	}

	.title {
		margin-top: 8px;
		font-size: 22px;
		line-height: 28px;
		text-align: center;
		color: var(--blue);
	}

	/* Line heights are fixed so the art can take exactly the height the caption leaves. */
	.saved-art-with-status {
		--caption-height: 50px;
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* Size containment gives it no height of its own; keeps the art visible on short screens. */
		min-height: 200px;
		margin-top: 12px;
		background: radial-gradient(circle closest-side, var(--white-alpha-80), transparent);
		container-type: size;
	}

	/* Fills the width, or the height left by the caption, keeping the art's ratio. Stretched
	   and centered by its margins: if the width rule ever fails, the art fills the width
	   instead of shrinking to nothing. */
	.saved-art {
		position: relative;
		flex-shrink: 0;
		align-self: stretch;
		margin: 0 auto;
		width: min(100cqw, (100cqh - var(--caption-height)) * var(--art-ratio, 1));
		container-type: inline-size;
	}

	.saved-art:not(.loaded) {
		visibility: hidden;
	}

	.saved-art img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* Sized from the art width and pushed past the sketch frame, onto the map. */
	.share {
		--share-size: max(100cqw * var(--share-size-fraction), var(--share-min-size));
		--share-inset: calc(100cqw * (var(--frame-fraction, 0) + var(--share-gap-fraction)));
		position: absolute;
		top: var(--share-inset);
		right: var(--share-inset);
		display: grid;
		place-items: center;
		width: var(--share-size);
		height: var(--share-size);
		padding: 0;
		border: 1.5px solid var(--white);
		border-radius: 50%;
		background: var(--blue-alpha-80);
		color: var(--white);
		cursor: pointer;
	}

	.share :global(svg) {
		width: 45%;
		height: 45%;
	}

	.share:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.approval-status {
		align-self: stretch;
		padding-top: 12px;
	}

	.awaiting-approval {
		display: flex;
		align-items: center;
		gap: 8px;
		line-height: 20px;
		color: var(--blue);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--blue);
		box-shadow: 0 0 0 4px rgb(18 13 49 / 0.35);
	}

	.awaiting-approval-description {
		padding: 2px 0 0 16px;
		line-height: 16px;
	}

	.bottom {
		padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
	}

	.remix {
		padding: 16px 24px 0;
	}

	.remix-title {
		font-size: 16px;
		color: var(--blue);
	}

	.remix-body {
		padding: 2px 0 4px;
		font-size: 13px;
		line-height: 18px;
	}

	.create-another-art {
		margin: 12px 20px 16px;
	}
</style>
