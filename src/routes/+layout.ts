import { redirect } from '@sveltejs/kit';
import { browser } from '$app/env';
import { resolve } from '$app/paths';
import { hasSeenOnboarding } from '#lib/data/onboarding.ts';

// SPA mode: everything renders in the browser (see CLAUDE.md).
export const ssr = false;
// Each route is still written as its own HTML shell, so GitHub Pages answers it with 200
// instead of the 404 fallback, which matters for search engines.
export const prerender = true;

/**
 * MainActivity's onboarding check: the first visit to any page of the app opens the onboarding
 * first, then the page that was asked for. The digital exhibition is not part of the app, so it
 * never shows it.
 */
export function load({ route, url }) {
	if (!browser || !route.id) return;
	if (route.id === '/onboarding' || route.id.startsWith('/(exhibition)')) return;
	if (hasSeenOnboarding()) return;
	// Not url.hash: SvelteKit throws when a load reads it (the server never receives it)
	const next = url.pathname + url.search;
	redirect(307, `${resolve('/onboarding')}?next=${encodeURIComponent(next)}`);
}
