import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

// Web-only. SvelteKit's automatic registration is off (vite.config.ts) because it runs on
// every page, and the worker precaches the whole app (p5 included) when it installs. The
// digital exhibition is public and often opened on weak connections, so only the app's
// pages register it. Same call SvelteKit makes: a module worker at the root of the site.

let registered = false;

export function registerServiceWorker() {
	if (registered || !('serviceWorker' in navigator)) return;
	registered = true;
	// The worker is built next to the static files, under the base path, but it is not one of
	// them, so it is not an AssetPath.
	const url = asset('service-worker.js' as AssetPath);
	navigator.serviceWorker.register(url, { type: 'module' }).catch((e) => {
		registered = false;
		console.error('Service worker registration failed', e);
	});
}
