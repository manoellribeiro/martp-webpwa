import p5 from 'p5';

// Port of core/sketches/MartpSketch.kt. Sizes are in canvas pixels, which are device
// pixels like on Android: the canvas is drawn at pixelDensity 1 and scaled down by CSS.

export const frameThickness = 30;
export const framePadding = 30;

export interface MartpSketchOptions {
	canvasWidth: number;
	canvasHeight: number;
	/** URL of the static map image (an object URL from fetchStaticMapImage). */
	imageUrl: string;
}

/** What the screen needs from a running sketch. */
export interface MartpSketch {
	/** Downloads the art as a PNG, the web counterpart of PApplet.save(path). */
	save(fileName: string): Promise<void>;
	/** Stops the sketch and removes its canvas. */
	remove(): void;
}

export type Rgb = [red: number, green: number, blue: number];

/** Starts a p5 instance mode sketch inside `container`. */
export function startMartpSketch(container: HTMLElement, sketch: (p: p5) => void): MartpSketch {
	const instance = new p5(sketch, container);
	return {
		save: (fileName) => {
			const canvas = container.querySelector('canvas');
			return canvas ? downloadCanvas(canvas, fileName) : Promise.reject(new Error('No art to save'));
		},
		remove: () => instance.remove()
	};
}

/** MartpSketch.settings(): creates the canvas, filling the container. */
export function createMartpCanvas(
	p: p5,
	{ canvasWidth, canvasHeight }: MartpSketchOptions
): HTMLCanvasElement {
	p.pixelDensity(1);
	const canvas = p.createCanvas(canvasWidth, canvasHeight).elt;
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	return canvas;
}

export function drawArtFrame(p: p5, { canvasWidth, canvasHeight }: MartpSketchOptions) {
	p.noStroke();
	p.fill(51, 51, 51);
	p.rect(0, 0, canvasWidth, canvasHeight);
	p.fill(255, 255, 255);
	p.rect(
		frameThickness,
		frameThickness,
		canvasWidth - 2 * frameThickness,
		canvasHeight - 2 * frameThickness
	);
}

export function drawMapImage(p: p5, mapImage: p5.Image) {
	p.image(mapImage, frameThickness + framePadding, frameThickness + framePadding);
}

export function isStreetPixel(red: number, green: number, blue: number): boolean {
	const isInStreetRange = (value: number) => value >= 56 && value <= 64;
	return isInStreetRange(red) && isInStreetRange(green) && isInStreetRange(blue);
}

/** Port of the Int.isRgbColor extension: each channel within ±2 of the compared color. */
export function isRgbColor(red: number, green: number, blue: number, [r, g, b]: Rgb): boolean {
	return Math.abs(red - r) <= 2 && Math.abs(green - g) <= 2 && Math.abs(blue - b) <= 2;
}

export function setPixel(pixels: Uint8ClampedArray | number[], index: number, [r, g, b]: Rgb) {
	pixels[index] = r;
	pixels[index + 1] = g;
	pixels[index + 2] = b;
	pixels[index + 3] = 255;
}

export function hexToRgb(hex: string): Rgb {
	const value = Number.parseInt(hex.slice(1), 16);
	return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function downloadCanvas(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error('Could not encode the art as PNG'));
				return;
			}
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${fileName}.png`;
			link.click();
			// Give the browser time to start the download before freeing the image.
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			resolve();
		}, 'image/png');
	});
}
