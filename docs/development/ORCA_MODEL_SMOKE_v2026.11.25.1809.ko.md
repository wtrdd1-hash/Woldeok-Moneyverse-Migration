# Orca 실제 모델 검증 — v2026.11.25.1809
[English](ORCA_MODEL_SMOKE_v2026.11.25.1809.md) | 한국어

미니PC Orca 터미널에서 가상 smoke/orca-local worktree로 한 모델씩 실행. Gemini plan 모드에서 ORCA_MODEL_OK_323 정확 응답(exit 0), 가상 Python 함수 sum(xs) 수정과 결과 20 반환(exit 0, AST 검증 통과). Claude는 5시간 사용량 한도, 11/25 18:40 KST 초기화 표시(exit 1). Codex read-only 최초 스레드 EAGAIN, CPU 2개와 RAYON_NUM_THREADS=2/TOKIO_WORKER_THREADS=2 제한 재실행으로 모델 요청 단계 도달했지만 사용량 한도(exit 1, 11/27 오후 1:57 표시, 시간대 미확인); 별도 MCP OAuth 인증 오류도 기록. 한도 우회 및 전역 설정 변경 없음. Orca 계속 가동, 재시작 0, 가상 worktree clean. 실제 서비스 코드나 Orca 네이티브 봇 그룹 실행은 미검증. 로컬 기록 ~/orca-model-smoke-20261125.log.

## 기존 Discord 봇 연동 제안 (미구현)
공식 Orca https://orca.dev/docs/bots/connectors 및 Discord https://docs.discord.com/developers/docs/interactions/slash-commands 참고. Orca 공식 커넥터에 Discord 명시 없음. 기존 bot/index.js에서 guild 등록/InteractionCreate 확인. 문서상 moneyverse-discord-bot.service 미발견으로 실제 운영 봇 소유 경로 확인 필요. Spring Discord 상호작용 컨트롤러도 있어 실제 소유 핸들러 하나만 선택. /orca status, review, task, approve, cancel 제안. 서버측 소유자 ID·서버·채널 검증, 비공개 응답, 명시적 승인, 단일 작업 큐, 프로젝트/동작/모델 허용목록. 임의 쉘·경로·토큰 공개·외부 Orca 포트·운영 직행 금지. 읽기 전용부터 시작하고 코드 변경은 승인 후 격리 브랜치/worktree에서만, main 자동 병합 금지. 로컬 제한 워커는 인자 배열과 검증된 작업 레코드 사용. 무권한·재전송·주입·승인·속도 제한 단위 테스트, 별도 Discord 테스트 서버 및 정확한 후보 SHA 검증 후 승격. 이번 검증에서는 운영 봇 및 명령 등록 변경 없음.
