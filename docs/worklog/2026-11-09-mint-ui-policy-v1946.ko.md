# v2026.11.09.1946 — 조폐국 화면/정책 값 일치화
**영어 정본:** [상세 일지](2026-11-09-mint-ui-policy-v1946.md)

## 작업 전
- 운영 화면 오류: 승인 WORK_REWARD 선택 항목이 보이지만 내부 selectedOrderId 빈 문자열로 제출 시 오류; 사유 10자 이상이어도 정책 발의 시 `internal server error`.
- 실제 DB 244번 스키마는 MINT/RETIRE/FREEZE/UNFREEZE와 WORK_REWARD/QUEST_REWARD/EVENT_REWARD/INCIDENT_COMPENSATION/STABILIZATION_POOL/HARD_SINK_PURGE/GENERAL_CIRCULATION만 허용. UI 기본 `TREASURY`, `EXPAND_LIMIT`, `REBALANCE`는 DB 거부.
- 이전 운영 국고 초기화 v1944 확인. 현재 조폐국 인증서 기록 코드에는 국고 정본 전표·금고 자동 입고가 구현되어 있지 않음. UI의 'VAULT_MAIN 자동 입고'는 실제 기능 증거가 아니므로 거짓 성공 방지 필요.
- 다른 작업자 파일과 운영 금융 데이터 보존, 새 브랜치로 처리.

## 작업 중
- 입력 UI 상태·백엔드 검증 오류 분리, 회귀 테스트, 공식 Test와 운영 동일 소스 검증 계획.

## 종료
- 실제 완료 상태는 검증 후 기록.
