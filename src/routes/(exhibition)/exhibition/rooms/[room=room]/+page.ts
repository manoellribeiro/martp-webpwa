import { exhibitionRooms, roomSlug } from '#lib/domain/continent.ts';

// Every room is prerendered as its own shell, so GitHub Pages answers it with 200.
export function entries() {
	return exhibitionRooms.map((room) => ({ room: roomSlug(room) }));
}
