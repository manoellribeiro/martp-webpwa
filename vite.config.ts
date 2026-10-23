import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Same pattern as the Android app's build.gradle: the MAPBOX_API_KEY environment variable
	// (set from the repository secret in GitHub Actions) wins, otherwise the untracked .env file.
	// loadEnv gives environment variables priority over .env files.
	const env = loadEnv(mode, '.', '');
	const mapboxApiKey = env.MAPBOX_API_KEY;
	if (!mapboxApiKey) console.warn('MAPBOX_API_KEY is not set: map images will fail to load.');
	// Path the site is served under (see .env.production); empty in development.
	const basePath = (env.BASE_PATH ?? '') as '' | `/${string}`;

	return {
		define: {
			// Build-time constant, the counterpart of BuildConfig.MAPBOX_API_KEY.
			__MAPBOX_API_KEY__: JSON.stringify(mapboxApiKey ?? '')
		},
		plugins: [
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				// Static build for GitHub Pages. Every route is prerendered as an empty shell (see
				// src/routes/+layout.ts); GitHub Pages serves 404.html for any other path.
				adapter: adapter({ fallback: '404.html' }),
				paths: { base: basePath }
			})
		]
	};
});
