<script lang="ts">
	import '#lib/features/exhibition/exhibition.css';

	// Web-only: the digital exhibition. Unlike the app's screens it uses the whole window and
	// never registers the service worker (see src/routes/+layout.svelte).
	let { children } = $props();
</script>

{@render children()}
