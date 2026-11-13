<script lang="ts">
	import type { Snippet } from 'svelte';

	// Port of ArtSettingRow (core/components/compose/ArtSettingRows.kt): one art setting (art
	// style, color palette, map zoom) with a small picture of it on the left. Shared by the
	// success screen and the onboarding.
	interface Props {
		title: string;
		description?: string | null;
		showTopDivider: boolean;
		indicator: Snippet;
	}

	let { title, description = null, showTopDivider, indicator }: Props = $props();
</script>

<div class="art-setting-row" class:top-divider={showTopDivider}>
	<div class="indicator" aria-hidden="true">
		{@render indicator()}
	</div>
	<div class="texts">
		<p class="text-title title">{title}</p>
		{#if description}
			<p class="text-gray-subtitle">{description}</p>
		{/if}
	</div>
</div>

<style>
	.art-setting-row {
		display: flex;
		align-items: center;
		padding: 10px 0;
	}

	.top-divider {
		border-top: 1px solid var(--blue-alpha-8);
	}

	.indicator {
		flex-shrink: 0;
		width: 80px;
	}

	.texts {
		flex: 1;
		min-width: 0;
		padding-left: 14px;
	}

	.title {
		color: var(--blue);
	}
</style>
