<script lang="ts">
	import { artStyleModels } from '#lib/features/artStyleSettings/mapArtStyleModels.ts';

	// Port of ArtStyleIndicator (ArtSettingRows.kt): the art styles as chips, the first one highlighted.
</script>

<div class="art-style-indicator">
	{#each artStyleModels as artStyleModel, index (artStyleModel.sketchArtType)}
		<span class="chip" class:highlighted={index === 0}>
			<span class="icon" style:--icon={`url("${artStyleModel.icon}")`}></span>
		</span>
	{/each}
</div>

<style>
	.art-style-indicator {
		display: flex;
		gap: 4px;
	}

	.chip {
		display: grid;
		place-items: center;
		box-sizing: border-box;
		width: 24px;
		height: 24px;
		padding: 5px;
		border-radius: 6px;
		background: var(--light-l3);
		color: var(--dark-d4);
	}

	.chip.highlighted {
		background: var(--yellow);
		color: var(--blue);
	}

	/* Icon tint, as in the art style cards: the drawable is a mask over the current color. */
	.icon {
		width: 100%;
		height: 100%;
		background: currentColor;
		-webkit-mask: var(--icon) center / contain no-repeat;
		mask: var(--icon) center / contain no-repeat;
	}
</style>
