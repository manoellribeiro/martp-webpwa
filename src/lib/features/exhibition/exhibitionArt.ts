import type { RemoteExhibitionMapArt } from '#lib/data/martpApi.ts';
import { locale, strings } from '#lib/strings.ts';

// The texts of an art's label in the digital exhibition (globe card and room wall).

const dateFormat = new Intl.DateTimeFormat(locale, {
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});

/** `@username`, or the anonymous artist. */
export function artAuthor(art: RemoteExhibitionMapArt): string {
	return art.user ? `@${art.user.username}` : strings.anonymous_artist;
}

/** `06 Nov 2026` in every language: the day, the short month and the year. */
export function artDate(art: RemoteExhibitionMapArt): string {
	const parts = dateFormat.formatToParts(new Date(art.dateInMillis));
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value.replace('.', '') ?? '';
	return `${part('day')} ${part('month')} ${part('year')}`;
}

/** The art style's name and its tag color, or null for a style the web doesn't know. */
export function artStyle(art: RemoteExhibitionMapArt): { name: string; color: string } | null {
	switch (art.sketchArtType) {
		case 'DEFAULT':
			return { name: strings.classic, color: '#ffe2ae' };
		case 'POINTILLISM':
			return { name: strings.pointillism, color: '#f8cad5' };
		case 'COLORFUL_MAP':
			return { name: strings.colorful_map, color: '#c9ebdb' };
		case 'WATER_FLOW':
			return { name: strings.water_flow, color: '#cce2f6' };
		default:
			return null;
	}
}
