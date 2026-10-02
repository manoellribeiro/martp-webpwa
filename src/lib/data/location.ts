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
