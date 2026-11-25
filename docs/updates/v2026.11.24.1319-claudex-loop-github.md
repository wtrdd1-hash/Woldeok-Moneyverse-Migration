# Claudex Loop installation — v2026.11.24.1319

Status: installed on Debian miniPC development account; no application, Test or Production deployment.

Source: https://www.instagram.com/reel/DfmlL5ETNsn/ (public caption verified); upstream https://github.com/chaseai-yt/claudex-loop, MIT, pinned commit `53cddc42e39346fb8c6d5d612281a3b1add14e66`.

Installed four upstream skills (`claudex-loop`, `claudex-route`, `codex-build`, `codex-review`) in both `~/.agents/skills/` and `~/.claude/skills/`. Existing Codex–Gemini pingpong is preserved. New sessions are required for discovery. Invoke `$claudex-loop` in Codex or `/claudex-loop` in Claude Code. Python 3.13.5; Claude Code 2.1.331 and Codex 0.162.0 authentication checks succeeded. Upstream metadata validator passed; 37/37 offline unit tests passed; all eight installed directories matched source; runner help passed. Live cross-provider review/build was not executed.

Project rules remain authoritative: current main and integrated plan first; isolated owned worktree; no secrets/member data in handoff; bounded review (five rounds by default), independent inspection and real Test gates; no automatic Production promotion. Do not bypass permissions or treat an incomplete review as approval. Gemini remains a separate collaboration path, not a native Claudex provider. No scheduler changes.

Rollback: remove only the four newly installed directories from each skill root after checking ownership; do not remove pre-existing skills. Update only after reviewing a new pinned upstream revision and rerunning validation.

## Start / checkpoint / finish (server time)

```text
2026-11-24T13:19:32+09:00 START: identify upstream, inspect project rules and installed skills; no service changes
2026-11-24T13:19:46+09:00 CHECKPOINT: upstream 53cddc42; project main 9876c09888ec84034eec183cf1309c85df3d7447; both CLI logins confirmed; no runtime changes
2026-11-24T13:20:04+09:00 PRE-INSTALL main=9876c09888ec84034eec183cf1309c85df3d7447; metadata and 37 tests pass
2026-11-24T13:20:05+09:00 FINISH: four skill directories installed in both hosts; 8 copies verified; existing Gemini pingpong preserved; live model loop not run; no service changes
```
