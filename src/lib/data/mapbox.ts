import { MapboxApiErrorFailure, NoInternetConnectionFailure } from '#lib/domain/failures.ts';

// Web counterpart of MapboxApiService + MartpRepository.fetchStaticMapImage and of
// GetAddressService (the app uses Android's Geocoder; here Mapbox reverse geocoding).
// https://docs.mapbox.com/api/maps/static-images/
// https://docs.mapbox.com/api/search/geocoding/#reverse-geocoding

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

/** The parts of android.location.Address the app uses. */
export interface Address {
	thoroughfare: string | null;
	locality: string | null;
	countryName: string | null;
}

interface GeocodingContextItem {
	name?: string;
	street_name?: string;
}

interface GeocodingResponse {
	features: {
		properties: {
			feature_type: string;
			name: string;
			context: Partial<Record<'address' | 'street' | 'place' | 'country', GeocodingContextItem>>;
		};
	}[];
}

/** Like GetAddressService: null when the address cannot be found, a failure only when offline. */
export async function getAddress(
	latitude: number,
	longitude: number,
	language: string,
	signal?: AbortSignal
): Promise<Address | null> {
	if (!navigator.onLine) throw new NoInternetConnectionFailure();
	const url = new URL('https://api.mapbox.com/search/geocode/v6/reverse');
	url.searchParams.set('latitude', latitude.toString());
	url.searchParams.set('longitude', longitude.toString());
	url.searchParams.set('language', language);
	url.searchParams.set('limit', '1');
	url.searchParams.set('access_token', accessToken);
	try {
		const response = await fetch(url, { signal });
		if (!response.ok) return null;
		const { features } = (await response.json()) as GeocodingResponse;
		const properties = features[0]?.properties;
		if (!properties) return null;
		const { context } = properties;
		return {
			thoroughfare:
				context.street?.name ??
				context.address?.street_name ??
				(properties.feature_type === 'street' ? properties.name : null),
			locality: context.place?.name ?? null,
			countryName: context.country?.name ?? null
		};
	} catch (e) {
		if (signal?.aborted) throw e;
		return null;
	}
}
