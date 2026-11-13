<script lang="ts">
	// Port of MartpPrimaryButton (core/components/compose): the full-width dark button at the
	// bottom of the Compose screens.
	interface Props {
		text: string;
		onclick: () => void;
	}

	let { text, onclick }: Props = $props();
</script>

<button type="button" class="text-title martp-primary-button" {onclick}>{text}</button>

<style>
	/* RoundedCornerShape(percent = 10) on a 52px tall button. */
	.martp-primary-button {
		display: block;
		width: 100%;
		height: 52px;
		padding: 0 24px 0 32px;
		border: none;
		border-radius: 5.2px;
		background: var(--blue);
		color: var(--white);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
	}

	.martp-primary-button:active {
		background-image: linear-gradient(rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.12));
	}

	.martp-primary-button:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}
</style>
