<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/martp_logo.svg';
	import AppDownloadLinks from '#lib/features/exhibition/AppDownloadLinks.svelte';
	import ExhibitionGlobe from '#lib/features/exhibition/ExhibitionGlobe.svelte';
	import ExhibitionNav from '#lib/features/exhibition/ExhibitionNav.svelte';
	import SocialLinks from '#lib/features/exhibition/SocialLinks.svelte';
	import { strings } from '#lib/strings.ts';

	// Web-only: the digital exhibition's home (digital-exhibition.pen, "Exhibition Home - Desktop
	// (Globe)" and "Exhibition Home - Mobile").
</script>

<svelte:head>
	<title>{strings.digital_exhibition} · Martp</title>
</svelte:head>

<div class="home">
	<header class="header">
		<div class="brand">
			<div class="logo-block">
				<img class="logo" src={logo} alt="Martp" width="512" height="256" />
				<p class="tagline">{strings.digital_exhibition}</p>
			</div>
			<span class="divider" aria-hidden="true"></span>
			<div class="header-nav">
				<ExhibitionNav direction="column" />
			</div>
		</div>
		<SocialLinks />
	</header>

	<main class="main">
		<section class="hero">
			<h1 class="headline">{strings.exhibition_headline}</h1>
			<a class="enter-button" href={resolve('/(exhibition)/exhibition/rooms')}>
				{strings.enter_the_exhibition}
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
			</a>
		</section>

		<span class="lower-band" aria-hidden="true"></span>

		<section class="globe-section">
			<!-- The heading is as wide as the globe, so their left edges line up. -->
			<div class="globe-column">
				<div class="globe-heading">
					<h2 class="section-title">{strings.arts_around_the_world}</h2>
					<p class="globe-hint">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
						</svg>
						{strings.drag_to_spin}
					</p>
				</div>
				<div class="globe">
					<ExhibitionGlobe />
				</div>
			</div>
		</section>

		<div class="download">
			<AppDownloadLinks />
		</div>

		<footer class="footer">
			<ExhibitionNav direction="row" />
		</footer>
	</main>
</div>

<style>
	/* Mobile first: one column. From 960px, the design's two columns. */
	.home {
		--content-max-width: 1200px;
		--page-padding: 20px;
		--exhibition-section-title-size: 21px;
		--badge-height: 56px;
		--band-line: #e6dcc6;
		--band-background: linear-gradient(#fff6e2, #ffefd2);

		display: flex;
		flex-direction: column;
		/* Lets the band behind the globe (z-index -1) paint above this background. */
		isolation: isolate;
		min-height: 100dvh;
		padding: 20px var(--page-padding) 28px;
		box-sizing: border-box;
		overflow-x: clip;
		background: linear-gradient(#ffffff, #fffdf8 12%, var(--light-cream) 35%);
		color: var(--blue);
	}

	.header,
	.main {
		width: 100%;
		max-width: var(--content-max-width);
		margin: 0 auto;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: flex-start;
		gap: 28px;
	}

	.logo-block {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.logo {
		display: block;
		width: auto;
		height: 44px;
		/* The wordmark has empty space around it in its 2:1 box. */
		margin: -6px 0 -6px -10px;
	}

	.tagline {
		margin: 0;
		font-family: var(--exhibition-label-font);
		font-size: 12px;
		font-style: italic;
	}

	.divider,
	.header-nav {
		display: none;
	}

	.main {
		display: grid;
		flex: 1;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto 1fr auto;
		grid-template-areas: 'hero' 'globe' 'download' 'footer';
	}

	.hero {
		grid-area: hero;
		display: flex;
		flex-direction: column;
		gap: 28px;
		padding-top: 44px;
	}

	.headline {
		margin: 0;
		font-family: var(--exhibition-headline-font);
		font-size: clamp(28px, 2.4vw + 18px, 44px);
		font-weight: 500;
		line-height: 1.18;
		letter-spacing: -0.5px;
	}

	.enter-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		height: 56px;
		border-radius: 10px;
		background: var(--blue);
		color: var(--light-cream);
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 2.4px;
		text-decoration: none;
		text-transform: uppercase;
	}

	.enter-button svg {
		width: 18px;
		height: 18px;
		fill: none;
		stroke: var(--yellow);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* The warmer floor below the line, full-bleed. On a phone it starts at the middle of the
	   globe (.globe::before), on a big screen right below the hero. */
	.lower-band {
		grid-row: 3 / -1;
		grid-column: 1 / -1;
		margin: 0 calc(-50vw + 50%) -28px;
		background: var(--band-background);
	}

	.globe-section {
		grid-area: globe;
		display: flex;
		flex-direction: column;
		padding-top: 52px;
	}

	.globe-column {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.globe-heading {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.section-title {
		margin: 0;
		font-family: var(--exhibition-headline-font);
		font-size: var(--exhibition-section-title-size);
		font-weight: 500;
	}

	.globe-hint {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		font-family: var(--exhibition-label-font);
		font-size: 11px;
		letter-spacing: 0.8px;
		color: var(--dark-d5);
		text-transform: uppercase;
	}

	.globe-hint svg {
		width: 12px;
		height: 12px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
	}

	.globe {
		position: relative;
	}

	/* On a phone the warmer floor starts at the middle of the globe. */
	.globe::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 50% calc(-50vw + 50%) 0;
		border-top: 1px solid var(--band-line);
		background: #fff6e2;
	}
	.download {
		grid-area: download;
		padding-top: 56px;
	}

	.footer {
		grid-area: footer;
		margin-top: 44px;
		padding-top: 14px;
		border-top: 1px solid var(--band-line);
	}

	@media (min-width: 960px) {
		.home {
			--page-padding: clamp(40px, 8vw, 120px);
			--exhibition-section-title-size: 30px;
			--badge-height: 60px;
			/* Above the headline and the globe's title, which line up. */
			--columns-top: 56px;

			padding-top: 40px;
			padding-bottom: 48px;
			background: linear-gradient(#ffffff, #fffdf8 12%, var(--light-cream) 45%);
		}

		.header {
			align-items: flex-start;
		}

		.logo {
			height: 60px;
			margin: -8px 0 -8px -14px;
		}

		.tagline {
			font-size: 15px;
		}

		.divider {
			display: block;
			width: 1px;
			height: 96px;
			background: var(--exhibition-surface-border);
		}

		.header-nav {
			display: block;
			padding-top: 8px;
		}

		.main {
			grid-template-columns: minmax(0, 524fr) minmax(48px, 140fr) minmax(0, 536fr);
			grid-template-rows: auto 1fr;
			grid-template-areas:
				'hero . globe'
				'download . globe';
		}

		/* Keeps the button a little above the line where the floor starts. */
		.hero {
			gap: 36px;
			padding-top: var(--columns-top);
			padding-bottom: 44px;
		}

		.enter-button {
			height: 60px;
		}

		.lower-band {
			grid-row: 2 / -1;
			margin-bottom: -48px;
			border-top: 1px solid var(--band-line);
		}

		/* The title's top lines up with the headline's (.hero). */
		.globe-section {
			padding-top: var(--columns-top);
		}

		/* Small enough to be seen whole on the first screen, below the header, the top padding
		   and the globe's heading. Its right edge lines up with the header's social links. */
		.globe-column {
			align-self: flex-end;
			width: min(100%, max(360px, 100svh - 330px));
		}

		.globe::before {
			display: none;
		}


		.download {
			padding-top: 44px;
		}

		.footer {
			display: none;
		}
	}
</style>
