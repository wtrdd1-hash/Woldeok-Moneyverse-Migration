# OmniRoute 도입 검토 — v2026.11.24.1342

사용자 캡처로 릴스 두 번째 도구 OmniRoute 확인. [공식 저장소](https://github.com/cheaper-inference/OmniRoute), MIT. npm 조회 버전 3.8.54. AI 모델 연결·라우팅 및 무료 할당량 활용, Claude Code/Codex/Gemini CLI 지원. 무료 모델은 공급자별 제한 존재. 일반 SKILL.md가 아닌 별도 게이트웨이 서버.

미니PC 사전 점검: Debian, Node 24.21.0 호환, RAM 총 7.9GiB/가용 1.6GiB, 디스크 가용 16G, 20128 포트 미수신. 공식 README Docker 기준 가벼운 사용 2GiB 이상, 코딩 에이전트 1개 10GiB 이상, 긴 요청 동시 처리 12~16GiB 권장. 운영/테스트와 호스트 공유하므로 설치·기동 보류. 공급자 연동·에이전트 설정·예약·서비스 변경 없음.

추후 별도 호스트 또는 충분한 RAM, 고정 릴리스, 루프백 전용, 별도 데이터 경로·강력한 인증·승인된 공급자만 연결·자동 유료 전환 방지. 합성 프롬프트 검증 후 개인정보/비밀값 제외, 로그 보존 및 공급자 약관 확인. 기존 Claude/Codex/Gemini 및 운영 승격 규정 보존.

## 서버 시간 기록
```text
2026-11-24T13:42:52+09:00 START: identify OmniRoute, inspect installation requirements; no provider or service changes
2026-11-24T13:43:13+09:00 CHECKPOINT: official npm registry version 3.8.54; Node 24.21.0 compatible; host RAM 7.9GiB total/1.6GiB available; disk 16G available; port 20128 not listening
2026-11-24T13:43:13+09:00 FINISH: upstream recommends container >=2GiB light use and >=10GiB one coding agent; defer installation and activation to avoid shared host resource pressure. No provider connection, app or service change.
```
