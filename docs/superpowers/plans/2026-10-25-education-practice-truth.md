# Educational Practice Receipt Truth — C v1048

## Evidence / bounded design
The live `FinancialKnowledgeHub` on public calculator pages displays fixed USD/KRW/JPY/EUR numbers as "live", implicitly assigns real fiat value to non-redeemable WLD, and shows a 10,000 WLD starter grant as claimed after only a browser localStorage write. No ledger API is invoked and the real portfolio is not updated. This is a P1 user trust defect.

## Scope and acceptance
Preserve the six educational glossary cards and interactive mock stock-selection exercise. Remove the WLD-to-fiat conversion claim and all fabricated reward, order settlement, and portfolio persistence claims. Make the exercise unmistakably practice-only with no account or ledger changes; never write `wdmv_mock_*` or `wdmv_quest_stock_mock`. Provide an accessible live result and a real link to the server-backed `/stocks` catalogue, not a false portfolio receipt. Explicitly label example PER/PBR numbers as fictional. Keep mobile 44px controls and public educational SEO. No DB/API changes because this feature performs **no** transactions or member data operations. Real orders remain in the existing authenticated stock API only.

## TDD / verification
1. Write user-flow tests asserting no live WLD-to-fiat quote or fake grant, practice completion only, and no storage/ledger side effect. Run RED.
2. Implement minimal UI changes and run GREEN.
3. Run lint, typecheck, build, focused and full regression; verify exact HEAD SHA and CI, real PostgreSQL only in isolated test environment. Any failed mandatory gate blocks merge/deploy.
4. Re-fetch main and planning at mid/end; document evidence EN canonical/KO supplementary, open Draft PR, preserve other worktrees.
