import { isSketchArtType, type SketchArtType } from '#lib/domain/sketchArtType.ts';

// Web counterpart of the art settings DataStore in MartpRepository.
// The preferences live in localStorage, under the same keys the app uses.
const MAP_ZOOM_KEY = 'MAP_ZOOM_KEY';
const MAP_ART_STYLE_KEY = 'MAP_ART_STYLE_KEY';
const SELECTED_COLOR_PALETTE = 'SELECTED_COLOR_PALETTE';

function read(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function write(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		// The app throws LocalStorageErrorFailure, which nothing catches; a failed save is ignored here.
	}
}

export function getColorPalettePreference(): string {
	return read(SELECTED_COLOR_PALETTE) ?? 'Martp';
}

export function setColorPalettePreference(colorPaletteName: string) {
	write(SELECTED_COLOR_PALETTE, colorPaletteName);
}

export function getArtStylePreference(): SketchArtType {
	const stored = read(MAP_ART_STYLE_KEY);
	return isSketchArtType(stored) ? stored : 'COLORFUL_MAP';
}

export function setMapArtStylePreference(sketchArtType: SketchArtType) {
	write(MAP_ART_STYLE_KEY, sketchArtType);
}

export function getMapZoomPreference(): number {
	const stored = Number.parseFloat(read(MAP_ZOOM_KEY) ?? '');
	return Number.isFinite(stored) ? stored : 16.5;
}

export function setMapZoomPreference(mapZoom: number) {
	write(MAP_ZOOM_KEY, mapZoom.toString());
}
