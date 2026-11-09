import { getColorPalettePreference } from '#lib/data/artSettings.ts';
import { getColorPalettes, type RemoteColorPalette } from '#lib/data/martpApi.ts';
import { FALLBACK_COLOR_PALETTES, type ColorPalette } from '#lib/domain/colorPalettes.ts';

// Port of the color palette parts of MartpRepository. The app caches the palettes in Room
// (ColorPalettesDao); here they are cached in localStorage. A cached list is returned right
// away and refreshed in the background, so the next visit gets the API's latest palettes.

const STORAGE_KEY = 'color_palettes';

/** Port of String.hexToColorInt: throws unless the color is #RRGGBB. */
function normalizeHexColor(color: string): string {
	const hex = color.startsWith('#') ? color.slice(1) : color;
	if (!/^[0-9a-f]{6}$/i.test(hex)) {
		throw new Error(`Expected a color in the #RRGGBB format but was ${color}`);
	}
	return `#${hex.toUpperCase()}`;
}

/** ColorPaletteEntity(remoteColorPalette). */
function toColorPalette({ name, colors }: RemoteColorPalette): ColorPalette {
	return { name, colors: colors.map(normalizeHexColor) };
}

function readLocalColorPalettes(): ColorPalette[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as ColorPalette[]) : [];
	} catch (e) {
		console.error('colorPalettes.readLocalColorPalettes', e);
		return [];
	}
}

/** ColorPalettesDao.replaceAll. */
function replaceLocalColorPalettes(colorPalettes: ColorPalette[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(colorPalettes));
	} catch (e) {
		console.error('colorPalettes.replaceLocalColorPalettes', e);
	}
}

export async function getColorsPalettes(): Promise<ColorPalette[]> {
	const localColorPalettes = readLocalColorPalettes();
	if (localColorPalettes.length === 0) return fetchColorsPalettes();
	void fetchColorsPalettes();
	return localColorPalettes;
}

export async function fetchColorsPalettes(): Promise<ColorPalette[]> {
	let remoteColorPalettes: ColorPalette[];
	try {
		remoteColorPalettes = (await getColorPalettes()).palettes.map(toColorPalette);
	} catch (e) {
		console.error('colorPalettes.fetchColorsPalettes', e);
		return FALLBACK_COLOR_PALETTES;
	}
	if (remoteColorPalettes.length === 0) return FALLBACK_COLOR_PALETTES;
	replaceLocalColorPalettes(remoteColorPalettes);
	return remoteColorPalettes;
}

export async function getSelectedColorPalette(): Promise<ColorPalette> {
	const selectedName = getColorPalettePreference();
	const selectedColorPalette = readLocalColorPalettes().find(
		(colorPalette) => colorPalette.name === selectedName
	);
	return selectedColorPalette ?? (await getColorsPalettes())[0];
}
