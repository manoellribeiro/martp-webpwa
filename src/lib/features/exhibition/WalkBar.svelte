<script lang="ts">
	// The bar under the exhibition's sideways lists: where you are, a progress rail, a hint and the
	// previous and next arrows. On a phone the hint is hidden and the position sits above the rail.

	let {
		position,
		progress,
		hint,
		previousLabel,
		nextLabel,
		atStart,
		atEnd,
		onprevious,
		onnext
	}: {
		position: string;
		/** 0 to 1. */
		progress: number;
		hint: string;
		previousLabel: string;
		nextLabel: string;
		atStart: boolean;
		atEnd: boolean;
		onprevious: () => void;
		onnext: () => void;
	} = $props();
</script>

<div class="walk-bar">
	<div class="progress">
		<span class="position">{position}</span>
		<span class="rail"><span class="rail-fill" style:width="{progress * 100}%"></span></span>
	</div>
	<!-- Nothing to walk to when everything is seen. -->
	<p class="hint" class:hidden={atStart && atEnd}>{hint}</p>
	<div class="arrows" class:hidden={atStart && atEnd}>
		<button class="arrow-button" aria-label={previousLabel} disabled={atStart} onclick={onprevious}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
		</button>
		<button class="arrow-button next" aria-label={nextLabel} disabled={atEnd} onclick={onnext}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
		</button>
	</div>
</div>

<style>
	.walk-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		color: var(--blue);
	}

	.progress {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.position,
	.hint {
		font-family: var(--exhibition-label-font);
	}

	.position {
		font-size: 12px;
		letter-spacing: 0.6px;
		white-space: nowrap;
	}

	.rail {
		position: relative;
		width: 140px;
		height: 3px;
		border-radius: 2px;
		background: rgb(18 13 49 / 10%);
	}

	.rail-fill {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: 2px;
		background: var(--blue);
		transition: width 0.2s ease;
	}

	.hint {
		display: none;
		margin: 0;
		font-size: 11px;
		letter-spacing: 0.8px;
		color: var(--dark-d5);
		text-align: center;
		text-transform: uppercase;
	}

	.hidden {
		visibility: hidden;
	}

	.arrows {
		display: flex;
		gap: 10px;
	}

	.arrow-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border: 1.5px solid var(--blue);
		border-radius: 50%;
		background: transparent;
		color: var(--blue);
		cursor: pointer;
	}

	.arrow-button.next {
		background: var(--blue);
		color: var(--light-cream);
	}

	.arrow-button:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.arrow-button svg {
		width: 18px;
		height: 18px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (min-width: 960px) {
		.progress {
			flex-direction: row;
			align-items: center;
			gap: 16px;
		}

		.rail {
			width: 240px;
		}

		.hint {
			display: block;
		}
	}
</style>
