import {
	getArtStylePreference,
	getColorPalettePreference,
	getMapZoomPreference
} from '#lib/data/artSettings.ts';
import { getCurrentLocation } from '#lib/data/location.ts';
import { fetchStaticMapImage, getAddress, type Address } from '#lib/data/mapbox.ts';
import { Failure, UnknownErrorFailure } from '#lib/domain/failures.ts';
import { sketchArtTypes, type SketchArtType } from '#lib/domain/sketchArtType.ts';
import { framesSize } from '#lib/sketches/martpSketch.ts';
import { locale, type Strings } from '#lib/strings.ts';

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
			colorPalette: string | null;
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
			this.emitNewState({ type: 'loading', loadingMessageId: 'accessing_your_location' });
			const sketchArtType = getArtStylePreference();
			const location = await getCurrentLocation();
			if (signal.aborted) return;
			this.emitNewState({ type: 'loading', loadingMessageId: 'downloading_map_image' });
			const [address, staticMapImageUrl] = await Promise.all([
				getAddress(location.latitude, location.longitude, locale.split('-')[0], signal),
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
				title: this.buildTitleWithAddress(address),
				sketchArtType,
				colorPalette: sketchArtType === 'COLORFUL_MAP' ? getColorPalettePreference() : null,
				latitude: location.latitude,
				longitude: location.longitude
			});
		} catch (e) {
			if (signal.aborted) return;
			const failure = e instanceof Failure ? e : new UnknownErrorFailure(String(e));
			this.emitNewState({ type: 'error', failure });
		}
	}

	private buildTitleWithAddress(address: Address | null): string {
		return [address?.thoroughfare, address?.locality, address?.countryName]
			.filter((part): part is string => !!part?.trim())
			.join(', ');
	}

	/**
	 * Port of saveArtToLocalDatabase. The web keeps no arts on the device, so for now the
	 * art is downloaded as a PNG through `saveArtImage`. Resolves to whether it worked,
	 * which stands in for the ArtCreatedSuccessfully event.
	 * TODO: send the art to the backend once the API client exists.
	 */
	async saveArt(saveArtImage: (fileName: string) => Promise<void>): Promise<boolean> {
		this.isActionButtonLoading = true;
		try {
			await saveArtImage(`martp-${crypto.randomUUID()}`);
			return true;
		} catch (e) {
			this.emitNewState({ type: 'error', failure: new UnknownErrorFailure(String(e)) });
			return false;
		} finally {
			this.isActionButtonLoading = false;
		}
	}

	/** Counterpart of onCleared(). */
	clear() {
		this.generateMapArtJob?.abort();
		this.emitNewState({ type: 'idle' });
	}
}
