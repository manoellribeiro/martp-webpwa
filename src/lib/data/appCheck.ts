import type { AppCheck } from 'firebase/app-check';
import { dev } from '$app/env';
import {
	PUBLIC_APPCHECK_DEBUG_TOKEN,
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
} from '$app/env/public';

// Web counterpart of MartpApplication's App Check setup and of AppCheckInterceptor.
// Android uses Play Integrity (DebugAppCheckProviderFactory in debug builds); the web uses
// reCAPTCHA Enterprise, and in development the debug provider. The debug token is
// PUBLIC_APPCHECK_DEBUG_TOKEN (from .env.development) when set, so one token registered in
// the Firebase console works in every browser; otherwise each browser generates its own,
// printed in the console the first time, which has to be registered too.
// Firebase is imported on the first request, so it stays out of the screens' bundles.

export const APP_CHECK_HEADER = 'X-Firebase-AppCheck';

declare global {
	// Read by the App Check SDK to switch to the debug provider.
	var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

let appCheck: Promise<AppCheck> | null = null;

function getAppCheck(): Promise<AppCheck> {
	appCheck ??= initAppCheck().catch((e) => {
		appCheck = null;
		throw e;
	});
	return appCheck;
}

async function initAppCheck(): Promise<AppCheck> {
	if (
		!PUBLIC_FIREBASE_API_KEY ||
		!PUBLIC_FIREBASE_PROJECT_ID ||
		!PUBLIC_FIREBASE_APP_ID ||
		!PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
	) {
		throw new Error('App Check is not configured: set the PUBLIC_FIREBASE_* variables.');
	}
	const [{ initializeApp }, { initializeAppCheck, ReCaptchaEnterpriseProvider }] =
		await Promise.all([import('firebase/app'), import('firebase/app-check')]);
	if (dev) globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN ??= PUBLIC_APPCHECK_DEBUG_TOKEN || true;
	const app = initializeApp({
		apiKey: PUBLIC_FIREBASE_API_KEY,
		projectId: PUBLIC_FIREBASE_PROJECT_ID,
		appId: PUBLIC_FIREBASE_APP_ID
	});
	return initializeAppCheck(app, {
		provider: new ReCaptchaEnterpriseProvider(PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY),
		isTokenAutoRefreshEnabled: true
	});
}

/** Like AppCheckInterceptor: throws when there is no token, so the request is not sent. */
export async function getAppCheckToken(): Promise<string> {
	const [instance, { getToken }] = await Promise.all([
		getAppCheck(),
		import('firebase/app-check')
	]);
	const { token } = await getToken(instance, false);
	return token;
}
