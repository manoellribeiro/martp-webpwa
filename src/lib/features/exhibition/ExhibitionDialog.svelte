<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { strings } from '#lib/strings.ts';

	// The exhibition's modal <dialog> (About, Contact): a title, a close button and a body that
	// scrolls. It closes on Escape, the close button or a tap on the scrim, and calls `onDismiss`
	// however it was closed. A centered panel on a big screen, a sheet on a phone.

	let { title, onDismiss, children }: { title: string; onDismiss: () => void; children: Snippet } =
		$props();

	let dialog: HTMLDialogElement;
	const titleId = $props.id();

	onMount(() => dialog.showModal());

	/** A tap outside the panel lands on the dialog itself (the scrim). */
	function closeOnScrimClick(event: MouseEvent) {
		if (event.target === dialog) dialog.close();
	}
</script>

<dialog
	class="exhibition-dialog"
	aria-labelledby={titleId}
	bind:this={dialog}
	onclose={onDismiss}
	onclick={closeOnScrimClick}
>
	<div class="panel">
		<header class="panel-header">
			<h2 class="title" id={titleId}>{title}</h2>
			<button class="close-button" aria-label={strings.close} onclick={() => dialog.close()}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
			</button>
		</header>

		<!-- Only the body scrolls; the title and the close button stay. -->
		<div class="body">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.exhibition-dialog {
		width: 100%;
		max-width: 100%;
		max-height: 92dvh;
		margin: auto auto 0;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--blue);
	}

	.exhibition-dialog::backdrop {
		background: rgb(18 13 49 / 40%);
	}

	.panel {
		display: flex;
		flex-direction: column;
		max-height: 92dvh;
		box-sizing: border-box;
		border-radius: 16px 16px 0 0;
		background: var(--light-cream);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 20px 12px;
		border-bottom: 1px solid var(--exhibition-surface-border);
	}

	.title {
		margin: 0;
		font-family: var(--exhibition-headline-font);
		font-size: 21px;
		font-weight: 500;
	}

	.close-button {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 1.5px solid var(--blue);
		border-radius: 10px;
		background: transparent;
		color: var(--blue);
		cursor: pointer;
	}

	.close-button svg {
		width: 18px;
		height: 18px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.body {
		padding: 16px 20px calc(24px + env(safe-area-inset-bottom));
		overflow-y: auto;
		font-size: 16px;
		line-height: 1.55;
		color: var(--dark-d4);
	}

	@media (min-width: 960px) {
		.exhibition-dialog {
			max-width: 640px;
			max-height: 86dvh;
			margin: auto;
		}

		.panel {
			max-height: 86dvh;
			border: 1px solid var(--exhibition-surface-border);
			border-radius: 12px;
			box-shadow: 0 20px 48px rgb(18 13 49 / 18%);
		}

		.panel-header {
			padding: 28px 32px 16px;
		}

		.title {
			font-size: 26px;
		}

		.body {
			padding: 20px 32px 32px;
			font-size: 17px;
		}
	}
</style>
