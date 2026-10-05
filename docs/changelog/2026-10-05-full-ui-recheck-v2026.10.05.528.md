# v2026.10.05.528 — Full UI Recheck

**English canonical** | [한국어](2026-10-05-full-ui-recheck-v2026.10.05.528.ko.md)

## Scope
Documentation/evidence-only full UI recheck against current authority and runtime identities.

## Findings
- Current main inventory: 138 page routes, including 25 administrator and 24 dynamic routes.
- Production/Test are older candidates (112/122 page routes respectively), so current-main exact-candidate acceptance evidence does not exist.
- P0: current Test/main fallback locale is English although current authority requires Korean product/public fallback.
- P1: global 320px onboarding panel can clip because it is fixed at 340px below `sm`.
- P1: shared interaction primitives and multiple global/route controls permit sub-44px targets.
- P1: global skip-link text remains Korean under explicit EN/JA/ZH locale.
- P1: mobile navigation implementation conflicts with maintained App Spec and Design System navigation models.
- P2: partial public HTTP smoke found body-transfer timeouts on Production `/newspaper` and Test `/shop`.

## Runtime/release statement
No source fix, Test deployment, Production deployment, database change, migration, or promotion was performed. Release sign-off remains blocked pending remediation and exact-SHA full-route browser QA.
