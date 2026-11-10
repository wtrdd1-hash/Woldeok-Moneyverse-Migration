# Implementation plan — Admin channel OTP v2026.11.10.2026
Spec: docs/superpowers/specs/2026-11-10-admin-channel-otp-design.md
Baseline: integration c02bdbc884, origin/main 3a7c34507a; independent worktree and branch.

1. **TDD service.** Extend backend/src/auth/admin-channel-otp.service.test.ts first for dual delivery failure, expiry, replay, wrong session/action/body, invalid format, attempt limit and resend throttle. Then replace AdminChannelOtpService with fail-closed hashed, scoped, bounded OTP storage, using canonical Treasury intent parsing.
   Expected: Vitest returns 0 failed for auth OTP service tests.

2. **TDD Nest routes.** Add admin-channel-otp.controller.ts plus test; register in AdminModule and guard with Session/Authenticated/Consent/Admin/AdminSession/CSRF. Add mandatory OTP verification inside POST Treasury salary and mint endpoints before TreasuryService invocation. Tests cover missing/invalid/wrong intent and positive single-use.
   Expected: backend focused controller and service tests pass; backend typecheck clean.

3. **Next proxy and UI.** Add minimal same-origin POST proxies for OTP request, salary disbursement and mint top-up with internal cookie/CSRF forwarding; change the two existing admin dialogs to use these routes, canonical action payloads and stable UUID for mint idempotency. Tests cover disallowed cross-origin calls and blocked failures.
   Expected: frontend test and typecheck pass.

4. **Integration evidence and documentation.** Re-read origin/main, integrate only safe changes, write EN+KO internal/GitHub update notes and dated worklog, run full relevant builds, isolated exact-SHA Test and authenticated negative-path QA. No Production promotion until verified release gates and shared-agent conflict checks succeed; preserve rollback.
   Expected: versioned commit, pushed branch and PR; operational status reported from runtime evidence, not assumed.
