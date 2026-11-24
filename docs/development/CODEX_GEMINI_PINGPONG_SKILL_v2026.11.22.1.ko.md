# Codex ↔ Gemini 교차 검토 핑퐁 스킬 — 머니버스

**버전:** v2026.11.22.1 | **상태:** IMPLEMENTED (미니PC 설치, 실제 모델 간 통신 미검증) | [영문 정본](CODEX_GEMINI_PINGPONG_SKILL_v2026.11.22.1.md)

## 목적과 범위

GPT/Codex와 Gemini가 동일한 요구사항을 검토하고 의견을 주고받는 스킬을 설치하고 GitHub에 기록합니다. 외부에서 검증되지 않은 오케스트레이터를 그대로 실행하는 대신, **작동 방식과 권한을 검증할 수 있는 자체 스킬** 및 최대 3회 읽기 전용 검토 실행기를 만들었습니다. 자동 코드 병합·배포 기능은 포함하지 않습니다.

사용자 제공 릴스: https://www.instagram.com/reel/DeeE-i9vuK2/ (실제 영상 내용은 직접 검증하지 못함). 이전 [AgentMemory 프로토콜](AGENTMEMORY_SHARED_AGENT_MEMORY_v2026.11.21.2234.ko.md)과 별개이며 영구 메모리 서비스가 아닙니다.

## 설치 현황

| 구성요소 | 설치 경로 | 검증 |
| --- | --- | --- |
| 저장소 원본 스킬 | `.agents/skills/codex-gemini-pingpong/SKILL.md` | 신규 브랜치 PR 대상 |
| 사용자 공유 스킬 | `/home/debian/.agents/skills/codex-gemini-pingpong/` | 로컬 설치 및 해시 대조 |
| 핑퐁 실행기·테스트 | `.agents/skills/codex-gemini-pingpong/scripts/` | 모의 테스트 6/6 통과 |
| Codex CLI | `/usr/local/bin/codex` | 설치 확인 |
| Gemini CLI | `/home/debian/.local/share/moneyverse-agent-toolchain/gemini-cli-v0.70.0/` | 공식 패키지 0.70.0 고정 설치, 버전 출력 확인 |
| 사용자 Gemini 바로가기 | `/home/debian/.local/bin/gemini` | 고정 버전 심볼릭 링크 |

사용자 권한으로 공식 `@google/gemini-cli@0.70.0`을 설치했습니다. npm 설치 스크립트 실행은 차단했습니다(`--ignore-scripts`). 서버 서비스, DB, 사이트 코드, 운영 배포는 변경하지 않았으며 Gemini 계정 로그인 여부는 확인되지 않았습니다.

## 실제 사용 절차

1. 최신 `origin/main`과 통합 기획서, `AGENTS.md`, `GEMINI.md`, 현재 작업 기록을 확인합니다.
2. 구현 담당자별 독립 브랜치·작업 트리를 생성하고 동일 파일 동시 수정을 막습니다.
3. 외부 모델에 보내도 되는 **비밀정보 없는 검토용 문서**를 저장소 밖 UTF-8 파일로 준비합니다. 계정 토큰, 회원 금융정보, 운영 로그, DB 덤프 등은 넣지 않습니다.
4. 설치 확인: `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --check` (로그인·API 호출 검증 아님).
5. 두 CLI 로그인·사용량·과금과 문서 검토 후에만 `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --run --input /path/to/approved-brief.txt --rounds 2`를 실행합니다. Codex 제안 → Gemini 반론 → Codex 재검토가 최대 3회까지 반복됩니다.
6. 모델 답변은 `~/.local/state/moneyverse-agent-pingpong/`에 사용자 전용으로 저장합니다(디렉터리 0700, 파일 0600). GitHub에는 원문을 올리지 않고 정제된 결정·담당자·테스트 근거만 남깁니다.
7. 실제 소스 수정은 승인된 독립 브랜치에서 수행하고, 상대 AI는 별도 읽기 전용 검토를 합니다. PR 직렬 병합, 실 Test 서버 Spring/API/UI QA, 롤백 가능한 운영 승격은 기존 절차대로 별도 수행합니다.

## 안전 조치·미검증 사항

- Codex는 `--sandbox read-only`, Gemini는 `--approval-mode plan`으로 실행해 수정 권한을 제한합니다.
- 모델이 의견에 동의해도 코드 변경·테스트 성공·운영 승격 승인을 뜻하지 않습니다.
- 비밀문자열 정규식 검사는 보조 수단입니다. **입력 문서의 사람이 하는 보안 검토가 필수**입니다.
- 실제 Codex ↔ Gemini 모델 통신과 로그인, 서비스 과금, 실제 QA, 운영 배포는 **미검증**입니다. 모의 검증 성공과 실제 모델 연결 성공을 혼동하지 않습니다.
- 사용이 불가하면 정제된 작업기록 기반 수동 교대 검토를 진행하고 **MANUAL**로 기록합니다.
- 제거 시 본 스킬 폴더와 해당 Gemini CLI 고정 설치·바로가기만 별도 확인 후 제거합니다. 기록 파일 삭제·보존은 별도 정책이 필요합니다.

## 문서·검증 기록

[영문 작업기록](../worklog/2026-11-22-codex-gemini-pingpong-skill-v1.md) · [한국어 작업기록](../worklog/2026-11-22-codex-gemini-pingpong-skill-v1.ko.md) · [GitHub 업데이트](../updates/v2026.11.22.1-codex-gemini-pingpong-github.ko.md) · 내부 업데이트: 미니PC 비공개 기록(.gitignore 적용).

이 스킬은 최신 프로젝트 기획서 및 문서 관리 정책보다 우선하지 않습니다.
