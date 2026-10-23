<script lang="ts">
	import { onMount } from 'svelte';
	import { strings } from '#lib/strings.ts';

	// Web-only: tells the user when a new deploy has been installed by the service worker
	// (src/service-worker) and switches to it on request. Until then the open app keeps the
	// version it started with, so a deploy never reloads the page in the middle of an art.
	let waitingWorker = $state<ServiceWorker | null>(null);

	onMount(() => {
		if (!('serviceWorker' in navigator)) return;
		let registration: ServiceWorkerRegistration | undefined;

		// Only an update has a controller already; the first install needs no prompt.
		const offerUpdate = (worker: ServiceWorker | null) => {
			if (worker && navigator.serviceWorker.controller) waitingWorker = worker;
		};
		const checkForUpdate = () => {
			if (document.visibilityState === 'visible') registration?.update().catch(() => {});
		};

		navigator.serviceWorker.ready.then((ready) => {
			registration = ready;
			offerUpdate(ready.waiting);
			ready.addEventListener('updatefound', () => {
				const installing = ready.installing;
				installing?.addEventListener('statechange', () => {
					if (installing.state === 'installed') offerUpdate(installing);
				});
			});
		});
		// The app is a SPA, so the browser only looks for a new version on full page loads.
		document.addEventListener('visibilitychange', checkForUpdate);
		return () => document.removeEventListener('visibilitychange', checkForUpdate);
	});

	function update() {
		navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
			once: true
		});
		waitingWorker?.postMessage('SKIP_WAITING');
	}
</script>

{#if waitingWorker}
	<div class="update-available-prompt" role="status">
		<p class="text-middle-screen-info message">{strings.update_available_message}</p>
		<div class="actions">
			<button type="button" class="text-title action" onclick={() => (waitingWorker = null)}>
				{strings.not_now_action}
			</button>
			<button type="button" class="text-title action primary" onclick={update}>
				{strings.update_action}
			</button>
		</div>
	</div>
{/if}

<style>
	/* Fixed, so it is capped and centered at the app's width like the bottom navigation bar. */
	.update-available-prompt {
		position: fixed;
		inset: calc(env(safe-area-inset-top) + 8px) 16px auto 16px;
		z-index: 10;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: center;
		justify-content: space-between;
		max-width: calc(var(--max-app-width) - 32px);
		margin: 0 auto;
		padding: 12px 16px;
		border-radius: 8px;
		background: var(--blue);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
	}

	.message {
		color: var(--white);
	}

	.actions {
		display: flex;
		gap: 8px;
		margin-left: auto;
	}

	.action {
		padding: 8px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--light-l1);
		font-family: inherit;
		cursor: pointer;
	}

	.action.primary {
		color: var(--yellow);
	}

	.action:focus-visible {
		outline: 2px solid var(--yellow);
	}
</style>
