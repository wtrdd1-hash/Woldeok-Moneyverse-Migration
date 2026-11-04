# v2026.11.04.1743 — Repair KDIC public/admin read-only endpoints on official Test without broad grants

## BEFORE — 2026-11-04 09:55 KST
User's completion criterion: all financial services function end-to-end on actual Production, with backed settlements, no fabricated WLD.
Latest main ff9839bde... (v1740 Production/Test). Separate parent Mint PR #2683 branch SHA 0b587733 carries SQL334; this v1743 is stacked after it (SQL335), owns only KDIC and docs, no Mint/tax overlap. NPS primary funded UI PR #2686 independent.
Root cause reproduced: GET https://test.easy-scraping.com/api/v1/kdic/portal HTTP500 while same public Production route HTTP200. Test effective backend database wdmv_v761_test_acl_v1544_restore contains 1 actual KDIC fund and 2 institutions; web moneyverse_app has NO SELECT on deposit_insurance_funds, insured_institutions, deposit_insurance_premiums, deposit_insurance_payouts and member_profiles. Production web role has SELECT on all 5. Existing KdicRepository uses raw reads and fails on Test. Granting broad raw read to Test is against AGENTS core least-privilege design and would leak sensitive member data.
Plan: create bounded, owned SECURITY DEFINER read wrappers for public fund/institutions and actor-scoped admin premium/payout. Replace backend raw KDIC table access while preserving public sanitized response, and return read-only overview on Test without expanding web raw KDIC SELECT. Validate isolated PostgreSQL Test clone, Test exact SHA, CI and Production release gates. Preserve existing KDIC payout/claim 503 financial settlement holds until true reserve funded. Existing NPS UI / PR2686 and Mint #2683 remain untouched.

## MID — pending
## END — pending
