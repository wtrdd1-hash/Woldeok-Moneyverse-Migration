# v2026.11.09.1946 — 조폐국 화면/정책 값 일치화
**영어 정본:** [상세 일지](2026-11-09-mint-ui-policy-v1946.md)

## 작업 전
- 운영 화면 오류: 승인 WORK_REWARD 선택 항목이 보이지만 내부 selectedOrderId 빈 문자열로 제출 시 오류; 사유 10자 이상이어도 정책 발의 시 `internal server error`.
- 실제 DB 244번 스키마는 MINT/RETIRE/FREEZE/UNFREEZE와 WORK_REWARD/QUEST_REWARD/EVENT_REWARD/INCIDENT_COMPENSATION/STABILIZATION_POOL/HARD_SINK_PURGE/GENERAL_CIRCULATION만 허용. UI 기본 `TREASURY`, `EXPAND_LIMIT`, `REBALANCE`는 DB 거부.
- 이전 운영 국고 초기화 v1944 확인. 현재 조폐국 인증서 기록 코드에는 국고 정본 전표·금고 자동 입고가 구현되어 있지 않음. UI의 'VAULT_MAIN 자동 입고'는 실제 기능 증거가 아니므로 거짓 성공 방지 필요.
- 다른 작업자 파일과 운영 금융 데이터 보존, 새 브랜치로 처리.

## 작업 중
- 메인 재조회: `427c5b1eb01c7f6c9ad9920c00e7ab3728eb2450` 변경 없음. 다른 작업자 소스 보존.
- 비동기 승인 명령이 나중에 도착해도 보이는 항목과 요청 ID 일치, 만료/소진/미승인 정책 제외. 입력·오류 초기화 보강.
- 발의 유형/대상을 DB 244 스키마에 일치, 서버/Next 사전 검증. 모바일 한 열 레이아웃·버튼 자동 줄바꿈. 실제 원장 증빙 없는 자동 입금 및 2인 결재 문구 삭제.
- 복제 DB의 app 권한을 격리 상태에서 재현한 뒤 정상 MINT/WORK_REWARD INSERT는 ROLLBACK, 미지원 MINT/TREASURY는 제약조건 위반 확인. 운영 국고 0/0/0/0 유지.
- 프론트 17/17, 백엔드 10/10 통과, 양쪽 타입 검사 통과, ESLint 오류 0(기존 경고 3건).

## 종료
- 코드 및 국소 검증 완료. 정확한 CI/공식 Test/운영 검증 결과를 후속 기록으로 추가할 것.
