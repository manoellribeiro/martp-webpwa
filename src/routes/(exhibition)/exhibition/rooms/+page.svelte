<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/martp_logo.svg';
	import { getExhibitionContinents } from '#lib/data/martpApi.ts';
	import { type ExhibitionRoom, exhibitionRooms, roomSlug } from '#lib/domain/continent.ts';
	import {
		arrowKeyDirection,
		HorizontalScroller
	} from '#lib/features/exhibition/horizontalScroller.svelte.ts';
	import { roomName } from '#lib/features/exhibition/roomName.ts';
	import { artCount, roomImages } from '#lib/features/exhibition/rooms.ts';
	import WalkBar from '#lib/features/exhibition/WalkBar.svelte';
	import WindowLight from '#lib/features/exhibition/WindowLight.svelte';
	import { strings } from '#lib/strings.ts';

	// Web-only: the exhibition's hall, one door per room (digital-exhibition.pen, "Exhibition -
	// Choose a Room" and its mobile version). Only rooms with approved arts get a door.

	interface Door {
		room: ExhibitionRoom;
		total: number;
	}

	let doors = $state<Door[] | null>(null);
	let failed = $state(false);

	/** The doors seen whole (desktop progress) and the one in the middle (mobile dots). */
	const scroller = new HorizontalScroller();

	const pad = (value: number) => String(value).padStart(2, '0');
	const roomHref = (room: ExhibitionRoom) =>
		resolve('/(exhibition)/exhibition/rooms/[room=room]', { room: roomSlug(room) });

	async function loadDoors() {
		failed = false;
		doors = null;
		try {
			const { continents } = await getExhibitionContinents();
			const totals = new Map(continents.map(({ continent, total }) => [continent, total]));
			doors = exhibitionRooms
				.filter((room) => (totals.get(room) ?? 0) > 0)
				.map((room) => ({ room, total: totals.get(room) ?? 0 }));
		} catch (error) {
			console.error('Could not load the exhibition rooms', error);
			failed = true;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		const direction = arrowKeyDirection(event);
		if (!direction) return;
		event.preventDefault();
		scroller.scrollPage(direction);
	}

	$effect(() => scroller.observe());

	onMount(() => {
		loadDoors();
	});
</script>

<svelte:head>
	<title>{strings.choose_a_room} · {strings.digital_exhibition} · Martp</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="hall">
	<WindowLight />

	<header class="top-bar">
		<a class="brand" href={resolve('/(exhibition)/exhibition')}>
			<img class="logo" src={logo} alt="Martp" width="512" height="256" />
			<span class="tagline">{strings.digital_exhibition}</span>
		</a>
		<a class="home-link" href={resolve('/(exhibition)/exhibition')}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
			{strings.exhibition_home}
		</a>
	</header>

	<div class="title-block">
		<h1 class="title">{strings.choose_a_room}</h1>
		<p class="description">
			{strings.choose_a_room_description}
			<span class="mobile-only">{strings.swipe_to_explore}</span>
		</p>
	</div>

	<main class="wall">
		{#if failed}
			<div class="message">
				<p>{strings.rooms_loading_error}</p>
				<button class="retry-button" onclick={loadDoors}>{strings.try_again}</button>
			</div>
		{:else if doors && doors.length === 0}
			<p class="message">{strings.no_rooms_yet}</p>
		{:else}
			<div class="doors" bind:this={scroller.element}>
				{#if doors}
					{#each doors as door, index (door.room)}
						<a class="door" href={roomHref(door.room)}>
							<span class="sign">
								<span class="continent">{roomName(door.room)}</span>
								<span class="count">{artCount(door.total)}</span>
							</span>
							<span class="doorway">
								<img
									class="continent-image"
									src={roomImages[door.room]}
									alt=""
									loading={index < 4 ? 'eager' : 'lazy'}
								/>
							</span>
						</a>
					{/each}
				{:else}
					<!-- Loading: empty doorways, so the hall keeps its shape. -->
					{#each [0, 1, 2, 3] as placeholder (placeholder)}
						<span class="door placeholder" aria-hidden="true">
							<span class="sign">
								<span class="continent">&nbsp;</span>
								<span class="count">&nbsp;</span>
							</span>
							<span class="doorway"></span>
						</span>
					{/each}
				{/if}
			</div>
		{/if}
	</main>

	<footer class="floor">
		{#if doors && doors.length > 0}
			<div class="bottom-bar">
				<WalkBar
					position="{pad(scroller.first + 1)}–{pad(scroller.last + 1)} / {pad(doors.length)}"
					progress={scroller.progress}
					hint={strings.more_rooms_hint}
					previousLabel={strings.previous_rooms}
					nextLabel={strings.next_rooms}
					atStart={scroller.atStart}
					atEnd={scroller.atEnd}
					onprevious={() => scroller.scrollPage(-1)}
					onnext={() => scroller.scrollPage(1)}
				/>
			</div>

			<div class="mobile-bottom">
				<div class="dots" aria-hidden="true">
					{#each doors as door, index (door.room)}
						<span class="dot" class:active={index === scroller.centered}></span>
					{/each}
				</div>
				<!-- The doors are the buttons. -->
				<p class="tap-hint">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M22 14a8 8 0 0 1-8 8" />
						<path d="M18 11v-1a2 2 0 0 0-4 0" />
						<path d="M14 10V9a2 2 0 0 0-4 0v1" />
						<path d="M10 9.5V4a2 2 0 0 0-4 0v10" />
						<path
							d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
						/>
					</svg>
					{strings.tap_a_door_to_enter}
				</p>
			</div>
		{/if}
	</footer>
</div>

<style>
	/* Mobile first: one door in the middle, swiped. From 960px, a row of doors and arrows. */
	.hall {
		--side-padding: 20px;
		--door-width: 200px;
		/* Shorter doors on short phones, so the hint stays on the first screen. */
		--doorway-height: clamp(260px, 100dvh - 494px, 350px);
		--door-gap: 36px;
		--floor-height: 194px;
		--baseboard: #e3d3b3;

		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		overflow: hidden;
		background: linear-gradient(#fffbf1, #f7ecd4);
		color: var(--blue);
	}

	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px var(--side-padding) 0;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
		color: var(--blue);
		text-decoration: none;
	}

	.logo {
		display: block;
		width: auto;
		height: 40px;
		/* The wordmark has empty space around it in its 2:1 box. */
		margin: -6px -6px -6px -9px;
	}

	.tagline {
		display: none;
		font-family: var(--exhibition-label-font);
		font-size: 13px;
		font-style: italic;
	}

	.home-link {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		color: var(--blue);
		font-size: 15px;
		font-weight: 500;
		text-decoration: none;
	}

	.home-link svg,
	.tap-hint svg {
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.title-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 14px 32px 0;
		text-align: center;
	}

	.title {
		margin: 0;
		font-family: var(--exhibition-headline-font);
		font-size: 26px;
		font-weight: 500;
	}

	.description {
		margin: 0;
		max-width: 420px;
		font-size: 15px;
		line-height: 1.45;
		color: var(--dark-d4);
	}

	/* The doors stand on the floor, in front of the baseboard. */
	.wall {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: flex-end;
		min-height: calc(var(--doorway-height) + 80px);
		background: linear-gradient(to top, var(--baseboard) 8px, transparent 8px);
	}

	.doors {
		display: flex;
		align-items: flex-end;
		gap: var(--door-gap);
		/* The first and last doors can reach the middle. */
		padding: 24px calc(50% - var(--door-width) / 2) 0;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}

	.doors::-webkit-scrollbar {
		display: none;
	}

	.door {
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		width: var(--door-width);
		color: var(--blue);
		text-decoration: none;
		scroll-snap-align: center;
	}

	.sign {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		text-align: center;
	}

	.continent {
		font-family: var(--exhibition-label-font);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 1.2px;
		text-transform: uppercase;
	}

	.count {
		font-size: 13px;
		color: var(--dark-d5);
	}

	/* An arch with a dark frame, the room's floor at its feet and a little shade on the left. */
	.doorway {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: var(--doorway-height);
		box-sizing: border-box;
		padding-bottom: 20%;
		overflow: hidden;
		border: 6px solid var(--blue);
		border-bottom: none;
		border-radius: calc(var(--door-width) / 2) calc(var(--door-width) / 2) 0 0;
		background:
			linear-gradient(to left, transparent calc(100% - 16px), rgb(18 13 49 / 13%)),
			linear-gradient(to top, #d8c197 20%, #efe3cf 20%);
		transition: transform 0.2s ease;
	}

	.continent-image {
		display: block;
		max-width: 79%;
		max-height: 58%;
		/* Brighter than the doorway, the image's cream background disappears into it with
		   darken; the dots stay. */
		filter: brightness(1.1);
		mix-blend-mode: darken;
	}

	.door:hover .doorway,
	.door:focus-visible .doorway {
		transform: translateY(-4px);
	}

	.door:focus-visible {
		outline: none;
	}

	.door:focus-visible .doorway {
		outline: 3px solid var(--yellow);
		outline-offset: 4px;
	}

	.placeholder .doorway {
		opacity: 0.35;
	}

	.message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 420px;
		margin: auto auto 0;
		padding: 0 32px 64px;
		font-size: 16px;
		line-height: 1.5;
		text-align: center;
		color: var(--dark-d4);
	}

	.message p {
		margin: 0;
	}

	.retry-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
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
		text-decoration: none;
		text-transform: uppercase;
		cursor: pointer;
	}

	.floor {
		box-sizing: border-box;
		min-height: var(--floor-height);
		padding: 26px var(--side-padding) 24px;
		background: linear-gradient(#e9dbbe, #f3e8d0);
	}

	.bottom-bar {
		display: none;
	}

	.mobile-bottom {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.tap-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 0;
		font-family: var(--exhibition-label-font);
		font-size: 11px;
		letter-spacing: 0.8px;
		color: var(--dark-d5);
		text-transform: uppercase;
	}

	.tap-hint svg {
		width: 14px;
		height: 14px;
	}

	.dots {
		display: flex;
		justify-content: center;
		gap: 6px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 3px;
		background: rgb(18 13 49 / 20%);
		transition: width 0.2s ease;
	}

	.dot.active {
		width: 22px;
		background: var(--blue);
	}

	@media (min-width: 960px) {
		.hall {
			--side-padding: 64px;
			--door-width: 168px;
			--doorway-height: 300px;
			--door-gap: 40px;
			--floor-height: 200px;
			--doors-inset: clamp(24px, 8vw, 116px);
		}

		.top-bar {
			padding-top: 28px;
		}

		.tagline {
			display: block;
		}

		.title-block {
			gap: 12px;
			padding-top: 24px;
		}

		.title {
			font-size: 40px;
		}

		.description {
			max-width: none;
			font-size: 17px;
		}

		.mobile-only {
			display: none;
		}

		.wall {
			background: linear-gradient(to top, var(--baseboard) 10px, transparent 10px);
		}

		.doors {
			padding: 32px var(--doors-inset) 0;
			scroll-snap-type: x proximity;
			scroll-padding-inline: var(--doors-inset);
		}

		.door {
			gap: 16px;
			scroll-snap-align: start;
		}

		/* Centered when every door fits; from the left when they scroll. */
		.door:first-child {
			margin-left: auto;
		}

		.door:last-child {
			margin-right: auto;
		}

		.floor {
			padding-top: 76px;
		}

		.bottom-bar {
			display: block;
		}

		.mobile-bottom {
			display: none;
		}
	}
</style>
