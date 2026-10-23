<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { strings } from '#lib/strings.ts';

	interface Props {
		userInfoBadgeVisible: boolean;
		onCreateNewArt: () => void;
	}

	let { userInfoBadgeVisible, onCreateNewArt }: Props = $props();

	interface MenuItem {
		href: string;
		title: string;
		icon: Snippet;
		badge?: boolean;
	}

	// res/menu/bottom_navigation_menu.xml without the gallery item. The app's empty
	// "none" item, which reserves the slot under the FAB, is the FAB itself here.
	const leadingItems: MenuItem[] = [
		{ href: resolve('/(main)/edit'), title: strings.menu_edit, icon: artConfigIcon }
	];
	const trailingItems: MenuItem[] = $derived([
		{
			href: resolve('/(main)/profile'),
			title: strings.menu_user,
			icon: userDataIcon,
			badge: userInfoBadgeVisible
		},
		{ href: resolve('/(main)/about'), title: strings.menu_info, icon: infoIcon }
	]);
</script>

{#snippet artConfigIcon()}
	<svg viewBox="0 0 23.37 21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M1.82,6.28L1.82,16.01C1.82,17.91 3.17,18.69 4.81,17.75L7.16,16.41C7.67,16.12 8.52,16.09 9.05,16.36L14.3,18.99C14.83,19.25 15.68,19.23 16.19,18.94L20.52,16.46C21.07,16.14 21.53,15.36 21.53,14.72L21.53,4.99C21.53,3.09 20.18,2.31 18.54,3.25L16.19,4.59C15.68,4.88 14.83,4.91 14.3,4.64L9.05,2.02C8.52,1.76 7.67,1.78 7.16,2.07L2.83,4.55C2.27,4.87 1.82,5.65 1.82,6.28Z" />
		<path d="M8.09,2.5L8.09,15.5" />
		<path d="M15.26,5.12L15.26,18.5" />
	</svg>
{/snippet}

{#snippet userDataIcon()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
		<path d="M9,9m-2,0a2,2 0,1 1,4 0a2,2 0,1 1,-4 0" />
		<path d="M13,15C13,16.105 13,17 9,17C5,17 5,16.105 5,15C5,13.895 6.791,13 9,13C11.209,13 13,13.895 13,15Z" />
		<path stroke-linecap="round" d="M22,12C22,15.771 22,17.657 20.828,18.828C19.657,20 17.771,20 14,20H10C6.229,20 4.343,20 3.172,18.828C2,17.657 2,15.771 2,12C2,8.229 2,6.343 3.172,5.172C4.343,4 6.229,4 10,4H14C17.771,4 19.657,4 20.828,5.172C21.298,5.641 21.579,6.226 21.748,7" />
		<path stroke-linecap="round" d="M19,12H15" />
		<path stroke-linecap="round" d="M19,9H14" />
		<path stroke-linecap="round" d="M19,15H16" />
	</svg>
{/snippet}

{#snippet infoIcon()}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M13,8C13,7.448 12.552,7 12,7C11.448,7 11,7.448 11,8C11,8.552 11.448,9 12,9C12.552,9 13,8.552 13,8Z" />
		<path d="M12,17.75C12.414,17.75 12.75,17.414 12.75,17V11C12.75,10.586 12.414,10.25 12,10.25C11.586,10.25 11.25,10.586 11.25,11V17C11.25,17.414 11.586,17.75 12,17.75Z" />
		<path fill-rule="evenodd" d="M12.057,1.25H11.943C9.634,1.25 7.825,1.25 6.414,1.44C4.969,1.634 3.829,2.039 2.934,2.934C2.039,3.829 1.634,4.969 1.44,6.414C1.25,7.825 1.25,9.634 1.25,11.943V12.057C1.25,14.366 1.25,16.175 1.44,17.586C1.634,19.031 2.039,20.171 2.934,21.066C3.829,21.961 4.969,22.366 6.414,22.56C7.825,22.75 9.634,22.75 11.943,22.75H12.057C14.366,22.75 16.175,22.75 17.586,22.56C19.031,22.366 20.171,21.961 21.066,21.066C21.961,20.171 22.366,19.031 22.56,17.586C22.75,16.175 22.75,14.366 22.75,12.057V11.943C22.75,9.634 22.75,7.825 22.56,6.414C22.366,4.969 21.961,3.829 21.066,2.934C20.171,2.039 19.031,1.634 17.586,1.44C16.175,1.25 14.366,1.25 12.057,1.25ZM3.995,3.995C4.564,3.425 5.335,3.098 6.614,2.926C7.914,2.752 9.622,2.75 12,2.75C14.378,2.75 16.086,2.752 17.386,2.926C18.665,3.098 19.435,3.425 20.005,3.995C20.575,4.564 20.902,5.335 21.074,6.614C21.248,7.914 21.25,9.622 21.25,12C21.25,14.378 21.248,16.086 21.074,17.386C20.902,18.665 20.575,19.435 20.005,20.005C19.435,20.575 18.665,20.902 17.386,21.074C16.086,21.248 14.378,21.25 12,21.25C9.622,21.25 7.914,21.248 6.614,21.074C5.335,20.902 4.564,20.575 3.995,20.005C3.425,19.435 3.098,18.665 2.926,17.386C2.752,16.086 2.75,14.378 2.75,12C2.75,9.622 2.752,7.914 2.926,6.614C3.098,5.335 3.425,4.564 3.995,3.995Z" />
	</svg>
{/snippet}

{#snippet menuItem(item: MenuItem)}
	{@const selected = page.url.pathname === item.href}
	<a class="item" href={item.href} aria-label={item.title} aria-current={selected ? 'page' : undefined}>
		<span class="active-indicator">
			<span class="icon">
				{@render item.icon()}
				{#if item.badge}
					<span class="badge"></span>
				{/if}
			</span>
		</span>
	</a>
{/snippet}

<nav class="bottom-navigation-bar">
	{#each leadingItems as item (item.href)}
		{@render menuItem(item)}
	{/each}

	<div class="fab-slot">
		<button
			type="button"
			class="create-new-art-fab"
			aria-label={strings.create_new_art}
			onclick={onCreateNewArt}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.008" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M12,13V7M15,10.001L9,10M19,10.2C19,14.176 15.5,17.4 12,21C8.5,17.4 5,14.176 5,10.2C5,6.224 8.134,3 12,3C15.866,3 19,6.224 19,10.2Z" />
			</svg>
		</button>
	</div>

	{#each trailingItems as item (item.href)}
		{@render menuItem(item)}
	{/each}
</nav>

<style>
	.bottom-navigation-bar {
		position: fixed;
		inset: auto 0 0 0;
		/* Centered at the app's width, like the screens above it. */
		max-width: var(--max-app-width);
		margin: 0 auto;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		height: calc(var(--bottom-navigation-bar-height) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		/* background_home_bottom_navigation_bar.xml */
		background: var(--white);
		border: 1px solid var(--light-l3);
	}

	.item {
		display: grid;
		place-items: center;
		/* selector_bottom_navigation_menus.xml */
		color: var(--dark-d4);
	}

	.item[aria-current='page'] {
		color: var(--blue);
	}

	.active-indicator {
		display: grid;
		place-items: center;
		width: 64px;
		height: 32px;
		border-radius: 16px;
		transition: background-color 150ms;
	}

	.item[aria-current='page'] .active-indicator {
		background: var(--yellow);
	}

	.item:focus-visible {
		outline: none;
	}

	.item:focus-visible .active-indicator,
	.create-new-art-fab:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.icon {
		position: relative;
		display: grid;
		width: 20px;
		height: 20px;
	}

	.icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.badge {
		position: absolute;
		top: -1px;
		right: -3px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		/* Material 3 default badge color (colorError) */
		background: #b3261e;
	}

	.fab-slot {
		display: grid;
		place-items: center;
	}

	.create-new-art-fab {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--yellow);
		color: var(--black);
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.3),
			0 4px 8px 3px rgb(0 0 0 / 0.15);
		cursor: pointer;
	}

	.create-new-art-fab svg {
		width: 32px;
		height: 32px;
	}
</style>
