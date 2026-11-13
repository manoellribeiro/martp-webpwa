<script lang="ts">
	// The icon of a share button: ic_share.xml where the browser can share the art, or a
	// download arrow where shareArtImage downloads it instead (canShareArtImage).
	let { canShare }: { canShare: boolean } = $props();
</script>

<svg
	viewBox="0 0 25 25"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if canShare}
		<path
			d="M13.97,4.14C13.24,4.36 12.78,5.96 12.59,7.91C7.28,7.91 2.5,13.48 2.5,20.08C4.69,14.08 9.5,12.45 12.64,12.45C12.84,14.21 13.29,15.62 13.97,15.82C16.07,16.43 22.5,12.44 22.5,9.98C22.5,7.52 16.07,3.53 13.97,4.14Z"
		/>
	{:else}
		<path d="M12.5,3.5V15.5M7.5,10.5L12.5,15.5L17.5,10.5M4.5,20.5H20.5" />
	{/if}
</svg>
