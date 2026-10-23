import { PUBLIC_SITE_URL } from '$app/env/public';

export const prerender = true;

// The screens worth finding in a search. The others only make sense inside the flow
// (/ redirects to /edit, location access and art creation need the user's location) or
// hold personal data (/profile). PUBLIC_SITE_URL already includes the base path.
const indexedPaths = ['/edit', '/about'];

export function GET() {
	const urls = indexedPaths
		.map((path) => `\t<url><loc>${PUBLIC_SITE_URL}${path}</loc></url>`)
		.join('\n');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
