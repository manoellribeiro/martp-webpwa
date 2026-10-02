import de from './translations/android/de.ts';
import en from './translations/android/en.ts';
import es from './translations/android/es.ts';
import fr from './translations/android/fr.ts';
import ptBR from './translations/android/pt-BR.ts';
import web from './translations/web.ts';

// Texts come from two places: the Android app's strings.xml (generated files, see
// scripts/sync-android-strings.mjs) and the hand-written web-only strings.
// English defines the keys and fills in anything a language leaves untranslated.

type Widen<T> = { [Key in keyof T]: string };
export type Strings = Widen<typeof en> & Widen<typeof web.en>;

const translations = {
	en: { ...en, ...web.en },
	de: { ...de, ...web.de },
	es: { ...es, ...web.es },
	fr: { ...fr, ...web.fr },
	'pt-BR': { ...ptBR, ...web['pt-BR'] }
} satisfies Record<string, Partial<Strings>>;

export type Locale = keyof typeof translations;

const DEFAULT_LOCALE: Locale = 'en';

/** Like Android, the language follows the device: the first browser language we support wins. */
function detectLocale(): Locale {
	const supported = Object.keys(translations) as Locale[];
	for (const preferred of navigator.languages ?? [navigator.language]) {
		const language = preferred.toLowerCase().split('-')[0];
		const match =
			supported.find((locale) => locale.toLowerCase() === preferred.toLowerCase()) ??
			supported.find((locale) => locale.toLowerCase().split('-')[0] === language);
		if (match) return match;
	}
	return DEFAULT_LOCALE;
}

export const locale = detectLocale();
export const strings: Strings = { ...translations[DEFAULT_LOCALE], ...translations[locale] };

document.documentElement.lang = locale;
