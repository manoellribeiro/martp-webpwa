// Where a place is drawn on the COBE globe, so the art pins can be HTML on top of the canvas.
// Same math as COBE's own marker anchors (cobe/dist/index.esm.js) for a square canvas with the
// default scale and offset, without the marker elevation: pins sit on the surface.

/** COBE draws the sphere at 80% of its canvas, so the canvas is this much bigger than the globe. */
export const CANVAS_TO_GLOBE = 1 / 0.8;

export interface GlobePoint {
	/** 0 at the sphere's left edge, 1 at its right edge (not the canvas', which is bigger). */
	x: number;
	/** 0 at the sphere's top edge, 1 at its bottom edge. */
	y: number;
	/** How much the point faces the viewer: 1 in the middle, 0 at the edge, negative behind. */
	facing: number;
}

export function projectLocation(
	latitude: number,
	longitude: number,
	phi: number,
	theta: number
): GlobePoint {
	const lat = (latitude * Math.PI) / 180;
	const lng = (longitude * Math.PI) / 180 - Math.PI;
	const px = -Math.cos(lat) * Math.cos(lng);
	const py = Math.sin(lat);
	const pz = Math.cos(lat) * Math.sin(lng);

	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);
	const cosPhi = Math.cos(phi);
	const sinPhi = Math.sin(phi);

	const screenX = cosPhi * px + sinPhi * pz;
	const screenY = sinPhi * sinTheta * px + cosTheta * py - cosPhi * sinTheta * pz;
	const depth = -sinPhi * cosTheta * px + sinTheta * py + cosPhi * cosTheta * pz;

	return {
		x: (screenX + 1) / 2,
		y: (-screenY + 1) / 2,
		facing: depth
	};
}

/** The globe's `phi` and `theta` that put a place in the middle, facing the viewer. */
export function anglesFacing(latitude: number, longitude: number): { phi: number; theta: number } {
	return {
		phi: (3 * Math.PI) / 2 - (longitude * Math.PI) / 180,
		theta: (latitude * Math.PI) / 180
	};
}

/** The same angle moved by whole turns to be the closest to `from`, so a spin takes the short way. */
export function closestAngle(angle: number, from: number): number {
	const turn = 2 * Math.PI;
	return angle + Math.round((from - angle) / turn) * turn;
}
