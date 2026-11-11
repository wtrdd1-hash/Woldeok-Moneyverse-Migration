# Agent Skills Audit and User-Level Installation — vSKILL.2026.11.11.001

## Before work / 작업 전
- Owner scope: expand trusted development, planning, design, QA, and security agent skills for the Debian miniPC. No app source, migration, user balance, runtime service, or production change is authorized or needed.
- Environment: [$pc] (minipc-hong) first. Local source branch `main` was behind published `origin/main`; fetched and resolved current source authority to `d0f4a44503acb7cbaa5af118280dfc56311c989c` at start.
- Read the updated `AGENTS.md`, `README.md`, document index and authoritative EN `docs/planning/PROJECT_PLAN.md` / KO `.ko.md` for this scope. Existing release HOLD and no-test-bypass policies remain effective.
- Before installation: ChatGPT/plugin-backed skill catalog has 74 entries, but local `/home/debian/.agents/skills`, `.gemini/skills` and `.claude/skills` did not exist. Hosted ChatGPT skills are not installed by copying server files.
- Inventory sources (reviewed before copying): official `obra/superpowers` (commit `22f0b463e7a5e579904dd6211a520321035526f7`), `vercel-labs/agent-skills` (`1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`), `anthropics/skills` (`2c5958ecac7cee2b583967a2c4981d0f4a75c579`), and `trailofbits/skills` (`e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff`).
- Isolation: new `docs/skills-20261111-v001` Git worktree; no concurrent agent files overwritten. Separate server-local log under `~/.local/share/moneyverse-skill-audit/2026-11-11-skills.log`.
- Candidate selection: source folders and metadata only, not unknown scripts or automatic npm hooks. Security/license inventory precedes any installation. No third-party skill is permitted to override user/project instructions.

## In progress / 진행 중
- [x] Complete source manifest and static inspection.
- [x] Install verified skill folders into user-level `~/.agents/skills`, without altering production application dependencies.
- [x] Independently inventory names, source fingerprints, content integrity, and Codex discovery prerequisite.
- [x] Recheck origin/main and preserve staging/production policies.
- [x] Publish final English/Korean worklog and explain ChatGPT-hosted versus minipc-local scope.

## In-progress evidence / 작업 중 검증
- Fetched `origin/main` again mid-task: `9f73c89f3ed18aad42bd0ee019c24a7f86b8f41b`. This task modifies no application code and does not merge anything into main.
- Official repositories downloaded at pinned source commits with sparse checkout; no npm installers, repository hooks, external scripts, or model-side agent invocations executed.
- Per-skill `SKILL.md` frontmatter name and the content of the full copied folder were verified. Symlinks, collisions and files above 3MB were disallowed. Source-to-destination SHA-256 inventory comparison PASSED for every installed directory. This is a structural/integrity check, **not** a full security audit of embedded scripts.
- `codex-cli 0.162.0` installed; local `skill_search` and `multi_agent` features report enabled. A Gemini executable was not found; future Gemini CLI discoverability is NOT confirmed.
- The 74 ChatGPT plugin-backed skills remain separate from the 31 local miniPC skills; copying server files does not install new hosted skills.

## Installed skill inventory / 설치 목록

| Source | Official source commit | Installed user-level names |
| --- | --- | --- |

| [superpowers](https://github.com/obra/superpowers) | `22f0b463e7a5e579904dd6211a520321035526f7` | `brainstorming`, `diagnosing-superpowers`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills` |
| [vercel](https://github.com/vercel-labs/agent-skills) | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions` |
| [anthropic](https://github.com/anthropics/skills) | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | `frontend-design`, `webapp-testing`, `doc-coauthoring`, `mcp-builder`, `skill-creator` |
| [trailofbits](https://github.com/trailofbits/skills) | `e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff` | `audit-context-building`, `differential-review`, `post-patch-validation`, `property-based-testing`, `spec-to-code-compliance`, `supply-chain-risk-auditor` |

## Finished / 작업 종료
- **Installed:** 31/31 skills in `/home/debian/.agents/skills`; all directory copies independently rehashed and match source manifests. `~/.local/share/moneyverse-skill-audit/installed_skills_vSKILL001.json` contains source path, exact SHA, relative paths, hashes, and file counts.
- **Scope:** guidance only for local agents such as Codex; user-level paths shared with compatible agents. Server application runtime/DB/migrations, CI, Production and Test deployments: **NOT CHANGED / NOT RUN**. Not a software release. No production promotion was necessary or performed.
- **Catalog:** hosted ChatGPT skill count 74 before and after; miniPC-local installed count 31 (two independent catalogs, NOT 105 ChatGPT skills). Actual autonomous application of these skills on a future task remains unverified until each agent logs use.
- **Safety:** project operating directives, source-of-truth planning, concurrency protections, TDD, exact-SHA Test release gates and English-first/Korean-second document convention remain unchanged.
- **Remaining gaps:** a Gemini CLI binary was not present on this host, so Gemini CLI runtime activation remains unverified; browser/Playwright runtime dependencies were not provisioned; skill instructions require separate validation before executing scripts. No claim of passing real browser E2E or staging is made.

### 한국어 확인 요약
- Debian 미니PC의 사용자 계정에 공식 제공처 4곳의 스킬 **31개 설치 및 파일 해시 검증 완료**.
- Superpowers 15, Vercel 5, Anthropic 5, Trail of Bits 6.
- 설치 경로: `/home/debian/.agents/skills`. 내부용 설치 증빙: `/home/debian/.local/share/moneyverse-skill-audit/installed_skills_vSKILL001.json`.
- ChatGPT 자체 스킬 74개와 미니PC 로컬 스킬 31개는 별도이며 합산 설치로 오인하지 않는다.
- 서버 운영 코드·데이터베이스·배포 변경 없음. Gemini CLI와 Playwright 실제 실행 검증은 별도 작업 사항.
- GitHub에는 격리된 `docs/skills-20261111-v001` 브랜치의 검토용 작업 기록만 제출한다.
