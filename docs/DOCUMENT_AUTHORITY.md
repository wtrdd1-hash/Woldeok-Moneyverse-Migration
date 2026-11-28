> **CURRENT OWNER OVERRIDE / 최신 사용자 지시 — v2026.11.28.2027.1.** [Frontend rebuild authority](planning/FRONTEND_REBUILD_MASTER_v2026.11.28.2027.1.md). All earlier visual plans, images, palettes, tokens and visual acceptance directives below are historical only, not fallback. Functional, financial, security, accessibility and release contracts remain binding. Frontend rebuild is highest ordinary priority.

# Current Document Authority

**Version:** v2026.11.24.DOCSYNC.1 · **Owner-confirmed rules; integration candidate, not runtime acceptance.** [한국어](DOCUMENT_AUTHORITY.ko.md).

## Read order

1. Current explicit owner instructions, including recorded conflict decisions below.
2. This authority register and the [frontend architecture decision](planning/FRONTEND_ARCHITECTURE_NOV23_NEXT_SPRING_v2026.11.24.FEARCH.1.md).
3. [Project plan](planning/PROJECT_PLAN.md) and [integrated master](planning/INTEGRATED_PLANNING_MASTER.md) for business requirements; detailed specifications apply only to their adopted scope.
4. [Infrastructure](INFRASTRUCTURE.md), [release procedure](RELEASING.md), exact immutable candidate/runtime receipts and database contracts for observed execution facts.
5. Indexes and dated records for navigation and history. A higher version string, closed PR or successful PNG generation is not implementation or deployment acceptance.

A document in an unmerged branch is a candidate unless the owner has explicitly approved its direction. That approval does not merge code or change a running server.

## One target, separate current facts

| Subject | Current rule |
| --- | --- |
| New frontend | Next.js16 / React19 / TypeScript / Tailwind4, independent presentation server and same-origin server-only BFF |
| Backend | Spring Boot owns identity/session/roles, profiles, APIs and business contracts; PostgreSQL restricted functions retain ledger authority |
| Existing presentation | Spring MVC/Thymeleaf and legacy Next/static screens are transitional implementations; preserve verified behavior until gated replacement |
| Legacy Nest | Existing code/gateway dependencies require endpoint mapping before retirement; their presence does not select Nest as the new backend |
| Design | Nov23 revised v10, immutable39888c7d26bdf688737a77b93a7da29e230b4168; preserve Nov18/v8/v10 assets and per-screen approval status |
| Logo | Actual existing favicon bytes, never a replacement letter W or generated imitation |
| Money and data | Canonical integer strings for balances, exact decimal arithmetic where required, real actor-bound APIs/receipts; no Number(balance), mock success or fake fallback prices |
| Identity UX | Spring-verified identity/profile/roles, no-store user responses, honest loading/empty/error/session-expired states and no cross-user leakage |
| Languages | EN default, KO second, JA/ZH/VI; explicit supported user selection and deterministic saved/browser fallbacks |
| Runtime authority | Measured MiniPC Debian/systemd/Nginx with isolated real Test data; discover active PID/upstream/artifact each run. Kubernetes/Flux is a recovery/target record |
| Release | Image preparation may be automatic after required checks. Actual Production cutover needs separate owner approval and exact independent Test/rollback evidence |
| Current task | Branch integration/document consistency; no runtime/DB cutover. Existing frontend implementation remains Test-only |
| Work persistence | A task request includes task-branch commits/pushes and checkpoints. Main integration needs a separate instruction; the current request explicitly authorizes branch integration |
| Attribution | No generated-source badges/watermarks in product UI or commits. Factual tool references and work provenance are allowed in technical records; no automatic author trailers |

## Confirmed command conflicts

| ID | Old conflicting directives | Owner-confirmed resolution |
| --- | --- | --- |
| DOC-C01 | New UI must use Thymeleaf versus Next/BFF + Spring | Prior explicit approval of PR3423 selects Next/BFF + Spring for new UI; legacy behavior remains until replacement |
| DOC-C02 | Manual release wording versus workflow-run image preparation | Automatic image preparation allowed; actual Production cutover requires separate approval |
| DOC-C03 | Blanket tool-name ban versus technical reference/work attribution requirements | Ban UI/commit generated-source marking; allow factual references and work records |
| DOC-C04 | Mandatory checkpoint commits/pushes versus commits only when asked | Task request includes branch commits/pushes; main integration separately requested |
| DOC-C05 | NixOS/Kubernetes described as current versus measured Debian host | Infrastructure's measured Debian baseline governs observations; cluster descriptions are recovery/history |
| DOC-C06 | Current maintenance503/complete migration claims versus later runtime findings | Dated statements are snapshots. Re-query actual runtime; do not certify current state from a README or repository SHA |

C02/C03/C04 were explicitly answered by the owner during this task. C01 was already approved; C05/C06 reconcile dated evidence, not a new infrastructure choice. Ask the owner before replacing any newly discovered unresolved contradictory instruction.

## Historical-document interpretation

Versioned worklogs, releases, QA, findings, updates and dated plans retain their original evidence. They cannot override this approved frontend technology choice or the current owner scope. Business/security rules in adopted plans remain binding. Do not rewrite old failures as passes or discard original assets to make documentation look consistent.

The repository inventory reads every unique tracked Markdown/text blob across captured branch tips. Automated instruction/link matches are review candidates, not a claim of semantic manual approval of every sentence. Current entry points link here; old receipts remain time-bounded. Open acceptance and branch-integration blockers stay visible.

## Distinct route counts

The original-route contract's92 routes and the design/QA inventory's180 routes count different sets. Do not change the original-route invariant to force equal counts. Every changed screen still requires its handler/API/data/role/locale/viewport evidence.

## Completion evidence

Integration requires source-bound checks and preserved branch changes. Branch deletion requires re-fetch, expected-head comparison, main ancestry and added-file review. A closed PR, squash label or branch name is insufficient. Never reset/remove another worker's dirty tree.

Release requires exact application source, artifact and served resource hashes, real authenticated contracts, independent Test, security/DB checks and a usable inverse. Documentation-only changes do not authorize runtime deployment or certify all functions.
