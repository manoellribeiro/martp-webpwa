// The API's Continent (martp-api core/models/Continent.kt): where an art was made. Central
// America includes the Caribbean; OCEAN is an art made at sea. Web-only, the app has no
// exhibition. UNKNOWN (the lookup failed) is never shown until it is fixed by hand.
export type Continent =
	| 'AFRICA'
	| 'ANTARCTICA'
	| 'ASIA'
	| 'CENTRAL_AMERICA'
	| 'EUROPE'
	| 'NORTH_AMERICA'
	| 'OCEANIA'
	| 'SOUTH_AMERICA'
	| 'OCEAN'
	| 'UNKNOWN';

/** Every continent that is an exhibition room, in the order of the doors. */
export const exhibitionRooms = [
	'AFRICA',
	'ANTARCTICA',
	'ASIA',
	'CENTRAL_AMERICA',
	'EUROPE',
	'NORTH_AMERICA',
	'OCEANIA',
	'SOUTH_AMERICA',
	'OCEAN'
] as const satisfies readonly Continent[];

export type ExhibitionRoom = (typeof exhibitionRooms)[number];

export function isExhibitionRoom(value: string): value is ExhibitionRoom {
	return (exhibitionRooms as readonly string[]).includes(value);
}

/** The room's path segment: SOUTH_AMERICA is `south-america`. */
export function roomSlug(room: ExhibitionRoom): string {
	return room.toLowerCase().replace('_', '-');
}

export function roomFromSlug(slug: string): ExhibitionRoom | null {
	const value = slug.toUpperCase().replace('-', '_');
	return isExhibitionRoom(value) ? value : null;
}
