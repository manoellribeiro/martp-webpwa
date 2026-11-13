import type { RemoteMapLayersColors } from '#lib/data/martpApi.ts';
import { LocalStorageErrorFailure } from '#lib/domain/failures.ts';
import type { SketchArtType } from '#lib/domain/sketchArtType.ts';

// Port of MapArtEntity, MapArtsDao and the map art parts of MartpRepository. The app keeps
// the arts in Room and their PNGs in its files directory; here both go to IndexedDB, the
// PNG as a Blob, in the browser that created them.

/** MapArtEntity, with the image itself instead of imagePathLocation. */
export interface MapArtEntity {
	id: string;
	title: string;
	description: string | null;
	latitude: number;
	longitude: number;
	dateInMillis: number;
	image: Blob;
	sketchArtType: SketchArtType | null;
	colorPalette: string | null;
	colorsLayers: RemoteMapLayersColors | null;
}

const DATABASE_NAME = 'martp';
const DATABASE_VERSION = 1;
const MAP_ARTS_STORE = 'map_arts';

let database: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
	database ??= new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
		request.onupgradeneeded = () => {
			request.result.createObjectStore(MAP_ARTS_STORE, { keyPath: 'id' });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => reject(new Error('The database is open in another tab.'));
	}).catch((e) => {
		database = null;
		throw e;
	});
	return database;
}

async function runInStore<T>(
	mode: IDBTransactionMode,
	operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	const db = await openDatabase();
	return new Promise<T>((resolve, reject) => {
		const transaction = db.transaction(MAP_ARTS_STORE, mode);
		const request = operation(transaction.objectStore(MAP_ARTS_STORE));
		transaction.oncomplete = () => resolve(request.result);
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

/**
 * MartpRepository.observeUserMapArts. Room returns the rows in insertion order (no ORDER BY);
 * IndexedDB returns them by id, a random UUID, so they are sorted by creation date instead.
 */
export async function getUserMapArts(): Promise<MapArtEntity[]> {
	try {
		const mapArts = await runInStore<MapArtEntity[]>('readonly', (store) => store.getAll());
		return mapArts.sort((a, b) => a.dateInMillis - b.dateInMillis);
	} catch (e) {
		console.error('mapArts.getUserMapArts', e);
		throw new LocalStorageErrorFailure(String(e));
	}
}

/** MartpRepository.saveMapArtEntity. */
export async function saveMapArtEntity(mapArt: MapArtEntity): Promise<void> {
	try {
		await runInStore('readwrite', (store) => store.put(mapArt));
	} catch (e) {
		console.error('mapArts.saveMapArtEntity', e);
		throw new LocalStorageErrorFailure(String(e));
	}
	requestPersistentStorage();
}

/**
 * Web-only: asks the browser not to evict the gallery when the device is low on space (or,
 * in Safari, after weeks without a visit). Browsers decide on their own and may say no.
 */
function requestPersistentStorage() {
	navigator.storage
		?.persist?.()
		.catch((e) => console.error('mapArts.requestPersistentStorage', e));
}
