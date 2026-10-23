import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

// The app's start destination is the art style settings screen, which is /edit here.
export function load() {
	redirect(307, resolve('/(main)/edit'));
}
