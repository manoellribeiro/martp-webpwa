<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { artStyleModels } from '#lib/features/artStyleSettings/mapArtStyleModels.ts';
	import { shareArtImage } from '#lib/data/shareArtImage.ts';
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

	function onArtImageLoad(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		artImageSize = { width: image.naturalWidth, height: image.naturalHeight };
	}

	/** MainActivity.newIntentOpeningEditTab + finish(). */
	function openEditTab() {
		goto(resolve('/(main)/edit'), { replaceState: true });
	}

	const colorsRows = [
		['var(--blue)', 'var(--yellow)', 'var(--green)'],
		['var(--error-medium)', 'var(--green-darker)', 'var(--light-yellow)']
	];
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
						aria-label={strings.success_share}
						onclick={() => savedArt && shareArtImage(savedArt)}
					>
						<!-- ic_share.xml -->
						<svg
							viewBox="0 0 25 25"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M13.97,4.14C13.24,4.36 12.78,5.96 12.59,7.91C7.28,7.91 2.5,13.48 2.5,20.08C4.69,14.08 9.5,12.45 12.64,12.45C12.84,14.21 13.29,15.62 13.97,15.82C16.07,16.43 22.5,12.44 22.5,9.98C22.5,7.52 16.07,3.53 13.97,4.14Z"
							/>
						</svg>
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

			<div class="remix-tip">
				<div class="indicator art-style-indicator" aria-hidden="true">
					{#each artStyleModels as artStyleModel, index (artStyleModel.sketchArtType)}
						<span class="art-style-chip" class:highlighted={index === 0}>
							<span class="art-style-icon" style:--icon={`url("${artStyleModel.icon}")`}></span>
						</span>
					{/each}
				</div>
				<div class="tip-texts">
					<p class="text-title tip-title">{strings.art_style}</p>
					<p class="text-gray-subtitle">
						{formatString(
							strings.success_remix_art_style_description,
							strings.colorful_map,
							strings.classic,
							strings.pointillism
						)}
					</p>
				</div>
			</div>

			<div class="remix-tip">
				<div class="indicator color-palette-indicator" aria-hidden="true">
					{#each colorsRows as colorsRow, rowIndex (rowIndex)}
						<span class="swatches">
							{#each colorsRow as color (color)}
								<span class="swatch" style:background={color}></span>
							{/each}
						</span>
					{/each}
				</div>
				<div class="tip-texts">
					<p class="text-title tip-title">{strings.color_palette}</p>
					<p class="text-gray-subtitle">{strings.success_remix_color_palette_description}</p>
				</div>
			</div>

			<div class="remix-tip">
				<div class="indicator map-zoom-indicator" aria-hidden="true">
					<!-- ic_zoom_out.xml -->
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14zM7,9h5v1H7z"
						/>
					</svg>
					<span class="zoom-track"></span>
					<!-- ic_zoom_in.xml -->
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14zM12,10h-2v2H9v-2H7V9h2V7h1v2h2v1z"
						/>
					</svg>
				</div>
				<div class="tip-texts">
					<p class="text-title tip-title">{strings.map_zoom}</p>
					<p class="text-gray-subtitle">{strings.success_remix_map_zoom_description}</p>
				</div>
			</div>
		</section>

		<button type="button" class="text-title create-another-art" onclick={openEditTab}>
			{strings.success_create_another_art}
		</button>
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

	/* Fills the width, or the height left by the caption, keeping the art's ratio. */
	.saved-art {
		position: relative;
		flex-shrink: 0;
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

	.share svg {
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

	.remix-tip {
		display: flex;
		align-items: center;
		padding: 10px 0;
	}

	.remix-tip + .remix-tip {
		border-top: 1px solid var(--blue-alpha-8);
	}

	.indicator {
		flex-shrink: 0;
		width: 80px;
	}

	.tip-texts {
		flex: 1;
		min-width: 0;
		padding-left: 14px;
	}

	.tip-title {
		color: var(--blue);
	}

	.art-style-indicator {
		display: flex;
		gap: 4px;
	}

	.art-style-chip {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		padding: 5px;
		border-radius: 6px;
		background: var(--light-l3);
		color: var(--dark-d4);
	}

	.art-style-chip.highlighted {
		background: var(--yellow);
		color: var(--blue);
	}

	/* Icon tint, as in the art style cards: the drawable is a mask over the current color. */
	.art-style-icon {
		width: 100%;
		height: 100%;
		background: currentColor;
		-webkit-mask: var(--icon) center / contain no-repeat;
		mask: var(--icon) center / contain no-repeat;
	}

	.color-palette-indicator {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.swatches {
		display: flex;
		gap: 3px;
	}

	.swatch {
		width: 12px;
		height: 12px;
		border: 1px solid var(--blue-alpha-12);
		border-radius: 50%;
	}

	.map-zoom-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--dark-d5);
	}

	.map-zoom-indicator svg {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
	}

	/* Half-way slider: 3px track, yellow up to the 12px thumb. */
	.zoom-track {
		flex: 1;
		height: 12px;
		background:
			radial-gradient(circle closest-side, var(--yellow) 100%, transparent 100%) center / 12px
				12px no-repeat,
			linear-gradient(to right, var(--yellow) 50%, var(--light-l2) 50%) center / 100% 3px
				no-repeat;
		border-radius: 1.5px;
	}

	/* RoundedCornerShape(percent = 10) on a 52px tall button. */
	.create-another-art {
		display: block;
		width: calc(100% - 40px);
		height: 52px;
		margin: 12px 20px 16px;
		padding: 0 24px 0 32px;
		border: none;
		border-radius: 5.2px;
		background: var(--blue);
		color: var(--white);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
	}

	.create-another-art:active {
		background-image: linear-gradient(rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.12));
	}

	.create-another-art:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}
</style>
