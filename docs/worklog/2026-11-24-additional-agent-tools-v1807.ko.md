# 추가 에이전트 도구 설치 — v2026.11.24.1807

[English](2026-11-24-additional-agent-tools-v1807.md)

상태: IMPLEMENTED (명시된 설치 구성요소); 전체 기능 검증 미완료. 출처: 사용자 제공 사진 3장. Graft는 이름과 기능으로 원본 후보 및 변경된 저장소 확인, 릴스 원본 링크 미확정.

Start / mid / final main: `9876c09888ec84034eec183cf1309c85df3d7447 / 9876c09888ec84034eec183cf1309c85df3d7447 / 9876c09888ec84034eec183cf1309c85df3d7447`.

| Tool | Upstream | Evidence |
|---|---|---|
| Graft / Trail-code | https://github.com/trailhq/Trail-Code | CLI 0.30.5 설치; 합성 코드 그래프 검증 통과; 실제 프로젝트 인덱싱·훅 없음. |
| Agency Agents | https://github.com/msitarzewski/agency-agents | 원본 283개 중 개발·디자인·테스트·보안·제품·기획 110개 격리 등록. |
| Codebase Memory MCP | https://github.com/DeusData/codebase-memory-mcp | v0.12.1 체크섬·버전 검증 및 격리 Claude MCP 연결 확인. 실제 프로젝트 인덱싱 없음. |
| OpenMontage | https://github.com/OpenMontageInc/OpenMontage | 원본 확보, 격리 Python 의존성 검사 및 npm 197개 설치 통과; 실제 영상 렌더링/API 미검증. |
| Claude SEO | https://github.com/AgriciDaniel/claude-seo | v2.6.2 격리 설치, 자동 훅 검증 전 비활성화. 브라우저/SEO 감사 미검증. |
| Claude-Mem | https://github.com/thedotmack/claude-mem | 기존 v16.1.2 격리 설치 및 비활성 상태 유지. 중복 설치 없음. |
| FreeLLMAPI | https://github.com/tashfeenahmed/freellmapi | CLI v0.8.4 설치 및 도움말 확인; 게이트웨이 v0.16.42 이미지 매니페스트 확인. 디스크 90%로 서버 이미지/서비스 미설치, 키·기본 라우팅 변경 없음. |
| Claude Code Setup | https://github.com/anthropics/claude-plugins-official | 공식 1.0.0 격리 활성화, 자동화 추천 스킬 공용·Claude·Codex·Gemini에 연결. |
| Elephant-Goldfish Model | https://github.com/google/elephant-goldfish-model | 0.1.1 격리 Claude 활성화; 독립 설계 리뷰 실행 미검증. |
| 21st.dev MCP | https://github.com/21st-dev/claude-code-plugin | 0.4.1 격리 설치·비활성. 외부 MCP API 키 미설정, 연결 미검증. |

격리 프로필: `~/.local/share/moneyverse/extra-agent-tools`. 원본 및 기록: `~/.local/state/moneyverse/skill-install-20261124-extra`. 테스트/운영 앱 변경, 자동 수집, 외부 키, 회원 데이터, 운영 코드 인덱싱 및 자동 승격 없음. 최신 통합 기획 및 에이전트 격리 우선.

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
