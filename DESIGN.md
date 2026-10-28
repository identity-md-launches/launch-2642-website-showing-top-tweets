# The Swamp design system

## Overview

The Swamp is a reading room for public IdentityMD tweets. The requested dark green, AI-equipped Pepe theme is carried by a single squad illustration, forest surfaces, and a lime accent. A compact introduction leads directly to a working feed; the cards and reading controls are the primary product. The snapshot, topic counts, and bookmark total come from the local data and browser state.

The implementation is React and TypeScript with plain CSS. `src/styles.css` is the canonical token and component style source. `src/App.tsx` composes the page. `src/data/posts.json` supplies the public-post snapshot. This document describes the final implementation, not a proposed redesign.

## Colors

Primitives and semantic aliases are declared in `src/styles.css:9`.

| Semantic token | Primitive / exact value | Role |
| --- | --- | --- |
| `--color-bg` | `--forest-950`, `#0b140f` | Page, on-accent text, share input background |
| `--color-surface` | `--forest-900`, `#101c14` | Tweet cards, search, dialogs, hero base |
| `--color-surface-hover` | `--forest-850`, `#142219` | Reserved surface alias in the implemented ramp; currently unused by components |
| `--color-selected` | `--forest-800`, `#1b2d20` | Selected filter, hover fill, saved state, avatar fallback |
| `--color-border` | `--forest-700`, `#2d4032` | Structural edges and selected-control borders |
| `--color-text` | `--sage-50`, `#f0f2e9` | Headings and tweet text |
| `--color-text-secondary` | `--sage-200`, `#cad2c4` | Secondary text, links, hero explanation |
| `--color-text-muted` | `--sage-400`, `#a5b3a4` | Handles, dates, metrics, captions |
| `--color-accent` | `--lime-300`, `#b3ed78` | Primary fill, brand emphasis, selected icon |
| `--color-accent-hover` | `--lime-200`, `#c5f497` | Primary hover fill |
| `--color-on-accent` | `--forest-950`, `#0b140f` | Text on lime surfaces |
| `--color-focus` | `--lime-200`, `#c5f497` | Keyboard focus ring |

This is intentionally one dark theme. No light-mode or theme-switching behavior exists. Component text consumes semantic tokens. The card hover edge is `#4c6450`; image outlines use pure white at 10% opacity. The modal backdrop uses black at 76% opacity. The hero uses a dark-to-transparent overlay to protect text over the artwork; its exact stops live in `.hero-art::after` and the mobile media query.

The final solid-background contrast probe passes. A separate screenshot-pixel check measures backgrounds under actual text ranges: at 390px, the headline minima are 6.54:1 and 4.96:1; the explanation's two lines are at least 6.96:1. At 1440px, the headline minima are 15.51:1 and 12.75:1, and the explanation is 11.29:1. These are conservative minima across the text rectangles, not a claim of full accessibility conformance. See `docs/VALIDATION.md`.

## Typography

`src/styles.css:1` defines a locally bundled Latin WOFF2 from `@fontsource-variable/manrope`. The family stack is `"Manrope Variable", "Manrope", sans-serif`. The file provides weights 200–800; the interface requests only **400, 600, and 700**, in normal style. No italic or synthetic face is required. Font loading was confirmed in Chromium.

| Token | Default | Use |
| --- | --- | --- |
| `--font-caption` | 13px / `0.8125rem` | Dates, handles, metrics, provenance, mobile topic filters |
| `--font-small` | 14px / `0.875rem` | Buttons, desktop controls, author names, supporting UI |
| `--font-body` | 16px / `1rem` | Tweet text, normal prose, mobile search and share inputs |
| `--font-title-small` | 20px / `1.25rem` | Empty-state headings, mobile brand |
| `--font-title` | 24px / `1.5rem` | Feed title, dialog title, desktop brand, snapshot totals |
| `--font-display` | 56px / `3.5rem`; 32px / `2rem` at ≤704px | Hero heading |

The body has a unitless line-height of 1.5. Tweets use 1.65, reduced to 1.6 on mobile; dialog copy uses 1.7. Headings use 1.1–1.4 according to role. Display tracking is −0.055em on desktop and −0.045em on mobile; small headings stay within −0.04em and normal prose is untracked. Headings balance, descriptions use pretty wrapping, tweet whitespace is retained, and long handles/queries wrap. Tweet text is capped at 65ch. Changing numbers use tabular numerals.

There is one page-level h1: the hero on the feed, or “Saved tweets” in the saved view. The feed and sidebar sections use descriptive headings. Text remains selectable. Inputs are 16px on mobile to avoid input-triggered iOS zoom.

## Layout

`.shell` is the shared alignment primitive: maximum width 1280px, centered, with 40px side margins by default. Margins become 24px at ≤1152px and 16px at ≤704px. The page uses predominantly 4px-derived spacing (8, 12, 16, 20, 24, 28, 32, 36, 40px), with smaller optical gaps in compact metadata. Spacing is declared directly rather than through a second token registry.

Desktop uses a two-column feed beside a 274px sidebar, separated by 36px. Cards have a 16px grid gap and 20px inner padding. The sidebar narrows to 238px at ≤1152px. At ≤992px it disappears and the feed uses the full content width; the data, source explanation, and controls remain available in the feed and About dialog. At ≤704px the feed becomes a single column, margins shrink, the hero becomes 232px minimum height, and filter icons disappear while their text and selected state remain. Search and sort share one row at 390px. At ≤384px, search takes a full row and sort wraps beneath it.

The header is 80px minimum on desktop and 64px minimum on mobile. Its mobile flex row can wrap when text is enlarged. Text containers use minimum heights and natural wrapping. Card action rows wrap when enlarged text needs more room. Critical tweet content is not line-clamped. The hero is the only intentionally cropped image surface; its crop favors the main Pepe's face on desktop. The crop's left-to-right art composition is physical; spacing and text placement otherwise use logical CSS properties.

The first 390 × 844 screen contains the product name, “Explore top tweets,” search, sort, topic filters, and the complete first tweet excerpt. At that size the excerpt occupies approximately y=698–774px. Observed widths: 320, 390, 704, 990, and 1440px, with no horizontal overflow. 200% text enlargement and an RTL mirror were also checked for overflow; these are not native browser zoom or a translated release.

## Elevation & depth

The system is flat. Cards and controls use tonal surfaces and one-pixel structural borders; no surface combines a border with a drop shadow. The hero's original image provides depth without a stack of decorative effects. Images other than the hero have a one-pixel, 10%-white inset outline. Dialogs occupy the browser's native top layer over a dimmed backdrop. The skip link uses z-index 20 and the dismissible copy notice uses z-index 10.

## Shapes

The implemented radius tokens are 8px for buttons and inputs, 12px for tweet cards, and 18px for the hero and dialogs. Author avatars are circles. The logo uses a small rounded square. The CPU illustration uses a 15px radius on a 56px square. Borders follow structure or state, not ornamental nested boxes.

## Components

- **Page and feed (`src/App.tsx`)**: header navigation, compact hero, search, native sort select, topic button group, six-at-a-time display, useful empty states, saved view, source explanation, and sidebar. `#feed`, `#saved`, and `#home` work without server routing. Navigation and hero actions move focus to the feed. Counts and topic totals derive from the snapshot; bookmarks derive from browser storage.
- **TweetCard (`src/components/TweetCard.tsx`)**: `post`, `rank`, `saved`, `onSave`, and `onShare` props. A sourced quote, author/profile link, UTC date, topic, captured metrics, original-post link, share button, and bookmark button. Saved state changes to a check icon and exposes `aria-pressed`. Avatar failure falls back to the author's first letter. Metrics are read-only, not simulated engagement controls.
- **AboutDialog (`src/components/AboutDialog.tsx`)**: `open` and `onClose` props. Native `dialog.showModal()` provides background inertness and focus restoration. Escape, backdrop, and close button dismiss it. Copy explains the ranking scope, source excerpts, historical metrics, and local-only saves.
- **Share fallback (`src/App.tsx`)**: clipboard success produces a dismissible confirmation; denied/unavailable clipboard opens a native dialog with a labeled, selectable original URL and a source link. Announcements use a stable polite live region.
- **Buttons and fields (`src/styles.css`)**: `.button-primary` is reserved for the hero action; `.button-secondary` handles secondary navigation and load-more. `.icon-button`, `.filter-button`, `.plain-button`, and `.text-link` retain distinct placement and interaction cues. Search has a persistent visible label. Native sort has an accessible label.
- **Icons**: one Lucide icon set using `currentColor`, plus the inline `XMark` brand vector. Decorative icons are hidden from assistive technology by the library or component. The local frog mark is `public/favicon.svg`.

Hover treatments are gated by `@media (hover: hover)`. Keyboard focus is a 2px lime outline with a 4px offset; the search ring surrounds the whole field. Forced-colors mode uses the system Highlight color. Native controls provide keyboard behavior; modal page content is inert. Controls meet the probe's 24px/spacing floor, but not every dense text link is 44px tall.

Interactive transitions are 150ms with `cubic-bezier(.2,0,0,1)` and name only changing properties. Buttons scale to 0.96 on press. All motion is enabled only under `prefers-reduced-motion: no-preference`; there are no entrance sequences, autoplay, timers, or endless animations. There is no fake loading state because the snapshot is bundled locally.

## Do's and don'ts

Start additional reading surfaces with `.shell`, the existing type tokens, and the feed's heading/control alignment. Reuse semantic color aliases, card spacing, focus styles, and the existing action hierarchy. Use `TweetCard` for sourced posts and the native dialog pattern for short contextual overlays.

Keep source links and snapshot wording next to historical data. Keep saved-state scope explicit. Preserve the one-font, three-weight, six-size system. Use a single prominent lime action per view. New text must wrap at 320px and at enlarged text sizes.

Do not add live-looking counters, invented tweets, fake likes, wallet controls, remote font dependencies, route paths requiring a server rewrite, or extra competing visual themes. Re-run the build and the interaction/design checks after changing the final source or its runtime assets.
