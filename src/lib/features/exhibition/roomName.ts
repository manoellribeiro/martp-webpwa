import type { ExhibitionRoom } from '#lib/domain/continent.ts';
import { strings } from '#lib/strings.ts';

// Apart from domain/continent.ts, which the room route matcher also loads during the build,
// where strings.ts can't run (it reads navigator.languages).
export function roomName(room: ExhibitionRoom): string {
	const names: Record<ExhibitionRoom, string> = {
		AFRICA: strings.continent_africa,
		ANTARCTICA: strings.continent_antarctica,
		ASIA: strings.continent_asia,
		CENTRAL_AMERICA: strings.continent_central_america,
		EUROPE: strings.continent_europe,
		NORTH_AMERICA: strings.continent_north_america,
		OCEANIA: strings.continent_oceania,
		SOUTH_AMERICA: strings.continent_south_america,
		OCEAN: strings.continent_ocean
	};
	return names[room];
}
