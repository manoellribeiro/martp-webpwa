<!--
	Sunlight through a window over the exhibition's walls: a big diagonal shadow and, on a big
	screen, the window post's, as in the design. Soft edges come from gradients, not a blur filter,
	so slow phones don't pay for it. Place it inside a positioned, clipped parent.
-->
<div class="window-light" aria-hidden="true"></div>

<style>
	.window-light {
		--shadow: rgb(43 35 80 / 23%);

		position: absolute;
		z-index: 2;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: multiply;
	}

	.window-light::before,
	.window-light::after {
		content: '';
		position: absolute;
		transform: rotate(35deg);
		transform-origin: 0 0;
	}

	.window-light::before {
		top: 110px;
		left: -125%;
		width: 3000px;
		height: 3000px;
		background: linear-gradient(90deg, transparent, var(--shadow) 40px);
		mask-image: linear-gradient(transparent, #000 40px);
	}

	.window-light::after {
		display: none;
	}

	@media (min-width: 960px) {
		.window-light::before {
			top: -10px;
			left: 75%;
		}

		.window-light::after {
			display: block;
			top: -10px;
			left: 41.6%;
			width: 64px;
			height: 1400px;
			background: linear-gradient(
				90deg,
				transparent,
				rgb(43 35 80 / 19%) 40%,
				rgb(43 35 80 / 19%) 60%,
				transparent
			);
		}
	}
</style>
