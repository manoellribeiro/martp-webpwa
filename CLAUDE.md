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
- **Mobile layout first.** The desktop layout comes later, after the mobile screens exist.
- **Strings**: use `strings.<android_key>` from `src/lib/strings.ts`. All Android strings are available in en, de, es, fr and pt-BR through the generated files in `src/lib/translations/android/` — never edit those; change the text in the Android project and run `pnpm strings:sync` (reads `../martp/map-arts` by default, or pass the path). Strings that only exist on the web go in `src/lib/translations/web.ts`, in all five languages (TypeScript fails if one is missing). The language follows the browser (`navigator.languages`), falling back to English; there is no switcher and no language in the URL.
- **Colors and text styles**: `src/app.css` mirrors `res/values/colors.xml` as CSS variables (`--blue`, `--dark-d4`, ...) and `themes.xml` text styles as classes. Use the variables, not raw hex values. Treat `dp`/`sp` as `px`.
- **Font**: Nunito, copied from `res/font` into `src/lib/assets/fonts` (only the weights in use).
- **Icons**: convert the Android vector drawables to inline SVG using `currentColor` so they can be tinted. Icons and images with fixed colors become `.svg` files in `src/lib/assets/` (same name as the drawable) and are used through `<img>`. When a multi-color drawable is tinted as a whole (Compose `Icon(tint = ...)`), use the `.svg` file as a CSS `mask` over `background: currentColor`, as the art style cards do.
- **Shared components**: `core/components` on Android maps to `src/lib/components/` here, with the same names (`MartpTextInput.svelte`). Port a component, or a missing feature of one, only when a screen needs it.
- **Ported so far**: main scene (bottom navigation bar), user info (`/profile`), Martp project info (`/about`), location access details (`/location-access-details`), art style settings (`/edit`) and create new map art (`/create-new-map-art`). User info is saved only to `localStorage` for now; sending it to the backend comes with the API client.
- **Art settings** (zoom, art style, color palette) live in `localStorage` under the app's DataStore keys (`src/lib/data/artSettings.ts`) and are saved on every change, not after the app's 1.5s debounce, so a new art never reads stale settings.
- **Sketches**: only the three art styles the app offers are ported (`DEFAULT`/Classic, `POINTILLISM`, `COLORFUL_MAP`) in `src/lib/sketches/`; WATER_FLOW and PARTICLE_SYSTEM (sensors) are work in progress in the app and skipped. The canvas is drawn at `pixelDensity(1)` in device pixels and scaled down by CSS, so the 30px frame and the Mapbox image size match Android's pixel values.
- **Mapbox**: static images and reverse geocoding (the web stand-in for Android's `Geocoder`) call Mapbox directly. The token is read at build time like in the Android `build.gradle`: the `MAPBOX_API_KEY` environment variable (the repository secret in GitHub Actions) or else the untracked `.env` file (see `.env.example`), injected as the `__MAPBOX_API_KEY__` constant. It ships in the bundle, so it must be a URL-restricted public token.
- **Saving an art** downloads it as a PNG until the API client exists (`TODO` in `CreateNewMapArtViewModel.saveArt`).
- **Routes**: fragments hosted by `MainActivity` live in the `src/routes/(main)/` group, whose layout renders the bottom navigation bar. Separate activities (`create-new-map-art`, `location-access-details`) are top-level routes without the bar.
- `#lib` imports of `.ts` files need the extension (`#lib/strings.ts`, `#lib/features/main/main.viewmodel.svelte.ts`); the alias comes from `package.json` `imports`, not `$lib`.

## Stack

### Frontend (this repo, `web/` or repo root: [FILL IN])
- **SvelteKit + Svelte 5 (runes)** with **TypeScript**
- **SPA mode**: `@sveltejs/adapter-static` with `fallback: 'index.html'`, and `export const ssr = false;` in `src/routes/+layout.ts`
- **p5.js in instance mode** (`new p5(sketch, containerEl)`), always call `.remove()` on cleanup
- **PWA** via `@vite-pwa/sveltekit` (precache app shell and p5, cache-first thumbnails, network-first API calls, "update available" prompt)


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
npm install
npm run dev       # dev server
npm run build     # static build
npm run check     # svelte-check / type check
npm run test      # [FILL IN once tests exist]
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