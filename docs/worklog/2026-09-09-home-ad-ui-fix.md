# Home advertising and desktop navigation UI fix — 2026-09-09

## Reported issue

A production desktop screenshot showed two visible UX defects on the landing page:

- Korean header labels wrapped onto multiple lines even though the viewport was wide enough for the desktop navigation.
- AdSense sections rendered as large empty reserved boxes when Google did not fill the unit, making the page look broken and creating excessive vertical whitespace before the footer.

## Root cause

- Desktop header links did not opt out of line wrapping. With the signed-in navigation, language/theme controls, account action and wallet action all present, the remaining nav width could become narrow enough for Korean labels to break by syllable.
- The public advertisement component always reserved at least 140 px plus outer spacing and kept its placeholder chrome visible even when AdSense reported an unfilled unit or failed to initialize.
- The landing page also used an 80 px section gap at desktop widths, amplifying the amount of empty space around an unfilled ad.

## Changes

- Added `whitespace-nowrap` to desktop header links and dropdown triggers.
- Reduced desktop navigation gap slightly so the complete signed-in header fits more robustly before falling back to the mobile navigation breakpoint.
- Reduced the landing-page desktop section gap from 80 px to a denser 56–64 px range.
- Moved ad-slot chrome into the client-side AdSense component so it can react to the real Google `data-ad-status` value.
- Added a `MutationObserver` for `data-ad-status` and a bounded six-second no-fill timeout.
- Collapse the complete advertising section when Google reports `unfilled`, when initialization throws, or when no fill arrives within the timeout.
- Removed the dashed empty-placeholder panel. Filled AdSense units retain a conventional sponsored label and a responsive 970 px maximum width.
- Added a stable `id` to the shared AdSense loader so repeated public ad placements reuse the same script resource.

## Advertising verification

Production already exposes the configured publisher and slot in rendered HTML, publishes the expected Google record in `/ads.txt`, and its CSP allows the AdSense script/frame/connect origins used by the current implementation. This change therefore does not replace the publisher identity or invent an advertisement. Google ultimately decides whether a request is filled based on the AdSense account, site approval, inventory and visitor context; the UI now degrades cleanly when the result is no-fill.

## Validation

- Frontend TypeScript typecheck: passed.
- Remaining repository CI / Test deployment / public smoke checks are required before Production.
