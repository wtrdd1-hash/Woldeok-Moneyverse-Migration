# Development C v1322 — Administrator Role Visibility Evidence

Status: DRAFT / RELEASE HOLD. Base: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`.

## Problem and implementation

The authenticated administrator controls overview calls `admin_list_roles`, which invokes the SQL `admin_require_superadmin` gate. The intentional SQLSTATE 42501 role refusal was not handled by the controller, causing a 500 for ordinary administrators. Other expected failures were silently presented as an empty role list. The change adds an explicit `rolesEvidence` field to the Nest response (`VERIFIED`, `RESTRICTED`, `UNAVAILABLE`) and validates it on the Next admin page. Restricted and unavailable states do not reveal role rows, cannot be interpreted as zero roles, and block role mutation forms until the source is verified. A genuine PostgreSQL `42501 permission denied for ...` still propagates as a server error. No DB schema, security-definer function, role grant, economy ledger or financial mutation is changed.

## UX, security and verification

The administrator role card retains responsive layout, keyboard-reachable retry and screen-reader status/alert semantics. Existing admin session authorization and page `robots: noindex` remain. Tests cover backend intentional refusal versus missing privilege and frontend malformed/restricted/empty states. RED and GREEN evidence, exact SHA gates, live PostgreSQL, CI and release decisions are recorded in the task's internal log and PR; PASS must not be inferred from a prior run. Production and Test remain untouched until every release gate passes.

## HTTP privacy / SEO regression
A separate RED test confirmed the global Next.js X-Robots-Tag index,follow would override the admin page metadata. The specific admin controls path and localized variants now return noindex,nofollow, private,no-store and no-referrer. This is scoped to the existing private page; no new API or public route.
