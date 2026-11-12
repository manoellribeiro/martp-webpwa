<script lang="ts">
	import { resolve } from '$app/paths';
	import badgeDe from '#lib/assets/google_play_badge/de.png';
	import badgeEn from '#lib/assets/google_play_badge/en.png';
	import badgeEs from '#lib/assets/google_play_badge/es.png';
	import badgeFr from '#lib/assets/google_play_badge/fr.png';
	import badgePtBr from '#lib/assets/google_play_badge/pt-br.png';
	import { type Locale, locale, strings } from '#lib/strings.ts';
	import { GOOGLE_PLAY_URL } from './links.ts';

	// Google's official badge (play.google.com/intl/en_us/badges), in the visitor's language,
	// cropped to the badge itself: the files come with clear space around it.
	const googlePlayBadges: Record<Locale, { src: string; width: number; height: number }> = {
		en: { src: badgeEn, width: 564, height: 168 },
		de: { src: badgeDe, width: 646, height: 192 },
		es: { src: badgeEs, width: 646, height: 192 },
		fr: { src: badgeFr, width: 646, height: 192 },
		'pt-BR': { src: badgePtBr, width: 646, height: 192 }
	};
	const googlePlayBadge = googlePlayBadges[locale];
</script>

<section class="app-download-links">
	<h2 class="title">{strings.make_your_own}</h2>
	<p class="description">{strings.make_your_own_description}</p>
	<div class="badges">
		<a class="google-play-link" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener">
			<img
				class="google-play"
				src={googlePlayBadge.src}
				alt={strings.get_it_on_google_play}
				width={googlePlayBadge.width}
				height={googlePlayBadge.height}
			/>
		</a>
		<!-- Styled after the official badge so both read as a pair. -->
		<a class="web-app" href={resolve('/(main)/edit')}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="12" cy="12" r="10" />
				<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
			</svg>
			<span class="web-app-text">
				<span class="small">{strings.or_open_the}</span>
				<span class="big">{strings.web_version}</span>
			</span>
		</a>
	</div>
</section>

<style>
	.app-download-links {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.title {
		margin: 0;
		font-family: var(--exhibition-headline-font);
		font-size: var(--exhibition-section-title-size);
		font-weight: 500;
		color: var(--blue);
	}

	.description {
		margin: 0;
		font-size: 16px;
		line-height: 1.5;
		color: var(--dark-d4);
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding-top: 12px;
	}

	/* The Google Play badge's corners: 19px for its 168px height (English). */
	.badges a {
		height: var(--badge-height);
		border-radius: calc(var(--badge-height) * 19 / 168);
	}

	.google-play-link {
		display: block;
	}

	.google-play {
		display: block;
		width: auto;
		height: 100%;
	}

	/* The official badge: black, a 1px #a6a6a6 border and rounded corners. */
	.web-app {
		display: flex;
		align-items: center;
		justify-content: center;
		/* The Google Play badge's width; wider only when a translation needs it. */
		min-width: calc(var(--badge-height) * 646 / 192);
		gap: 10px;
		box-sizing: border-box;
		padding: 0 18px 0 14px;
		white-space: nowrap;
		border: 1px solid #a6a6a6;
		background: var(--black);
		color: var(--white);
		text-decoration: none;
	}

	.web-app svg {
		width: 26px;
		height: 26px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
	}

	.web-app-text {
		display: flex;
		flex-direction: column;
	}

	.small {
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.6px;
		text-transform: uppercase;
	}

	.big {
		font-size: 20px;
		font-weight: 700;
		line-height: 1.1;
	}
</style>
