# 월덕 머니버스 — 웹 전체 코드·기능 오류·서비스 안정성 감사 v2026.10.15.651

**상태:** 분석 및 문서화만 완료, 운영 배포 **차단(BLOCKED)**. 비교 기준은 2026-10-15 10:52 KST의 origin/main bf55b057, 실제 운영 prod-v600, Test test-v618-7fa3f245bbc3입니다. v650까지의 main 변경은 이전 v638 검사 이후 문서·CI 감사 관련 변경이며 앱 코드는 동일합니다. 영어 원문: MONEYVERSE_WEB_FULL_CODE_STABILITY_AUDIT_v2026.10.15.651.md.

## 1. 기준 문서와 조사 범위

통합 기획서 docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, 문서 색인, AGENTS.md, PROJECT_MEMORY.md, 배포 규칙, 이전 v636~v639 결함 보고서를 우선 대조했습니다. v530의 전체 UI 수용 차단 기준은 현재도 유효합니다.

웹 프론트 화면 템플릿 164개(관리자 34개), Next 라우트 핸들러 78개, NestJS 컨트롤러 82개, SQL 마이그레이션 270개를 인벤토리로 확인했습니다. 코드의 주요 경로를 정적으로 확인하고 운영 사이트의 HTTP 요청, Test 상태, 서비스, DB 권한 및 통계, QA 실행 명령을 독립 재검증했습니다. **모든 코드의 한 줄씩 완전 검증, 인증된 회원·관리자 전체 UI 및 실제 DB 마이그레이션 재실행을 완료한 것은 아닙니다.** v638 및 v639에 기록된 과거 테스트 통과 수치는 이번 감사가 다시 실행한 것으로 주장하지 않습니다.

## 2. 재현된 기능 장애와 위험

| ID | 우선순위 | 확인 사항 | 조치 방향 |
| --- | --- | --- | --- |
| STAB-651-01 | P0 | 연결된 woldeok_moneyverse_dev의 public 테이블 245개 중 moneyverse_app에 직접 쓰기 권한이 있는 테이블 **241개**. PUBLIC이 EXECUTE 가능한 SECURITY DEFINER 함수 **11개**. 함수별 실제 악용 가능성은 별도 검증 필요. | 완전 복제된 Test DB에서 기능 호출 의존성·호출자 검증·안전한 search_path 및 최소권한 부정 테스트 후 전진 마이그레이션. 운영 DB에 즉시 일괄 REVOKE 금지. |
| STAB-651-02 | P0 | 국채·자동 국부펀드·FX·국민연금·장터·암시장·PvP·주식 리그 백엔드에 원장 없이 account_balances를 직접 UPDATE하는 코드가 잔존. 이전 정적 감사에서는 테스트 제외 8개 파일, 24개 구문. | 모든 잔액 변경을 원자적·멱등적 복식부기 원장 거래로 연결하고 동시성·실패 롤백·중복 요청·보존 법칙 검증. v639 PvP/경매 트랜잭션 개선만으로 원장 통합 완료가 아님. |
| STAB-651-03 | P1 | 운영 GET 404: /auth/register, /attendance, /business, /career-guide, /guide/getting-started, /pet 총 6개. 프론트 계산기 4곳이 잘못된 /auth/register 링크 사용. | v639 후보를 최신 main과 충돌 점검 후 Test 검증; 올바른 내부 링크와 이전 URL의 307/308 처리. /pet→/roadmap은 안내 이동이지 펫 기능 구현이 아님. |
| STAB-651-04 | P1 | /api/stocks/not-a-uuid/candles가 입력 오류 400 대신 503 반환. 반면 비로그인 /app-api/v1/account/identities의 401은 정상 인증 거부. | v639 응답 코드 수정 후보를 Test에서 비정상 UUID·없는 종목·정상 종목·권한·백엔드 중단으로 반복 검증. |
| STAB-651-05 | P1 | pnpm qa:route-ledger:check 실행 실패(exit 1): 필수 --inventory 인자 누락. 검증기 자체의 3개 단위 테스트는 PASS. 164개 화면 × 5회 실제 E2E 증거 미충족. | v639 CLI 수정 활용, 실측 5회 화면/관리자/모바일/로그인 QA와 증거 대장 구축. 가짜 PASS 금지. |
| STAB-651-06 | P1 | 운영 prod-v600, Test test-v618, 최신 main과 v639 수정 후보가 서로 다름. v638에는 운영과 main 간 프론트 57개 차이/9개 누락, 백엔드 20개 차이/8개 누락 기록. | 정확한 SHA의 CI→Test DB·백엔드·세션·사용자 UI→복구/롤백→무중단 승격 게이트. |
| STAB-651-07 | P2 | DEV DB 1008 MB, autovacuum 사용 중. virtual_stock_minute_candles dead tuple 추정 13,863, outbox_events 4,932. pg_stat_statements 미설치; 측정 시 잠금 대기 0. | Test에서 v622 아웃박스 최적화 후보·인덱스·계획을 계측. 허가 없는 VACUUM FULL 및 운영 일괄 SQL 금지. |
| STAB-651-08 | P2 | 운영 서비스 모두 active, NRestarts 0. 최근 24시간 systemd 오류 등급: 운영 프론트 0/백엔드 0, Test 백엔드 3. 미니PC 메모리 사용 48%, 디스크 사용 64%. 이는 순간 상태일 뿐 기능 정상·가용성 SLO의 증명이 아님. | 응답 시간(p50/p95/p99)·요청량·오류율·자원 포화도·기능별 성공률·BFF→Nest→DB 추적 도입. |

계산기 소스의 잘못된 링크 위치: frontend/src/app/tools/salary-calculator/page.tsx:259, isa-calculator/page.tsx:254, pension-tax-calculator/page.tsx:273, youth-leap-calculator/page.tsx:310.

## 3. 검사 결과와 경계

운영 /register, /quests, /businesses, /guide/career-mastery, /roadmap, /blog, /stocks 및 /admin/seo는 GET 200(일부는 로그인 유도 화면일 수 있음). Test 홈과 /register는 200. 백엔드 및 Test 헬스 응답도 200으로 확인했지만 실제 인증 사용자·관리자 기능의 E2E 정상 판정은 불가합니다. 이번 검사에서 돈 이동·계정 갱신·DB 변경·기능 스위치·운영이나 Test 링크 교체를 실행하지 않았습니다.

최근 main 앱 소스와 동일한 v638 기준 과거 결과: 프론트 1,206 통과, 백엔드 1,185 통과/29 제외, 타입검사·빌드·179 모바일 계약 검사 통과. v639 격리 후보: 프론트 1,228 통과, 백엔드 1,199 통과/29 제외이지만 Full Test/schema/권한/관리자 브라우저/실데이터 무중단 승격 **미통과**. 이번 v651의 새 QA 검증기는 3/3, 실제 명령은 실패로 기록합니다.

## 4. 순차적 해결·최적화 계획

1. **P0** 데이터 보존·원장·권한: 완전한 격리 Test 복구본 준비 → 모든 잔액 직접 UPDATE의 복식부기 전환 → 멱등성/동시성/롤백 부정 테스트 → 안전한 함수 실행권한 축소. 운영 권한을 선제 변경하지 않습니다.
2. **P1** 기능: v639를 최신 main과 재대조한 후 6개 구 경로, 계산기 링크, 종목 캔들 오류 코드, 관리자 백업/IndexNow 인증 및 CSRF 검증. 모든 성공 응답은 실제 서버 영수증과 일치해야 합니다.
3. **P1** 통합 QA: 164개 전체 화면과 관리자 34개, 320~430px 포함 다양한 화면, 실제 회원·관리자 인증, 5회 반복, 모바일 API 179건 계약, DB/세션/백업/롤백, 정확한 소스 SHA에 묶인 CI 및 Test 증거.
4. **P2** 성능: Next.js BFF·Nest API·PostgreSQL의 지연·오류·트래픽·포화도 및 DB SQL계획 수집. 관측 값으로만 캐시, 인덱스, 아웃박스 삭제 배치, 병목을 최적화합니다.

## 5. 참고한 공식 기술 자료

- Next.js 배포 품질·계측: https://nextjs.org/docs/app/guides/production-checklist / https://nextjs.org/docs/app/guides/instrumentation
- Next.js URL 리다이렉트: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- NestJS Health/정상 종료: https://docs.nestjs.com/reliability/terminus
- PostgreSQL SECURITY DEFINER 보호: https://www.postgresql.org/docs/17/sql-createfunction.html
- PostgreSQL SQL 계측 및 자동 Vacuum: https://www.postgresql.org/docs/17/pgstatstatements.html / https://www.postgresql.org/docs/17/routine-vacuuming.html
- Google SRE 4대 주요 신호: https://sre.google/sre-book/monitoring-distributed-systems/
- v639 실제 코드 후보 PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/844

**최종 판정:** 이번 범위의 안전한 조사 완료. 전체 코드·기능 정상 수용 및 운영 승격은 **BLOCKED**.
