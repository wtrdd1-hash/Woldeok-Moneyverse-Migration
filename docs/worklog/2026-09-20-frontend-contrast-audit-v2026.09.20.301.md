# Frontend colour/contrast audit — v2026.09.20.301

Date: 2026-09-20  
Branch: `feat/frontend-contrast-v2026.09.20.301`  
Base: `0b973824d85379119813f9b9f53cd7cdd4ddeb93`

## Internal implementation record

The v297 rebuild foundation exposed theme-boundary defects that were masked by the previous dark-only presentation. This cycle audits colour use across the frontend rather than applying another cosmetic layer.

### Root causes

- `:root` and `.dark` shared one light palette while `dark:` utilities continued to activate.
- The tertiary light text token failed normal-text AA.
- Several global surfaces were hard-coded to light colours.
- Route components retained dark-only 300/400 text shades on light cards.
- Arbitrary user point colours could make the primary surface too bright for white text.

### Implementation

- Added distinct semantic light/dark palettes.
- Replaced hard-coded global surfaces with theme-aware tokens.
- Repaired home status panel, shop rarity/state labels, work/job status, inventory, business values and admin status colours.
- Added a programmatic WCAG contrast regression test.
- Constrained light-theme custom point primary luminance.

### Verification so far

- Frontend Vitest: 92/92 files, 688/688 tests.
- Contract build + frontend TypeScript: pass.
- Measured light normal-text floor: 4.90:1.
- Measured tested dark foreground floor: 6.14:1.
