import { PUBLIC_MARTP_API_URL } from '$app/env/public';
import { APP_CHECK_HEADER, getAppCheckToken } from '#lib/data/appCheck.ts';

// Port of core/data/network/martp/MartpApiService.kt and its models. Every request carries
// the App Check token, like the app's AppCheckInterceptor. Errors are thrown as is; the
// repositories decide what to do with them, as MartpRepository does.

export interface RemoteColorPalette {
	name: string;
	/** #RRGGBB */
	colors: string[];
}

interface RemoteColorPalettesResponse {
	palettes: RemoteColorPalette[];
}

export interface RemoteReversedAddress {
	street: string | null;
	city: string | null;
	country: string | null;
}

export interface RemoteMapLayersColors {
	roadsColor: string | null;
	buildingStrokeColor: string | null;
	buildingColor: string | null;
	roadsPathColor: string | null;
	waterColor: string | null;
	landOthersColor: string | null;
}

export interface RemoteSaveMapArtRequest {
	id: string;
	title: string;
	latitude: number;
	longitude: number;
	dateInMillis: number;
	sketchArtType: string | null;
	colorPalette: string | null;
	colorsLayers: RemoteMapLayersColors | null;
	email: string | null;
	username: string | null;
}

/** An approved art of the digital exhibition. Web-only: the app has no exhibition yet. */
export interface RemoteExhibitionMapArt {
	id: string;
	title: string;
	latitude: number;
	longitude: number;
	dateInMillis: number;
	/** A Continent value; OCEAN when not on or near any country, UNKNOWN when the lookup failed. */
	continent: string;
	/** ISO 3166-1 alpha-2, null in the ocean. */
	countryCode: string | null;
	imageUrl: string;
	sketchArtType: string | null;
	colorPalette: string | null;
	colorsLayers: RemoteMapLayersColors;
	/** null when the art is anonymous, or its user is deleted or has no username. */
	user: { username: string } | null;
}

interface RemoteExhibitionMapArtsResponse {
	mapArts: RemoteExhibitionMapArt[];
}

export interface RemoteExhibitionContinent {
	/** A Continent value, OCEAN and UNKNOWN included. */
	continent: string;
	total: number;
}

interface RemoteExhibitionContinentsResponse {
	continents: RemoteExhibitionContinent[];
}

/**
 * The API (Cloud Run) and its database (Neon) sleep when nobody uses them, and the first request
 * waits for both to wake up. Each attempt gets this long before it is given up.
 */
const REQUEST_TIMEOUT_MS = 30_000;
/** An art upload carries the PNG, so it gets longer. */
const UPLOAD_TIMEOUT_MS = 60_000;
/** Wait before the first retry; doubled before the next one. */
const RETRY_DELAY_MS = 2_000;

class MartpApiHttpError extends Error {
	constructor(
		path: string,
		readonly status: number
	) {
		super(`Martp API ${path}: HTTP ${status}`);
	}
}

class MartpApiTimeoutError extends Error {
	constructor(path: string, timeoutMs: number) {
		super(`Martp API ${path}: no answer after ${timeoutMs / 1000}s`);
	}
}

interface RequestOptions {
	init?: RequestInit;
	signal?: AbortSignal;
	/** Extra attempts after a timeout, a network error or a server error. Only for reads. */
	retries?: number;
	timeoutMs?: number;
}

/** Waking up can end in a timeout, a dropped connection (TypeError) or a 5xx/429 answer. */
function isWakingUpFailure(error: unknown): boolean {
	if (error instanceof MartpApiTimeoutError || error instanceof TypeError) return true;
	return error instanceof MartpApiHttpError && (error.status >= 500 || error.status === 429);
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, milliseconds);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(timer);
				reject(signal.reason);
			},
			{ once: true }
		);
	});
}

async function attempt(path: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal) {
	// AbortSignal.any and AbortSignal.timeout are too recent for the older phones of the audience.
	const controller = new AbortController();
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, timeoutMs);
	const forwardAbort = () => controller.abort(signal?.reason);
	signal?.addEventListener('abort', forwardAbort);
	try {
		const headers = new Headers(init.headers);
		headers.set(APP_CHECK_HEADER, await getAppCheckToken());
		const response = await fetch(`${PUBLIC_MARTP_API_URL}/${path}`, {
			...init,
			headers,
			signal: controller.signal
		});
		if (!response.ok) throw new MartpApiHttpError(path, response.status);
		return response;
	} catch (error) {
		throw timedOut ? new MartpApiTimeoutError(path, timeoutMs) : error;
	} finally {
		clearTimeout(timer);
		signal?.removeEventListener('abort', forwardAbort);
	}
}

async function request(
	path: string,
	{ init = {}, signal, retries = 0, timeoutMs = REQUEST_TIMEOUT_MS }: RequestOptions = {}
) {
	for (let attemptNumber = 0; ; attemptNumber++) {
		try {
			return await attempt(path, init, timeoutMs, signal);
		} catch (error) {
			if (attemptNumber >= retries || signal?.aborted || !isWakingUpFailure(error)) throw error;
			console.warn(`Martp API ${path}: retrying`, error);
			await wait(RETRY_DELAY_MS * 2 ** attemptNumber, signal);
		}
	}
}

export async function getColorPalettes(): Promise<RemoteColorPalettesResponse> {
	return (await request('color-palettes', { retries: 1 })).json();
}

export async function reverseGeocode(
	latitude: number,
	longitude: number,
	language: string | null,
	signal?: AbortSignal
): Promise<RemoteReversedAddress> {
	const params = new URLSearchParams({
		latitude: latitude.toString(),
		longitude: longitude.toString()
	});
	if (language) params.set('language', language);
	return (await request(`geocoding/reverse?${params}`, { signal })).json();
}

/** Multipart request with the `art` JSON part and the `image` PNG part. */
export async function saveMapArt(art: RemoteSaveMapArtRequest, image: Blob): Promise<void> {
	const body = new FormData();
	body.append('art', new Blob([JSON.stringify(art)], { type: 'application/json' }));
	body.append('image', image, `${art.id}.png`);
	await request('map-arts', { init: { method: 'POST', body }, timeoutMs: UPLOAD_TIMEOUT_MS });
}

/** Approved arts, newest first. A null `continent` means every continent. */
export async function getExhibitionMapArts(
	continent: string | null,
	signal?: AbortSignal
): Promise<RemoteExhibitionMapArtsResponse> {
	const query = continent ? `?${new URLSearchParams({ continent })}` : '';
	return (await request(`map-arts/exhibition${query}`, { signal, retries: 2 })).json();
}

/** Continents with approved arts and how many each has, the biggest first. */
export async function getExhibitionContinents(
	signal?: AbortSignal
): Promise<RemoteExhibitionContinentsResponse> {
	return (await request('map-arts/exhibition/continents', { signal, retries: 2 })).json();
}

/** A random selection of approved arts for the globe, different on each call. */
export async function getGlobeMapArts(
	signal?: AbortSignal
): Promise<RemoteExhibitionMapArtsResponse> {
	return (await request('map-arts/exhibition/globe', { signal, retries: 2 })).json();
}
