// Port of core/data/local/entities/ColorPaletteEntity.kt. The palettes come from the Martp
// API (src/lib/data/colorPalettes.ts); colors are kept as #RRGGBB strings.
export interface ColorPalette {
	name: string;
	colors: string[];
}

/** MartpRepository.FALLBACK_COLOR_PALETTES: used when the API has no palettes to give. */
export const FALLBACK_COLOR_PALETTES: ColorPalette[] = [
	{ name: 'Martp', colors: ['#100C2D', '#120D31', '#4E3C41', '#896B51', '#FFC971', '#FFCE7E'] }
];
