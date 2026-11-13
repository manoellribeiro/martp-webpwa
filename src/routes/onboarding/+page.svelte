<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ArtSettingRow from '#lib/components/ArtSettingRow.svelte';
	import ArtStyleIndicator from '#lib/components/ArtStyleIndicator.svelte';
	import ColorPaletteIndicator from '#lib/components/ColorPaletteIndicator.svelte';
	import MapZoomIndicator from '#lib/components/MapZoomIndicator.svelte';
	import MartpPrimaryButton from '#lib/components/MartpPrimaryButton.svelte';
	import exampleArt from '#lib/assets/onboarding/onboarding_example_art.webp';
	import globe from '#lib/assets/onboarding/onboarding_globe.webp';
	import { setOnboardingSeen } from '#lib/data/onboarding.ts';
	import { formatString, strings } from '#lib/strings.ts';

	// Port of OnboardingActivity + OnboardingScreen.kt + OnboardingViewModel. A separate activity
	// on Android, so a top-level route here, without the bottom navigation bar. The root layout
	// opens it on the first visit to the app, with the page that was asked for in `next`.
	// HorizontalPager becomes a horizontal scroll-snap container, so it swipes natively.

	type OnboardingStep = 'LOCATION_ART' | 'SIGNATURE' | 'EXHIBITION';
	const onboardingSteps: OnboardingStep[] = ['LOCATION_ART', 'SIGNATURE', 'EXHIBITION'];

	// The example art card shows a real place and a fixed date, like a card of the gallery
	const EXAMPLE_ART_TITLE = 'Salvador, Brazil';
	const EXAMPLE_ART_DATE = '05/11/2026 13:10';
	// Sizes of the exported images, so their place is kept before they load
	const EXAMPLE_ART_SIZE = { width: 996, height: 525 };
	const GLOBE_SIZE = { width: 1077, height: 903 };

	let pager: HTMLElement;
	let currentPage = $state(0);
	const isLastPage = $derived(currentPage === onboardingSteps.length - 1);

	function onPagerScroll() {
		const pageIndex = Math.round(pager.scrollLeft / pager.clientWidth);
		currentPage = Math.min(Math.max(pageIndex, 0), onboardingSteps.length - 1);
	}

	function onPrimaryButtonClick() {
		if (isLastPage) {
			completeOnboarding();
		} else {
			pager.scrollTo({ left: (currentPage + 1) * pager.clientWidth, behavior: 'smooth' });
		}
	}

	/** OnboardingViewModel.completeOnboarding: Skip and Start creating both end it for good. */
	function completeOnboarding() {
		try {
			setOnboardingSeen();
		} catch (e) {
			// The user still goes on to the app
			console.error('Onboarding.completeOnboarding', e);
		}
		goto(nextPage(), { replaceState: true });
	}

	/** The page the user opened, or the app's start destination. Only paths of this site. */
	function nextPage(): string {
		const next = page.url.searchParams.get('next');
		if (next) {
			const url = new URL(next, page.url.origin);
			if (url.origin === page.url.origin && !url.pathname.startsWith(resolve('/onboarding'))) {
				return url.pathname + url.search + url.hash;
			}
		}
		return resolve('/(main)/edit');
	}
</script>

{#snippet calendarIcon()}
	<!-- ic_calendar.xml -->
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M15,4V2M15,4V6M15,4H10.5M3,10V19C3,20.105 3.895,21 5,21H19C20.105,21 21,20.105 21,19V10H3Z" />
		<path d="M3,10V6C3,4.895 3.895,4 5,4H7" />
		<path d="M7,2V6" />
		<path d="M21,10V6C21,4.895 20.105,4 19,4H18.5" />
	</svg>
{/snippet}

<!-- Built like a card of the gallery: the art (which brings its own frame), its place and its date -->
{#snippet exampleArtCard(signature: string | null)}
	<div class="example-art-card">
		<img
			class="example-art"
			src={exampleArt}
			width={EXAMPLE_ART_SIZE.width}
			height={EXAMPLE_ART_SIZE.height}
			alt={strings.onboarding_example_art_description}
		/>
		<p class="text-title example-art-title">{EXAMPLE_ART_TITLE}</p>
		{#if signature}
			<p class="text-title signature">
				<!-- ic_person_edit.xml -->
				<svg viewBox="0 0 960 960" fill="currentColor" aria-hidden="true">
					<path
						d="M160,800L160,688Q160,654 177.5,625.5Q195,597 224,582Q286,551 350,535.5Q414,520 480,520Q517,520 553,524.5Q589,529 625,539L558,607Q538,604 519,602Q500,600 480,600Q424,600 369,613.5Q314,627 260,654Q251,659 245.5,668Q240,677 240,688L240,720L480,720L480,800L160,800ZM560,840L560,717L781,497Q790,488 801,484Q812,480 823,480Q835,480 846,484.5Q857,489 866,498L903,535Q911,544 915.5,555Q920,566 920,577Q920,588 916,599.5Q912,611 903,620L683,840L560,840ZM860,577L860,577L823,540L823,540L860,577ZM620,780L658,780L779,658L761,639L742,621L620,742L620,780ZM761,639L742,621L742,621L779,658L779,658L761,639ZM367,433Q320,386 320,320Q320,254 367,207Q414,160 480,160Q546,160 593,207Q640,254 640,320Q640,386 593,433Q546,480 480,480Q414,480 367,433ZM536.5,376.5Q560,353 560,320Q560,287 536.5,263.5Q513,240 480,240Q447,240 423.5,263.5Q400,287 400,320Q400,353 423.5,376.5Q447,400 480,400Q513,400 536.5,376.5Z"
					/>
				</svg>
				{signature}
			</p>
		{/if}
		<p class="example-art-date">
			{@render calendarIcon()}
			<span class="text-gray-subtitle">{EXAMPLE_ART_DATE}</span>
		</p>
	</div>
{/snippet}

<!-- The visual takes the height left by the texts, so it shrinks on small phones instead of pushing them away -->
{#snippet stepPage(step: OnboardingStep, index: number)}
	<section class="step" aria-hidden={index !== currentPage}>
		<div class="visual">
			{#if step === 'LOCATION_ART'}
				{@render exampleArtCard(null)}
			{:else if step === 'SIGNATURE'}
				{@render exampleArtCard(strings.onboarding_example_username)}
			{:else}
				<!-- The exported globe brings the art card sticking out on its right, so the image is
				     wider than the globe. The globe (as tall as the image) is centered and the card
				     may reach into the page padding. -->
				<div class="globe-area" style:--globe-ratio={GLOBE_SIZE.width / GLOBE_SIZE.height}>
					<img
						class="globe"
						src={globe}
						width={GLOBE_SIZE.width}
						height={GLOBE_SIZE.height}
						alt={strings.onboarding_globe_description}
					/>
				</div>
			{/if}
		</div>

		<h2 class="text-screen-title step-title">
			{#if step === 'LOCATION_ART'}
				{strings.onboarding_art_title}
			{:else if step === 'SIGNATURE'}
				{strings.onboarding_signature_title}
			{:else}
				{strings.onboarding_exhibition_title}
			{/if}
		</h2>
		<p class="text-gray-subtitle step-description">
			{#if step === 'LOCATION_ART'}
				{strings.onboarding_art_description}
			{:else if step === 'SIGNATURE'}
				{formatString(strings.onboarding_signature_description, strings.menu_user)}
			{:else}
				{strings.onboarding_exhibition_description}
			{/if}
		</p>

		{#if step === 'LOCATION_ART'}
			<div class="art-choices">
				<h3 class="text-title art-choices-title">{strings.onboarding_choices_title}</h3>
				<p class="text-gray-subtitle art-choices-description">
					{formatString(strings.onboarding_choices_description, strings.menu_edit)}
				</p>
				<ArtSettingRow title={strings.art_style} showTopDivider={false}>
					{#snippet indicator()}
						<ArtStyleIndicator />
					{/snippet}
				</ArtSettingRow>
				<ArtSettingRow title={strings.color_palette} showTopDivider>
					{#snippet indicator()}
						<ColorPaletteIndicator />
					{/snippet}
				</ArtSettingRow>
				<ArtSettingRow title={strings.map_zoom} showTopDivider>
					{#snippet indicator()}
						<MapZoomIndicator />
					{/snippet}
				</ArtSettingRow>
			</div>
		{/if}
	</section>
{/snippet}

<div class="onboarding">
	<div class="top-bar">
		<p class="text-title step-count">
			{formatString(strings.onboarding_step_count, currentPage + 1, onboardingSteps.length)}
		</p>
		{#if !isLastPage}
			<button type="button" class="text-title skip" onclick={completeOnboarding}>
				{strings.onboarding_skip}
			</button>
		{/if}
	</div>

	<div class="pager" bind:this={pager} onscroll={onPagerScroll}>
		{#each onboardingSteps as step, index (step)}
			{@render stepPage(step, index)}
		{/each}
	</div>

	<div class="bottom">
		<!-- Decorative: the step count in the top bar already tells where the user is -->
		<div class="pager-dots" aria-hidden="true">
			{#each onboardingSteps as step, index (step)}
				<span class="pager-dot" class:selected={index === currentPage}></span>
			{/each}
		</div>
		<MartpPrimaryButton
			text={isLastPage ? strings.onboarding_start_creating : strings.onboarding_next}
			onclick={onPrimaryButtonClick}
		/>
	</div>
</div>

<style>
	.onboarding {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
			env(safe-area-inset-left);
		background: var(--light-cream);
	}

	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 48px;
		padding: 0 12px 0 24px;
	}

	.step-count {
		font-size: 12px;
		letter-spacing: 1.2px;
		text-transform: uppercase;
		color: var(--dark-d5);
	}

	/* Material 3 TextButton */
	.skip {
		min-height: 40px;
		padding: 0 12px;
		border: none;
		border-radius: 20px;
		background: none;
		font: inherit;
		font-size: 15px;
		font-weight: 700;
		color: var(--green-darker);
		cursor: pointer;
	}

	.skip:active {
		background: rgb(52 118 103 / 0.12);
	}

	.skip:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.pager {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}

	.pager::-webkit-scrollbar {
		display: none;
	}

	.step {
		display: flex;
		flex: 0 0 100%;
		flex-direction: column;
		min-width: 0;
		/* Very short windows (a phone in landscape) scroll the page instead of hiding the visual. */
		overflow-y: auto;
		padding: 0 24px;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.visual {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		min-height: 160px;
		padding: 8px 0;
		background: radial-gradient(
			circle closest-side,
			color-mix(in srgb, var(--yellow) 25%, transparent),
			transparent
		);
	}

	.example-art-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-height: 100%;
		min-height: 0;
	}

	/* Fills the width, or shrinks to the height left (aligned to the start, as on Android). */
	.example-art {
		display: block;
		flex: 0 1 auto;
		width: 100%;
		height: auto;
		min-height: 0;
		object-fit: contain;
		object-position: left center;
	}

	.example-art-title {
		margin-top: 10px;
		font-size: 15px;
		color: var(--blue);
	}

	.signature {
		display: flex;
		align-items: center;
		align-self: flex-start;
		gap: 6px;
		margin-top: 6px;
		padding: 4px 9px;
		border-radius: 6px;
		background: var(--light-yellow);
		font-size: 13px;
		color: var(--blue);
	}

	.signature svg {
		width: 14px;
		height: 14px;
	}

	.example-art-date {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 6px 0 0;
	}

	.example-art-date svg {
		flex: none;
		width: 16px;
		height: 16px;
		color: var(--dark-d4);
	}

	.example-art-date span {
		font-size: 13px;
	}

	/* The globe's diameter fits the height, the width, and the card sticking out on the right. */
	.globe-area {
		--diameter: min(
			(50cqw + 24px) / (var(--globe-ratio) - 0.5),
			100cqw,
			100cqh
		);
		position: relative;
		align-self: stretch;
		width: 100%;
		container-type: size;
	}

	.globe {
		position: absolute;
		top: calc((100cqh - var(--diameter)) / 2);
		left: calc((100cqw - var(--diameter)) / 2);
		width: calc(var(--diameter) * var(--globe-ratio));
		max-width: none;
		height: var(--diameter);
	}

	.step-title {
		margin-top: 16px;
		font-size: 24px;
		line-height: 29px;
		color: var(--blue);
	}

	.step-description {
		margin-top: 8px;
		font-size: 15px;
		line-height: 21px;
	}

	.art-choices {
		padding-top: 16px;
	}

	.art-choices-title {
		margin: 0;
		font-size: 16px;
		color: var(--blue);
	}

	.art-choices-description {
		padding: 2px 0 4px;
		font-size: 13px;
		line-height: 18px;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		padding: 16px 20px;
	}

	.pager-dots {
		display: flex;
		gap: 6px;
	}

	.pager-dot {
		width: 6px;
		height: 6px;
		border-radius: 3px;
		background: var(--blue-alpha-12);
		transition:
			width 200ms,
			background-color 200ms;
	}

	.pager-dot.selected {
		width: 22px;
		background: var(--blue);
	}

	@media (prefers-reduced-motion: reduce) {
		.pager-dot {
			transition: none;
		}
	}
</style>
