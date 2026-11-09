import { MapboxApiErrorFailure, NoInternetConnectionFailure } from '#lib/domain/failures.ts';

// Web counterpart of MapboxApiService + MartpRepository.fetchStaticMapImage.
// Reverse geocoding goes through the Martp API instead (src/lib/data/martpApi.ts).
// https://docs.mapbox.com/api/maps/static-images/

export const MapboxMapStyle = {
	DarkV11: 'cmnxj3x4g000501sm6i905bl6',
	WaterFlow: 'cmtu822b3004l01s79n597c5j',
	ColorfulMap: 'cmupymzds005i01qy8allhvs1'
} as const;

export type MapboxMapStyle = (typeof MapboxMapStyle)[keyof typeof MapboxMapStyle];

const accessToken = __MAPBOX_API_KEY__;

/** Mapbox static images are at most 1280px on each side. */
export const MAPBOX_MAX_IMAGE_SIZE = 1280;

interface StaticMapImageRequest {
	styleId: MapboxMapStyle;
	latitude: number;
	longitude: number;
	mapWidth: number;
	mapHeight: number;
	mapZoom: number;
	signal?: AbortSignal;
}

/** Downloads the map image and returns an object URL for it; revoke it once it is not needed. */
export async function fetchStaticMapImage({
	styleId,
	latitude,
	longitude,
	mapWidth,
	mapHeight,
	mapZoom,
	signal
}: StaticMapImageRequest): Promise<string> {
	if (!navigator.onLine) throw new NoInternetConnectionFailure();
	const url = new URL(
		`https://api.mapbox.com/styles/v1/manoellribeiro/${styleId}/static/${longitude},${latitude},${mapZoom},0,0/${mapWidth}x${mapHeight}`
	);
	url.searchParams.set('access_token', accessToken);
	url.searchParams.set('logo', 'false');
	url.searchParams.set('attribution', 'false');
	url.searchParams.set('before_layer', 'false');
	try {
		const response = await fetch(url, { signal });
		if (!response.ok) throw new Error(`Mapbox static image: HTTP ${response.status}`);
		return URL.createObjectURL(await response.blob());
	} catch (e) {
		if (signal?.aborted) throw e;
		throw new MapboxApiErrorFailure(e instanceof Error ? e.message : null);
	}
}
