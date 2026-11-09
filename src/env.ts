import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description:
			'Absolute URL the site is served from, without a trailing slash (see .env.production). Used for link previews, canonical links and the sitemap; empty in development.',
		schema: (value) => value ?? ''
	},
	PUBLIC_MARTP_API_URL: {
		public: true,
		static: true,
		description:
			'Base URL of the Martp API (Spring Boot), without a trailing slash. Defaults to the local server, like the Android app.',
		schema: (value) => value || 'http://localhost:8080'
	},
	PUBLIC_FIREBASE_API_KEY: {
		public: true,
		static: true,
		description: 'Firebase web app config (apiKey), used by App Check. Public by design.',
		schema: (value) => value ?? ''
	},
	PUBLIC_FIREBASE_PROJECT_ID: {
		public: true,
		static: true,
		description: 'Firebase web app config (projectId), used by App Check.',
		schema: (value) => value ?? ''
	},
	PUBLIC_FIREBASE_APP_ID: {
		public: true,
		static: true,
		description: 'Firebase web app config (appId), used by App Check.',
		schema: (value) => value ?? ''
	},
	PUBLIC_APPCHECK_DEBUG_TOKEN: {
		public: true,
		static: true,
		description:
			'Development only: a fixed App Check debug token registered in the Firebase console, used by every browser in `pnpm dev`. Set it in the untracked .env.development, never in .env or .env.production, so it is not built into the site.',
		schema: (value) => value ?? ''
	},
	PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY: {
		public: true,
		static: true,
		description:
			'reCAPTCHA Enterprise site key registered as the App Check provider of the Firebase web app.',
		schema: (value) => value ?? ''
	}
});
