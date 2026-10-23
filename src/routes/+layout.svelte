<script lang="ts">
	import '../app.css';
	import { PUBLIC_SITE_URL } from '$app/env/public';
	import { page } from '$app/state';
	import UpdateAvailablePrompt from '#lib/components/UpdateAvailablePrompt.svelte';
	import { MAX_CANVAS_SIZE } from '#lib/sketches/martpSketch.ts';

	let { children } = $props();

	// The screens adapt to the window until the art reaches MAX_CANVAS_SIZE (device pixels)
	// plus its 16px margins; past that the whole app keeps that width, centered. It is set
	// before the screens mount, so the art is measured against it, and again whenever the
	// pixel ratio changes (browser zoom, another display).
	function updateMaxAppWidth() {
		const ratio = devicePixelRatio;
		document.documentElement.style.setProperty(
			'--max-app-width',
			`${MAX_CANVAS_SIZE / ratio + 32}px`
		);
		matchMedia(`(resolution: ${ratio}dppx)`).addEventListener('change', updateMaxAppWidth, {
			once: true
		});
	}
	updateMaxAppWidth();
</script>

<svelte:head>
	{#if PUBLIC_SITE_URL}
		<link rel="canonical" href={new URL(page.url.pathname, PUBLIC_SITE_URL).href} />
	{/if}
</svelte:head>

<div class="app">
	{@render children()}
</div>

<UpdateAvailablePrompt />

<style>
	.app {
		max-width: var(--max-app-width);
		margin: 0 auto;
	}
</style>
