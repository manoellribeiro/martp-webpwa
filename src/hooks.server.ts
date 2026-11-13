import type { Handle } from '@sveltejs/kit/hooks';
import { PUBLIC_SITE_URL } from '$app/env/public';
import { resolve as resolvePath } from '$app/paths';

// Runs while the pages are prerendered (the site has no server). Crawlers read the link preview
// tags of src/app.html without running JavaScript, so the digital exhibition's pages get their
// own preview here, in their HTML shells. One preview for the whole exhibition, in English.

const EXHIBITION_TITLE = 'Martp Digital Exhibition';
const EXHIBITION_DESCRIPTION =
	'Walk through map arts made by people around the world, one room per continent.';
const EXHIBITION_IMAGE_ALT =
	'A dotted globe with art pins next to the words: Walk through map arts made around the world.';

function setMeta(html: string, attribute: 'name' | 'property', key: string, value: string) {
	const tag = new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*(")`);
	return html.replace(tag, `$1${value}$2`);
}

/** The base path, empty at martp.app; PUBLIC_SITE_URL already includes it. */
const basePath = resolvePath('/').replace(/\/$/, '');

function exhibitionPreview(html: string, pathname: string): string {
	const url = `${PUBLIC_SITE_URL}${pathname.slice(basePath.length)}`;
	let result = html.replace(/<title>[^<]*<\/title>/, `<title>${EXHIBITION_TITLE}</title>`);
	result = setMeta(result, 'name', 'description', EXHIBITION_DESCRIPTION);
	result = setMeta(result, 'property', 'og:title', EXHIBITION_TITLE);
	result = setMeta(result, 'property', 'og:description', EXHIBITION_DESCRIPTION);
	result = setMeta(result, 'property', 'og:url', url);
	result = setMeta(result, 'property', 'og:image', `${PUBLIC_SITE_URL}/og-exhibition.jpg`);
	return setMeta(result, 'property', 'og:image:alt', EXHIBITION_IMAGE_ALT);
}

export const handle: Handle = ({ event, resolve }) => {
	if (!event.route.id?.startsWith('/(exhibition)')) return resolve(event);
	return resolve(event, {
		transformPageChunk: ({ html }) => exhibitionPreview(html, event.url.pathname)
	});
};
