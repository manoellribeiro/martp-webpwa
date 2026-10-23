import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icons next to static/favicon.svg: run `pnpm pwa:assets` after changing it.
// Maskable and Apple icons get padding filled with the icon's own light_yellow background.
const background = '#fff0e5';

export default defineConfig({
	headLinkOptions: { preset: '2023' },
	preset: {
		...minimal2023Preset,
		maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
		apple: { ...minimal2023Preset.apple, resizeOptions: { background } }
	},
	images: ['static/favicon.svg']
});
