import { getColorsPalettes } from '#lib/data/colorPalettes.ts';
import { fetchCurrentUserInfo } from '#lib/data/userInfo.ts';
import type { ColorPalette } from '#lib/domain/colorPalettes.ts';

// Port of the main-scene parts of MainViewModel (MainUiState.SetUserInfoBadgeVisibility) and of
// its color palettes, which every screen with the bottom bar shares: the create button waits
// for them.
class MainViewModel {
	userInfoBadgeVisible = $state(false);
	colorPalettes = $state<ColorPalette[] | null>(null);
	/**
	 * True while the palettes come from the API, which only happens without a cached list. A
	 * sleeping API takes a while; on failure the fallback palette is used, so it always ends.
	 */
	colorPalettesLoading = $state(false);

	handleBadgesVisibilities() {
		const user = fetchCurrentUserInfo();
		this.userInfoBadgeVisible = !user.username && !user.email;
	}

	/** The app hides the badge as soon as the profile screen is opened (tryToGetUserInfo). */
	hideUserInfoBadge() {
		this.userInfoBadgeVisible = false;
	}

	/** Loads them once; later calls reuse the result. */
	async loadColorPalettes() {
		if (this.colorPalettes || this.colorPalettesLoading) return;
		this.colorPalettesLoading = true;
		try {
			this.colorPalettes = await getColorsPalettes();
		} finally {
			this.colorPalettesLoading = false;
		}
	}
}

export const mainViewModel = new MainViewModel();
