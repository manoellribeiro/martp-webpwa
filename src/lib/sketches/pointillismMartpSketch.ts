import type p5 from 'p5';
import {
	createMartpCanvas,
	drawArtFrame,
	drawMapImage,
	framePadding,
	frameThickness,
	isStreetPixel,
	setPixel,
	startMartpSketch,
	type MartpSketchOptions,
	type Rgb
} from './martpSketch.ts';

// Port of core/sketches/PointillismMartpSketch.kt.
const circleColor: Rgb = [18, 13, 49];
const everythingElseColor: Rgb = [255, 201, 113];
const circleRadius = 4;
const circleSpacing = 8;

export function startPointillismMartpSketch(container: HTMLElement, options: MartpSketchOptions) {
	return startMartpSketch(container, (p) => {
		p.setup = async () => {
			createMartpCanvas(p, options);
			p.noLoop();
			const mapImage = await p.loadImage(options.imageUrl);
			const pixelsToAddCircles = changePixelColors(mapImage);
			drawArtFrame(p, options);
			drawMapImage(p, mapImage);
			p.filter(p.ERODE);
			p.fill(...circleColor);
			p.ellipseMode(p.RADIUS);
			for (const [x, y] of pixelsToAddCircles) {
				p.ellipse(
					x + frameThickness + framePadding,
					y + frameThickness + framePadding,
					circleRadius,
					circleRadius
				);
			}
		};
	});
}

/** Paints the map and returns where the circles go: street pixels, at most one every 8px. */
function changePixelColors(mapImage: p5.Image): [x: number, y: number][] {
	const pixelsToAddCircles: [number, number][] = [];
	let nextXPixelAllowedToPutCircle = 0;
	let nextYPixelAllowedToPutCircle = 0;

	mapImage.loadPixels();
	const pixels = mapImage.pixels;
	for (let y = 0; y < mapImage.height; y++) {
		for (let x = 0; x < mapImage.width; x++) {
			const index = (y * mapImage.width + x) * 4;
			if (
				isStreetPixel(pixels[index], pixels[index + 1], pixels[index + 2]) &&
				y >= nextYPixelAllowedToPutCircle
			) {
				if (x >= nextXPixelAllowedToPutCircle) {
					pixelsToAddCircles.push([x, y]);
					nextXPixelAllowedToPutCircle += circleSpacing;
				}
			} else {
				setPixel(pixels, index, everythingElseColor);
			}
		}
		nextXPixelAllowedToPutCircle = 0;

		if (y >= nextYPixelAllowedToPutCircle) {
			nextYPixelAllowedToPutCircle += circleSpacing;
		}
	}
	mapImage.updatePixels();
	return pixelsToAddCircles;
}
