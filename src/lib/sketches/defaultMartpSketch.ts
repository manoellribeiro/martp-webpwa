import type p5 from 'p5';
import {
	createMartpCanvas,
	drawArtFrame,
	drawMapImage,
	isStreetPixel,
	setPixel,
	startMartpSketch,
	type MartpSketchOptions,
	type Rgb
} from './martpSketch.ts';

// Port of core/sketches/DefaultMartpSketch.kt (the "Classic" art style). The app's tile
// layout (createTiles) is commented out there, so it is not ported.
const streetColor: Rgb = [18, 13, 49];
const everythingElseColor: Rgb = [255, 201, 113];

export function startDefaultMartpSketch(container: HTMLElement, options: MartpSketchOptions) {
	return startMartpSketch(container, (p) => {
		p.setup = async () => {
			createMartpCanvas(p, options);
			p.noLoop();
			const mapImage = await p.loadImage(options.imageUrl);
			changePixelColors(mapImage);
			drawArtFrame(p, options);
			drawMapImage(p, mapImage);
			p.filter(p.ERODE);
		};
	});
}

function changePixelColors(mapImage: p5.Image) {
	mapImage.loadPixels();
	const pixels = mapImage.pixels;
	for (let index = 0; index < pixels.length; index += 4) {
		const isStreet = isStreetPixel(pixels[index], pixels[index + 1], pixels[index + 2]);
		setPixel(pixels, index, isStreet ? streetColor : everythingElseColor);
	}
	mapImage.updatePixels();
}
