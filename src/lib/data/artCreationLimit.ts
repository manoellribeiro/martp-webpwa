// Web-only: limits how many arts one browser creates, so a script looping over the app
// cannot use up the Mapbox free allowance. Each art costs one Static Images and one
// Temporary Geocoding request. Static Images is the tighter allowance (50,000 a month):
// a script needs 50,000 / 720 hours ≈ 69 arts an hour, every hour, to use it alone.
// At 20 an hour it reaches 14,400 a month (29%). Quick series stay possible (an art every
// couple of seconds) up to 10 in a minute. Anyone calling Mapbox directly bypasses this;
// the real protection is moving the Mapbox calls behind the backend.

const ART_CREATION_TIMESTAMPS_KEY = 'ART_CREATION_TIMESTAMPS';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const BURST_LIMIT = 10;
const BURST_WINDOW = MINUTE;
const HOURLY_LIMIT = 20;
const HOURLY_WINDOW = HOUR;

export type ArtCreationLimit =
	| { type: 'burst' }
	| { type: 'hourly'; minutesUntilNextArt: number };

/** Times (ms) at which arts were created in the last hour. */
function readTimestamps(now: number): number[] {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(ART_CREATION_TIMESTAMPS_KEY) ?? '[]');
		if (!Array.isArray(stored)) return [];
		return stored.filter(
			(time): time is number => typeof time === 'number' && now - time < HOURLY_WINDOW
		);
	} catch {
		return [];
	}
}

/** The limit a new art would exceed, or null when it can be created. */
export function getArtCreationLimit(now = Date.now()): ArtCreationLimit | null {
	const timestamps = readTimestamps(now);
	if (timestamps.length >= HOURLY_LIMIT) {
		// The oldest art of the hour has to leave the window to free a slot.
		const nextArtAt = Math.min(...timestamps) + HOURLY_WINDOW;
		const minutesUntilNextArt = Math.max(1, Math.ceil((nextArtAt - now) / MINUTE));
		return { type: 'hourly', minutesUntilNextArt };
	}
	const inLastMinute = timestamps.filter((time) => now - time < BURST_WINDOW).length;
	return inLastMinute >= BURST_LIMIT ? { type: 'burst' } : null;
}

/** Counts an art once its Mapbox requests are about to be sent. */
export function recordArtCreation(now = Date.now()) {
	try {
		const timestamps = [...readTimestamps(now), now];
		localStorage.setItem(ART_CREATION_TIMESTAMPS_KEY, JSON.stringify(timestamps));
	} catch {
		// Without storage the limit cannot be kept; the art is still created.
	}
}
