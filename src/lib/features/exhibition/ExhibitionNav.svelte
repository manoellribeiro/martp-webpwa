<script lang="ts">
	import { resolve } from '$app/paths';
	import { strings } from '#lib/strings.ts';
	import { LINKEDIN_URL } from './links.ts';

	let { direction }: { direction: 'row' | 'column' } = $props();
</script>

<!-- About opens the app's Martp info screen; Contact is the LinkedIn profile that screen points to. -->
<nav class="exhibition-nav" class:column={direction === 'column'}>
	<a href={resolve('/(main)/about')}>{strings.menu_info}</a>
	<a href={LINKEDIN_URL} target="_blank" rel="noopener">{strings.contact_action}</a>
</nav>

<style>
	.exhibition-nav {
		display: flex;
		gap: 24px;
	}

	.exhibition-nav.column {
		flex-direction: column;
		gap: 10px;
	}

	a {
		color: var(--green-darker);
		font-size: 17px;
		font-weight: 500;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
