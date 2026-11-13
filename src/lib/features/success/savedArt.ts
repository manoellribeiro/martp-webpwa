// The web counterpart of SuccessActivity's IMAGE_PATH_LOCATION_EXTRA: the saved art's PNG is
// handed to the success screen in memory (it is also in the gallery, src/lib/data/mapArts.ts).
// A reload loses it, and the screen then closes like the activity does without the extra.

let savedArt: Blob | null = null;

export function setSavedArt(image: Blob) {
	savedArt = image;
}

export function getSavedArt(): Blob | null {
	return savedArt;
}
