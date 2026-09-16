# Internal change record — v2026.09.16.156

## Incident evidence

- User screenshot: dice parity accepted a visually valid `10 WLD` input but returned the generic HTTP 400 copy, “입력한 내용을 다시 확인해 주세요.”
- Frontend evidence: `playCoin()` and `rollDie()` normalized `stake` through `wholeAmount()`, which returns a string.
- Backend evidence: `CasinoPlayDto` and `CasinoDicePlayDto` require `@IsInt()` numbers; global `ValidationPipe` keeps implicit conversion off; casino E2E explicitly asserts numeric-string stakes are rejected.
- UX evidence: the coin game had a substantial server-result visual stage while both dice forms were plain input/button forms.

## Code changes

1. Parse coin and dice play stakes with `wholeNumber()` so valid bounded stakes cross the JSON contract as numbers.
2. Add a regression assertion that both casino action paths keep numeric stake parsing and never regress to `wholeAmount(formData.get('stake'))`.
3. Add a shared dice visual stage for parity and exact-number games using the authoritative `outcomeFace` returned by the server action.
4. Add an in-flight dice animation with `prefers-reduced-motion` fallback.
5. Keep all RNG, winning decisions, payout, and ledger settlement server-authoritative.

## Verification evidence

- Frontend: 68 test files / 609 tests passed.
- Typecheck: passed.
- Next.js production build: passed.
- Backend contract inspection: numeric string rejection is explicit in DTO/e2e and confirms the mismatch fixed here.

## Promotion gates

New branch → candidate CI/build → exact-SHA Test deployment → Test backend/API and `/casino` QA → merge to `main` → exact-main-SHA Test revalidation → Production release build → backup evidence → Production deployment → HTTP/log/runtime smoke. Any SHA mismatch blocks promotion.
