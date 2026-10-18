import {
	LocationDisabledFailure,
	LocationPermissionNotGrantedFailure,
	UnknownErrorFailure
} from '#lib/domain/failures.ts';

// Web counterpart of the ACCESS_FINE_LOCATION permission checks in MainActivity.

export type LocationPermissionState = 'granted' | 'denied' | 'prompt';

export async function checkLocationPermission(): Promise<LocationPermissionState> {
	try {
		const status = await navigator.permissions.query({ name: 'geolocation' });
		return status.state;
	} catch {
		// Permissions API unavailable: the only way to know is to ask.
		return 'prompt';
	}
}

/** Shows the browser's permission prompt. Resolves to whether access was granted. */
export function requestLocationPermission(): Promise<boolean> {
	return new Promise((resolve) => {
		if (!('geolocation' in navigator)) {
			resolve(false);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			() => resolve(true),
			// Timeouts and unavailable positions still mean the permission itself was granted.
			(error) => resolve(error.code !== error.PERMISSION_DENIED)
		);
	});
}

export interface Location {
	latitude: number;
	longitude: number;
}

/** Port of LocationService.getCurrentLocation(). Rejects with a Failure. */
export function getCurrentLocation(): Promise<Location> {
	return new Promise((resolve, reject) => {
		if (!('geolocation' in navigator)) {
			reject(new UnknownErrorFailure('Geolocation API unavailable'));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
			(error) =>
				reject(
					error.code === error.PERMISSION_DENIED
						? new LocationPermissionNotGrantedFailure(error.message)
						: new LocationDisabledFailure(error.message)
				),
			// PRIORITY_BALANCED_POWER_ACCURACY. Unlike the app's fused client, a browser may
			// never answer, so give up after a while.
			{ enableHighAccuracy: false, timeout: 30_000 }
		);
	});
}
