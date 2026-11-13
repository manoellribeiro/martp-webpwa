<script lang="ts">
	// Port of ColorPaletteIndicator (ArtSettingRows.kt): two rows of color swatches.
	const colorsRows = [
		['var(--blue)', 'var(--yellow)', 'var(--green)'],
		['var(--error-medium)', 'var(--green-darker)', 'var(--light-yellow)']
	];
</script>

<div class="color-palette-indicator">
	{#each colorsRows as colorsRow, rowIndex (rowIndex)}
		<span class="swatches">
			{#each colorsRow as color (color)}
				<span class="swatch" style:background={color}></span>
			{/each}
		</span>
	{/each}
</div>

<style>
	.color-palette-indicator {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.swatches {
		display: flex;
		gap: 3px;
	}

	.swatch {
		width: 12px;
		height: 12px;
		box-sizing: border-box;
		border: 1px solid var(--blue-alpha-12);
		border-radius: 50%;
	}
</style>
