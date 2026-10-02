<script lang="ts">
	import codeBaseIcon from '#lib/assets/ic_code_base.svg';
	import githubIcon from '#lib/assets/ic_github.svg';
	import linkedinIcon from '#lib/assets/ic_linkedin.svg';
	import logo from '#lib/assets/martp_logo.svg';
	import { strings } from '#lib/strings.ts';

	// Port of MartpProjectInfoFragment + fragment_martp_project_info.xml.
	const GITHUB_PROFILE_URL = 'https://github.com/manoellribeiro';
	const MARTP_GITHUB_REPOSITORY_URL = 'https://github.com/manoellribeiro/map-arts';
	const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/manoellribeiro/';

	// The labels are not in the app, whose image buttons have no content description.
	const links = [
		{ url: LINKEDIN_PROFILE_URL, icon: linkedinIcon, label: 'LinkedIn' },
		{ url: GITHUB_PROFILE_URL, icon: githubIcon, label: 'GitHub' },
		{ url: MARTP_GITHUB_REPOSITORY_URL, icon: codeBaseIcon, label: 'Martp GitHub repository' }
	];
</script>

<div class="martp-project-info">
	<img class="logo" src={logo} alt={strings.app_name} />

	<p class="description">{strings.martp_info_description}</p>

	<div class="links">
		{#each links as link (link.url)}
			<a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
				<img src={link.icon} alt="" />
			</a>
		{/each}
	</div>
</div>

<style>
	.logo {
		display: block;
		width: 200px;
		height: 200px;
		margin: 0 auto;
		object-fit: contain;
	}

	/* Text.MiddleScreenInfoText */
	.description {
		margin: 8px 16px 0;
		font-size: 14px;
		font-weight: 500;
		color: var(--dark-d1);
		white-space: pre-line;
	}

	.links {
		display: flex;
		justify-content: space-evenly;
		margin-top: 30px;
	}

	.links a {
		display: block;
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}

	.links a:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.links img {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
