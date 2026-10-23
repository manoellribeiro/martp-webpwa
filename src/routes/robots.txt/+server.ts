import { PUBLIC_SITE_URL } from '$app/env/public';

export const prerender = true;

// Crawlers only read robots.txt at the root of a domain, so this one takes effect once the
// site has its own domain; under the GitHub Pages project path it is harmless.
export function GET() {
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${PUBLIC_SITE_URL}/sitemap.xml\n`, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
