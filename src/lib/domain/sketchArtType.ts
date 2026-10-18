import { MapboxMapStyle } from '#lib/data/mapbox.ts';

// Port of core/models/failures/SketchArtType.kt. WATER_FLOW and PARTICLE_SYSTEM are still
// work in progress in the app (hidden from the art style settings), so they are not ported.
export type SketchArtType = 'DEFAULT' | 'POINTILLISM' | 'COLORFUL_MAP';

interface SketchArtTypeConfig {
	mapboxMapStyle: MapboxMapStyle;
	minZoom: number;
	maxZoom: number;
}

export const sketchArtTypes: Record<SketchArtType, SketchArtTypeConfig> = {
	DEFAULT: { mapboxMapStyle: MapboxMapStyle.DarkV11, minZoom: 14, maxZoom: 15 },
	POINTILLISM: { mapboxMapStyle: MapboxMapStyle.DarkV11, minZoom: 14, maxZoom: 15 },
	COLORFUL_MAP: { mapboxMapStyle: MapboxMapStyle.ColorfulMap, minZoom: 16, maxZoom: 17 }
};

export function isSketchArtType(value: string | null): value is SketchArtType {
	return value != null && value in sketchArtTypes;
}

// Slider position goes from 0 (far, minZoom) to 1 (close, maxZoom)
export function zoomToSliderPosition(sketchArtType: SketchArtType, zoom: number): number {
	const { minZoom, maxZoom } = sketchArtTypes[sketchArtType];
	const position = (zoom - minZoom) / (maxZoom - minZoom);
	return Math.min(Math.max(position, 0), 1);
}

export function sliderPositionToZoom(sketchArtType: SketchArtType, sliderPosition: number): number {
	const { minZoom, maxZoom } = sketchArtTypes[sketchArtType];
	return minZoom + sliderPosition * (maxZoom - minZoom);
}
