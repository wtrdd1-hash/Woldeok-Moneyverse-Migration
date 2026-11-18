# QA Practice Reference — QA실무노트 (@qaonetop), verified public caption research

> Version v2026.11.18.16 · English canonical · [한국어](QA_PUBLIC_PROFILE_REFERENCE_v2026.11.18.16.ko.md) · Research evidence, not a QA test or original-video transcript.
> Snapshot 2026-11-18 KST. Accessible source: public Instagram profile and anonymous embedded-public *post captions*. 74 media counted by the page at inspection; **only the six caption-accessible reels below** were reviewed. Profile/metrics/availability can change. Entire account, audio, story highlights, frames, paid/private content were not verified.

## Public profile context
- [QA실무노트 (@qaonetop)](https://www.instagram.com/qaonetop/), public profile self-description: publishes software QA information, describes embedded/web/app QA experience, shares practical QA experience.
- Distinguish this Korean educational account from similarly named QAonTOP company accounts. Same brand words are insufficient evidence of shared identity/ownership.
- This source provides learning prompts, not authority to override ISTQB or canonical Moneyverse planning/security/finance gates.

## Six evidence-linked captions and exact scope

| Reel | Public caption-confirmed theme | Moneyverse QA design application (our recommendation) |
|---|---|---|
| [Df25MnXybqW](https://www.instagram.com/reel/Df25MnXybqW/) | 12 QA process stages, requirements through closure | Enforce 12-stage test ledger with explicit NOT_RUN and GO/NO-GO decisions |
| [Df1gBVOR55n](https://www.instagram.com/reel/Df1gBVOR55n/) | Title says 12 testing types; the caption does not provide the full type list | Use separately project-authored QA coverage taxonomy; do NOT attribute it as 12 specific types stated by creator |
| [Df05BgtRMpe](https://www.instagram.com/reel/Df05BgtRMpe/) | Twelve concepts: defect types, boundary, equivalence, decision tables, state transition, pyramid, regression, V-model, coverage, pairwise, lifecycle, risk-based | Build explicit assertions including authorization, money boundary, source failure, retry/idempotency and state transitions |
| [Df0byjESMAd](https://www.instagram.com/reel/Df0byjESMAd/) | Unit tests check a small component, integration checks connections/request→DB, E2E checks whole user experience; widen scope only where it adds assurance | Separate isolated unit assertions, actual Spring+PostgreSQL integration, member/admin browser flow; do not promote from HTTP-only tests |
| [DfyqzZRunoC](https://www.instagram.com/reel/DfyqzZRunoC/) | Nine collaborating roles: PO, PM, service planner, designer, frontend, backend, QA, DevOps, operations manager | Record requirement owner, defect triage owner, API/UX handoff, who can approve release and who operates the rollback |
| [Dfx9roYRhcV](https://www.instagram.com/reel/Dfx9roYRhcV/) | Mobile app screen states: splash, onboarding, permission request, login prompt, empty, error, inspection, forced update, completion | Include accessible Android-supported states and recovery paths in route/role/fixture test inventory; do not pretend unimplemented states exist |

## Source-to-test design, limitations, future checks
1. User-supplied educational posts are **source evidence for topics only**. Case IDs, pass criteria, classifications, schedules and risk thresholds are Moneyverse project design choices, not verbatim creator guidance.
2. Captions are not the same as verified slide frames or spoken lecture, and a single retrieved page cannot establish completeness of the account. Do not claim all 74 posts were analyzed.
3. Reference verification should be repeated before incorporating new material, including screenshot/video-level review only if legitimately available. Cite direct permalink and access date; never scrape private data or commit cookies.
4. Redefine any established route inventory after Spring migration using real candidate pages and Android entry points; source count snapshots from earlier releases are not current QA evidence.

## Implementation references
- Related draft [v2026.11.18.15 QA methodology PR #3269](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3269) documents 12 phases, 12 concepts and the **original** Moneyverse coverage buckets.
- The independent [v2026.11.18.16 scheduled semantic QA spec](../operations/QA_SCHEDULED_SEMANTIC_RUNBOOK_v2026.11.18.16.md) operationalizes only a few safe anonymous assertions. It is not a substitute for authenticated functional QA, Android instrumentation or money-ledger checks.
