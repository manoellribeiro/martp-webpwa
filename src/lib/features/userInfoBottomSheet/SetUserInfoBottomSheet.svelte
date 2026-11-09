<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import MartpButton from '#lib/components/MartpButton.svelte';
	import MartpTextInput from '#lib/components/MartpTextInput.svelte';
	import type { UserInfo } from '#lib/data/userInfo.ts';
	import { strings } from '#lib/strings.ts';

	// Port of SetUserInfoBottomSheetFragment + fragment_set_user_info_bottom_sheet.xml.
	// A modal <dialog> stands in for the BottomSheetDialogFragment: it closes on Escape or
	// a tap on the scrim, and calls `onDismiss` however it was closed.
	interface Props {
		userInfo: UserInfo;
		onSaveWithMyName: (userInfo: UserInfo) => void;
		onSaveAnonymously: () => void;
		onDismiss: () => void;
	}

	let { userInfo, onSaveWithMyName, onSaveAnonymously, onDismiss }: Props = $props();

	let dialog: HTMLDialogElement;
	// Read once, like the fragment's setupViews.
	const initialUserInfo = untrack(() => userInfo);
	const showSaveAnonymously = !initialUserInfo.username;
	let username = $state(initialUserInfo.username ?? '');
	let email = $state(initialUserInfo.email ?? '');

	onMount(() => dialog.showModal());

	function saveAnonymously() {
		onSaveAnonymously();
		dialog.close();
	}

	function saveWithName() {
		onSaveWithMyName({ id: userInfo.id, username, email });
		dialog.close();
	}

	/** A tap outside the sheet lands on the dialog itself (the scrim). */
	function closeOnScrimClick(event: MouseEvent) {
		if (event.target === dialog) dialog.close();
	}
</script>

<dialog
	class="bottom-sheet"
	aria-labelledby="set-user-info-title"
	bind:this={dialog}
	onclose={onDismiss}
	onclick={closeOnScrimClick}
>
	<div class="sheet">
		<span class="scroll-indicator" aria-hidden="true"></span>

		<h2 class="text-screen-title title" id="set-user-info-title">{strings.want_your_name_on_it}</h2>
		<p class="text-gray-subtitle description">{strings.digital_exhibition_description}</p>

		<div class="field">
			<MartpTextInput
				label={strings.username}
				placeholder={strings.name_or_nickname_hint}
				cornerRadius={10}
				enterkeyhint="next"
				autocomplete="nickname"
				bind:value={username}
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
			/>
			<p class="text-gray-subtitle field-description">{strings.email_not_mandatory_hint}</p>
		</div>

		<div class="save-with-name">
			<MartpButton title={strings.save_art} onclick={saveWithName} />
		</div>

		{#if showSaveAnonymously}
			<div class="save-anonymously">
				<MartpButton
					title={strings.save_anonymously}
					variant="text"
					width="wrap_content"
					onclick={saveAnonymously}
				/>
			</div>
		{/if}
	</div>
</dialog>

<style>
	.bottom-sheet {
		width: 100%;
		max-width: var(--max-app-width);
		max-height: 100dvh;
		margin: auto auto 0;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
	}

	.bottom-sheet::backdrop {
		background: rgb(0 0 0 / 0.32);
	}

	/* background_rounded_bottom_sheet_dialog.xml */
	.sheet {
		display: flex;
		flex-direction: column;
		padding-bottom: calc(8px + env(safe-area-inset-bottom));
		border-radius: 16px 16px 0 0;
		background: var(--light-cream);
	}

	/* background_rounded_scroll_indicator.xml */
	.scroll-indicator {
		align-self: center;
		width: 30px;
		height: 4px;
		margin-top: 8px;
		border-radius: 10px;
		background: var(--light-l1);
	}

	.title {
		margin: 12px 16px 0;
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

	.save-with-name {
		margin: 24px 16px 8px;
	}

	.save-anonymously {
		display: flex;
		justify-content: center;
		margin-top: 8px;
	}
</style>
