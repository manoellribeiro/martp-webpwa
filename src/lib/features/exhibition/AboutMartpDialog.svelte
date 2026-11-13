<script lang="ts">
	import { strings } from '#lib/strings.ts';
	import ExhibitionDialog from './ExhibitionDialog.svelte';

	// Web-only: what Martp is, in the creator's words, opened by the exhibition's About link.

	let { onDismiss }: { onDismiss: () => void } = $props();

	const references = [
		{ label: 'I Made Art from Random Satellite Images', href: 'https://www.youtube.com/watch?v=KytAyWVtr_8' },
		{ label: strings.about_martp_takawo_sketches, href: 'https://openprocessing.org/@takawo#sketches' },
		{ label: 'New Art City', href: 'https://newart.city/' }
	];
</script>

<ExhibitionDialog title={strings.about_martp_title} {onDismiss}>
	<p>{strings.about_martp_intro}</p>
	<p>{strings.about_martp_how}</p>
	<p>{strings.about_martp_exhibition}</p>
	<p>{strings.about_martp_community}</p>

	<h3 class="references-title">{strings.about_martp_references}</h3>
	<ul class="references">
		{#each references as reference (reference.href)}
			<li>
				<a href={reference.href} target="_blank" rel="noopener">
					{reference.label}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
				</a>
			</li>
		{/each}
	</ul>

	<p class="signature">{strings.about_martp_signature}</p>
</ExhibitionDialog>

<style>
	p {
		margin: 0 0 14px;
	}

	.references-title {
		margin: 22px 0 10px;
		font-family: var(--exhibition-label-font);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 1px;
		color: var(--blue);
		text-transform: uppercase;
	}

	.references {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.references a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		color: var(--green-darker);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.references svg {
		width: 14px;
		height: 14px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.signature {
		margin: 26px 0 0;
		font-family: var(--exhibition-label-font);
		font-size: 13px;
		font-style: italic;
		color: var(--blue);
	}
</style>
