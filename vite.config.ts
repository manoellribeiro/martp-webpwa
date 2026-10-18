import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Same pattern as the Android app's build.gradle: the MAPBOX_API_KEY environment variable
	// (set from the repository secret in GitHub Actions) wins, otherwise the untracked .env file.
	// loadEnv gives environment variables priority over .env files.
	const mapboxApiKey = loadEnv(mode, '.', '').MAPBOX_API_KEY;
	if (!mapboxApiKey) console.warn('MAPBOX_API_KEY is not set: map images will fail to load.');

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

				// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
				// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
				// See https://svelte.dev/docs/kit/adapters for more information about adapters.
				adapter: adapter()
			})
		]
	};
});
