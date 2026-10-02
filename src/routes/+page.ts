import { redirect } from '@sveltejs/kit';

// The app's start destination is the gallery, which the web version doesn't have,
// so the first remaining bottom navigation item takes its place.
export function load() {
	redirect(307, '/edit');
}
