<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '#lib/assets/martp_logo.svg';
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

	/** Saves once the user has stopped typing for 2 seconds, as the app does. */
	function saveWhenUserStopsTyping(actionToExecute: () => void) {
		let userStoppedTyping: ReturnType<typeof setTimeout>;
		return () => {
			clearTimeout(userStoppedTyping);
			userStoppedTyping = setTimeout(actionToExecute, 2000);
		};
	}

	const onUsernameChanged = saveWhenUserStopsTyping(() => setUserName(username, user.id));
	const onEmailChanged = saveWhenUserStopsTyping(() => setUserEmail(email, user.id));
</script>

<div class="user-info">
	<img class="logo" src={logo} alt={strings.app_name} />

	<h1 class="text-screen-title title">{strings.digital_exposition}</h1>
	<p class="text-gray-subtitle description">{strings.digital_exposition_description}</p>

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
</div>

<style>
	.user-info {
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

	.field:last-child {
		margin-bottom: 16px;
	}
</style>
