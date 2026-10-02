import { fetchCurrentUserInfo } from '#lib/data/userInfo.ts';

// Port of the main-scene parts of MainViewModel (MainUiState.SetUserInfoBadgeVisibility).
class MainViewModel {
	userInfoBadgeVisible = $state(false);

	handleBadgesVisibilities() {
		const user = fetchCurrentUserInfo();
		this.userInfoBadgeVisible = !user.username && !user.email;
	}

	/** The app hides the badge as soon as the profile screen is opened (tryToGetUserInfo). */
	hideUserInfoBadge() {
		this.userInfoBadgeVisible = false;
	}
}

export const mainViewModel = new MainViewModel();
