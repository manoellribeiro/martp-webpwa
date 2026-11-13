<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/martp_logo.svg';
	import MartpButton from '#lib/components/MartpButton.svelte';
	import MartpTextInput from '#lib/components/MartpTextInput.svelte';
	import { fetchCurrentUserInfo, setUserEmail, setUserName } from '#lib/data/userInfo.ts';
	import { mainViewModel } from '#lib/features/main/main.viewmodel.svelte.ts';
	import { strings } from '#lib/strings.ts';

	// Port of UserInfoFragment + fragment_user_info.xml. The app's loading state is not
	// needed here: the user comes from localStorage synchronously.
	const user = fetchCurrentUserInfo();
	let username = $state(user.username ?? '');
	let email = $state(user.email ?? '');

	onMount(() => mainViewModel.hideUserInfoBadge());

	// The app opens https://martp.app/exhibition; here it is the same site, in a new tab like
	// the app's browser, as the button says.
	const DIGITAL_EXHIBITION_URL = resolve('/(exhibition)/exhibition');

	/** Saves once the user has stopped typing for 1 second, as the app does. */
	function saveWhenUserStopsTyping(actionToExecute: () => void) {
		let userStoppedTyping: ReturnType<typeof setTimeout>;
		return () => {
			clearTimeout(userStoppedTyping);
			userStoppedTyping = setTimeout(actionToExecute, 1000);
		};
	}

	const onUsernameChanged = saveWhenUserStopsTyping(() => setUserName(username, user.id));
	const onEmailChanged = saveWhenUserStopsTyping(() => setUserEmail(email, user.id));
</script>

<div class="user-info">
	<img class="logo" src={logo} alt={strings.app_name} />

	<h1 class="text-screen-title title">{strings.digital_exhibition}</h1>
	<p class="text-gray-subtitle description">{strings.digital_exhibition_description}</p>

	<div class="field">
		<MartpTextInput
			label={strings.username}
			placeholder={strings.name_or_nickname_hint}
			cornerRadius={10}
			enterkeyhint="next"
			autocomplete="nickname"
			bind:value={username}
			onChangedText={onUsernameChanged}
		/>
		<p class="text-gray-subtitle field-description">{strings.name_suggestion_hint}</p>
	</div>

	<div class="field">
		<MartpTextInput
			label={strings.email_optional_hint}
			placeholder={strings.your_email_hint}
			cornerRadius={10}
			enterkeyhint="done"
			inputmode="email"
			autocomplete="email"
			bind:value={email}
			onChangedText={onEmailChanged}
		/>
		<p class="text-gray-subtitle field-description">{strings.email_not_mandatory_hint}</p>
	</div>

	<div class="space"></div>

	<!-- background_digital_exhibition.xml -->
	<section class="digital-exhibition">
		<!-- background_live_indicator.xml -->
		<span class="live-indicator">
			<!-- ic_rounded_globe.xml -->
			<svg viewBox="0 0 960 960" fill="currentColor" aria-hidden="true">
				<path
					d="M480,880Q397,880 324,848.5Q251,817 197,763Q143,709 111.5,636Q80,563 80,480Q80,397 111.5,324Q143,251 197,197Q251,143 324,111.5Q397,80 480,80Q563,80 636,111.5Q709,143 763,197Q817,251 848.5,324Q880,397 880,480Q880,563 848.5,636Q817,709 763,763Q709,817 636,848.5Q563,880 480,880ZM480,800Q614,800 707,707Q800,614 800,480Q800,473 799.5,465.5Q799,458 799,453Q794,482 772,501Q750,520 720,520L640,520Q607,520 583.5,496.5Q560,473 560,440L560,400L400,400L400,320Q400,287 423.5,263.5Q447,240 480,240L520,240L520,240Q520,217 532.5,199.5Q545,182 563,171Q543,166 522.5,163Q502,160 480,160Q346,160 253,253Q160,346 160,480Q160,480 160,480Q160,480 160,480L360,480Q426,480 473,527Q520,574 520,640L520,680L400,680L400,790Q420,795 439.5,797.5Q459,800 480,800Z"
				/>
			</svg>
			<span class="live">{strings.live}</span>
		</span>
		<h2 class="text-screen-title exhibition-title">{strings.visit_digital_exhibition}</h2>
		<p class="text-gray-subtitle exhibition-description">{strings.explore_community_artworks}</p>
		<div class="open-in-browser">
			<MartpButton
				title={strings.open_in_browser}
				buttonBackgroundColor="var(--yellow)"
				fontAndIconColor="var(--black)"
				onclick={() => window.open(DIGITAL_EXHIBITION_URL, '_blank', 'noopener')}
			>
				{#snippet startIcon()}
					<!-- ic_open_in_browser.xml -->
					<svg viewBox="0 0 960 960" fill="currentColor" aria-hidden="true">
						<path
							d="M200,840Q167,840 143.5,816.5Q120,793 120,760L120,200Q120,167 143.5,143.5Q167,120 200,120L760,120Q793,120 816.5,143.5Q840,167 840,200L840,760Q840,793 816.5,816.5Q793,840 760,840L640,840Q623,840 611.5,828.5Q600,817 600,800Q600,783 611.5,771.5Q623,760 640,760L760,760Q760,760 760,760Q760,760 760,760L760,280L200,280L200,760Q200,760 200,760Q200,760 200,760L320,760Q337,760 348.5,771.5Q360,783 360,800Q360,817 348.5,828.5Q337,840 320,840L200,840ZM440,800L440,594L405,629Q393,641 376.5,640.5Q360,640 348,628Q337,616 336.5,600Q336,584 348,572L452,468Q458,462 465,459.5Q472,457 480,457Q488,457 495,459.5Q502,462 508,468L612,572Q624,584 623.5,600Q623,616 612,628Q600,640 583.5,640.5Q567,641 555,629L520,594L520,800Q520,817 508.5,828.5Q497,840 480,840Q463,840 451.5,828.5Q440,817 440,800Z"
						/>
					</svg>
				{/snippet}
			</MartpButton>
		</div>
	</section>
</div>

<style>
	/* Fills the screen, so the exhibition card sits at the bottom like in the app. */
	.user-info {
		display: flex;
		flex-direction: column;
		min-height: calc(
			100dvh - var(--bottom-navigation-bar-height) - env(safe-area-inset-top) -
				env(safe-area-inset-bottom)
		);
		padding-top: 16px;
	}

	.logo {
		display: block;
		width: 100px;
		height: 50px;
		margin-left: 11px;
	}

	.title {
		margin-left: 16px;
		font-size: 18px;
	}

	.description {
		margin: 10px 16px 0;
		font-size: 14px;
		line-height: 1.1;
	}

	.field {
		margin: 12px 16px 0;
	}

	.field-description {
		margin-top: 4px;
		font-style: italic;
		line-height: 1.25;
	}

	/* vertical_bias 1: pushes the card to the bottom of the screen. */
	.space {
		flex: 1;
	}

	.digital-exhibition {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 16px 16px 4px;
		padding: 16px;
		border: 1px solid var(--light-l3);
		border-radius: 8px;
		background: var(--blue);
	}

	.live-indicator {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		padding: 4px 8px;
		border-radius: 8px;
		background: rgb(255 255 255 / 0.08);
		color: var(--yellow);
	}

	.live-indicator svg {
		width: 24px;
		height: 24px;
	}

	.live {
		margin-left: 8px;
		font-size: 14px;
		font-weight: 500;
		text-transform: uppercase;
	}

	.exhibition-title {
		margin-bottom: 4px;
		color: var(--white);
	}

	.exhibition-description {
		font-size: 14px;
		line-height: 1.1;
		color: var(--light-l1);
	}

	.open-in-browser {
		align-self: stretch;
		margin-top: 8px;
	}
</style>
