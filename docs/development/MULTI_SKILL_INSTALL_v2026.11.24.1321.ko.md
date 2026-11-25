# 다중 스킬 설치 — v2026.11.24.1321

미니PC 개발 계정 전용. `~/.agents/skills/`, `~/.claude/skills/` 양쪽 83종 존재 확인, 신규 폴더 복사 160건 바이트 검증. 기존 UI UX Pro Max·Superpowers·Gemini·Claudex 유지. Anthropic frontend-design 기존 양쪽 유지, 4종은 기존 한쪽 유지.

## 요청 원본
- https://www.instagram.com/p/DaCxFUSDyC9/
- https://www.instagram.com/reel/DewCJcSS2-7/
- https://www.instagram.com/reel/DfrUP9ID4hx/
- https://www.instagram.com/reel/DfKcfEcid_V/

릴스 3개 공개 설명에서 스킬 이름 확인. 첫 캐러셀은 플러그인·스킬·MCP 각각 8개(총 24개)라고 소개하나 세부 명칭은 공개 설명·이미지 접근성 설명으로 확인 불가. Notion·Gmail·Zapier 언급만 확인. 계정 연동 및 권한 부여 안 함.

## 적용 및 검증 범위

83종 메타데이터 검증 및 양쪽 설치 경로 존재 확인. 신규 복사본은 명시적 호출 설정, 내장 훅·자동 도구 권한 제거, Real SFX 원본 YAML 따옴표 오류 정규화, 개인 설정 제외. agent-browser 0.44.0 고정 npm 실행기 설치 및 사용자 로컬 심볼릭 링크 생성, 버전과 core 도움말 정상; 브라우저 렌더링 미검증. PATH에 사용자 로컬 bin 추가가 필요할 수 있음. GSD Core 1.23.0은 별도 HOME·설정 루트에 Claude/Codex 각각 핵심 8종 설치 성공; 기존 프로필 미활성. 원본 소스 설치기는 생성 모듈 누락, 배포 패키지 설치 성공. Graphify·REA 스킬 지침 설치, CLI/MCP 엔진 미구성. Real SFX 음원 라이브러리·n8n MCP·Remotion 실행 프로젝트 의존성 미구성/미검증. ECC·Matt Pocock은 선별 설치, 나머지는 원본 보관, 전역 훅 미적용. 프로젝트 최신 통합기획·Superpowers·Test/운영 승격 규정 우선. 앱·DB·예약·Test/운영 서버 변경 없음.

## 스킬 및 고정 원본 커밋
| Source | Pinned SHA | Skills |
|---|---|---|
| https://github.com/Clipwing/skills.git | `edbefcbc3474869e6cc1e8a7ca583b0efd0dab7e` | real-sfx |
| https://github.com/DietrichGebert/ponytail.git | `ebd8654c2c627f721eb8f9c0d1bd4090a29f9e10` | ponytail |
| https://github.com/JuliusBrussee/caveman.git | `b89752f6bca5a26bfde8b019813554241800ca99` | caveman |
| https://github.com/Leonxlnx/taste-skill.git | `6c0b5c78f5d31776e2210305abaa210cdc0030bf` | design-taste-frontend |
| https://github.com/affaan-m/everything-claude-code.git | `4adeee6732a12d1540f49a4d50a38ce8c97f9a53` | api-design, browser-qa, e2e-testing, java-coding-standards, postgres-patterns, security-review, springboot-patterns, springboot-security, springboot-tdd, springboot-verification, verification-loop |
| https://github.com/anthropics/skills.git | `e4bb5d960d87126ff3b3a8af1a104b7db67560ba` | academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx |
| https://github.com/blader/humanizer.git | `a32f24407364c74c812b43c15926d638bee1e072` | humanizer |
| https://github.com/czlonkowski/n8n-skills.git | `ecdeca6f760b56bb1b11c0a7c961f11b69cb87d5` | n8n-agents, n8n-binary-and-data, n8n-code-javascript, n8n-code-python, n8n-code-tool, n8n-error-handling, n8n-expression-syntax, n8n-mcp-tools-expert, n8n-multi-instance, n8n-node-configuration, n8n-self-hosting, n8n-subworkflows, n8n-validation-expert, n8n-workflow-patterns, using-n8n-mcp-skills |
| https://github.com/forrestchang/andrej-karpathy-skills.git | `2c606141936f1eeef17fa3043a72095b4765b9c2` | karpathy-guidelines |
| https://github.com/mattpocock/skills.git | `abeeaf95660ba9e8b7c753eb38f441ca707a8823` | code-review, codebase-design, diagnosing-bugs, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, tdd, teach, to-spec, writing-for-agents |
| https://github.com/morluto/rea.git | `46b73f5b8116ac71333a0c37980f166c13bedd4e` | reverse-engineer-anything |
| https://github.com/remotion-dev/skills.git | `89c8afa3eee9cdd83838ac31979c2ba1384615aa` | remotion-best-practices, remotion-captions, remotion-create, remotion-docs, remotion-interactivity, remotion-license, remotion-maps, remotion-markup, remotion-multimedia, remotion-render, remotion-saas, remotion-studio, remotion-upgrade |
| https://github.com/safishamsi/graphify.git | `013a6461c31da6e003c0dea191aca84c94cb8d47` | graphify |
| https://github.com/vercel-labs/agent-browser.git | `0a923358ea989d7602f0d06507ad3447c62ffe9b` | agent-browser |
| https://github.com/vercel-labs/skills.git | `57217cf86ba38148a57af9e90d14a4c049558330` | find-skills |

## 서버 시간 작업기록
```text
2026-11-24T13:21:25+09:00 START: identify sources; preserve existing skills and services
2026-11-24T13:22:03+09:00 CHECKPOINT: pinned sources retrieved; select standalone skill files; no global hooks or permission changes
2026-11-24T13:22:18+09:00 CHECKPOINT: skill file installation and byte comparison completed
2026-11-24T13:22:25+09:00 CHECKPOINT: selected skill files installed; upstream metadata failures held
2026-11-24T13:23:03+09:00 CHECKPOINT: real-sfx YAML corrected; agent-browser CLI 0.44.0 verified; GSD isolated Claude/Codex install logs successful; no live service change
2026-11-24T13:23:11+09:00 DOCUMENTATION: dedicated worktree created from current main
2026-11-24T13:23:34+09:00 FINISH: 83 skill names present in both roots; 160 new copies byte-verified; GSD 8+8 isolated; runtime smoke limited to CLI version and core help; no app, database, scheduler or deployment change
```
