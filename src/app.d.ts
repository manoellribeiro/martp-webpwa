// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/** MAPBOX_API_KEY, injected at build time by vite.config.ts. */
	const __MAPBOX_API_KEY__: string;
}

export {};
