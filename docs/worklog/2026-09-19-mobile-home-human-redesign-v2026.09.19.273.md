# Mobile Home Human-Led Redesign — v2026.09.19.273

- Version: v2026.09.19.273
- Branch: feat/mobile-home-human-redesign-v2026.09.19.273
- Base: 2cc746cb1474377458d591bc991eb745fe6eb39f

## Why

A production mobile screenshot confirmed v271 looked effectively unchanged to the user. The route-family baseline had not replaced the visible oversized card/glow/pill composition.

## Status checklist

- [x] v273-01 Re-read the integrated plan and confirm the production screenshot mismatch.
- [x] v273-02 Remove the large rounded/glowing mobile hero card while preserving approved product copy.
- [x] v273-03 Convert the balance area to a flat ruled header.
- [x] v273-04 Convert Today’s route to a linear rule-separated navigation list.
- [x] v273-05 Remove pill-style secondary shortcuts and flatten notices/safety information.
- [x] v273-06 Replace the floating rounded bottom nav with a full-width flat tab bar.
- [x] v273-07 Preserve route behavior, translations, accessibility labels and >=44px primary touch targets.
- [x] v273-08 Run contract build, typecheck, full frontend regression, lint, production build and diff check.
- [ ] v273-09 Deploy exact SHA to isolated Test and verify the rendered structure/screenshot.
- [ ] v273-10 Promote to Production only after Test visual/runtime QA passes.

## Validation

- contract build: PASS
- frontend typecheck: PASS
- frontend regression: 83 files / 660 tests PASS
- lint: 0 errors, 11 pre-existing image warnings
- Next.js production build: PASS
- git diff --check: PASS

Test deployment and screenshot QA are required before Production promotion.
