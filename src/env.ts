import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description:
			'Absolute URL the site is served from, without a trailing slash (see .env.production). Used for link previews, canonical links and the sitemap; empty in development.',
		schema: (value) => value ?? ''
	}
});
