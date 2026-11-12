<script lang="ts">
	import githubIcon from '#lib/assets/ic_github.svg';
	import instagramIcon from '#lib/assets/ic_instagram.svg';
	import linkedinIcon from '#lib/assets/ic_linkedin.svg';
	import { GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL } from './links.ts';

	const links = [
		{ href: INSTAGRAM_URL, label: 'Instagram', icon: instagramIcon },
		{ href: GITHUB_URL, label: 'GitHub', icon: githubIcon },
		{ href: LINKEDIN_URL, label: 'LinkedIn', icon: linkedinIcon }
	];
</script>

<ul class="social-links">
	{#each links as link (link.href)}
		<li>
			<a href={link.href} target="_blank" rel="noopener" aria-label={link.label}>
				<!-- The icons have a fixed color, so they are tinted as a mask over currentColor. -->
				<span class="icon" style:--icon={`url("${link.icon}")`}></span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.social-links {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		color: var(--blue);
	}

	/* The last icon lines up with the content's right edge. */
	li:last-child a {
		justify-content: flex-end;
	}

	/* The URL is quoted because Vite inlines small SVGs as data URLs, which contain quotes. */
	.icon {
		width: 20px;
		height: 20px;
		background: currentColor;
		-webkit-mask: var(--icon) center / contain no-repeat;
		mask: var(--icon) center / contain no-repeat;
	}
</style>
