# The Swamp

A dark green IdentityMD tweet dashboard with AI-equipped Pepe artwork. Browse 12 sourced public posts from seven accounts, search by text or author, filter by topic, sort by captured engagement or date, save posts locally, and copy their original X links.

The feed is explicitly a **28 October 2026 snapshot**. “Top” means most liked within this collection. It does not claim a live or exhaustive X ranking. Bookmarks stay in the visitor's browser. No backend, account, wallet, API key, or runtime data service is required.

## Install and develop

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Dependencies are installed normally; they are excluded from the submission.

## Preview and rebuild

The complete production export is included in `dist/`, alongside the source and `package-lock.json`. The publisher can serve this directory directly.

```sh
npm run typecheck
npm run build
npm run preview
```

The preview command serves the current production export. Rebuild after changing source or assets. Vite's base is `./`; scripts, styles, fonts, favicon, and images use relative asset URLs suitable for a gateway subpath. Navigation uses hashes, so a static host does not need route rewrites. Serve the files over HTTP; opening an ES-module build directly with `file://` is not supported.

## Validation

The final production build and TypeScript check pass. The worker ran **48 interaction/layout/accessibility checks**, an Axe scan with **zero violations**, the pinned design probe with **16/16 passes**, and a separate rendered-image contrast check with **7/7 passing samples**. The complete first tweet excerpt and main action are visible at 390 × 844. No horizontal overflow was observed at 320, 390, 704, 990, or 1440px.

The checks exercise search, combined filters, all three sorts, show-more, source links, persistent bookmarks, saved deep-links, empty states, focus movement, dialogs, clipboard success and fallback, blocked/corrupt browser storage, reduced motion, forced colors, RTL layout, enlarged text, fonts, images, console errors, and local resource loads. They run against `dist/` under `/preview/` with external requests blocked for the main interaction run.

To repeat the interaction checks:

```sh
npx playwright install chromium webkit
npm run validate
npm run check:export
```

`npm run validate` starts and closes its own bounded local server. Results and screenshots go to `test/scratch/validation/`. For a short manual inspection and the separate artwork contrast measurement, use:

```sh
npm run validate -- --inspect
# In another terminal, while its preview is available:
node scripts/measure-hero.mjs
```

The inspection server closes after at most five minutes. Add `--capture` to refresh the two documentation screenshots. Browser downloads can be redirected with `PLAYWRIGHT_BROWSERS_PATH`; the worker used `/tmp/swamp-playwright-browsers` and kept all browser/dependency caches out of the repository.

During this assignment the pinned probe was run with:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/swamp-playwright-browsers node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste
```

That pinned input is removed before submission; it is not a dependency of the site or build. Its actual results and the six-domain Better Interface review are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

**Limitations:** WebKit could not launch because its native runtime dependencies are unavailable, so Safari is unverified. Physical devices, assistive-technology sessions, native browser 200% zoom, translated content, and actual social-network unfurling were not tested. The enlarged-text check uses 200% root text size rather than native browser zoom. External X links were verified as source URLs; their future availability is outside this static export.

## Source and design

- [DESIGN.md](DESIGN.md): actual tokens, typography, reusable patterns, responsive behavior, and states.
- [docs/SOURCES.md](docs/SOURCES.md): original post URLs, captured metrics, asset provenance, licenses, and snapshot update instructions.
- [docs/VALIDATION.md](docs/VALIDATION.md): commands, results, fixes, coverage, and limitations.
- [390px screenshot](docs/screenshots/390.jpg) · [1440px screenshot](docs/screenshots/1440.jpg).

`src/lib.ts` owns filtering, sorting, formatting, and defensive bookmark loading. `src/components/TweetCard.tsx` renders sourced posts. `src/App.tsx` owns the feed, hash navigation, and interaction state. No tweet embeds or remote scripts are needed to read the collection.

## Submission budget

The explicit ignore-file path budget is: `dist/` ≤2 MiB, `public/` ≤2 MiB, and source/configuration/lockfile/documentation ≤1 MiB, targeting ≤5 MiB against the assignment's 8 MiB maximum. `dist/` is intentionally included. Dependency folders, browser reports, caches, and scratch files are excluded at every nesting level. `npm run check:export` validates the actual delivered file size, local HTML references, export metadata, and required runtime assets. No vendored registry, dependency archive, or submodule is needed.
