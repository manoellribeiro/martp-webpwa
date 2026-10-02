<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import myLocationImage from '#lib/assets/ic_my_location.svg';
	import MartpButton from '#lib/components/MartpButton.svelte';
	import { checkLocationPermission, requestLocationPermission } from '#lib/data/location.ts';
	import { strings } from '#lib/strings.ts';

	// Port of LocationAccessDetailsActivity + activity_location_access_details.xml.
	let asking = $state(false);
	// Not in the app: Android can prompt again, but a browser that has location blocked
	// refuses silently, so the user has to be told to unblock it by hand.
	let errorMessage = $state<string | null>(null);

	async function showErrorIfLocationIsBlocked() {
		if ((await checkLocationPermission()) === 'denied') {
			errorMessage = strings.location_blocked_in_browser_error;
			return true;
		}
		return false;
	}

	onMount(() => {
		showErrorIfLocationIsBlocked();
	});

	async function askForLocationPermission() {
		asking = true;
		const wasGranted = await requestLocationPermission();
		asking = false;
		if (wasGranted) {
			// replaceState plays the role of finish(): back skips this screen.
			await goto('/create-new-map-art', { replaceState: true });
		} else if (!(await showErrorIfLocationIsBlocked())) {
			// The prompt was dismissed without blocking, so pressing again asks again.
			errorMessage = strings.location_permission_not_granted_failure_error;
		}
	}
</script>

<div class="location-access-details">
	<img class="location-image" src={myLocationImage} alt="" />

	<h1 class="text-screen-title title">{strings.we_need_your_location_to_create_art_with_you}</h1>
	<p class="text-middle-screen-info description">{strings.location_usage_details}</p>

	<div class="space"></div>

	{#if errorMessage}
		<p class="text-middle-screen-info error" role="alert">{errorMessage}</p>
	{/if}

	<div class="allow-location-access">
		<MartpButton
			title={strings.allow_location_access}
			cornerRadius={50}
			loading={asking}
			onclick={askForLocationPermission}
		/>
	</div>
</div>

<style>
	.location-access-details {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
		background: var(--light-l5);
	}

	.location-image {
		width: 200px;
		height: 200px;
		margin: 56px auto 0;
		object-fit: contain;
	}

	.title {
		margin: 16px 16px 0;
		text-align: center;
		white-space: pre-line;
	}

	.description {
		margin: 8px 16px 0;
	}

	.space {
		flex: 1;
	}

	.error {
		margin: 16px 16px 0;
		color: var(--error-medium);
	}

	.allow-location-access {
		margin: 16px;
	}
</style>
