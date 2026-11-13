<script lang="ts">
	// Port of MapZoomIndicator (ArtSettingRows.kt): a half-way zoom slider.
</script>

<div class="map-zoom-indicator">
	<!-- ic_zoom_out.xml -->
	<svg viewBox="0 0 24 24" fill="currentColor">
		<path
			d="M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14zM7,9h5v1H7z"
		/>
	</svg>
	<span class="zoom-track"></span>
	<!-- ic_zoom_in.xml -->
	<svg viewBox="0 0 24 24" fill="currentColor">
		<path
			d="M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14zM12,10h-2v2H9v-2H7V9h2V7h1v2h2v1z"
		/>
	</svg>
</div>

<style>
	.map-zoom-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--dark-d5);
	}

	svg {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
	}

	/* Half-way slider: 3px track, yellow up to the 12px thumb. */
	.zoom-track {
		flex: 1;
		height: 12px;
		background:
			radial-gradient(circle closest-side, var(--yellow) 100%, transparent 100%) center / 12px
				12px no-repeat,
			linear-gradient(to right, var(--yellow) 50%, var(--light-l2) 50%) center / 100% 3px
				no-repeat;
		border-radius: 1.5px;
	}
</style>
