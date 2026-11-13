import { getArtStylePreference, getMapZoomPreference } from '#lib/data/artSettings.ts';
import { getArtCreationLimit, recordArtCreation } from '#lib/data/artCreationLimit.ts';
import { getSelectedColorPalette } from '#lib/data/colorPalettes.ts';
import { getCurrentLocation } from '#lib/data/location.ts';
import { fetchStaticMapImage } from '#lib/data/mapbox.ts';
import { saveMapArtEntity, type MapArtEntity } from '#lib/data/mapArts.ts';
import {
	reverseGeocode,
	saveMapArt,
	type RemoteMapLayersColors,
	type RemoteSaveMapArtRequest
} from '#lib/data/martpApi.ts';
import {
	fetchCurrentUserInfo,
	setUserEmail,
	setUserName,
	type UserInfo
} from '#lib/data/userInfo.ts';
import type { ColorPalette } from '#lib/domain/colorPalettes.ts';
import {
	Failure,
	HourlyArtLimitReachedFailure,
	TooManyArtsInARowFailure,
	UnknownErrorFailure
} from '#lib/domain/failures.ts';
import { sketchArtTypes, type SketchArtType } from '#lib/domain/sketchArtType.ts';
import type { ColorLayerHolder } from '#lib/sketches/colorfulMapSketch.ts';
import { framesSize } from '#lib/sketches/martpSketch.ts';
import { locale, strings, type Strings } from '#lib/strings.ts';

// Port of CreateNewMapArtViewModel + CreateNewMapArtUiState.
export type CreateNewMapArtUiState =
	| { type: 'idle' }
	| { type: 'loading'; loadingMessageId: keyof Strings }
	| { type: 'error'; failure: Failure }
	| {
			type: 'imageDownloaded';
			staticMapImageUrl: string;
			title: string;
			sketchArtType: SketchArtType;
			latitude: number;
			longitude: number;
			colorPalette: ColorPalette | null;
			user: UserInfo;
	  };

export class CreateNewMapArtViewModel {
	state = $state<CreateNewMapArtUiState>({ type: 'idle' });
	/**
	 * The app's ActionButtonLoading state. It is a flag here because the view is drawn from
	 * the state, and the art must stay on screen while the button loads.
	 */
	isActionButtonLoading = $state(false);

	private generateMapArtJob: AbortController | null = null;

	private emitNewState(newState: CreateNewMapArtUiState) {
		if (this.state.type === 'imageDownloaded') URL.revokeObjectURL(this.state.staticMapImageUrl);
		this.state = newState;
	}

	async startToGenerateMapArt(canvasToDrawArtWidth: number, canvasToDrawArtHeight: number) {
		this.generateMapArtJob?.abort();
		const job = new AbortController();
		this.generateMapArtJob = job;
		const { signal } = job;
		try {
			// Web-only: checked before asking for the location, so a limited user doesn't wait.
			const limit = getArtCreationLimit();
			if (limit?.type === 'burst') throw new TooManyArtsInARowFailure();
			if (limit?.type === 'hourly') {
				throw new HourlyArtLimitReachedFailure(limit.minutesUntilNextArt);
			}
			this.emitNewState({ type: 'loading', loadingMessageId: 'accessing_your_location' });
			const sketchArtType = getArtStylePreference();
			const user = fetchCurrentUserInfo();
			const location = await getCurrentLocation();
			if (signal.aborted) return;
			this.emitNewState({ type: 'loading', loadingMessageId: 'downloading_map_image' });
			recordArtCreation();
			const [title, colorPalette, staticMapImageUrl] = await Promise.all([
				this.getAddressTitle(location.latitude, location.longitude, signal),
				sketchArtType === 'COLORFUL_MAP' ? getSelectedColorPalette() : null,
				fetchStaticMapImage({
					styleId: sketchArtTypes[sketchArtType].mapboxMapStyle,
					latitude: location.latitude,
					longitude: location.longitude,
					// The canvas is at most MAX_CANVAS_SIZE, so the map fits within the Mapbox limit.
					mapWidth: canvasToDrawArtWidth - framesSize,
					mapHeight: canvasToDrawArtHeight - framesSize,
					mapZoom: getMapZoomPreference(),
					signal
				})
			]);
			if (signal.aborted) {
				URL.revokeObjectURL(staticMapImageUrl);
				return;
			}
			this.emitNewState({
				type: 'imageDownloaded',
				staticMapImageUrl,
				title,
				sketchArtType,
				colorPalette,
				latitude: location.latitude,
				longitude: location.longitude,
				user
			});
		} catch (e) {
			if (signal.aborted) return;
			const failure = e instanceof Failure ? e : new UnknownErrorFailure(String(e));
			this.emitNewState({ type: 'error', failure });
		}
	}

	/**
	 * The app asks Android's Geocoder first and the Martp API only when it finds nothing; the
	 * web has no geocoder, so the API is the only source. When it fails, or finds no street,
	 * city or country, the art is still created, titled "Unknown Location".
	 */
	private async getAddressTitle(
		latitude: number,
		longitude: number,
		signal: AbortSignal
	): Promise<string> {
		try {
			const address = await reverseGeocode(latitude, longitude, locale.split('-')[0], signal);
			return (
				this.buildTitleWithAddress(address.street, address.city, address.country) ||
				strings.unknown_location
			);
		} catch (e) {
			if (signal.aborted) throw e;
			console.error('CreateNewMapArtViewModel.getAddressTitle', e);
			return strings.unknown_location;
		}
	}

	private buildTitleWithAddress(
		street: string | null,
		city: string | null,
		country: string | null
	): string {
		return [street, city, country].filter((part): part is string => !!part?.trim()).join(', ');
	}

	/**
	 * Port of saveArt. The web keeps no arts on the device: the art is only uploaded, in the
	 * background like the app's uploadMapArt, so the success screen opens right away.
	 * Resolves to the art's PNG when it worked, which stands in for the
	 * ArtCreatedSuccessfully(imagePathLocation) event, or null.
	 */
	async saveArt(
		mapLayersColors: ColorLayerHolder | null,
		updateUserInfo: UserInfo,
		getArtImage: () => Promise<Blob>
	): Promise<Blob | null> {
		if (this.state.type !== 'imageDownloaded') return null;
		const { title, latitude, longitude, sketchArtType, colorPalette } = this.state;
		this.isActionButtonLoading = true;
		try {
			setUserName(updateUserInfo.username ?? '', updateUserInfo.id);
			setUserEmail(updateUserInfo.email ?? '', updateUserInfo.id);
			const colorsLayers: RemoteMapLayersColors | null = mapLayersColors && {
				roadsColor: mapLayersColors.roadsColor ?? null,
				buildingStrokeColor: mapLayersColors.buildingStrokeColor ?? null,
				buildingColor: mapLayersColors.buildingColor ?? null,
				roadsPathColor: mapLayersColors.roadsPathColor ?? null,
				waterColor: mapLayersColors.waterColor ?? null,
				landOthersColor: mapLayersColors.landOthersColor ?? null
			};
			const newMartp: MapArtEntity = {
				id: crypto.randomUUID(),
				title,
				description: null,
				latitude,
				longitude,
				dateInMillis: Date.now(),
				image: await getArtImage(),
				sketchArtType,
				colorPalette: colorPalette?.name ?? null,
				colorsLayers
			};
			await saveMapArtEntity(newMartp);
			this.uploadMapArt(newMartp, updateUserInfo);
			return newMartp.image;
		} catch (e) {
			const failure = e instanceof Failure ? e : new UnknownErrorFailure(String(e));
			this.emitNewState({ type: 'error', failure });
			return null;
		} finally {
			this.isActionButtonLoading = false;
		}
	}

	/** MartpRepository.uploadMapArt: fire and forget, failures are only logged. */
	private uploadMapArt(mapArt: MapArtEntity, userInfo: UserInfo) {
		const art: RemoteSaveMapArtRequest = {
			id: mapArt.id,
			title: mapArt.title,
			latitude: mapArt.latitude,
			longitude: mapArt.longitude,
			dateInMillis: mapArt.dateInMillis,
			sketchArtType: mapArt.sketchArtType,
			colorPalette: mapArt.colorPalette,
			colorsLayers: {
				roadsColor: mapArt.colorsLayers?.roadsColor ?? null,
				buildingStrokeColor: mapArt.colorsLayers?.buildingStrokeColor ?? null,
				buildingColor: mapArt.colorsLayers?.buildingColor ?? null,
				roadsPathColor: mapArt.colorsLayers?.roadsPathColor ?? null,
				waterColor: mapArt.colorsLayers?.waterColor ?? null,
				landOthersColor: mapArt.colorsLayers?.landOthersColor ?? null
			},
			email: userInfo.email,
			username: userInfo.username
		};
		saveMapArt(art, mapArt.image).catch((e) =>
			console.error('CreateNewMapArtViewModel.uploadMapArt', e)
		);
	}

	/** Counterpart of onCleared(). */
	clear() {
		this.generateMapArtJob?.abort();
		this.emitNewState({ type: 'idle' });
	}
}
