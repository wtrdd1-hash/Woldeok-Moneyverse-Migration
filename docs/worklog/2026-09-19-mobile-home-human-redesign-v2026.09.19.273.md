# Mobile Home Human-Led Redesign — v2026.09.19.273

- Version: v2026.09.19.273
- Branch: feat/mobile-home-human-redesign-v2026.09.19.273
- Base: 2cc746cb1474377458d591bc991eb745fe6eb39f

## Why

A production mobile screenshot confirmed v271 looked effectively unchanged to the user. The route-family baseline had not replaced the visible oversized card/glow/pill composition.

## Changes

- removed the large rounded/glowing mobile hero card;
- changed the balance area to a flat ruled header;
- changed Today’s route from a rounded card into a linear rule-separated navigation list;
- removed pill-style secondary shortcuts;
- flattened announcements and safety information;
- replaced the floating rounded bottom nav with a full-width flat tab bar;
- preserved route behavior, translations, accessibility labels and touch sizing.

## Validation

- contract build: PASS
- frontend typecheck: PASS
- frontend regression: 83 files / 660 tests PASS
- lint: 0 errors, 11 pre-existing image warnings
- Next.js production build: PASS
- git diff --check: PASS

Test deployment and screenshot QA are required before Production promotion.
