// The web counterpart of SuccessActivity's IMAGE_PATH_LOCATION_EXTRA. The web keeps no arts
// on the device, so the saved art's PNG is handed to the success screen in memory; a reload
// loses it, and the screen then closes like the activity does without the extra.

let savedArt: Blob | null = null;

export function setSavedArt(image: Blob) {
	savedArt = image;
}

export function getSavedArt(): Blob | null {
	return savedArt;
}
