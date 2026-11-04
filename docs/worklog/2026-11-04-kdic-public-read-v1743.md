# v2026.11.04.1743 — Repair KDIC public/admin read-only endpoints on official Test without broad grants

## BEFORE — 2026-11-04 09:55 KST
User's completion criterion: all financial services function end-to-end on actual Production, with backed settlements, no fabricated WLD.
Latest main ff9839bde... (v1740 Production/Test). Separate parent Mint PR #2683 branch SHA 0b587733 carries SQL334; this v1743 is stacked after it (SQL335), owns only KDIC and docs, no Mint/tax overlap. NPS primary funded UI PR #2686 independent.
Root cause reproduced: GET https://test.easy-scraping.com/api/v1/kdic/portal HTTP500 while same public Production route HTTP200. Test effective backend database wdmv_v761_test_acl_v1544_restore contains 1 actual KDIC fund and 2 institutions; web moneyverse_app has NO SELECT on deposit_insurance_funds, insured_institutions, deposit_insurance_premiums, deposit_insurance_payouts and member_profiles. Production web role has SELECT on all 5. Existing KdicRepository uses raw reads and fails on Test. Granting broad raw read to Test is against AGENTS core least-privilege design and would leak sensitive member data.
Plan: create bounded, owned SECURITY DEFINER read wrappers for public fund/institutions and actor-scoped admin premium/payout. Replace backend raw KDIC table access while preserving public sanitized response, and return read-only overview on Test without expanding web raw KDIC SELECT. Validate isolated PostgreSQL Test clone, Test exact SHA, CI and Production release gates. Preserve existing KDIC payout/claim 503 financial settlement holds until true reserve funded. Existing NPS UI / PR2686 and Mint #2683 remain untouched.

## MID — pending
## END — pending

## MID — verified 2026-11-04 KST
- TDD regression RED (SQL335 absent), GREEN backend 8/8 targeted tests PASS, backend TypeScript PASS.
- Forward-only SQL335 provides owner-defined, stable read functions for fund, bounded 200 institutions, 10 admin premium and 10 admin payout rows. Admin functions check active user with granted user_roles. All functions have fixed pg_catalog/pg_temp search_path and explicit EXECUTE to app; no raw SELECT grants. Public portal no longer fetches private payout/premium evidence at all; admin controller supplies authenticated actor ID to DB wrapper; member coverage uses read-only fund wrapper.
- Real official Test failed HTTP500 on /api/v1/kdic/portal, while actual public Production HTTP200; Test data exists (1 KDIC fund, 2 institutions) but app role SELECT denied on five KDIC/profile tables. Reproduced raw ACL false in new separate PG17.11 network-none restored official Test snapshot.
- Test backup 20,878,252 bytes SHA256 68cf1f8a78c1342676c42d7a0a4905528fde35320119fd70da715274b7a029fd, verified archive listing, restored in mv-v1743-kdic-clone with Test role privileges. Applied stacked SQL334 then SQL335; both COMMIT. As true moneyverse_app: fund reader returns 1, institutions reader returns 2, admin actors safely read zero current premium/payout rows, unprivileged actor rejected. Original raw fund and institution SELECT rights remain false. Read-only SQL proof PASS and rollback.
- No Test Production DB grant, money, benefit, currency issue or financial record modified. KDIC monetary premium/claims remain correctly fail-closed until funded DB-owned settlement is implemented; no misleading 503 bypass.
- SQL335 is STACKED after contributor Mint SQL334 PR #2683. That predecessor's GitHub CI currently fails; do not merge or promote v1743 independently or reinterpret parent state as green.
