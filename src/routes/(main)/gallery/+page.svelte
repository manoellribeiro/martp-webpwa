<script lang="ts">
	import { onMount } from 'svelte';
	import ShareArtIcon from '#lib/components/ShareArtIcon.svelte';
	import adventureMap from '#lib/assets/ic_adventure_map.svg';
	import logo from '#lib/assets/martp_logo.svg';
	import { getUserMapArts, type MapArtEntity } from '#lib/data/mapArts.ts';
	import { canShareArtImage, shareArtImage } from '#lib/data/shareArtImage.ts';
	import { Failure, UnknownErrorFailure } from '#lib/domain/failures.ts';
	import { strings } from '#lib/strings.ts';

	// Port of GalleryFragment + fragment_gallery.xml, GalleryUiState and
	// MapArtsRecyclerViewAdapter + item_gallery_art.xml. The arts are the ones this browser
	// saved (src/lib/data/mapArts.ts). The header scrolls away with the list, like the app's
	// AppBarLayout; the status bar scrim is not needed, since the page never draws under it.

	type GalleryUiState =
		| { type: 'loading' }
		| { type: 'error'; failure: Failure }
		| { type: 'emptyList' }
		| { type: 'notEmptyList'; mapArts: MapArtItem[] };

	interface MapArtItem {
		mapArt: MapArtEntity;
		imageUrl: string;
	}

	let uiState = $state<GalleryUiState>({ type: 'loading' });

	onMount(() => {
		let imageUrls: string[] = [];
		let destroyed = false;
		getUserMapArts()
			.then((mapArts) => {
				if (destroyed) return;
				const items = mapArts.map((mapArt) => ({
					mapArt,
					imageUrl: URL.createObjectURL(mapArt.image)
				}));
				imageUrls = items.map((item) => item.imageUrl);
				uiState =
					items.length > 0 ? { type: 'notEmptyList', mapArts: items } : { type: 'emptyList' };
			})
			.catch((e) => {
				if (destroyed) return;
				const failure = e instanceof Failure ? e : new UnknownErrorFailure(String(e));
				uiState = { type: 'error', failure };
			});
		return () => {
			destroyed = true;
			imageUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	/** Calendar.formatDateHour: the same pattern in every language. */
	function formatDateHour(dateInMillis: number): string {
		const date = new Date(dateInMillis);
		const pad = (value: number) => value.toString().padStart(2, '0');
		return (
			`${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
			`${pad(date.getHours())}:${pad(date.getMinutes())}`
		);
	}
	// Browsers that can't share files download the art, and the button says so
	const canShare = canShareArtImage();
</script>

<div class="gallery">
	<header class="header">
		<img class="logo" src={logo} alt={strings.app_name} />
		<h1 class="text-screen-title title">{strings.your_gallery}</h1>
	</header>

	{#if uiState.type === 'notEmptyList'}
		<ul class="map-arts">
			{#each uiState.mapArts as { mapArt, imageUrl } (mapArt.id)}
				{@const title = mapArt.title || strings.unknown_location}
				<li class="map-art">
					<img class="art-miniature" src={imageUrl} alt={title} />
					<h2 class="text-title art-title">{title}</h2>
					<p class="date">
						<!-- ic_calendar.xml -->
						<svg class="calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M15,4V2M15,4V6M15,4H10.5M3,10V19C3,20.105 3.895,21 5,21H19C20.105,21 21,20.105 21,19V10H3Z" />
							<path d="M3,10V6C3,4.895 3.895,4 5,4H7" />
							<path d="M7,2V6" />
							<path d="M21,10V6C21,4.895 20.105,4 19,4H18.5" />
						</svg>
						<time class="text-gray-subtitle" datetime={new Date(mapArt.dateInMillis).toISOString()}>
							{formatDateHour(mapArt.dateInMillis)}
						</time>
					</p>
					<button
						type="button"
						class="share"
						aria-label={canShare ? strings.success_share : strings.download_art}
						onclick={() => shareArtImage(mapArt.image)}
					>
						<ShareArtIcon canShare={canShare} />
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="states" aria-busy={uiState.type === 'loading'}>
			{#if uiState.type === 'loading'}
				<span class="loading-indicator" aria-hidden="true"></span>
			{:else if uiState.type === 'error'}
				<p class="error">{strings[uiState.failure.messageToBeDisplayedToUserId]}</p>
			{:else}
				<img class="empty-gallery-image" src={adventureMap} alt="" />
				<p class="text-middle-screen-info empty-list">
					{strings.gallery_empty_state_state_message}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		min-height: calc(
			100dvh - var(--bottom-navigation-bar-height) - env(safe-area-inset-bottom) -
				env(safe-area-inset-top)
		);
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
		margin-left: 16px;
		font-size: 20px;
	}

	.states {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 16px;
	}

	/* ProgressBar with Theme.GenerateMapArts.ProgressBarTheme */
	.loading-indicator {
		width: 48px;
		height: 48px;
		box-sizing: border-box;
		border: 4px solid var(--light-l1);
		border-top-color: var(--green-darker);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		margin: 0;
		text-align: center;
		color: var(--dark-d1);
	}

	.empty-gallery-image {
		width: 200px;
		height: 200px;
		margin-top: 56px;
	}

	/* The app's states sit at the top under the image, not in the middle of the screen. */
	.states:has(.empty-gallery-image) {
		justify-content: flex-start;
	}

	.empty-list {
		text-align: center;
		white-space: pre-line;
	}

	.map-arts {
		margin: 0;
		padding: 4px 0 16px;
		list-style: none;
		container-type: inline-size;
	}

	/* item_gallery_art.xml */
	.map-art {
		position: relative;
		margin: 4px 0;
	}

	/*
	 * 200dp tall and fitCenter on Android. Arts are drawn at the screen width minus the 32px
	 * of margins and get taller on big screens (see martpSketch.ts), so the miniature follows
	 * the same rule.
	 */
	.art-miniature {
		display: block;
		width: 100%;
		height: max(200px, calc((100cqw - 32px) / (16 / 9)));
		object-fit: contain;
	}

	.art-title {
		margin: 8px 16px 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.date {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 4px 16px 0;
	}

	.calendar {
		flex: none;
		width: 20px;
		height: 20px;
		color: var(--dark-d4);
	}

	/* A 56px FAB scaled to 0.7 with a 16px margin, so 39px at 24px from the corner. */
	.share {
		position: absolute;
		top: 24px;
		right: 24px;
		display: grid;
		place-items: center;
		width: 39px;
		height: 39px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--white);
		color: var(--black);
		opacity: 0.8;
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.3),
			0 4px 8px 3px rgb(0 0 0 / 0.15);
		cursor: pointer;
	}

	.share:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.share :global(svg) {
		width: 17px;
		height: 17px;
	}
</style>
