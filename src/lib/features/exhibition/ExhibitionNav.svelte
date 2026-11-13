<script lang="ts">
	import { strings } from '#lib/strings.ts';
	import AboutMartpDialog from './AboutMartpDialog.svelte';
	import ContactDialog from './ContactDialog.svelte';

	let { direction }: { direction: 'row' | 'column' } = $props();

	let openDialog = $state<'about' | 'contact' | null>(null);
</script>

<!-- Both open a dialog: what Martp is, and the ways to get in touch. -->
<nav class="exhibition-nav" class:column={direction === 'column'}>
	<button class="link" aria-haspopup="dialog" onclick={() => (openDialog = 'about')}>
		{strings.menu_info}
	</button>
	<button class="link" aria-haspopup="dialog" onclick={() => (openDialog = 'contact')}>
		{strings.contact_action}
	</button>
</nav>

{#if openDialog === 'about'}
	<AboutMartpDialog onDismiss={() => (openDialog = null)} />
{:else if openDialog === 'contact'}
	<ContactDialog onDismiss={() => (openDialog = null)} />
{/if}

<style>
	.exhibition-nav {
		display: flex;
		gap: 24px;
	}

	.exhibition-nav.column {
		flex-direction: column;
		gap: 10px;
	}

	/* Buttons that look like links. */
	.link {
		align-self: flex-start;
		padding: 0;
		border: none;
		background: none;
		color: var(--green-darker);
		font: inherit;
		font-size: 17px;
		font-weight: 500;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
