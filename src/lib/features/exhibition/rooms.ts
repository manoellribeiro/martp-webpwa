import africa from '#lib/assets/exhibition/continent_africa.jpg';
import antarctica from '#lib/assets/exhibition/continent_antarctica.jpg';
import asia from '#lib/assets/exhibition/continent_asia.jpg';
import centralAmerica from '#lib/assets/exhibition/continent_central_america.jpg';
import europe from '#lib/assets/exhibition/continent_europe.jpg';
import northAmerica from '#lib/assets/exhibition/continent_north_america.jpg';
import ocean from '#lib/assets/exhibition/continent_ocean.jpg';
import oceania from '#lib/assets/exhibition/continent_oceania.jpg';
import southAmerica from '#lib/assets/exhibition/continent_south_america.jpg';
import type { ExhibitionRoom } from '#lib/domain/continent.ts';
import { formatString, locale, strings } from '#lib/strings.ts';

/**
 * The dotted continent seen through each room's door: the design's images (digital-exhibition.pen,
 * "Choose a Room"), cropped and resized to 320px JPEGs on a cream background.
 */
export const roomImages: Record<ExhibitionRoom, string> = {
	AFRICA: africa,
	ANTARCTICA: antarctica,
	ASIA: asia,
	CENTRAL_AMERICA: centralAmerica,
	EUROPE: europe,
	NORTH_AMERICA: northAmerica,
	OCEANIA: oceania,
	SOUTH_AMERICA: southAmerica,
	OCEAN: ocean
};

const pluralRules = new Intl.PluralRules(locale);

/** `1 art`, `64 arts`, in the visitor's language. */
export function artCount(total: number): string {
	const text = pluralRules.select(total) === 'one' ? strings.art_count_one : strings.art_count_other;
	return formatString(text, total.toLocaleString(locale));
}
