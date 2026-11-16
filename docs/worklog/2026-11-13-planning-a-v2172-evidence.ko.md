# A/v2172 — 국고 사고 QA 근거 점검 (2026-11-13 20:05 KST)

## 시작·회차·출처
직전 B/v2170 커밋 `7289bb6eec221d5b9682237ac6daa200c8ca7f55`, PR #3136 종료 상태를 확인했다. 현재 A/v2172, 다음 B/v2174(본 회차 기록 확인 조건). Migration main `90965f1dd84e272e757041eb9afd8a477699eb7c`, 앱 main `fc6c353ee413e50428548daf2981c7dd28c5fb45`. 문서 전용 격리 워크트리. Debian의 백엔드/프론트엔드/봇/MCP/nginx/docker 활성, 개발 DB 연결 확인. 호스팅 스킬 목록은 비어 있어 BLOCKED, 로컬 `using-superpowers`, `systematic-debugging`, `writing-plans`, `verification-before-completion` SKILL.md 실제 열람. GitHub CLI로 이슈 #3101, 병합 PR #3135, 열린 PR #3137 조사.

## 중간 조사·분류
- **P0 기존 사고 INC-2026.11.12.01 / #3101:** 2026-11-12 운영 모바일 화면에서 국고 10,000,000 WLD 충전 실패 보고, 이슈 OPEN. OTP 유효성·소비, 실제 잔액·원장 이동, 영수증 결과는 UNKNOWN. OTP 화면을 재공개하지 않는다. 병합 #3119는 재시도 `requestKey` 유지, **새로 병합된 #3135**(SHA `90965f1dd84e272e757041eb9afd8a477699eb7c`, 2026-11-13T10:18:17Z)는 `mint-topup`·`salary/disburse` 게이트웨이를 `/api/v1/admin/treasury/...` 정본 경로로 수정하고 계약 단위 테스트를 추가했다. 이는 구현 변경 근거이지 과거 사고의 정산·운영 복구 증명이 아니다. 동일 사고 ID를 유지하며 중복 개선 기획 0건.
- **P1 기존 보안 게이트:** 열린 #3137은 마이그레이션 347의 PUBLIC 함수 EXECUTE 권한 회수를 제안한다. 쉘 구문과 diff 검사 외 PostgreSQL 적용·E2E·Test exact-SHA는 미검증. 백엔드 B 담당으로 중복 변경 금지, 테스트 전 병합·배포 보류.
- 영문 PROJECT_PLAN·한글 대조·통합기획서·README·AGENTS 주요 정책을 확인했다. 30일 전체 코드/PR/기획 조사, 전체 영한 동등성, 운영 인증 흐름, 외부 독립 10,000개 레퍼런스는 미완료.

## 수용 기준·인계
P0 QA: 격리 Test 동일 SHA로 게이트웨이 경로, 권한, OTP 만료, 같은 요청키 재시도 1회 정산, 동시성·시간초과 복구, 원장 차변/대변 합계 0을 검증하고 운영 과거 거래의 `VAULT_MAIN` 원장·영수증·감사기록을 읽기 전용 대사한다. 계약 단위 테스트만으로 사고 종료 불가. P1 백엔드 B: 격리 PostgreSQL에서 migration 347 권한/기본 ACL/SECURITY DEFINER/롤백 검증. P2 다음 B: 3개 독립 신규 후보의 코드·기획·PR·외부 자료 중복 검증.

## 중간 재확인·종료 기준
커밋 전 main·기획서 SHA 재확인 필요. 신규 개선 0, NET_NEW 0, 신규 확정 중복 0, 기획만 채택 0, 이번 기획 코드 구현 0, QA·운영 검증 0. 기존 이슈군 2개 검토. #3135는 개발팀 병합 코드이지 기획팀 구현이 아니다. **기획 품질 BLOCKED**: Test exact-SHA, 과거 거래 대사, 30일 두 저장소 전수, 영한 전체 대조, 외부 10,000개 근거 부족. 운영 코드·DB·배포 변경 없음. TSI-001~011과 PR #3006 원문 유지.

| 단계 | 실제 읽은 로컬 스킬 | 적용 결과 | 미적용 사유 |
|---|---|---|---|
| 시작 | `/home/debian/.agents/skills/using-superpowers/SKILL.md` | 근거 우선 조사 | 호스팅 목록 공백 |
| 원인 | `/home/debian/.agents/skills/systematic-debugging/SKILL.md` | 경로 수정과 과거 정산 미검증 구분 | 인증 재현 없음 |
| 기획 | `/home/debian/.agents/skills/writing-plans/SKILL.md` | 근거 없는 중복 계획 배제 | 코드 작업 없음 |
| 검증 | `/home/debian/.agents/skills/verification-before-completion/SKILL.md` | BLOCKED 게이트 명시 | E2E·대사 불가 |
