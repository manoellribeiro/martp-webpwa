# CLAUDE.md

Project context for Claude Code. Keep this file short and current. When we make a new decision, add it under "Decisions log".

## Project overview

This the web copy project of the Martp Android App (https://github.com/manoellribeiro/map-arts). The goal of this project is to be a simplified version of the app, so everyone that does not have an android phone or does not want to download the app can still generate arts easily and fast. It is thought to be mobile-first and to work as a PWA.

The Android source is checked out locally at `/Users/manoellribeiro/Documents/martp/map-arts` (read access granted in `.claude/settings.local.json`). Use it as a read-only reference when porting a screen or behaviour; screens live under `app/src/main/java/manoellribeiro/dev/martp/scenes/`. Do not edit that project from here.

### Differences from the Android app

- **No gallery and no local art storage.** The web version never stores generated arts on the device, so the gallery screen, its menu item and `MapArtEntity`/Room logic are not ported. Arts only go to the backend.
- The app's start destination is the art style settings screen; here `/` redirects to `/edit`, the same screen.
- The create new map art screen shows latitude and longitude with 5 decimals; the app shows every decimal.
- User info (`id`, `username`, `email`) lives in `localStorage` instead of Room (`src/lib/data/userInfo.ts`).
- Location permission uses the Permissions + Geolocation APIs (`src/lib/data/location.ts`). A `denied` state is treated like Android's "should show rationale" and opens the location access details screen. Browsers do not prompt again once the user has blocked location, so that screen tells the user to unblock location in the browser's site settings (`location_blocked_in_browser_error`), both on open and after a refused request. A prompt that was only dismissed shows `location_permission_not_granted_failure_error`.

### Porting conventions

- Follow the Android logic, names and layout values as closely as the web allows. Port one screen at a time; unported screens are placeholders with a `TODO: port <AndroidClass>` comment.
- **Mobile layout first.** On big screens every screen adapts to the window until it reaches the art's maximum width (`MAX_CANVAS_SIZE` device pixels + 32px of margins, set as `--max-app-width` in `src/routes/+layout.svelte`); past that the whole app, bottom navigation bar included, keeps that width and is centered. New fixed-position elements must be capped the same way.
- **Strings**: use `strings.<android_key>` from `src/lib/strings.ts`. All Android strings are available in en, de, es, fr and pt-BR through the generated files in `src/lib/translations/android/` — never edit those; change the text in the Android project and run `pnpm strings:sync` (reads `../martp/map-arts` by default, or pass the path). Strings that only exist on the web go in `src/lib/translations/web.ts`, in all five languages (TypeScript fails if one is missing). The language follows the browser (`navigator.languages`), falling back to English; there is no switcher and no language in the URL.
- **Colors and text styles**: `src/app.css` mirrors `res/values/colors.xml` as CSS variables (`--blue`, `--dark-d4`, ...) and `themes.xml` text styles as classes. Use the variables, not raw hex values. Treat `dp`/`sp` as `px`.
- **Font**: Nunito, copied from `res/font` into `src/lib/assets/fonts` (only the weights in use).
- **Icons**: convert the Android vector drawables to inline SVG using `currentColor` so they can be tinted. Icons and images with fixed colors become `.svg` files in `src/lib/assets/` (same name as the drawable) and are used through `<img>`. When a multi-color drawable is tinted as a whole (Compose `Icon(tint = ...)`), use the `.svg` file as a CSS `mask` over `background: currentColor`, as the art style cards do.
- **Shared components**: `core/components` on Android maps to `src/lib/components/` here, with the same names (`MartpTextInput.svelte`). Port a component, or a missing feature of one, only when a screen needs it.
- **Ported so far**: main scene (bottom navigation bar), user info (`/profile`, with the digital exhibition card), Martp project info (`/about`), location access details (`/location-access-details`), art style settings (`/edit`), create new map art (`/create-new-map-art`), success (`/success`) and the set user info bottom sheet (`SetUserInfoBottomSheet.svelte`, a modal `<dialog>`). Up to the Android branch `feat/implement-martp-own-api`. User info lives in `localStorage` and reaches the backend only inside each uploaded art (`username`, `email`), as on Android.
- **Martp API** (`src/lib/data/martpApi.ts`, port of `MartpApiService`): color palettes, reverse geocoding and the multipart art upload, at `PUBLIC_MARTP_API_URL` (`https://api.martp.app` (Cloud Run) in `.env.production`; default `http://localhost:8080`, like Android). Every request sends a Firebase App Check token in `X-Firebase-AppCheck` (`src/lib/data/appCheck.ts`): reCAPTCHA Enterprise in production and the debug provider in `pnpm dev`, configured through the `PUBLIC_FIREBASE_*` and `PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` variables (`.env.production`, `.env`). The dev debug token is fixed through `PUBLIC_APPCHECK_DEBUG_TOKEN` in the untracked `.env.development` (only `pnpm dev` reads it; never put it in `.env` or `.env.production`, which builds read). Firebase is imported lazily on the first request. The backend must allow CORS from the site's origin.
- **Color palettes** come from the API and are cached in `localStorage` (`color_palettes`, the web counterpart of `ColorPalettesDao`) by `src/lib/data/colorPalettes.ts`: a cached list is returned and refreshed in the background, and when there is nothing the single `FALLBACK_COLOR_PALETTES` "Martp" palette is used.
- **Reverse geocoding uses only the Martp API.** On Android it is the fallback for the device `Geocoder`; the web has no geocoder, so the API is the source of the title. If it fails or finds no street, city or country, the art is still created with `unknown_location` as its title.
- **Art settings** (zoom, art style, color palette) live in `localStorage` under the app's DataStore keys (`src/lib/data/artSettings.ts`) and are saved on every change, not after the app's 1.5s debounce, so a new art never reads stale settings.
- **Sketches**: only the three art styles the app offers are ported (`DEFAULT`/Classic, `POINTILLISM`, `COLORFUL_MAP`) in `src/lib/sketches/`; WATER_FLOW and PARTICLE_SYSTEM (sensors) are work in progress in the app and skipped. The canvas is drawn at `pixelDensity(1)` in device pixels and scaled down by CSS, so the 30px frame and the Mapbox image size match Android's pixel values. Each canvas side is capped at `MAX_CANVAS_SIZE` (`src/lib/sketches/martpSketch.ts`: Mapbox's 1280px limit + the 120px of frames), so the map always fills the frame (no `@2x` images, which would change the look). The app's art is 200dp tall at any width; here the height is `max(200px, width / (16/9))`, so phones look like the app and big screens get bigger, landscape arts. `filter()` must run on the CPU (`p.filter(p.ERODE, undefined, false)`): p5 2.x defaults to a WebGL shader, which gives different (and on some GPUs, like the Android emulator's, broken) results instead of Processing's.
- **Mapbox**: static images call Mapbox directly. The token is read at build time like in the Android `build.gradle`: the `MAPBOX_API_KEY` environment variable (the repository secret in GitHub Actions) or else the untracked `.env` file (see `.env.example`), injected as the `__MAPBOX_API_KEY__` constant. It ships in the bundle, so it must be a URL-restricted public token, separate from the Android one (native requests have no referrer). Restrict it to **origins** (`https://martp.app`, `https://www.martp.app`), not paths: browsers send only the origin as `Referer` to Mapbox, so a restriction with a path answers 403.
- **Art creation limit** (web-only, `src/lib/data/artCreationLimit.ts`): per browser, at most 10 arts a minute and 20 an hour, kept in `localStorage`, so a looping script can't use up the Mapbox free allowance (20/h for a month is 29% of the 50,000 Static Images). Shown through `TooManyArtsInARowFailure` / `HourlyArtLimitReachedFailure` on the error screen. It only stops automation of the app itself; moving the Mapbox calls behind the backend (with per-IP limits) is the real protection, planned for later.
- **Saving an art** uploads it to the Martp API in the background (like `MartpRepository.uploadMapArt`, failures are only logged) and replaces the screen with `/success`. Nothing is kept on the device: the PNG reaches the success screen in memory (`src/lib/features/success/savedArt.ts`, the counterpart of the image path extra), so a reload there goes to `/edit`. Its header says the web-only `success_art_sent` instead of `success_saved_to_gallery`, since there is no gallery. Share uses the Web Share API with the file, or downloads the PNG where files can't be shared.
- **Routes**: fragments hosted by `MainActivity` live in the `src/routes/(main)/` group, whose layout renders the bottom navigation bar. Separate activities (`create-new-map-art`, `location-access-details`, `success`) are top-level routes without the bar.
- `#lib` imports of `.ts` files need the extension (`#lib/strings.ts`, `#lib/features/main/main.viewmodel.svelte.ts`); the alias comes from `package.json` `imports`, not `$lib`.
- **Digital exhibition** (web-only, not a port: the app only links to it). Designs are in `/Users/manoellribeiro/Documents/martp/digital-exhibition.pen` and its persona in `/Users/manoellribeiro/Documents/martp/PERSONA-digital exhibition.md` (beginners on a phone browser, often a weak connection, must see an art in under 10 seconds). Routes live in the `src/routes/(exhibition)/` group: `/exhibition` (home with the globe), `/exhibition/rooms` (one door per continent) and `/exhibition/rooms/[room=room]` (the room's wall; every room is prerendered through `entries()`, matcher in `src/params.ts`). Unlike the app's screens it uses the whole window, desktop and mobile. The root layout skips the app width cap, the update prompt and the service worker registration for this group. The rooms are the API's continents (`src/lib/domain/continent.ts`, `UNKNOWN` excluded), and only rooms with approved arts are shown. Data comes from the `map-arts/exhibition*` endpoints in `martpApi.ts`, with App Check like every other call. Headlines use Unbounded and labels IBM Plex Mono (Latin WOFF2 subsets, `src/lib/features/exhibition/exhibition.css`); body text stays Nunito.
- **The service worker is registered only by the app's pages** (`src/lib/data/serviceWorker.ts`, called from the root layout; SvelteKit's automatic registration is off in `vite.config.ts`), so an exhibition visitor never downloads the whole app. Modules the root layout imports must not pull in p5: the canvas sizes it needs are in `src/lib/sketches/canvasSize.ts`, not `martpSketch.ts`.

## Stack

### Frontend (this repo, `web/` or repo root: [FILL IN])
- **SvelteKit + Svelte 5 (runes)** with **TypeScript**
- **SPA mode**: `@sveltejs/adapter-static` with `fallback: '404.html'`, and `ssr = false` + `prerender = true` in `src/routes/+layout.ts`, so every route is written as an HTML shell that GitHub Pages answers with 200.
- **p5.js in instance mode** (`new p5(sketch, containerEl)`), always call `.remove()` on cleanup
- **PWA** with SvelteKit's own service worker (`src/service-worker/`, its own tsconfig; `@vite-pwa/sveltekit` does not support Kit 3): precaches the whole build (app, p5, fonts, icons, page shells), serves it cache-first, leaves Mapbox to the network, and waits for `UpdateAvailablePrompt.svelte` before switching versions. `static/manifest.webmanifest` uses relative URLs so it works under any base path. Icons are generated from `static/favicon.svg` with `pnpm pwa:assets` (`pwa-assets.config.ts`).
- **Kit 3 APIs**: env variables are declared in `src/env.ts` (`defineEnvVars`) and imported from `$app/env/public`; `$app/env` replaces `$app/environment`; the worker uses `$app/manifest` and `$app/service-worker`.
- **Deploy**: GitHub Pages via `.github/workflows/deploy.yml` (check, build with the `MAPBOX_API_KEY` secret, publish `build/`). The site is served at the custom domain `https://martp.app` (DNS on Cloudflare, records "DNS only" so GitHub issues the HTTPS certificate); the old `manoellribeiro.github.io/martp-webpwa` URL redirects to it. The site URL and base path live in the committed `.env.production` (`PUBLIC_SITE_URL`, `BASE_PATH`, empty at the root of the domain). Each deploy deletes the previous build's scripts while browsers may keep the HTML for 10 minutes, so an inline script in `src/app.html` reloads the page once (guarded by `sessionStorage`) when a script fails to load. Internal links and `goto` must use `resolve()` from `$app/paths` with route IDs (`resolve('/(main)/edit')`).
- **SEO**: static title, description and Open Graph/Twitter tags in `src/app.html` (crawlers don't run JS, so they are the same on every app page, in English; `static/og-image.png` is the preview). The digital exhibition's pages get their own preview (`static/og-exhibition.jpg`, drawn in `digital-exhibition.pen` as "Link Preview - Exhibition") from `src/hooks.server.ts`, which rewrites those tags in their HTML shells while they are prerendered. `src/app.html` also has JSON-LD `WebApplication` structured data with the keywords and the Instagram profile (`@martp.app`). The root layout adds a canonical link; `robots.txt` and `sitemap.xml` are prerendered endpoints built from `PUBLIC_SITE_URL` (the sitemap lists the exhibition and every room).


### Backend ([FILL IN: separate repo or `server/` folder])
- **Spring Boot** ([FILL IN: Java or Kotlin])
- **PostgreSQL** with Spring Data JPA
- REST API documented with **springdoc-openapi**
- Spring Security for auth ([FILL IN: JWT or sessions])
- Tests: JUnit + Testcontainers


Keep it simple and use standard Svelte/SvelteKit conventions.

- **All screens except the generator**: plain Svelte. Components hold local `$state`/`$derived`, and pages fetch data with `load` functions or direct calls to the API client in `src/lib/data/`. No extra layers.
- **Generator screen (the exception)**: it has a lot of logic (params, seed, randomizing, saving, export, share URL), so the logic lives in a **state class** (`GeneratorState` in `generator.svelte.ts`), separate from the view. The state class uses `$state`, `$derived` and methods, and knows nothing about the UI. The component only reads its state and calls its methods. This plays the role of a ViewModel.
- **API access**: a small API client in `src/lib/data/` wrapping `fetch` calls to Spring Boot.
- Use runes, not the old `writable`/`derived` stores.

### Folder layout

```
src/lib/
  data/        # repositories, API client, DTO types
  domain/      # sketch meta, param models, pure logic
  features/
    gallery/   # gallery.viewmodel.svelte.ts, GalleryGrid.svelte
    generator/ # generator.viewmodel.svelte.ts, ParamPanel.svelte
  sketches/    # p5 sketch modules
src/routes/    # thin pages that wire a ViewModel or load data to a view
```

## Backend responsibilities

- Save the sketches the user created.
- Save the artist data when it is provided.

## Commands

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # static build into build/ (uses .env.production)
pnpm preview      # serve the build (at BASE_PATH, empty with the custom domain)
pnpm check        # svelte-check + service worker type check
pnpm strings:sync # regenerate the Android strings
pnpm pwa:assets   # regenerate the icons from static/favicon.svg
pnpm test         # [FILL IN once tests exist]
```

Backend: [FILL IN, e.g. `./gradlew bootRun`, `./gradlew test`]

## Code style

- TypeScript strict mode. Avoid `any`.
- Prefer small, focused components and modules.
- Name ViewModel files `*.viewmodel.svelte.ts` (runes only work in `.svelte.ts` files outside components).
- Handle errors explicitly in repositories and surface them through ViewModel state.
- Keep CORS in mind: ideally serve the static build and API from the same origin or behind one reverse proxy.

## Working agreements for Claude

- Work in small steps. Do not generate the whole app at once.
- Ask before adding new dependencies or changing the architecture above.
- When we make a decision, append it to the log below.

## Decisions log

- Chose **SvelteKit (SPA mode)** over React/Next.js and Kotlin Multiplatform for the frontend. React and plain TS offered no CV differentiation, and KMP/Wasm interop with p5 is awkward.
- Chose **p5.js** as the sketch runtime. Processing.js is unmaintained and the Java runtime cannot run in browsers.
- Backend is **Spring Boot** to strengthen the JVM side of the CV.
- Built as a **PWA**. A Trusted Web Activity (Bubblewrap) package for the Play Store is a possible later bonus.
- **p5.js 2.x** (ships its own types; `@types/p5` is for 1.x and must not be added). `setup` can be `async` and `await p.loadImage(...)`.
- **Translations use plain TypeScript files**, no i18n library (Paraglide and svelte-i18n were considered). Android strings are generated by a script so both projects stay in sync; the language follows the browser, like Android follows the device.
- **Hosting on GitHub Pages**, first at `https://manoellribeiro.github.io/martp-webpwa`, now at the custom domain `https://martp.app`; the backend will need its own host and CORS.
- **SvelteKit's built-in service worker instead of `@vite-pwa/sveltekit`**, which only supports Kit 1–2. `@vite-pwa/assets-generator` is kept for the icons only.
- **Art resolution**: arts are drawn and saved at density 1 (at most 1400px wide), the same on every device. A fixed higher-resolution export (e.g. 2x canvas with `@2x` Mapbox images) is deferred until the digital exhibition exists and shows whether quality is a problem; stretching the canvas to the display density adds no detail.
- **Reverse geocoding moved from Mapbox to the Martp API** (the backend's own geocoding), so the title can be stored with the art. Mapbox's Permanent Geocoding API is paid from the first request and its Temporary results may not be stored. Never use services that are paid at low volumes.
- **Firebase App Check (reCAPTCHA Enterprise) protects the Martp API on the web**, like Play Integrity on Android; `firebase` is the dependency for it.
- **Arts are only uploaded**: the web no longer downloads a PNG when saving.
- **Mapbox attribution** is given in the GitHub README, which the app links to; the arts are requested without the Mapbox logo.
- **The digital exhibition lives in this repo** at `/exhibition` (later `martp.app/exhibition`), sharing the API client, colors and strings with the app, but kept out of the PWA: it never registers the service worker. The installed app's manifest scope still covers it, which is fine.
- **The exhibition keeps App Check** on its API calls for now; if it makes the first art too slow, the exhibition `GET` routes may become public with rate limiting.
- **One link preview for the whole exhibition**, no per-art previews (the site has no server to build them).
- **COBE** draws the exhibition's 3D dotted globe (small WebGL library, pins and cards as HTML on top).
- **Exhibition fonts**: Unbounded and IBM Plex Mono as self-hosted Latin WOFF2 subsets (about 52 KB together), no font package; body text keeps Nunito.