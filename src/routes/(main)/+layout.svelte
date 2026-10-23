<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { checkLocationPermission, requestLocationPermission } from '#lib/data/location.ts';
	import BottomNavigationBar from '#lib/features/main/BottomNavigationBar.svelte';
	import { mainViewModel } from '#lib/features/main/main.viewmodel.svelte.ts';

	// Web counterpart of MainActivity + activity_main.xml: the screens that share the
	// bottom navigation bar render inside this layout.
	let { children } = $props();

	onMount(() => mainViewModel.handleBadgesVisibilities());

	async function verifyPermissionToAccessLocation() {
		switch (await checkLocationPermission()) {
			case 'granted':
				await goto(resolve('/create-new-map-art'));
				break;
			case 'denied':
				// Closest thing the web has to shouldShowRequestPermissionRationale.
				await goto(resolve('/location-access-details'));
				break;
			case 'prompt':
				await goto(
					(await requestLocationPermission())
						? resolve('/create-new-map-art')
						: resolve('/location-access-details')
				);
				break;
		}
	}
</script>

<div class="fragment-container">
	{@render children()}
</div>

<BottomNavigationBar
	userInfoBadgeVisible={mainViewModel.userInfoBadgeVisible}
	onCreateNewArt={verifyPermissionToAccessLocation}
/>

<style>
	.fragment-container {
		min-height: 100dvh;
		padding-top: env(safe-area-inset-top);
		padding-bottom: calc(var(--bottom-navigation-bar-height) + env(safe-area-inset-bottom));
		background: var(--light-cream);
	}
</style>
