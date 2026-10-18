import type p5 from 'p5';
import type { ColorPalette } from '#lib/domain/colorPalettes.ts';
import {
	createMartpCanvas,
	drawArtFrame,
	drawMapImage,
	hexToRgb,
	isRgbColor,
	setPixel,
	startMartpSketch,
	type MartpSketchOptions,
	type Rgb
} from './martpSketch.ts';

// Port of core/sketches/ColorfulMapSketch.kt. The ColorfulMap Mapbox style paints each
// layer with a marker color, which is swapped for a shuffled color of the palette.
// Tapping the art shuffles the colors again.

const buildingOriginalColor: Rgb = [255, 36, 36];
const buildingStrokeOriginalColor: Rgb = [69, 36, 255];
const roadsOriginalColor: Rgb = [211, 255, 36];
const roadsPathOriginalColor: Rgb = [93, 249, 192];
const waterOriginalColor: Rgb = [234, 26, 234];

/** The palette color each map layer got; null when the layer is not in the image. */
export interface ColorLayerHolder {
	roadsColor: string | null;
	buildingStrokeColor: string | null;
	buildingColor: string | null;
	roadsPathColor: string | null;
	waterColor: string | null;
	landOthersColor: string | null;
}

interface ColorfulMapSketchOptions extends MartpSketchOptions {
	colorPalette: ColorPalette;
	onColorsShuffled: (colorLayerHolder: ColorLayerHolder) => void;
}

export function startColorfulMapSketch(container: HTMLElement, options: ColorfulMapSketchOptions) {
	return startMartpSketch(container, (p) => {
		let originalMapImage: p5.Image;
		let mapImage: p5.Image;

		function changePixelColors(image: p5.Image) {
			const randomColors = shuffled(options.colorPalette.colors);
			const randomRgbs = randomColors.map(hexToRgb);
			const colorHolder: ColorLayerHolder = {
				roadsColor: null,
				buildingStrokeColor: null,
				buildingColor: null,
				roadsPathColor: null,
				waterColor: null,
				landOthersColor: null
			};
			// Same order as the app's `when`: the first matching layer wins.
			const layers: [Rgb | null, keyof ColorLayerHolder][] = [
				[roadsOriginalColor, 'roadsColor'],
				[roadsPathOriginalColor, 'roadsPathColor'],
				[waterOriginalColor, 'waterColor'],
				[buildingStrokeOriginalColor, 'buildingStrokeColor'],
				[buildingOriginalColor, 'buildingColor'],
				[null, 'landOthersColor']
			];

			image.loadPixels();
			const pixels = image.pixels;
			for (let index = 0; index < pixels.length; index += 4) {
				const red = pixels[index];
				const green = pixels[index + 1];
				const blue = pixels[index + 2];
				const layer = layers.findIndex(
					([originalColor]) => originalColor == null || isRgbColor(red, green, blue, originalColor)
				);
				setPixel(pixels, index, randomRgbs[layer]);
				colorHolder[layers[layer][1]] = randomColors[layer];
			}
			image.updatePixels();
			options.onColorsShuffled(colorHolder);
		}

		/** A fresh copy of the downloaded image with new colors, like loadImage + changePixelColors. */
		function recoloredMapImage() {
			const image = originalMapImage.get();
			changePixelColors(image);
			return image;
		}

		p.setup = async () => {
			const canvas = createMartpCanvas(p, options);
			// The app only redraws the same image every frame, so draw on demand instead.
			p.noLoop();
			originalMapImage = await p.loadImage(options.imageUrl);
			mapImage = recoloredMapImage();
			drawArtFrame(p, options);
			drawMapImage(p, mapImage);
			p.filter(p.ERODE);
			// The app's mousePressed. p.mousePressed would fire for clicks anywhere on the page.
			canvas.addEventListener('pointerdown', () => {
				mapImage = recoloredMapImage();
				p.redraw();
			});
		};

		p.draw = () => {
			if (mapImage) drawMapImage(p, mapImage);
		};
	});
}

/** Kotlin's List.shuffled() (Fisher–Yates). */
function shuffled<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
