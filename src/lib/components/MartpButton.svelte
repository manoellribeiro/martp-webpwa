<script lang="ts">
	import type { Snippet } from 'svelte';

	// Port of core/components/MartpButton.kt and the MartpButton.* styles in themes.xml.
	// Not ported yet: the end icon.
	interface Props {
		title: string;
		/**
		 * MartpButton.Primary, MartpButton.Secondary, MartpButton.Ghost, MartpButton.Pill or
		 * MartpButton.TextButton.
		 */
		variant?: 'primary' | 'secondary' | 'ghost' | 'pill' | 'text';
		/** Android's layout_width: fill the parent or wrap the content. */
		width?: 'match_parent' | 'wrap_content';
		/** Icon before the title, tinted with the font color (an SVG using currentColor). */
		startIcon?: Snippet;
		/** app:buttonBackgroundColor / setButtonBackGroundColor, overriding the style's. */
		buttonBackgroundColor?: string;
		/** app:strokeColor / setStrokeColor, overriding the style's. */
		strokeColor?: string;
		/** app:fontAndIconColor / setTitleColor, overriding the style's. */
		fontAndIconColor?: string;
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
		width = 'match_parent',
		startIcon,
		buttonBackgroundColor,
		strokeColor,
		fontAndIconColor,
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
	class:wrap-content={width === 'wrap_content'}
	style:--corner-radius="{cornerRadius}px"
	style:--button-background-color={buttonBackgroundColor}
	style:--stroke-color={strokeColor}
	style:--font-and-icon-color={fontAndIconColor}
	disabled={!isEnabled}
	aria-busy={loading}
	onclick={() => !loading && onclick?.()}
>
	{#if loading}
		<span class="progress-bar" aria-label={title}></span>
	{:else}
		<span class="content">
			{#if startIcon}
				<span class="start-icon">{@render startIcon()}</span>
			{/if}
			<span class="title">{title}</span>
		</span>
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

	.pill {
		--button-background-color: var(--yellow);
		--stroke-color: var(--yellow);
		--font-and-icon-color: var(--black);
		--ripple-color: rgb(0 0 0 / 0.13);
		--title-font-weight: 500;
		min-height: 0;
		padding: 4px 16px 4px 12px;
	}

	.text {
		--button-background-color: transparent;
		--stroke-color: transparent;
		--font-and-icon-color: var(--dark-d1);
		--ripple-color: rgb(0 0 0 / 0.13);
		min-height: 0;
		padding: 4px 16px 4px 12px;
	}

	.wrap-content {
		width: auto;
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

	.content {
		display: flex;
		align-items: center;
		max-width: 100%;
	}

	.start-icon {
		display: flex;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		margin-right: 8px;
	}

	.start-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.title {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 16px;
		font-weight: var(--title-font-weight, 900);
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
