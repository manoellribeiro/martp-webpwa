// Web counterpart of the onboarding flag in MartpRepository's DataStore, in localStorage
// under the app's key.
const HAS_SEEN_ONBOARDING_KEY = 'HAS_SEEN_ONBOARDING_KEY';

export function hasSeenOnboarding(): boolean {
	try {
		return localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === 'true';
	} catch (e) {
		console.error('onboarding.hasSeenOnboarding', e);
		// An unreadable store would otherwise show the onboarding on every visit
		return true;
	}
}

/** Throws when the browser blocks storage; the caller lets the user go on anyway. */
export function setOnboardingSeen() {
	localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
}
