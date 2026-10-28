# Public post sources

The site contains a fixed 28 October 2026 snapshot, not a live feed or an exhaustive X ranking. Public X pages were fetched directly. Their embedded public post records supplied the original wording, post timestamps, avatars, and displayed engagement counts. Each selected post was fetched again at its original status URL, and its whitespace-normalized excerpt was checked against the original text (including expanded note text where present). All 12 checks passed.

Quotes are short excerpts of at most 24 whitespace-delimited words per original post. The P2P product announcement quotes the full visible text, excluding its media URL. Other cards explicitly say “Tweet excerpt” and link to the full post. No author text, likes, reposts, dates, views, or handles were invented. Topic assignments are editorial. Posts can contain outdated claims or opinions; the app does not verify those claims.

Default ranking is captured likes descending, with post date as a tie-breaker. “Most reposted” uses captured repost counts; “Newest first” uses each original UTC post timestamp. Numbers are historical, not current or global.

| Author | Post date (UTC) | Topic | Likes | Reposts | Original source |
| --- | --- | --- | ---: | ---: | --- |
| @Bankless | 2026-09-28 | AI & agents | 409 | 100 | [Original tweet](https://x.com/Bankless/status/2104546260195713113) |
| @surfcoderepeat | 2026-10-07 | Community | 398 | 93 | [Original tweet](https://x.com/surfcoderepeat/status/2107939454396567581) |
| @surfcoderepeat | 2026-09-21 | AI & agents | 242 | 37 | [Original tweet](https://x.com/surfcoderepeat/status/2102050129440133156) |
| @surfcoderepeat | 2026-10-07 | Community | 232 | 31 | [Original tweet](https://x.com/surfcoderepeat/status/2107659285320671390) |
| @dani_who_daniel | 2026-09-27 | Building | 164 | 32 | [Original tweet](https://x.com/dani_who_daniel/status/2104338788990529829) |
| @surfcoderepeat | 2026-10-28 | AI & agents | 152 | 21 | [Original tweet](https://x.com/surfcoderepeat/status/2115279190412968299) |
| @LastToSign | 2026-09-02 | AI & agents | 111 | 22 | [Original tweet](https://x.com/LastToSign/status/2095221759439962123) |
| @imdradar | 2026-10-23 | Community | 79 | 14 | [Original tweet](https://x.com/imdradar/status/2113661096481390726) |
| @imdradar | 2026-10-15 | Building | 56 | 7 | [Original tweet](https://x.com/imdradar/status/2110765083311689890) |
| @damian_et | 2026-10-09 | Building | 48 | 4 | [Original tweet](https://x.com/damian_et/status/2108610031755096117) |
| @taylor_ | 2026-10-26 | AI & agents | 35 | 5 | [Original tweet](https://x.com/taylor_/status/2114812590434181589) |
| @LastToSign | 2026-10-05 | Community | 29 | 8 | [Original tweet](https://x.com/LastToSign/status/2107170404213076356) |

## Runtime assets

- `public/assets/swamp-squad.webp`: AI-generated original illustration commissioned for this build. Optimized to 1440 × 960 WebP; no third-party stock art is required.
- `public/assets/avatar-*.webp`: author avatars fetched from the public image URLs in the corresponding X author record. Bundled locally for offline rendering; authors retain their respective rights.
- `public/favicon.svg`: original frog mark made for this build.
- Manrope Variable: local Latin WOFF2 supplied by `@fontsource-variable/manrope`. SIL Open Font License retained in `docs/licenses/manrope.txt`.
- Interface icons: `lucide-react`, bundled by Vite; X mark is an inline vector.

## Guidance attribution

Better Interface guidance is adapted from Jakub Krehel’s Better Interface (MIT), pinned commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`. Documentation guidance is adapted from Paul Bakaus’s Impeccable (Apache-2.0), pinned commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`. Both license texts and original attribution are retained in `docs/licenses/design-guidance.txt`. These references informed the implementation; the task’s own scope took precedence.

## Updating the snapshot

Replace entries in `src/data/posts.json` only with verified public source posts. Keep the source URL and exact excerpt, update the capture date and explanatory date/count copy in `src/App.tsx` and `src/components/AboutDialog.tsx`, and replace local avatars as needed. Rebuild `dist/` and rerun the checks. Ranking and topic counts are derived from the data; nothing is fetched from X at runtime.
