# Verified first-trade onboarding — bounded implementation plan

## Source and intent
The root-layout onboarding currently claims a completed trade without a verified order receipt, invents browser-local holdings and a 10,000 WLD credit, and guesses authentication from client storage. This is P1 misleading account state. Replace the fake execution with an accessible educational entry point to the existing `/stocks` server-backed order flow. Do not change or duplicate trade execution, settlement, or API contracts.

## Steps (TDD)
1. `frontend/src/components/first-trade-onboarding-modal.test.tsx`: create failing cases for signed-out users, authenticated guide, no fetch/no local holdings, keyboard Escape and visible accessible links.
2. `frontend/src/components/first-trade-onboarding-modal.tsx`: accept server-derived `eligible` boolean, remove cookie heuristics and fake POST/local ledger, replace CTA with actual stock catalog navigation and explicit no-trade statement; 44px controls, focus/aria semantics.
3. `frontend/src/app/layout.tsx`: pass `viewer.signedIn && viewer.consentCurrent` into onboarding. Keep SEO public market metadata unchanged.
4. Validate focused RED/GREEN, full quality gates and GitHub CI. Fail closed on any release blocker; no main/Production changes.
