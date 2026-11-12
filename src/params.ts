import { defineParams } from '@sveltejs/kit/params';
import { roomFromSlug } from '#lib/domain/continent.ts';

export const params = defineParams({
	/** `/exhibition/rooms/south-america`: only the continents that are exhibition rooms. */
	room: (param) => (roomFromSlug(param) ? param : undefined)
});
