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

## In progress — verified forensic checkpoint (2026-11-22 KST)
- The native-auth integration worklog explicitly says Google was shown unavailable because the Spring Google authorization source was incomplete. That describes the implementer's documented compatibility decision; it is **not** an owner request to remove Google. The first Git-authored template version already contained the notice, so `git blame` of a later whole-file rewrite was insufficient for origin attribution.
- Confirmed actual deployment drift: version-controlled `ops/nginx/discord-oauth-node-bridge-v2026.11.17.4.conf` routes OAuth to `prod_node`, while installed live Nginx snippet routes the same paths to `prod_spring`. The difference is the single `proxy_pass` line. It may reflect the subsequent Spring migration, but the historical "canonical Nest" comments no longer describe deployed routing.
- Independently parsed bounded metadata from the local MCP audit log: 188,196 lines examined, 188,193 parseable at that snapshot, 3 unparsable; a successful `execute_command` audit event at **2026-11-17 07:15:41 UTC / 16:15:41 KST** used a substitution changing the Nginx routing to Spring. The installed snippet filesystem modification time matches. It does **not** identify the human or AI executor.
- Two successful `fs_write_file` audit events on **2026-11-20 05:19:01 UTC / 14:19:01 KST** and **06:20:25 UTC / 15:20:25 KST** contained the Google-unavailable note. Transport was `streamable-http`; the records have no independently authenticated ChatGPT-vs-Gemini identity. Do not equate the Git author or IP with a human/agent executor.
- Read-only local HTTP observations: Spring 4550 `/login` 200 with Discord provider link only; `/api/v1/auth/providers` 200 listing Google and Discord enabled. Internal gateway 4400 returns HTTP302 for both provider start paths. No real provider callback, user consent, sign-in success, or authenticated member session acceptance was tested. An anonymous prelogin session may have been initialized by the authorize GET probe. A local port-80 request to Discord authorize returned 403 under one Host/protocol context, not necessarily the browser's external path.
- Prior November 17 OAuth gateway/state logs record preexisting failures and partial repairs. Current root cause of Discord callback failure remains **not proven**. The app repository is an Android/Kotlin project and does not replace the web/Spring login authority.
- Restricted internal operations evidence created outside the public Git repository under the task-owned private operations directory (file permission 0600). Sensitive security findings and raw audit content are intentionally excluded from GitHub; original audit log and foreign staged files unchanged.

## Finished — v2026.11.22.1 documentation-only incident audit
**Confirmed defects:** (1) Google Spring OAuth implementation is incomplete while provider capability is advertised enabled; (2) Spring native login hides usable Google entry in favor of an explicit unavailable label; (3) deployed OAuth upstream and tracked Nginx source are divergent; (4) historical provider redirect tests are not proof of end-to-end Discord login success.

**Attribution:** `10916dfddf` (Spring OAuth migration) Git author `wtrdd1-hash`, `ac12a17328` (first native auth UI with unavailable Google label) Git author `wtrdd1-hash`, `2ac581b24f` (UI integration) Git author `wtrdd1-hash`, and `88b70b90d7` (later rewrite retaining label) Git author `Hong Jong-hwan`. A successful MCP command is the operational evidence of the deployed Nginx target substitution. **The actual person/AI executing the tool cannot be attributed from these records.**

**Next implementation gates:** In an independently owned fix branch, test provider-advertised capabilities against actual complete authorization+callback contracts; restore Google via verified client registration and callback or show an accurate closed availability status without inventing success; compare exact edge/4400/Spring route and www/base-domain cookies; test state/PKCE, failed-provider and expired-session paths; run an owner-consented real Test callback and session proof, CI/QA, protected zero-downtime promotion with rollback. Treat credential-default and sensitive-provider-body logging findings as a restricted high-priority rotation/containment task. Never disclose secrets in a public PR.

**Verification:** source genealogy, current plan, specific read-only GET/status checks, versioned Nginx-vs-live directive comparison, 188k-entry audit metadata scan, ownership audit and remote-main recheck. No full source tests/build, no E2E provider test, no public UI acceptance. **No source patch, no merge, no production service/config change, no deployment. The HTTP GET to the 4400 OAuth authorize endpoint may have created transient anonymous prelogin records through the Spring handler; this side effect was not independently measured. No schema, member-account, or financial mutation was intentionally executed.** MCP bulk-audit export/summary API failed `Invalid string length`, and no backup success is asserted.
