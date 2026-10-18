// Port of scenes/artStyleSettings/ColorPallete.kt + core/utils/ColorPaletteProvider.kt.
export interface ColorPalette {
	name: string;
	colors: string[];
}

export const colorPalettes: ColorPalette[] = [
	{ name: 'Martp', colors: ['#100C2D', '#120D31', '#4E3C41', '#896B51', '#FFC971', '#FFCE7E'] },
	{ name: 'Benedictus', colors: ['#F27EA9', '#366CD9', '#9475C1', '#5EADF2', '#636E73', '#F2E6D8'] },
	{ name: 'Cross', colors: ['#D962AF', '#58A6A6', '#8AA66F', '#F29F05', '#F26D6D', '#F28639'] },
	{ name: 'Demuth', colors: ['#222940', '#D98E04', '#F2A950', '#BF3E21', '#F2F2F2', '#D97439'] },
	{ name: 'Hiroshige', colors: ['#1B618C', '#55CCD9', '#F2BC57', '#F2DAAC', '#F24949', '#A4C498'] },
	{ name: 'Hokusai', colors: ['#074A59', '#F2C166', '#F28241', '#F26B5E', '#F2F2F2', '#7D8660'] },
	{ name: 'Hokusai Blue', colors: ['#023059', '#459DBF', '#87BF60', '#D9D16A', '#F2F2F2', '#66AE90'] },
	{ name: 'Java', colors: ['#632973', '#02734A', '#F25C05', '#F29188', '#F2E0DF', '#7A6828'] },
	{ name: 'Kandinsky', colors: ['#8D95A6', '#0A7360', '#F28705', '#D98825', '#F2F2F2', '#E6BD8C'] },
	{ name: 'Monet', colors: ['#4146A6', '#063573', '#5EC8F2', '#8C4E03', '#D98A29', '#758B7B'] },
	{ name: 'Nizami', colors: ['#034AA6', '#72B6F2', '#73BFB1', '#F2A30F', '#F26F63', '#F28939'] },
	{ name: 'Renoir', colors: ['#303E8C', '#F2AE2E', '#F28705', '#D91414', '#F2F2F2', '#91765D'] },
	{ name: 'VanGogh', colors: ['#424D8C', '#84A9BF', '#C1D9CE', '#F2B705', '#F25C05', '#DAC86A'] },
	{ name: 'Mono', colors: ['#D9D7D8', '#3B5159', '#5D848C', '#7CA2A6', '#262321', '#3C4343'] },
	{ name: 'RiverSide', colors: ['#906FA6', '#025951', '#252625', '#D99191', '#F2F2F2', '#14403B'] }
];

export function colorPaletteByNameOrDefault(name: string | null | undefined): ColorPalette {
	return colorPalettes.find((colorPalette) => colorPalette.name === name) ?? colorPalettes[0];
}
