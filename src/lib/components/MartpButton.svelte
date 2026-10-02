<script lang="ts">
	// Port of core/components/MartpButton.kt and the MartpButton.* styles in themes.xml.
	// Not ported yet: start/end icons.
	interface Props {
		title: string;
		/** MartpButton.Primary, MartpButton.Secondary or MartpButton.Ghost. */
		variant?: 'primary' | 'secondary' | 'ghost';
		isEnabled?: boolean;
		/** Hides the title and shows a progress indicator; the button stops being clickable. */
		loading?: boolean;
		/** Corner radius in px. */
		cornerRadius?: number;
		onclick?: () => void;
	}

	let {
		title,
		variant = 'primary',
		isEnabled = true,
		loading = false,
		cornerRadius = 8,
		onclick
	}: Props = $props();
</script>

<button
	type="button"
	class="martp-button {variant}"
	class:loading
	style:--corner-radius="{cornerRadius}px"
	disabled={!isEnabled}
	aria-busy={loading}
	onclick={() => !loading && onclick?.()}
>
	{#if loading}
		<span class="progress-bar" aria-label={title}></span>
	{:else}
		<span class="title">{title}</span>
	{/if}
</button>

<style>
	.martp-button {
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 46px;
		padding: 12px;
		border: 1px solid var(--stroke-color);
		border-radius: var(--corner-radius);
		background: var(--button-background-color);
		color: var(--font-and-icon-color);
		font: inherit;
		cursor: pointer;
	}

	.primary {
		--button-background-color: var(--blue);
		--stroke-color: var(--blue);
		--font-and-icon-color: var(--light-l5);
		--ripple-color: rgb(0 0 0 / 0.33);
	}

	.secondary {
		--button-background-color: var(--white);
		--stroke-color: var(--blue);
		--font-and-icon-color: var(--blue);
		--ripple-color: rgb(0 0 0 / 0.13);
	}

	.ghost {
		--button-background-color: var(--light-l5);
		--stroke-color: var(--light-l5);
		--font-and-icon-color: var(--dark-d1);
		--ripple-color: rgb(0 0 0 / 0.33);
	}

	.martp-button:disabled {
		--stroke-color: var(--light-l2);
		--button-background-color: var(--light-l2);
		--font-and-icon-color: var(--dark-d4);
		cursor: default;
	}

	.secondary:disabled {
		--button-background-color: var(--white);
	}

	.martp-button.loading {
		cursor: default;
	}

	/* Stands in for the Android ripple. */
	.martp-button:not(:disabled, .loading):active {
		background-image: linear-gradient(var(--ripple-color), var(--ripple-color));
	}

	.martp-button:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.title {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 16px;
		font-weight: 900;
		line-height: 22px;
	}

	.progress-bar {
		width: 22px;
		height: 22px;
		border: 3px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 800ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
