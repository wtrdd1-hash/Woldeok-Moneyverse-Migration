# Planning v1264 — F675-123 verified calendar watchlist and private ICS export

**2026-10-25 KST — FEATURE ADDITION / DOCUMENTATION ONLY / DRAFT / RELEASE HOLD**

Previous Feature Improvement v1262 → Current Feature Addition v1264 → Next Feature Improvement v1266 provisional. Source main `c9a868b1e622341e2daa8b936ddf0988eda9988e` checked at start/mid, AGENTS/README and canonical English/Korean PROJECT_PLAN reviewed. Previous unmerged Draft #1261 remains separate. Engineering issue [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267).

Inspected actual Next calendar and shop deadline helper, Nest season event controller/repository and Android app-api gateway. Main has server-backed season/shop deadlines but no identified member watchlist or ICS; daily personalized event and computed weekly reset excluded from saved future deadlines. Plan adds owner-only verified watchlist, immutable request receipts, 100-item cap, current-source revalidation, RFC5545 authenticated snapshot export, no public subscription/reminders and no financial mutation. Ten P0/P1 handoff items documented in both languages.

Latest completed QA v1265 FAILED/HOLD. v1266 audit artifacts show full Critical2/High10, production High2, bot test 8/8; no overall PASS. Root disk 100% (~349MiB); excessive DB ACL, migration266/280, frontend six failures and exact-SHA Test/restore unresolved. External design standards reviewed from RFC Editor, OWASP and W3C; accepted independent evidence +0, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.

This planning run does not deploy or alter runtime code, DB, WLD, ledger, feature switches, Test, Production or other workers' branches. Development must use a separate branch and independent exact-final-SHA Test gate.
