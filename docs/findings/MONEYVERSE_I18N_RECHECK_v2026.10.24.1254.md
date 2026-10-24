# Moneyverse full-surface four-locale translation re-audit — v2026.10.24.1254

**2026-10-24 10:11–10:15 KST. Result: FAIL — home improved, page-wide parity remains substantially incomplete.** Authoritative policy: `docs/planning/PROJECT_PLAN.ko.md`, `INTEGRATED_PLANNING_MASTER.ko.md`, `GLOBAL_GROWTH_EXECUTION_SPEC.ko.md` §§3–4. Prior audit: `MONEYVERSE_I18N_FULL_SURFACE_AUDIT_v2026.10.24.1251.md` in pending PR #1100.

## Version identity
- Current `origin/main=5072d43e43dd93191d1c738c31c94ef1c1a5319d` (2026-10-24 09:59), translated selected areas: `frontend/src/app/page.tsx`, `stocks/page.tsx`, `bank/page.tsx`, `layout.tsx`, dictionary and tests. A four-file UI change is not full-site translation.
- Nginx serves website at `127.0.0.1:3354`; `/api/version` is from separate backend `127.0.0.1:3343` returning `6a989b5ac0c6155587d43426d64f6def6b62c917`. **The backend SHA is not proof of a frontend SHA.** Frontend release `prod-v2026.10.22.toss-redesign` was built ~09:59 KST with Git HEAD `a9167fe9` plus **43 uncommitted tracked-file modifications**. Home i18n improvements are visible, but production has no proven immutable frontend release identity.

## Reproduction
- Read-only live production via Nginx host header: 42 public URL families × 3 foreign locales EN/JA/ZH = **126 requests**. Each locale: **39 HTTP 200**, **3 redirects** (bank/support authentication 307, old compound calculator canonical 308). Each 200 group had 26 pages with **≥100 readable Hangul characters**. HTML `lang` correctly matched requested locale on all 39 per group, but EN **23/39 H1s** and JA/ZH **24/39 H1s** still include Hangul.
- Strong failures: `/en/terms` H1 Korean, ~2,085 Hangul; `/en/privacy` H1 Korean ~4,094; `/en/stocks` H1 Korean ~459; `/en/tools` ~1,415; `/en/guide` H1 Korean ~1,686; `/en/shop` ~4,996; stock, salary, retirement, loan, ISA, tax, gift and real-estate calculators have Korean H1/body/metadata. JA/ZH similar.
- Positive: localized root H1 and content improved; `/en/tools/compound-interest-calculator` has English H1 and only ~3 Hangul characters. JA/ZH version still has ~41 Hangul characters in onboarding CTA/description. `/en|ja|zh/guide/glossary` has translated H1 but **~1,250 Hangul characters** in term definitions. Country blog has localized H1 but Korean common labels (~75 characters). Admin after-login flows not evaluated.
- Default KO, en/ja Accept-Language, CN IP, explicit language cookie and URL precedence all passed **rendered live** checks; TW silently maps to Simplified zh and `/fr/stocks` 307 redirects to EN despite current market/script policy. Good locale selection does not imply translated content.
- Method: raw HTML with script/style/SVG omitted, text extracted with parser. Counts include some valid Korean names/original excerpts/selector options. Treat them as triage counts, not certified individual errors. H1 mismatch is a confirmed defect.

## Current main source coverage / focused verification
- AST inventory: 888 TS/TSX source files, 168 app page paths; raw Korean JSX **6,925 sites** vs prior **6,963** (38 fewer); Korean UI attributes **602**, Korean metadata literals **177**. These are candidate instances, not necessarily live failures.
- New project audit script flags 106 consumers of i18n out of 888 files, 583 Korean-containing files without i18n imports (heuristic). Existing `translations.ts` 68 keys vs `i18n-dictionary.ts` 313 keys; **17 shared keys contain divergent wordings**, e.g. `nav.admin`, `nav.wallet`.
- Vitest 7 locale-related suites **48/48 PASS**; frontend TypeScript `tsc --noEmit` **PASS**. Token/country tests do not evaluate every rendered view, legal accuracy, fluency, SSR mixed-language content, or published translations.
- Android physical QA, authenticated admin/bank/account flows and Discord/UGC translations **not proven**. Android resource coverage was previously identified as EN+KO only; no claim of revalidated device status.

## Follow-up priorities / gates
1. **P0** legal/privacy, financial and virtual-funds disclosures: legal + native review; no misleading foreign-language/indexable page without approved content.
2. **P1** all public routes: real body/H1/metadata parity, calculator scenarios/output, glossary content, shop/stocks/guides, localized blog editorial labels and independent regional composition. Add high-sensitivity accuracy checks, not machine literal swapping.
3. **P1** member/admin/mobile/BFF error messages, accessibility and device-width checks; separate zh-Hans/zh-Hant and locale/market/jurisdiction.
4. **P1** unify dictionaries, build/runtime missing-key detection, SSR public-route language-purity E2E, native editorial review and precise source revision evidence.
5. New isolated implementation branch, test-first change, fetch latest remote main mid-work, exact-SHA production-like Test with backend/auth/SEO gates and zero-downtime promotion only after verified acceptance. Do not rewrite dirty live Production source, mutate a shared finance database, or merge other agents' work without coordination.

**This audit is evidence and documentation only, not application remediation, Test promotion, or Production deployment.**
