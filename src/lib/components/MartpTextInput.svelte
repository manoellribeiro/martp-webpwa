<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	// Port of core/components/MartpTextInput.kt + martp_text_input.xml.
	// Not ported yet: start/end icon, hint, minLines and the validation listener.
	interface Props {
		/** Text always shown on top of the field box. */
		label?: string;
		/** Text shown inside the box before the user starts to write. */
		placeholder?: string;
		value?: string;
		/** Error message shown under the box; puts the input in its error state. */
		error?: string | null;
		obfuscated?: boolean;
		/** Corner radius in px. */
		cornerRadius?: number;
		/** Web counterpart of android:imeOptions. */
		enterkeyhint?: HTMLInputAttributes['enterkeyhint'];
		inputmode?: HTMLInputAttributes['inputmode'];
		autocomplete?: HTMLInputAttributes['autocomplete'];
		/** Runs every time the text changes. */
		onChangedText?: (text: string) => void;
	}

	let {
		label = '',
		placeholder = '',
		value = $bindable(''),
		error = null,
		obfuscated = false,
		cornerRadius = 8,
		enterkeyhint,
		inputmode,
		autocomplete,
		onChangedText
	}: Props = $props();

	const id = $props.id();
</script>

<div class="martp-text-input" class:error={error != null} style:--corner-radius="{cornerRadius}px">
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<input
		{id}
		type={obfuscated ? 'password' : 'text'}
		{placeholder}
		{enterkeyhint}
		{inputmode}
		{autocomplete}
		aria-invalid={error != null}
		bind:value
		oninput={() => onChangedText?.(value)}
	/>
	{#if error}
		<p class="error-message">{error}</p>
	{/if}
</div>

<style>
	.martp-text-input {
		display: flex;
		flex-direction: column;
	}

	/* Text.InputLabel + textStyle bold */
	label {
		margin-bottom: 4px;
		font-size: 14px;
		font-weight: 700;
		color: var(--dark-d1);
	}

	/* Text.InputText inside an outlined box */
	input {
		width: 100%;
		height: 48px;
		padding: 0 16px;
		border: 1px solid var(--blue);
		border-radius: var(--corner-radius);
		background: var(--light-l5);
		font: inherit;
		font-size: 16px;
		font-weight: 500;
		color: var(--dark-d1);
	}

	input::placeholder {
		color: var(--dark-d3);
		opacity: 1;
	}

	input:focus {
		outline: 1px solid var(--blue);
	}

	.error label,
	.error-message {
		color: var(--error-medium);
	}

	.error input {
		border-color: var(--error-medium);
		outline-color: var(--error-medium);
		background: var(--error-lightest);
	}

	.error-message {
		margin: 4px 16px 0;
		font-size: 12px;
	}
</style>
