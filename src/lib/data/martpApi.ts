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

async function request(path: string, init: RequestInit = {}, signal?: AbortSignal) {
	const headers = new Headers(init.headers);
	headers.set(APP_CHECK_HEADER, await getAppCheckToken());
	const response = await fetch(`${PUBLIC_MARTP_API_URL}/${path}`, { ...init, headers, signal });
	if (!response.ok) throw new Error(`Martp API ${path}: HTTP ${response.status}`);
	return response;
}

export async function getColorPalettes(): Promise<RemoteColorPalettesResponse> {
	return (await request('color-palettes')).json();
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
	return (await request(`geocoding/reverse?${params}`, {}, signal)).json();
}

/** Multipart request with the `art` JSON part and the `image` PNG part. */
export async function saveMapArt(art: RemoteSaveMapArtRequest, image: Blob): Promise<void> {
	const body = new FormData();
	body.append('art', new Blob([JSON.stringify(art)], { type: 'application/json' }));
	body.append('image', image, `${art.id}.png`);
	await request('map-arts', { method: 'POST', body });
}

/** Approved arts, newest first. A null `continent` means every continent. */
export async function getExhibitionMapArts(
	continent: string | null,
	signal?: AbortSignal
): Promise<RemoteExhibitionMapArtsResponse> {
	const query = continent ? `?${new URLSearchParams({ continent })}` : '';
	return (await request(`map-arts/exhibition${query}`, {}, signal)).json();
}

/** Continents with approved arts and how many each has, the biggest first. */
export async function getExhibitionContinents(
	signal?: AbortSignal
): Promise<RemoteExhibitionContinentsResponse> {
	return (await request('map-arts/exhibition/continents', {}, signal)).json();
}

/** A random selection of approved arts for the globe, different on each call. */
export async function getGlobeMapArts(
	signal?: AbortSignal
): Promise<RemoteExhibitionMapArtsResponse> {
	return (await request('map-arts/exhibition/globe', {}, signal)).json();
}
