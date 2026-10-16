# v2026.10.16.721 — AI blog integration, exact-SHA Test and Production promotion

**English canonical | [한국어](2026-10-16-ai-blog-integration-v721.ko.md)**

## START — 2026-10-16 KST
- Explicit user approval: repair the v719 blog candidate, integrate via PR and delete obsolete branches; pass CI and Test, then attempt safe zero-downtime Production promotion subject to all required gates.
- `origin/main` at task start: `b7cf876e6bd732ceaa5160456c9f839bd17abd6e`, branch base isolated from other agents.
- Old blog PR #888 source `819b4dcc788eb98f1aaa84da1afe5faf97ba164e`, CI all PASS but GitHub mergeability CONFLICTING because newer v719 UI documents use the same update filenames. Preserve newer UI changes and uniquely version blog integration as v721.
- Read document precedence `docs/DOCUMENTATION_POLICY.md`, integrated master and project plan, v719/v720 UI release and hold notes, `docs/RELEASING.md`, `docs/operations/production-deployment.md`, v717 blog hold and v719 AI blog audit.
- Current official Test points at v719.2 UI and Production points at v717. No changes yet to active Test/Production databases, live sessions or traffic.

## MID — 2026-10-16 17:27 KST
- Re-fetched `origin/main=b7cf876e6bd732ceaa5160456c9f839bd17abd6e`, unchanged. Transplanted v719 candidate into v721 isolated worktree using `cherry-pick --no-commit`. Four add/add conflicts were v719 internal/GitHub update filenames from concurrent UI remediation; preserved main v719 documents and moved blog updates to distinct v721 filenames.
- Exact candidate workspace `pnpm install --offline --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm lint` all exit 0. Backend: 1,216 pass, 396 database-dependent skipped; frontend: 1,249 pass; repository lint: 0 errors, 1,075 existing warnings. No production data writes.
- NEXT: commit, PR CI, exact-SHA official Test/DB/session acceptance and deployment gate inspection.

## END — 2026-10-16 17:50+ KST (release status: TEST_VERIFIED, PRODUCTION_BLOCKED)
- GitHub PR #891 merged `10d5dfdbe96d9445adbbce6acb2696e060b772bb`, same Git tree `6a60fbb5` as approved branch. Original conflicting PR #888 was commented/closed and obsolete remote/local branch deleted. #891 remote branch auto-deleted on merge; remaining local integration worktree is owned by this task and may be removed safely after release notes.
- Branch CI #38874050620, merged-main CI #38874931825 and main Test image build #38874931833 SUCCESS.
- First immutable Test v721.1 at branch SHA passed source/health/auth/blog; second immutable Test v721.2 at exact merged-main SHA passed host identity and auth restart continuity, public blog 6 approved items, sitemap 28 URL, historical article noindex, unauthorized POST 403; synthetic session revoked. Test-specific browser 5 rounds ×3 widths ×9 routes = 135/135 pass.
- Found Production added a 16:16:41 KST legacy AI article after v717 publication hold, and 4 older frontend instances with unsafe publication code. Exact write caller remains unidentified. Backed up shared store then set 0444 without changing content (sha256 recorded in release notes). Production/Test blog GET remained 200; this is a reversible emergency write-containment change, **not** an application rollout.
- Deployment decision: **NO Production application cutover.** Existing v530 full authenticated all-page 5-pass and Treasury/Economy financial DB/ledger P0 mandatory gates not passed. Public Production remains v717; Test is v721.2. Record full acceptance and blockers in [v721 release](../releases/v2026.10.16.721.md) and [operational runbook](../operations/BLOG_LEGACY_EDITORIAL_HOLD_RUNBOOK.md).
