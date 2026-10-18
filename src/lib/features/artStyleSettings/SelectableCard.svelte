<script lang="ts">
	import type { Snippet } from 'svelte';

	// The Card + RadioButton shared by ArtStyleCardSelector and ColorPaletteCardSelector
	// (ArtStyleSettingsFragment.kt). The whole card is the radio's label, so it is clickable.
	interface Props {
		/** Radio group name. */
		name: string;
		value: string;
		selected: boolean;
		/** Card content padding in px, as [vertical, horizontal]. */
		padding: [number, number];
		onselect: () => void;
		children: Snippet;
	}

	let { name, value, selected, padding, onselect, children }: Props = $props();
</script>

<label class="card" class:selected style:padding="{padding[0]}px {padding[1]}px">
	<span class="content">{@render children()}</span>
	<input type="radio" {name} {value} checked={selected} onchange={onselect} />
</label>

<style>
	/* Material 3 Card: medium shape, no elevation */
	.card {
		display: flex;
		align-items: center;
		border: 0.5px solid var(--light-l5);
		border-radius: 12px;
		background: var(--white);
		cursor: pointer;
	}

	.card.selected {
		border: 2px solid var(--yellow);
	}

	.card:has(input:focus-visible) {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.content {
		display: flex;
		flex: 1;
		align-items: center;
		min-width: 0;
	}

	/* Material 3 RadioButton without the minimum interactive size: a 20px icon with 2px padding */
	input {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		margin: 2px;
		border: 2px solid var(--dark-d5);
		border-radius: 50%;
		appearance: none;
		cursor: pointer;
	}

	input:checked {
		border-color: var(--yellow);
		background: radial-gradient(var(--yellow) 0 5px, transparent 5.5px);
	}

	input:focus-visible {
		outline: none;
	}
</style>
