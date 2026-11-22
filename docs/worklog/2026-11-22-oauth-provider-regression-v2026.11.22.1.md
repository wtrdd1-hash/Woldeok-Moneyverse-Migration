# OAuth provider regression and work attribution — v2026.11.22.1

**State:** INVESTIGATION / NO APPLICATION PATCH / NO DEPLOYMENT
**Date:** 2026-11-22 KST
**Owner of this investigation:** ChatGPT audit task (documentation-only, isolated branch)
**Baseline:** `origin/main` `768d932b202fbd506e5b0692bf4a38d1f5af1ef6`, checked against remote on 2026-11-22.
**Authority:** `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`, approved November 18 Spring UI, `AGENTS.md`, and preceding November 17/20 OAuth and auth worklogs.
**Safety:** No secrets, cookies, authorization codes, OAuth states, private user data, live provider consent, finance writes, production service changes, or changes to another agent's staged files. The GitHub repository is public: sensitive configuration findings stay only in restricted operations records.

## Before work — initial evidence and safeguards
- Owner reports Google login missing without an instruction to remove it, and Discord login failing. No matching owner instruction to remove Google was found in reviewed authority. Absence of an instruction is not proof about every older conversation.
- Preserved the current shared checkout as-is: `main` is at `768d932b202fbd506e5b0692bf4a38d1f5af1ef6` with unrelated pre-existing staged Spring static/UI files. This task must not reset, commit, or stage those files.
- Existing Next provider UI `frontend/src/app/login/login-providers-view.tsx` offers both Google and Discord when enabled; the Spring `templates/mv43/auth.html` shows a Discord link but Google as unavailable.
- Git history: original native auth template `ac12a17328` (2026-11-20 14:32 KST, Git author `wtrdd1-hash`) already explicitly marks Google unavailable. It was integrated by `2ac581b24f` (15:15 KST); later full-file rewrite `88b70b90d7` (17:04 KST, Git author `Hong Jong-hwan`) retained the Google-unavailable line. Blame on HEAD alone does **not** identify who first introduced the text. Human/AI executor attribution is unconfirmed.
- Spring `AuthController.providers()` advertises `google: enabled=true`, although `OAuthController` has no functional Google authorization/callback implementation. This violates source-of-truth provider availability.
- Spring service is active at loopback 4550; legacy frontend service is inactive. Local Spring `GET /login` returns 200, but the login HTML has only the Discord provider link. Local Nginx `GET /auth/discord/authorize` returned 403 in the observed host/protocol context; whether this is a route ACL, intentional maintenance, or an external-browser failure remains to be established.
- Historical November 17 worklogs identify previous gateway/host-only-cookie and OAuth state failures. They are prior incident evidence, **not** proof that a provider callback now succeeds.
- Built-in MCP audit backup and small recent-log inspection returned `Invalid string length`; do not claim those records were captured or that tool attribution is verified.
- A security-sensitive OAuth configuration/logging risk was detected. Never copy live values or token-bearing response bodies to GitHub or this worklog; handle remediation via restricted incident workflow.

## In progress — checkpoints
- [x] Read current authoritative master, auth spec, shared-agent protocol, November 20 auth plan and November 17 OAuth incident notes.
- [x] Confirm main SHA, pre-existing staged-file ownership, Git author/commit genealogy, source provider implementation and selected HTTP status observations.
- [ ] Reconcile edge routing and OAuth callback outcome with sanitized operational evidence.
- [ ] Verify recent GitHub reviews, CI/test evidence, and observed executor identity where records permit.
- [ ] Propose isolated tests and minimal guarded repair preserving both provider options and fail-closed session semantics.

## Finished — pending
- Findings, verification state, responsible commit(s), exact remaining blockers and release status will be added at final checkpoint.
- **Production promotion: NOT REQUESTED AS A CHANGE IN THIS INVESTIGATION; NOT PERFORMED.**
