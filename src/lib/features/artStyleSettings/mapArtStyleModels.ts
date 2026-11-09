import colorfulMapIcon from '#lib/assets/ic_colorful_map.svg';
import pointillismIcon from '#lib/assets/ic_pointllism.svg';
import logo from '#lib/assets/martp_logo.svg';
import type { SketchArtType } from '#lib/domain/sketchArtType.ts';
import type { Strings } from '#lib/strings.ts';

// Port of scenes/artStyleSettings/MapArtStyleModel.kt (artStyleModels), shared by the art
// style settings and the success screens.
export interface MapArtStyleModel {
	titleId: keyof Strings;
	descriptionId: keyof Strings;
	/** Icon file, tinted through a CSS mask. */
	icon: string;
	sketchArtType: SketchArtType;
}

// The app also lists WATER_FLOW and PARTICLE_SYSTEM, commented out as work in progress.
export const artStyleModels: MapArtStyleModel[] = [
	{
		titleId: 'colorful_map',
		descriptionId: 'colorful_map_description',
		icon: colorfulMapIcon,
		sketchArtType: 'COLORFUL_MAP'
	},
	{ titleId: 'classic', descriptionId: 'classic_description', icon: logo, sketchArtType: 'DEFAULT' },
	{
		titleId: 'pointillism',
		descriptionId: 'pointillism_colorful_description',
		icon: pointillismIcon,
		sketchArtType: 'POINTILLISM'
	}
];
