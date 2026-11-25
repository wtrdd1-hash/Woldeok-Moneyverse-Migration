# Additional agent tools — v2026.11.24.1807

[한국어](2026-11-24-additional-agent-tools-v1807.ko.md)

Status: IMPLEMENTED (specified installed components); full end-to-end workflows are not TEST_VERIFIED. Source: three user screenshots; Graft upstream matched by name/function and renamed repository, exact reel origin not confirmed.

Start / mid / final main: `9876c09888ec84034eec183cf1309c85df3d7447 / 9876c09888ec84034eec183cf1309c85df3d7447 / 9876c09888ec84034eec183cf1309c85df3d7447`.

| Tool | Upstream | Evidence |
|---|---|---|
| Graft / Trail-code | https://github.com/trailhq/Trail-Code | CLI 0.30.5; synthetic local graph PASS; DO_NOT_TRACK=1; no real project index, no hooks. |
| Agency Agents | https://github.com/msitarzewski/agency-agents | 283 source personas; 110 selected engineering/design/testing/security/product/project-management personas installed in isolated Claude registry. |
| Codebase Memory MCP | https://github.com/DeusData/codebase-memory-mcp | v0.12.1 checksum PASS; CLI version verified; isolated Claude MCP Connected, analysis profile; no project indexing. |
| OpenMontage | https://github.com/OpenMontageInc/OpenMontage | Source checkout, isolated Python requirements pip check PASS, lockfile npm ci (197 packages) PASS with lifecycle scripts disabled; rendering/API not tested. |
| Claude SEO | https://github.com/AgriciDaniel/claude-seo | Plugin v2.6.2 installed disabled in isolated profile (PostToolUse hook not approved); browser/audit not verified. |
| Claude-Mem | https://github.com/thedotmack/claude-mem | Existing v16.1.2 isolated installation disabled; no duplicate installation. |
| FreeLLMAPI | https://github.com/tashfeenahmed/freellmapi | CLI v0.8.4 installed, help PASS; gateway v0.16.42 manifest exists; gateway image/service not installed due disk 90%; no provider keys or default routing change. |
| Claude Code Setup | https://github.com/anthropics/claude-plugins-official | Official plugin 1.0.0 enabled in isolated profile; shared automation recommender skill linked in four discovery paths. |
| Elephant-Goldfish Model | https://github.com/google/elephant-goldfish-model | Plugin 0.1.1 enabled in isolated Claude profile; independent review workflow not yet executed. |
| 21st.dev MCP | https://github.com/21st-dev/claude-code-plugin | Plugin 0.4.1 installed disabled; remote MCP requires API key; no connection test. |

Private profile: `~/.local/share/moneyverse/extra-agent-tools`. Source checkouts and logs: `~/.local/state/moneyverse/skill-install-20261124-extra`. No production/Test app changes; no auto capture, provider secrets, real customer data, production indexing or automatic promotion. Preserve latest integrated planning, explicit skill invocation and agent isolation.

## Source commits
```text
21st f76b07aec6e65a582abe4b20bf3ec7b0fa64968a
agency 8ae6164602c95ca78828b148b9052460ee426885
egm ef27af6b1d76901d09bb346eea62ce377546052f
free cd65d6485788dfc7828f06c1147cdea207b28322
graft d8a59c17cf58abdbbaa2ba310c103b2fb38ca802
montage 2e003e65fa99a0f329478a2c1cdcf26bc481933a
seo 468ed5b0d9e3249394783710e54abb02837e326b
setup 5cec6716767283f4675a05f5f8855b5b49c81783
```

## Server-time log
```text
2026-11-24T18:04:06+09:00 START additional screenshot tools audit
2026-11-24T18:05:38+09:00 CHECKPOINT four native plugins registered in isolated profile
2026-11-24T18:05:55+09:00 CHECKPOINT codebase memory release checksum verified; agency selected personas registered
2026-11-24T18:06:14+09:00 CHECKPOINT pinned CLI installation and isolated MCP registration
2026-11-24T18:06:58+09:00 CHECKPOINT OpenMontage source and isolated Python environment prepared
2026-11-24T18:07:06+09:00 CHECKPOINT local smoke tests and shared setup skill verified
2026-11-24T18:07:25+09:00 CHECKPOINT OpenMontage composer setup attempt; no provider gateway or production services started
2026-11-24T18:07:52+09:00 FINISH installed components verified; no application Test/Production promotion; external API credentials not configured
```

## v2026.11.24.1814 — FreeLLMAPI gateway follow-up

Owner authorized proceeding while disk cleanup is in progress. Installed pinned v0.16.42 image `ghcr.io/tashfeenahmed/freellmapi@sha256:87eeb14eed0e8815fb0b13d50611586d61139ddf542460ac27dda015bdfdb42d`. Container `moneyverse-freellmapi-local` binds `127.0.0.1:20129`, separate persistent volume, restart unless-stopped, 768 MiB RAM, 0.75 CPU, 128 PIDs, bounded logs. Ping and dashboard HTTP 200, unauthenticated models HTTP 401; existing OmniRoute health OK. Provider keys and real model calls not configured/tested. Disk cleanup untouched. No app Test/Production deployment. Main: `9876c09888ec84034eec183cf1309c85df3d7447`.

```text
2026-11-24T18:13:48+09:00 START FreeLLMAPI gateway follow-up authorized by owner; disk cleanup concurrent, no cleanup by this task
2026-11-24T18:14:01+09:00 CHECKPOINT gateway immutable image resolved; credentials generated locally and not logged
2026-11-24T18:14:25+09:00 CHECKPOINT gateway started; loopback ping and existing OmniRoute health verified
2026-11-24T18:14:43+09:00 FINISH FreeLLMAPI gateway HTTP ping and dashboard 200, unauthenticated models 401, local only; no application deployment
```
