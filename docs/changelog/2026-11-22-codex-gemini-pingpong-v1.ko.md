# 변경 이력 — v2026.11.22.1: AI 상호 검토 스킬

- 신규 `codex-gemini-pingpong` 공유 스킬 및 최대 3회 읽기 전용 검토 실행기 추가.
- 공식 Gemini CLI `@google/gemini-cli@0.70.0`을 사용자 계정 전용 경로에 설치, 기존 스킬 유지.
- 모의 프로세스 테스트 6건 통과·CLI 버전 확인. 실제 두 AI 모델 간 로그인/통신은 미검증.
- 검토 입력 보안 검사, 사적 로컬 기록, 파일 소유권 분리, PR/QA/운영 배포 수동 품질 게이트 적용.
- 실제 사이트·DB·Test·Production 변경 없음.
- [상세 가이드](../development/CODEX_GEMINI_PINGPONG_SKILL_v2026.11.22.1.ko.md) · [작업기록](../worklog/2026-11-22-codex-gemini-pingpong-skill-v1.ko.md).
