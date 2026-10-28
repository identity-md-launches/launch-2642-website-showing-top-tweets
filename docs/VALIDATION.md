# Validation and Better Interface review

Reviewed 28 October 2026 against the final static export. This is the builder's evidence, not independent certification.

## Scope and consequential assumptions

The brief asks for a website showing top tweets about IdentityMD, with dark green styling and Pepes armed with AI. It does not request sign-in, a wallet, transactions, or a live X service. The implementation therefore ships a fixed, openly labeled public-post snapshot: 12 posts from seven accounts, captured on 28 October 2026. Default ranking is captured likes within this collection. All excerpts and metrics were checked against their original public X status pages; see [SOURCES.md](SOURCES.md).

Reviewed surfaces: initial feed, expanded feed, all topic filters and sort orders, author/text search, combined search/filter, empty search, saved list and empty saved state, source links, About dialog, clipboard success and fallback dialog, storage denial/corruption, keyboard focus, reduced motion, forced colors, RTL mirror, and enlarged text. The app is static; no remote loading, wallet, payment, authentication, or transaction state applies.

## Acceptance coverage

| Requirement | Result and evidence |
| --- | --- |
| Usable website with responsive layouts and primary interactions | Met; 48 checks against the actual export, plus direct browser-tool interaction and screenshots |
| `dist/index.html`, assets, source, lockfile; relative static URLs | Met; Vite `base: './'`, included export and local assets, `/preview/` subpath validation, export integrity/size check |
| Production build, typecheck, useful interaction validation; actual results and limitations | Met; final commands below, machine-readable [checks.json](checks.json), limitations below |
| Apply Better Interface, review six domains, fix applicable findings | Met; six-domain coverage and corrected findings below |
| Product/action on first 390px screen; title/favicon/description/OG title/image | Met; first excerpt y=698–774px, primary action y=243–287px; pinned share check passes |
| Root `DESIGN.md` describes final implementation | Met; exact tokens, type, spacing, components, breakpoints, interaction states, and measured limitations |
| README explains install, preview, rebuild | Met; `npm ci`, development, typecheck, build, preview, validation, and static-host behavior documented |

The one visual idea is an IdentityMD reading room carried by an AI-equipped Pepe squad, forest-green surfaces, and one lime action accent.

## Commands and actual results

| Command | Actual result |
| --- | --- |
| `npm install --cache /tmp/swamp-npm-cache --no-audit --no-fund` and scoped dependency additions | Completed; package manifest and lockfile delivered, dependency/cache folders excluded |
| `npm run typecheck` | Exit 0; TypeScript `tsc --noEmit` |
| `npm run build` | Exit 0; final Vite export contains local JS, CSS, Latin WOFF2, favicon, squad art, and all author avatars |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/swamp-playwright-browsers npm run validate -- --inspect --capture` | 48 checks passed; zero Axe violations; bounded foreground server closed after inspection |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/swamp-playwright-browsers node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` | Exit 0; all 16 taste@1 checks pass |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/swamp-playwright-browsers node scripts/measure-hero.mjs` | Exit 0; 7/7 conservative rendered-background contrast samples pass |
| `npm run check:export` | Exit 0; production references, metadata, runtime assets, path budgets, and total payload pass |

Interaction validation starts its own HTTP server under `/preview/` and closes its own browser. Default validation closes the server automatically; `--inspect` keeps it available for at most five minutes. The main interaction context blocks external requests. The exported site rendered successfully without an external font, X embed, API, or data request.

The 48 checks cover initial display and ranking, original links, showing more, newest/repost sorting, all three topics, normalized multi-term/author search, clear/reset and focus, combined filters, bookmark state, saved navigation, one main heading, reload persistence, removal and empty states, clipboard content and confirmation, modal opening/inert background/Escape/focus return/close, Axe, reflow, first-screen product/action, mobile search, reduced motion, forced colors, RTL, 200% text size, clipboard denial, localStorage denial/corruption, image/font loading, script errors, and failed local responses.

Direct browser-tool checks additionally exercised search plus topic filtering, saving/opening/removing a tweet, singular “1 tweet” copy, the final 390px and 1440px layouts, root text enlargement, and keyboard focus. The final export reported zero browser console errors/warnings and all requested local resources returned HTTP 200. Observed focus rings include the home link and the complete search field.

## Six-domain review

| Domain | Coverage | Evidence and boundaries |
| --- | --- | --- |
| Accessibility | Checked | Native links/buttons/search/select/dialog; persistent input labels, icon names, source-link names including visible text, one h1 in both views, status announcements, selected-state semantics, skip link, keyboard focus/return, minimum target spacing, reduced motion, forced colors; zero Axe violations. A real screen-reader session was not performed. |
| Layout | Checked | DOM order, shared shell, logical spacing, aligned controls, two-to-one card columns, collapsing sidebar, text/handle/query wrapping. Rendered at 320, 390, 704, 990, 1440px; no horizontal overflow. RTL and 200% text enlargement checked. Native browser zoom and translated/pseudolocalized content were not tested. |
| Writing | Checked | Source quotes rather than invented author copy; snapshot/ranking/local-save scope; direct action labels; historical counts; original links; recoverable empty/error states; singular saved counts. Authored first-screen prose is 12 words at 390 and 21 at 1440 according to the probe. |
| Typography | Checked | Local font loaded, one family, three used weights, six-size system; real quote wrapping and long handles; tabular metrics; 16px mobile inputs. No critical tweet content is line-clamped. Latin font coverage only; other scripts use the system fallback. |
| Colors | Checked | sRGB hex tokens, semantic roles, dark-green direction, one primary lime fill, selected-state icons/shapes. Solid text passes the probe's 4.5:1/3:1 thresholds. Separate image-background sampling passes after removing a failing decorative caption. No light theme is applicable to this brief. |
| UI details | Checked | Flat structural borders, consistent radii/icons, default/hover/focus/pressed/saved/empty/fallback states reviewed in source and representative rendered states. 150ms named-property transitions; reduced motion disables them. No autoplay or endless animation. Animation-panel replay at 10% speed was not performed. |

## Findings corrected

All source citations below point to the final source; removed elements are identified explicitly. No reproduced high- or medium-impact finding remains open.

| Severity / domain | Finding and evidence | Fix and recheck |
| --- | --- | --- |
| High / layout | At 390 × 844, the original hero and stacked sort/topic rows pushed tweet wording below the first screen. The screenshot showed the first author but no tweet text. | `src/styles.css:1090` makes the hero compact, keeps search/sort together at 390px, and removes topic icons on mobile. The final complete first excerpt ends at y≈774px and the main action ends at y≈287px. Verified by screenshot and bounding-box assertion. |
| Medium / accessibility | Six original-post links displayed “Read full tweet” while their accessible names omitted “full”; Axe reported `label-content-name-mismatch`. | `src/components/TweetCard.tsx:97` starts the accessible name with the actual visible action. Final Axe run: zero violations. |
| High / layout/accessibility | At 390px with 200% text size, the header utilities extended off-screen; document width was 507px. Enlarged metrics could also crowd their action row. | `src/styles.css:1097` allows header wrapping; `src/styles.css:648` allows card action rows to wrap; the hero permits long-word reflow. Final enlarged-text width is 390px. Browser-tool screenshot and automated assertion confirm the fix. |
| Medium / colors | The decorative artwork caption crossed a luminous part of the image. Conservative background sampling over its actual text range reached 1.00:1 against a 4.5:1 requirement. | Removed the caption from the hero in `src/App.tsx:218` and its styles. The image fills the freed space. The remaining seven text-line samples pass; source art remains intact. |
| Medium / accessibility | The initial saved-view composition omitted a page-level h1 after removing the hero. | `src/App.tsx:276` renders “Saved tweets” as h1 in that view. The saved deep-link test confirms exactly one h1. |
| Low / writing | A single saved post showed “1 tweets” in the total and footer. | `src/App.tsx:276` and `src/App.tsx:469` use singular copy for one post. The direct browser check returned “1 tweet” and “Showing 1 of 1 tweet”. |
| Low / UI and writing | Source review found that corrupt bookmark JSON and unavailable storage shared one catch path, potentially misreporting corrupt data as unavailable storage. | `src/lib.ts:43` separates storage access from JSON parsing, filters unknown IDs, and deduplicates valid IDs. Corrupt JSON now recovers without a false warning; denied storage explicitly retains in-memory saves. Both states pass the interaction run. |

## Design probe details

All 16 categories pass: render, layout, targets, contrast, casing, tracking, eyebrows, type sizes, type faces, glyphs, slogans, repetition, copy budget, chrome, motion, and share metadata.

The target measurement reports all 45 controls at 390px meeting the 24px-or-spacing rule; 36 remain below the recommended 44px comfort size. These are primarily compact metadata/text controls. Primary buttons, filters, and mobile tweet actions use comfortable dimensions; the report does not claim every link is 44px tall.

The probe does not measure text over artwork/gradients. The supplementary script hides only text, screenshots the unchanged background, and computes the lowest contrast across each real text-line rectangle. This is conservative because it includes spaces and all pixels within the rectangle. Final minima:

| Width | Text | Lowest contrast | Required |
| --- | --- | ---: | ---: |
| 390 | Product name | 6.54:1 | 3:1 |
| 390 | Accent headline | 4.96:1 | 3:1 |
| 390 | Explanation, first line | 6.96:1 | 4.5:1 |
| 390 | Explanation, second line | 9.38:1 | 4.5:1 |
| 1440 | Product name | 15.51:1 | 3:1 |
| 1440 | Accent headline | 12.75:1 | 3:1 |
| 1440 | Explanation | 11.29:1 | 4.5:1 |

## Retained evidence

- [390 × 844 production screenshot](screenshots/390.jpg).
- [1440 × 1000 production screenshot](screenshots/1440.jpg).
- [Machine-readable final check results](checks.json), containing the 48 interaction outcomes, 16 design outcomes, and seven contrast measurements.
- Scratch evidence used during the run: `test/scratch/validation/`, `test/scratch/taste/shots/`, and `test/scratch/source-verification.json`. Scratch files are intentionally not part of the deliverable.

## Remaining limitations and completion

WebKit was downloaded but could not launch because required native runtime dependencies are unavailable. Safari rendering and primary interactions remain **Not verified**. No physical-device or real assistive-technology session was performed. Native browser 200% zoom, alternate-language/pseudolocalized strings, animation-panel slow playback, and actual X/social share-card unfurling remain **Not verified**. The RTL check is a layout mirror, and 200% root text size is text enlargement, not native zoom. Passing Axe and contrast checks is not a claim of full accessibility compliance.

The export requires JavaScript and HTTP hosting. A noscript explanation links to X. Saved items are per browser/origin and do not synchronize between devices. X may require sign-in or change access to historical posts; the local excerpts remain readable without fetching X.

**Complete for the implemented static-site scope and available Chromium validation.** Source, lockfile, export, design documentation, source provenance, and check evidence are included. No hosting, publication, external messaging, or wallet transaction was performed.
