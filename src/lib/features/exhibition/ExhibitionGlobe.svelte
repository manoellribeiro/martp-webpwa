<script lang="ts">
	import createGlobe, { type Globe } from 'cobe';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { getGlobeMapArts, type RemoteExhibitionMapArt } from '#lib/data/martpApi.ts';
	import { isExhibitionRoom, roomSlug } from '#lib/domain/continent.ts';
	import { artAuthor, artDate, artStyle } from './exhibitionArt.ts';
	import { anglesFacing, CANVAS_TO_GLOBE, closestAngle, projectLocation } from './globe.ts';

	// Web-only: the home's dotted globe (digital-exhibition.pen, "Globe"). COBE draws the sphere;
	// the pins and the card are HTML placed on top of it every frame (see globe.ts).

	/** Radians per second of the idle spin. */
	const AUTO_SPIN_SPEED = 0.12;
	/** A drag across the whole globe turns it half a turn. */
	const DRAG_TURN = Math.PI;
	/** Pixels a pointer moves before it is a drag and not a tap on a pin. */
	const DRAG_THRESHOLD = 5;
	/** How far left of the middle a selected pin goes, so its card fits on its right. */
	const SELECTED_PHI_OFFSET = -0.55;
	const MAX_THETA = 0.6;
	/** South America and Africa, a little from above, like the design. */
	const INITIAL_ANGLES = { phi: anglesFacing(0, -20).phi, theta: 0.25 };

	let arts = $state<RemoteExhibitionMapArt[]>([]);
	let selected = $state<RemoteExhibitionMapArt | null>(null);

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let card = $state<HTMLAnchorElement>();
	const pins: Record<string, HTMLButtonElement> = {};

	let phi = INITIAL_ANGLES.phi;
	let theta = INITIAL_ANGLES.theta;
	/** Where a selected pin's spin is going; null when nothing is selected. */
	let target: { phi: number; theta: number } | null = null;
	let drag: { pointerId: number; startX: number; lastX: number; moved: boolean } | null = null;

	function select(art: RemoteExhibitionMapArt) {
		selected = art;
		const facing = anglesFacing(art.latitude, art.longitude);
		target = {
			phi: closestAngle(facing.phi + SELECTED_PHI_OFFSET, phi),
			theta: Math.max(-MAX_THETA, Math.min(MAX_THETA, facing.theta))
		};
	}

	function deselect() {
		selected = null;
		target = null;
	}

	function roomHref(art: RemoteExhibitionMapArt): string | undefined {
		if (!isExhibitionRoom(art.continent)) return undefined;
		return resolve('/(exhibition)/exhibition/rooms/[room=room]', { room: roomSlug(art.continent) });
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || drag) return;
		drag = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, moved: false };
	}

	function onPointerMove(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.pointerId) return;
		if (!drag.moved) {
			if (Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD) return;
			// Only now, so a tap still reaches the pin under the pointer.
			drag.moved = true;
			container.setPointerCapture(event.pointerId);
			target = null;
		}
		phi += ((event.clientX - drag.lastX) / container.clientWidth) * DRAG_TURN;
		drag.lastX = event.clientX;
	}

	function onPointerUp(event: PointerEvent) {
		if (drag?.pointerId === event.pointerId) drag = null;
	}

	/** Taps on the globe itself (not a pin or the card) close the card; drags don't. */
	function onClick(event: MouseEvent) {
		if (event.target === container) deselect();
	}

	function placeOverlays() {
		const size = container.clientWidth;
		for (const art of arts) {
			const pin = pins[art.id];
			if (!pin) continue;
			const point = projectLocation(art.latitude, art.longitude, phi, theta);
			pin.style.setProperty('--x', `${point.x * size}px`);
			pin.style.setProperty('--y', `${point.y * size}px`);
			// Fades out near the edge, gone behind the globe.
			pin.style.opacity = `${Math.max(0, Math.min(1, point.facing * 5))}`;
			pin.style.visibility = point.facing > 0 ? 'visible' : 'hidden';

			if (card && art.id === selected?.id) {
				card.style.setProperty('--x', `${point.x * size}px`);
				card.style.setProperty('--y', `${point.y * size}px`);
				card.classList.toggle('left', point.x > 0.55);
				card.style.visibility = point.facing > 0.15 ? 'visible' : 'hidden';
			}
		}
	}

	onMount(() => {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
		let size = container.clientWidth;

		const globe: Globe = createGlobe(canvas, {
			devicePixelRatio,
			width: size * CANVAS_TO_GLOBE,
			height: size * CANVAS_TO_GLOBE,
			phi,
			theta,
			dark: 0,
			diffuse: 1.2,
			mapSamples: 12000,
			mapBrightness: 5,
			mapBaseBrightness: 0,
			baseColor: [1, 0.945, 0.84],
			markerColor: [0.07, 0.05, 0.19],
			glowColor: [1, 0.97, 0.9],
			markers: []
		});

		let frame = 0;
		let lastTime = 0;
		function render(time: number) {
			const seconds = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
			lastTime = time;
			if (target) {
				const ease = reducedMotion ? 1 : 1 - Math.exp(-seconds * 6);
				phi += (target.phi - phi) * ease;
				theta += (target.theta - theta) * ease;
			} else if (!drag?.moved && !selected && !reducedMotion) {
				phi += AUTO_SPIN_SPEED * seconds;
			}
			globe.update({ phi, theta });
			placeOverlays();
			frame = requestAnimationFrame(render);
		}

		function start() {
			if (frame) return;
			lastTime = 0;
			frame = requestAnimationFrame(render);
		}

		function stop() {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		// No frames while the globe is scrolled out of view.
		const visibility = new IntersectionObserver(([entry]) =>
			entry.isIntersecting ? start() : stop()
		);
		visibility.observe(container);

		const resize = new ResizeObserver(() => {
			size = container.clientWidth;
			globe.update({ width: size * CANVAS_TO_GLOBE, height: size * CANVAS_TO_GLOBE });
		});
		resize.observe(container);

		const request = new AbortController();
		getGlobeMapArts(request.signal)
			.then((response) => (arts = response.mapArts))
			.catch((error) => {
				// The globe still spins without pins.
				if (!request.signal.aborted) console.error('Could not load the globe arts', error);
			});

		return () => {
			request.abort();
			stop();
			visibility.disconnect();
			resize.disconnect();
			globe.destroy();
		};
	});
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && deselect()} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="globe"
	bind:this={container}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
	onclick={onClick}
>
	<div class="sphere-clip">
		<div class="sphere-box">
			<canvas class="sphere" bind:this={canvas}></canvas>
		</div>
	</div>

	{#each arts as art (art.id)}
		<button
			class="pin"
			class:selected={art.id === selected?.id}
			bind:this={pins[art.id]}
			aria-label={art.title}
			aria-pressed={art.id === selected?.id}
			onclick={() => select(art)}
		></button>
	{/each}

	{#if selected}
		{@const style = artStyle(selected)}
		<a class="card" bind:this={card} href={roomHref(selected)}>
			<span class="title">{selected.title}</span>
			<span class="author">{artAuthor(selected)}</span>
			<span class="meta">
				<span class="date">{artDate(selected)}</span>
				{#if style}
					<span class="style" style:background={style.color}>{style.name}</span>
				{/if}
			</span>
		</a>
	{/if}
</div>

<style>
	.globe {
		--pin-size: 12px;
		--selected-pin-size: 16px;
		--halo-size: 28px;

		position: relative;
		aspect-ratio: 1;
		/* Vertical swipes still scroll the page; horizontal drags spin the globe. */
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		cursor: grab;
	}

	.globe:active {
		cursor: grabbing;
	}

	/* The sphere's color until COBE draws it, then its outline, like the design. */
	.globe::before,
	.globe::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		pointer-events: none;
	}

	.globe::before {
		background: #fff1d6;
	}

	.globe::after {
		box-shadow: inset 0 0 0 1px rgb(18 13 49 / 14%);
	}

	/* Cuts the glow around the sphere, so the canvas doesn't make the page longer or wider. */
	.sphere-clip {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: 50%;
		pointer-events: none;
	}

	/* COBE draws the sphere at 80% of its canvas (CANVAS_TO_GLOBE), and wraps the canvas in a
	   full-size div. */
	.sphere-box {
		position: absolute;
		inset: -12.5%;
	}

	.sphere {
		display: block;
		width: 100%;
		height: 100%;
	}

	.pin,
	.card {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		visibility: hidden;
	}

	.pin {
		width: var(--pin-size);
		height: var(--pin-size);
		padding: 0;
		border: 2px solid var(--blue);
		border-radius: 50%;
		background: var(--yellow);
		transform: translate(calc(var(--x) - 50%), calc(var(--y) - 50%));
		cursor: pointer;
	}

	/* A bigger touch target than the dot. */
	.pin::after {
		content: '';
		position: absolute;
		inset: -12px;
		border-radius: 50%;
	}

	.pin.selected {
		z-index: 2;
		width: var(--selected-pin-size);
		height: var(--selected-pin-size);
		border: 3px solid var(--yellow);
		background: var(--blue);
		box-shadow: 0 0 0 calc((var(--halo-size) - var(--selected-pin-size)) / 2) rgb(255 201 113 / 33%);
	}

	.pin:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 4px;
	}

	.card {
		z-index: 3;
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: min(250px, 60%);
		box-sizing: border-box;
		padding: 13px 13px 12px;
		border: 1px solid var(--exhibition-surface-border);
		border-radius: 8px;
		background: #ffffff;
		box-shadow: 0 10px 28px rgb(18 13 49 / 10%);
		color: var(--blue);
		text-decoration: none;
		transform: translate(calc(var(--x) + 27px), calc(var(--y) - 28px));
		cursor: pointer;
	}

	.card:global(.left) {
		transform: translate(calc(var(--x) - 100% - 27px), calc(var(--y) - 28px));
	}

	.date {
		font-family: var(--exhibition-label-font);
		text-transform: uppercase;
	}

	.title {
		overflow: hidden;
		font-size: 15px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.author {
		font-size: 13px;
		color: var(--dark-d4);
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding-top: 6px;
	}

	.date {
		font-size: 11px;
		letter-spacing: 0.6px;
		color: var(--dark-d5);
	}

	.style {
		padding: 4px 8px;
		border-radius: 3px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.8px;
		text-transform: uppercase;
	}

	@media (min-width: 960px) {
		.globe {
			--pin-size: 14px;
			--selected-pin-size: 18px;
			--halo-size: 36px;
		}

		.card {
			padding: 14px 16px;
			transform: translate(calc(var(--x) + 30px), calc(var(--y) - 28px));
		}

		.card:global(.left) {
			transform: translate(calc(var(--x) - 100% - 30px), calc(var(--y) - 28px));
		}

		.title {
			font-size: 16px;
		}

		.author {
			font-size: 14px;
		}
	}
</style>
