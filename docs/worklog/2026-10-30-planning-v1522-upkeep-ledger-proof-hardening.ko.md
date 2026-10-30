# 기획 v1522 — 유지비 영수증 원장 방향과 기준 주차 정확성 보완

**2026-10-30 KST · 기능 보완 · 초안/운영 보류 · 문서 전용**

## 시작
- [x] miniPC 설치 Superpowers using-superpowers·brainstorming·writing-plans·worktrees·verification 스킬 확인(스킬 커넥터 URI 없음).
- [x] Debian 13.6 시스템 7개 서비스 활성·개발 DB 연결 확인. main `bf8d0d48f810932b43783d8605dce53954c60cff`, AGENTS/README/영문 정본·국문 대조, 열린 PR, 선행 Draft #2036 조사.
- [x] 공유 main과 분리된 `auto/planning-v1522-upkeep-ledger-proof-hardening-20261030` 작업 트리 생성.

## 진행 — 실제 소스와 QA
- [x] `001-economy-core.sql`의 잔액 변화: debit 증가, credit 감소 확인. 104 자동/수동 유지비는 USER_CASH credit / SINK debit 사용.
- [x] 075 영수증 UNIQUE/FK, 104 자동 청구의 과거 체납 포함 금액과 수동 정산 first_missed_week 확인. 주차별 납부 배분·영수증 결제 시각 없음.
- [x] Nest 상점 컨트롤러·서비스, Next 구매 영수증 BFF, Android 게이트웨이 경계 조사. 구매 영수증과 유지비 영수증은 별도.
- [x] #2031 QA v1396 정정: 공개 Nginx는 live-prod v1935 bf8d0d48 사용, 레거시 v1515 유닛은 별도. 배포 SHA 런타임 검사 실패·공식 Test c2129625·lint 구문 실패. 운영 보류.
- [x] 작업 중 main 재조회 결과 동일 SHA. 자동 병합·운영 작업 없음.

## 완료 — 검증·인계
- [x] 영문/국문 통합 기획·정본·업데이트/깃허브 로그·작업일지 검증.
- [x] DOCS_ONLY 릴리스 분류 24/24·Git diff 검사 통과.
- [x] 선행 #2036 기반 Draft PR #2042 생성, 개발 이슈 #2035 갱신, 배포 P0 #2031 연결.
- [x] 최종 SHA를 miniPC에 기록, GitHub CI는 별도 조회(런타임 승인 아님).

**기획 문서만 검증한다.** 격리 PostgreSQL 합성 10,001건·음성 시험은 **정의만 하고 실행하지 않았다**. 런타임 전체 CI·공식 Test 정확 SHA·운영 승인·독립 복원·외부 근거 10,000건 달성을 주장하지 않는다. 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000(BLOCKED / IN PROGRESS). 런타임·DB·WLD·Test·Production·main 미변경.
