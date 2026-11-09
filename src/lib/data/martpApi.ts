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
