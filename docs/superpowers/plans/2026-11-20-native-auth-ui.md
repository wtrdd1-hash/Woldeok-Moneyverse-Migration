# Native authentication UI implementation plan

> **For agentic workers:** superpowers:subagent-driven-development; task1 has one isolated implementer, then independent spec/quality review. Existing owner approval selects November18 design and implementation.

**Goal:** Replace captured/static authentication screens with real native Spring MVC/Thymeleaf forms wired to existing verified same-origin authentication APIs.
**Architecture:** One closed authentication-page model and reusable Thymeleaf view uses the approved shared chrome. Keep existing POST/session/email-verification logic authoritative and preserve actual form field/action contracts. Client secrets and tokens remain transient; no fabricated email/authentication success.
**Tech Stack:** Java17, SpringBoot3.3.5, Thymeleaf, browser JavaScript/CSS, Gradle/JUnit and Node built-in tests.
**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md; existing route/control inventory.

## Global Constraints
- Background #0C1020, cards #151D32, violet #9C83FF, blue #64B7FF, text #E9F1FF, muted #A8BCD8. Reuse shared/chrome fragments,44px controls and one56px support entry.
- EN/KO/JA/ZH/VI; existing UiLocale and parity-tested dictionaries. Preserve existing Korean and legal/consent copy; do not invent legal approval or claim provider/email delivery without evidence.
- Work only isolated MiniPC checkout. No live DB/schema/roles/secrets/provider messages, browserfinancialactions, deployment, servicechanges or originalcheckout edits.
- No credentials/tokens in logs,URLs,localStorage or disk. No weakening session,CSRF,reauth,TOTP,CORS,age/consent gates. Existing auth bridge is an input, not yours to modify.
- No subagents. Do not merge or delete branches. Commit/push own reviewed-ready checkpoint; report exact failures/skips.

## Review Focus
- Captured Next $ACTION refs must not survive as fake working forms.
- Bad return URLs must never become an open redirect; form inputs remain on recoverable failures.
- Missing/expired tokens,401/403/429/5xx/offline cannot look successful.
- Passwords/proofs are never persisted or echoed into error text; sensitive reset/verification pages no-store,noindex.
- Language change keeps fields; keyboard,focus,validation,double-submit andmobile safeareas work.

### Task 1: Native authentication route family
**Files:** domain/web/NativeAuthPageController.java; templates/mv43/auth.html; static/assets/mv43/auth-core.js and auth.js; matching NativeAuthWebTest.java and scripts/native-auth.test.mjs; UiLocale.java; ui/mv43-copy.json and static/assets/mv39/i18n.js new auth label entries; chrome.css auth-scoped additions; LocalAuthController.java GET HTML ownership only where necessary; append docs/worklog/2026-11-20-nov18-design-integrate.md.
**Interfaces:** Consume existing shared chrome,UiLocale,actual POST auth contracts and verified session bootstrap from parent. Canonical pages /login,/register,/forgot-password,/reset-password,/verify-email,/verify-email-change,/account-deletion (include only source-backed actions; deletion requires clear irreversible confirmation in product, never automatic). Root/public HTML aliases should consistently render/redirect; API paths must never fall back to HTML. Existing login POST JSON/form compatibility remains.
- [ ] Read applicable AGENTS/skills, actual auth controller/service request/response contracts and existing frontend control inventory; inspect each route's owned GET mapping before edits. If an action is absent, record precise gap and render an honest unavailable state; do not simulate it or manufacture success.
- [ ] Refine route table and field/action matrix in worklog before behavior changes. No changes to UserAuthService/AuthController/AdminAuthService/AdminSecurityController or database files; coordinate root if those contracts block functionality.
- [ ] Write failing real Spring HTML route/locale/cache/alias/security tests and focused client form contract/state tests first. Observe logical RED.
- [ ] Implement MVC+Thymeleaf screens using shared design; preserve login/register/recovery/verification fields and provider links actually supported. Keep legal links/copy/unchecked consent semantics. Requests go to fixed same-origin existing endpoints with valid CSRF/proof where required, correct field names, no arbitrary actor headers and duplicate-submit prevention.
- [ ] Success requires the actual documented response. Do not say mail was sent without a delivery receipt; do not display success on unknown404/5xx. Preserve fields on validation/service failure; clear sensitive values on confirmed logout/account change. Token query values may be consumed in memory for their intended action only and never logged/reflected unsafely.
- [ ] Add all form labels/errors for five languages to the existing catalogs; parity must pass. Safe English fallback for genuinely unreviewed content is explicit and recorded, never raw keys. No captured Next CSS/chunks/hydration.
- [ ] Run focused tests, then full test-profile ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1 plus relevant Node tests. Test profile now isolates media; keep explicit own /tmp media override too. No real provider/email calls or shared DB changes.
- [ ] Self-review, append redacted before/in-progress/finished checkpoint, commit exact task files and push own branch. Report status,commit,RED/GREEN/fullcounts, source gaps and report path. Root owns independent review and integration.

## Pre-flight
One task internally coherent; auth labels/route family consume existing shared interfaces. Parent owns wallet/support/assets/release work and will not edit this task's listed shared locale/catalog/CSS files concurrently. Any source API gap must be surfaced, not silently patched with fake behavior.
