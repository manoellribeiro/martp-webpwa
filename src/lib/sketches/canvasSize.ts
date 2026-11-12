import { MAPBOX_MAX_IMAGE_SIZE } from '#lib/data/mapbox.ts';

// Sizes of core/sketches/MartpSketch.kt, apart from martpSketch.ts so that reading them
// (the root layout does, on every page) does not load p5. Canvas pixels, like on Android.

export const frameThickness = 30;
export const framePadding = 30;
/** Frame and padding on both sides, around the map image. */
export const framesSize = 2 * frameThickness + 2 * framePadding;
/**
 * Largest canvas side whose map still fills the frame. Phones never reach it; on a big
 * screen the art keeps this size instead of leaving a gap next to the map.
 */
export const MAX_CANVAS_SIZE = MAPBOX_MAX_IMAGE_SIZE + framesSize;
