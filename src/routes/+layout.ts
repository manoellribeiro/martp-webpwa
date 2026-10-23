// SPA mode: everything renders in the browser (see CLAUDE.md).
export const ssr = false;
// Each route is still written as its own HTML shell, so GitHub Pages answers it with 200
// instead of the 404 fallback, which matters for search engines.
export const prerender = true;
