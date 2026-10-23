import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';

// Makes the app work offline and installable. Everything the build produces (scripts,
// styles, fonts, p5, icons and the prerendered page shells) is cached when a version is
// installed and served from the cache. Mapbox requests are left to the network: a cached
// map is of no use for a new location. A new version waits until the user accepts the
// "update available" prompt (UpdateAvailablePrompt.svelte), which sends SKIP_WAITING.

const CACHE = `martp-${version}`;

/** The manifest paths are relative to the base path, which is the worker's scope. */
const fromScope = (path: string) => new URL(path, self.registration.scope).pathname;
const APP_SHELL = fromScope('');

const precached = new Set(
	[...immutable, ...assets, ...prerendered].map(({ path }) => fromScope(path))
);

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...precached])));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
	);
});

self.addEventListener('message', (event) => {
	if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== self.location.origin) return;

	if (precached.has(url.pathname)) {
		event.respondWith(fromCache(url.pathname, request));
	} else if (request.mode === 'navigate') {
		// Any other page of the app: the network first, so a new deploy shows up, then the
		// cached shell, which renders every route since the app is a SPA.
		event.respondWith(fetch(request).catch(() => fromCache(APP_SHELL, request)));
	}
});

async function fromCache(path: string, request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	return (await cache.match(path)) ?? fetch(request);
}
