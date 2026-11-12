<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		getExhibitionContinents,
		getExhibitionMapArts,
		type RemoteExhibitionMapArt
	} from '#lib/data/martpApi.ts';
	import {
		type ExhibitionRoom,
		exhibitionRooms,
		roomFromSlug,
		roomSlug
	} from '#lib/domain/continent.ts';
	import { artAuthor, artDate, artStyle } from '#lib/features/exhibition/exhibitionArt.ts';
	import {
		arrowKeyDirection,
		HorizontalScroller
	} from '#lib/features/exhibition/horizontalScroller.svelte.ts';
	import { roomName } from '#lib/features/exhibition/roomName.ts';
	import { artCount } from '#lib/features/exhibition/rooms.ts';
	import WalkBar from '#lib/features/exhibition/WalkBar.svelte';
	import WindowLight from '#lib/features/exhibition/WindowLight.svelte';
	import { formatString, strings } from '#lib/strings.ts';

	// Web-only: a room of the exhibition, its arts framed on a wall, newest first
	// (digital-exhibition.pen, "Exhibition - Room (South America)" and its mobile version).

	/** Before an image loads its frame is landscape, like most arts (the app's are wider than tall). */
	const DEFAULT_RATIO = 16 / 9;

	// The route matcher (src/params.ts) only lets rooms through.
	const room = $derived(roomFromSlug(page.params.room ?? '') as ExhibitionRoom);

	let arts = $state<RemoteExhibitionMapArt[] | null>(null);
	let failed = $state(false);
	let nextRoom = $state<ExhibitionRoom | null>(null);
	/** Width / height of each loaded image, by art id. */
	let ratios = $state<Record<string, number>>({});

	const scroller = new HorizontalScroller();
	/** On a phone a single frame is seen at a time: then the arrows move one frame. */
	const oneAtATime = $derived(scroller.first === scroller.last);

	const pad = (value: number) => String(value).padStart(2, '0');
	const roomHref = (target: ExhibitionRoom) =>
		resolve('/(exhibition)/exhibition/rooms/[room=room]', { room: roomSlug(target) });

	async function loadArts(target: ExhibitionRoom, signal?: AbortSignal) {
		failed = false;
		arts = null;
		try {
			const response = await getExhibitionMapArts(target, signal);
			if (signal?.aborted) return;
			arts = response.mapArts;
		} catch (error) {
			if (signal?.aborted) return;
			console.error('Could not load the room', error);
			failed = true;
		}
	}

	/** The next room with arts, in the doors' order, going around. Not shown when it fails. */
	async function loadNextRoom(target: ExhibitionRoom, signal?: AbortSignal) {
		nextRoom = null;
		try {
			const { continents } = await getExhibitionContinents(signal);
			const withArts = new Set(continents.filter((c) => c.total > 0).map((c) => c.continent));
			const start = exhibitionRooms.indexOf(target);
			for (let step = 1; step < exhibitionRooms.length; step++) {
				const candidate = exhibitionRooms[(start + step) % exhibitionRooms.length];
				if (withArts.has(candidate)) {
					nextRoom = candidate;
					return;
				}
			}
		} catch (error) {
			if (!signal?.aborted) console.error('Could not load the next room', error);
		}
	}

	function walk(direction: 1 | -1) {
		if (oneAtATime) scroller.scrollItem(direction);
		else scroller.scrollPage(direction);
	}

	function onKeydown(event: KeyboardEvent) {
		const direction = arrowKeyDirection(event);
		if (!direction) return;
		event.preventDefault();
		walk(direction);
	}

	function onImageLoad(art: RemoteExhibitionMapArt, image: HTMLImageElement) {
		if (image.naturalWidth && image.naturalHeight) {
			ratios[art.id] = image.naturalWidth / image.naturalHeight;
		}
	}

	$effect(() => {
		const request = new AbortController();
		// A new room starts at its first frame.
		untrack(() => scroller.element?.scrollTo({ left: 0 }));
		loadArts(room, request.signal);
		loadNextRoom(room, request.signal);
		return () => request.abort();
	});

	$effect(() => scroller.observe());

	// Frames change width as their images load.
	$effect(() => {
		void Object.keys(ratios).length;
		scroller.update();
	});
</script>

<svelte:head>
	<title>{roomName(room)} · {strings.digital_exhibition} · Martp</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="room">
	<WindowLight />

	<header class="top-bar">
		<div class="top-left">
			<a class="all-rooms" href={resolve('/(exhibition)/exhibition/rooms')} aria-label={strings.all_rooms}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
				<span class="all-rooms-label">{strings.all_rooms}</span>
			</a>
			<div class="room-title">
				<h1 class="room-name">{roomName(room)}</h1>
				{#if arts}
					<span class="count">{artCount(arts.length)}</span>
				{/if}
			</div>
		</div>
		{#if nextRoom}
			<a class="next-room" href={roomHref(nextRoom)}>
				{formatString(strings.next_room, roomName(nextRoom))}
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
			</a>
		{/if}
	</header>

	<main class="wall">
		{#if failed}
			<div class="message">
				<p>{strings.room_loading_error}</p>
				<button class="retry-button" onclick={() => loadArts(room)}>{strings.try_again}</button>
			</div>
		{:else if arts && arts.length === 0}
			<p class="message">{strings.room_empty}</p>
		{:else}
			<div class="frames" bind:this={scroller.element}>
				{#if arts}
					{#each arts as art, index (art.id)}
						{@const style = artStyle(art)}
						<figure class="artwork">
							<!-- The arts come with their own frame and mat. -->
							<img
								class="art"
								class:loaded={ratios[art.id]}
								src={art.imageUrl}
								alt={art.title}
								loading={index < 3 ? 'eager' : 'lazy'}
								decoding="async"
								style:--ratio={ratios[art.id] ?? DEFAULT_RATIO}
								onload={(event) => onImageLoad(art, event.currentTarget as HTMLImageElement)}
							/>
							<figcaption class="label">
								<span class="title">{art.title}</span>
								<span class="author">{artAuthor(art)}</span>
								<span class="meta">
									<span class="date">{artDate(art)}</span>
									{#if style}
										<span class="style" style:background={style.color}>{style.name}</span>
									{/if}
								</span>
							</figcaption>
						</figure>
					{/each}
				{:else}
					<!-- Loading: empty spots, so the wall keeps its shape. -->
					{#each [0, 1, 2] as placeholder (placeholder)}
						<div class="artwork placeholder" aria-hidden="true">
							<span class="art" style:--ratio={DEFAULT_RATIO}></span>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</main>

	<footer class="floor">
		{#if arts && arts.length > 0}
			<WalkBar
				position={oneAtATime
					? `${pad(scroller.centered + 1)} / ${pad(arts.length)}`
					: `${pad(scroller.first + 1)}–${pad(scroller.last + 1)} / ${pad(arts.length)}`}
				progress={scroller.progress}
				hint={strings.walk_hint}
				previousLabel={strings.previous_art}
				nextLabel={strings.next_art}
				atStart={scroller.atStart}
				atEnd={scroller.atEnd}
				onprevious={() => walk(-1)}
				onnext={() => walk(1)}
			/>
		{/if}
	</footer>
</div>

<style>
	/* Mobile first: one frame in the middle, swiped. From 960px, a row of frames. */
	.room {
		--side-padding: 20px;
		/* Arts keep their shape: as tall as this, unless that makes them wider than the screen. */
		--art-height: clamp(200px, 100dvh - 410px, 416px);
		--art-max-width: calc(100vw - 72px);
		--baseboard-height: 8px;

		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		overflow: hidden;
		background: linear-gradient(#fffbf1, #f7ecd4);
		color: var(--blue);
	}

	svg {
		width: 18px;
		height: 18px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px var(--side-padding) 0;
	}

	.top-left {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.all-rooms {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 40px;
		height: 40px;
		box-sizing: border-box;
		border: 1.5px solid var(--blue);
		border-radius: 10px;
		color: var(--blue);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
	}

	.all-rooms-label {
		display: none;
	}

	.room-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.room-name {
		margin: 0;
		overflow: hidden;
		font-family: var(--exhibition-headline-font);
		font-size: 19px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.count {
		font-family: var(--exhibition-label-font);
		font-size: 11px;
		letter-spacing: 1px;
		color: var(--dark-d5);
		text-transform: uppercase;
	}

	.next-room {
		display: none;
		align-items: center;
		gap: 8px;
		color: var(--green-darker);
		font-size: 15px;
		font-weight: 500;
		text-decoration: none;
	}

	.next-room:hover {
		text-decoration: underline;
	}

	.next-room svg {
		width: 16px;
		height: 16px;
	}

	/* The frames hang on the wall, above the baseboard. */
	.wall {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		padding-bottom: var(--baseboard-height);
		background: linear-gradient(to top, #e3d3b3 var(--baseboard-height), transparent 0);
	}

	.frames {
		display: flex;
		align-items: flex-start;
		gap: 24px;
		padding: 32px 36px 28px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}

	.frames::-webkit-scrollbar {
		display: none;
	}

	.artwork {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: 24px;
		margin: 0;
		scroll-snap-align: center;
	}

	.art {
		display: block;
		box-shadow: 5px 12px 20px rgb(43 35 80 / 25%);
		width: auto;
		height: min(var(--art-height), var(--art-max-width) / var(--ratio));
		aspect-ratio: var(--ratio);
		background: #efe8d9;
		object-fit: cover;
	}

	img.art {
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	img.art.loaded {
		opacity: 1;
	}

	.placeholder {
		opacity: 0.5;
	}

	/* As wide as the frame: the label never makes the frame wider. */
	.label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 0;
		min-width: 100%;
	}

	.title {
		font-size: 17px;
		font-weight: 700;
	}

	.author {
		font-size: 14px;
		color: var(--dark-d4);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 12px;
		padding-top: 6px;
	}

	.date {
		font-family: var(--exhibition-label-font);
		font-size: 11px;
		letter-spacing: 0.5px;
		color: var(--dark-d5);
		text-transform: uppercase;
	}

	.style {
		padding: 4px 8px;
		border-radius: 3px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.8px;
		text-transform: uppercase;
	}

	.message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 420px;
		margin: auto;
		padding: 0 32px;
		font-size: 16px;
		line-height: 1.5;
		text-align: center;
		color: var(--dark-d4);
	}

	.message p {
		margin: 0;
	}

	.retry-button {
		height: 56px;
		padding: 0 28px;
		border: none;
		border-radius: 10px;
		background: var(--blue);
		color: var(--light-cream);
		font: inherit;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 2.4px;
		text-transform: uppercase;
		cursor: pointer;
	}

	.floor {
		padding: 34px var(--side-padding) 24px;
		background: linear-gradient(#e9dbbe, #f3e8d0);
	}

	@media (min-width: 960px) {
		.room {
			--side-padding: 64px;
			--art-height: clamp(220px, 100dvh - 440px, 460px);
			--art-max-width: calc(100vw - 224px);
			--baseboard-height: 10px;
		}

		.top-bar {
			padding-top: 30px;
		}

		.top-left {
			gap: 24px;
		}

		.all-rooms {
			width: auto;
			height: 42px;
			padding: 0 16px;
		}

		.all-rooms svg {
			width: 16px;
			height: 16px;
		}

		.all-rooms-label {
			display: inline;
		}

		.room-title {
			flex-direction: row;
			align-items: baseline;
			gap: 14px;
		}

		.room-name {
			font-size: 28px;
		}

		.count {
			font-size: 12px;
		}

		.next-room {
			display: flex;
		}

		.frames {
			gap: 110px;
			padding: 36px 112px 38px;
			scroll-snap-type: x proximity;
			scroll-padding-inline: 112px;
		}

		.artwork {
			gap: 30px;
			scroll-snap-align: start;
		}

		/* Centered when every frame fits; from the left when they scroll. */
		.artwork:first-child {
			margin-left: auto;
		}

		.artwork:last-child {
			margin-right: auto;
		}

		.art {
			box-shadow: 6px 14px 24px rgb(43 35 80 / 25%);
		}

		.title {
			font-size: 16px;
		}

		.floor {
			padding: 34px var(--side-padding) 48px;
		}
	}
</style>
