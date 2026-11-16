# v2026.11.17.1 — 관리자 전체 기능·금전·보안 실제 QA

**최종 판정: 실패 / 보안 P0 / 금융 P0 / 운영 승격 보류**

## 검사 범위와 안전 조치
2026-11-17 KST, 미니PC debian13 직접 접속. 최신 origin/main 86777fb2d5 기준 통합 기획서·PROJECT_PLAN·AGENTS·운영 배포 지침·Nginx 라우팅과 Spring/Nest/Next 코드를 대조했습니다. 실제 공개 HTTP GET, 관리자 HTML, 공식 Test GET, 실제 PostgreSQL 읽기 전용 트랜잭션, 관리자 테스트 스위트를 실행했습니다. 운영 금전 POST/PUT/DELETE, OTP 무작위 시도, 지급·초기화·서비스 재시작·배포는 하지 않았습니다. 보고서에 비밀번호·토큰·개인식별자·개별 잔액을 넣지 않았습니다.

## 실사이트 결과
- 관리자 38개 고정 화면 GET: 200 37개, 404 1개(/admin/logs/system). 실제 로그인 후 버튼 E2E 통과는 아님.
- 관리자 GET API 92경로: 200 24건, 401 4건, 403 1건, 404 58건, 503 5건. 과거 Nest API가 포함되어 있으므로 404 전체를 실결함으로 단정하지 않음.
- 조폐국 상태·명령서 503; 저장소 관제·백업 목록·SEO 상태 503. 중앙은행·경제 세금정책 조회는 근원 오류를 동반한 404.
- 실제 Test 백엔드 중지·비활성, 국고 Test API 502, 국부펀드 BFF 500, 조폐국 Test 상태 503.
- 다수 관리자 화면과 관리자 API가 X-Robots-Tag: index, follow. 관리자 보안 화면·금융 화면에 noindex/nofollow 필요.

## P0 핵심 결함

### SEC-01 — Spring 인증 전면 허용 및 CSRF 비활성
spring-backend/src/main/java/com/moneyverse/api/config/SecurityConfig.java에 csrf 비활성, anyRequest().permitAll 및 자격증명 허용 와일드카드 CORS. KDIC 관리자 POST 보험료 징수·긴급대출·대위변제는 검증된 세션/관리자 OTP 가드 없이 호출자 헤더 x-user-id를 받습니다. 실제 운영 POST는 돈 변경 위험 때문에 호출하지 않았으므로 **무인증 지급 성공까지 실증한 것은 아니지만**, 코드 차단이 시급합니다.

### SEC-02 — 공개 관리자 역할·세션 정상으로 위장
쿠키 없이 운영 /api/v1/admin/security를 GET하면 admin/superadmin 역할과 open 콘솔 상태가 200으로 반환. /api/v1/admin/me도 200. 동일한 직접 Nest/Spring 원본 비로그인 요청은 401. Next의 /api/v1 재작성→app-api/v1 경로가 내부 토큰을 붙이고 운영 API_ORIGIN은 Spring 4550. 내부 토큰이 브라우저 사용자의 실제 관리자 자격을 대신해선 안 됩니다.

### FIN-01 — 예금보험 진단 수치 하드코딩
Spring KdicService.java 46–59행은 실제 SQL 없이 거래 14,250·계좌 42·국고 42·정상 판정을 고정값 반환하며 현재 시각으로 검사한 것처럼 출력합니다. 실운영 PostgreSQL은 거래 943·전표 1950·계좌 43·국고 52입니다. 실제 공개 API도 고정값 반환 확인. 현재 예보 무결성 정상 표시를 인증 결과로 사용할 수 없습니다.

### FIN-02 — 예금보험 실제 분개 없이 성공 응답
KdicService.java 61–116행에서 보험료 징수는 DB 예외를 무시하고 success=true와 임의 거래번호 반환. 긴급 유동성 대여·대위변제는 정식 복식부기 전표 없이 success=true/UUID를 생성합니다. @Transactional 어노테이션만으로 원장 전표가 만들어지지 않습니다. 지급·보험료·유동성은 실제 커밋 영수증 없으면 실패 차단해야 합니다.

### FIN-03 — 국부펀드 성공 위장·국고 내역 항상 빈 배열
TreasuryService.java 120–168행: DB 장애 시 가상의 활성 정책 상태를 반환하고 정책 변경이 실패해도 SUCCESS 반환. 219–247행: 거래내역·세입·세출을 SQL 없이 항상 빈 배열/0으로 반환. 실제 DB 국고 내역 52건이 있어 검증된 빈 내역 표시와 모순. 다만 SWF 리밸런싱·청산은 미구현 시 503으로 실패 차단하는 부분은 유지해야 함.

### REL-01 — 배포 코드 불일치
현재 main 신규 /admin/logs/system 페이지가 실제 운영 404. 운영 Java·Next 바이너리와 main SHA 동등성이 인증되지 않았고 Test 백엔드도 중지. 실제 OTP/관리자 버튼/결제·지급 E2E 검증 및 운영승격 불가.

## 실제 운영 금융 원장 대사
Docker PostgreSQL 17.11, 운영 백엔드 연결 DB woldeok_moneyverse_dev를 REPEATABLE READ READ ONLY로 조회:
- 거래 943건, 복식부기 전표 1,950건, 계좌 43개, 국고 기록 52개.
- 차변·대변 불일치 0건; 거래 없는 전표 0건; 계좌 없는 전표 0건; 전표 없는 거래 0건; 계좌별 저장 잔액-원장 합 불일치 0건; 국고 원장 연결 누락 0건.
- 음수 잔액 계좌 1개는 allow_negative=true인 MINT 시스템 계좌라 그 자체로 오류 아님.
- 잔액·개별 계좌 정보는 공개 문서에 쓰지 않음. 수치 대사 통과는 지급 권한·과거 거래 적법성·자동투자·중복지급 실검증 통과와 다릅니다.

## 전체 소스 테스트 결과
- Nest 관리자 전체: 103파일 통과/23파일 건너뜀, 개별 655통과/112건너뜀. 실DB 격리 연결이 필요한 테스트는 미실행.
- Next 관리자 UI/BFF/앱 API: 176파일/968테스트 전부 통과. React act 경고와 JSDOM 미지원 이동 메시지 별도 기록.
- Java Spring 관리자/금융 선별: 9스위트/22개 전부 통과. 그러나 이 스위트는 위 하드코딩·거짓 성공·permitAll을 검출하지 못함.
- 첫 144개 선별 Nest 테스트는 전체 655개에 포함돼 중복 계산하지 않음.
- 정식 Test 인증 세션, 실제 WLD POST, OTP 발송·인증, 중복키·동시 지급, 독립 백업 복원, 무중단 운영 승격은 안전·환경 조건으로 미실행.

## 조치 및 배포 허용 기준
1. Spring 관리자 모든 읽기/쓰기 API 기본 차단. 세션에 결합된 사용자·관리자 역할·OTP/재인증·CSRF·내부 토큰 최소 권한 구분, 실제 401/403 음성 테스트.
2. KDIC 고정 진단·가짜 입출금 성공을 정식 SQL 조회와 원자적 복식부기/멱등키/커밋 영수증으로 수정. DB 장애나 영수증 없음은 503 등 확실한 실패.
3. 국부펀드 정책 SUCCESS 폴백·가짜 활성 상태, 국고 빈 원장·0 집계 제거. 원장 유효/빈값/연결 실패를 UI와 API 모두 구별.
4. 조폐국 503, 원본(Spring/Nest) API 매핑, 신규 관리자 로그 화면, robots 보안 헤더 및 운영 프론트·main SHA 차이 해결.
5. 병행 Gemini 작업과 충돌하지 않는 독립 브랜치/테스트 서버로 실제 인증 금융 기능 테스트, 동일 SHA·백업 복구·회귀·롤백·무중단 승격 검증 후에만 운영 반영.
6. 이번 QA는 운영 금전/코드/서비스/main 변경 없음. P0 해소 및 증거 확보 전 RELEASE HOLD.

## 관리자 전체 화면 실측 표

| Path | HTTP | Duration (s) | X-Robots-Tag |
|---|---:|---:|---|
| /admin | 200 | 5.79 | index |
| /admin/analytics | 200 | 2.24 | index |
| /admin/api-health | 200 | 2.309 | index |
| /admin/bank | 200 | 3.212 | index |
| /admin/blog | 200 | 3.477 | noindex |
| /admin/bonds | 200 | 1.991 | index |
| /admin/catalog | 200 | 3.767 | index |
| /admin/central-bank | 200 | 1.346 | index |
| /admin/content | 200 | 2.444 | index |
| /admin/controls | 200 | 1.945 | index |
| /admin/discord | 200 | 1.999 | index |
| /admin/economy | 200 | 3.595 | index |
| /admin/economy/scenario-lab | 200 | 5.04 | index |
| /admin/enterprises | 200 | 2.083 | index |
| /admin/fx | 200 | 1.292 | index |
| /admin/help | 200 | 2.946 | index |
| /admin/kdic | 200 | 1.95 | index |
| /admin/logs | 200 | 2.001 | index |
| /admin/logs/activity | 200 | 5.067 | index |
| /admin/logs/delivery | 200 | 2.187 | index |
| /admin/logs/integrity | 200 | 3.214 | index |
| /admin/logs/system | 404 | 3.095 | index |
| /admin/market | 200 | 5.076 | index |
| /admin/market/ai-news | 200 | 3.209 | index |
| /admin/mint | 200 | 1.992 | index |
| /admin/money-flow | 200 | 6.024 | index |
| /admin/operations/storage | 200 | 2.282 | index |
| /admin/pension | 200 | 1.281 | index |
| /admin/safety | 200 | 1.628 | index |
| /admin/security | 200 | 1.957 | index |
| /admin/seo | 200 | 1.916 | index |
| /admin/seo-audit | 200 | 5.247 | index |
| /admin/shop | 200 | 1.287 | index |
| /admin/support | 200 | 1.625 | index |
| /admin/treasury | 200 | 6.136 | index |
| /admin/treasury/grants | 200 | 1.609 | index |
| /admin/users | 200 | 1.298 | index |
| /admin/work | 200 | 1.329 | index |

## 관리자 GET API 전체 실측 표

| Path | HTTP | Failure note |
|---|---:|---|
| /api/admin/api-health/backup-inventory | 503 | backup inventory unavailable |
| /api/admin/api-health/status | 404 |  |
| /api/admin/auth/channel-otp/status | 200 |  |
| /api/admin/blog/publisher-status | 403 | FORBIDDEN |
| /api/admin/bonds/overview | 200 |  |
| /api/admin/central-bank/status | 404 | CENTRAL_BANK_SOURCE_UNAVAILABLE |
| /api/admin/economy/tax-policy | 404 | Failed to fetch tax policies |
| /api/admin/kdic/ledger-integrity | 200 |  |
| /api/admin/kdic/overview | 200 |  |
| /api/admin/mint/certificates | 200 |  |
| /api/admin/mint/orders | 503 | 통화정책 명령서 조회에 실패했습니다. |
| /api/admin/mint/status | 503 | MINT_POLICY_SOURCE_UNAVAILABLE |
| /api/admin/operations/storage | 503 | storage evidence unavailable |
| /api/admin/pension/overview | 200 |  |
| /api/admin/pension/recent-payouts | 200 |  |
| /api/admin/seo-audit | 200 |  |
| /api/admin/seo/status | 503 | seo_status_unavailable |
| /api/admin/seo/twitter | 200 |  |
| /api/admin/treasury/grants | 200 |  |
| /api/admin/treasury/swf | 200 |  |
| /api/v1/admin/ai-news/batches/latest | 404 |  |
| /api/v1/admin/ai-news/models | 404 |  |
| /api/v1/admin/ai-news/settings | 200 |  |
| /api/v1/admin/api-health/status | 404 |  |
| /api/v1/admin/approvals | 404 |  |
| /api/v1/admin/audit-events | 404 |  |
| /api/v1/admin/audit/dispositions | 404 |  |
| /api/v1/admin/audit/events | 404 |  |
| /api/v1/admin/audit/retention | 404 |  |
| /api/v1/admin/audit/verifications | 404 |  |
| /api/v1/admin/auth/channel-otp/status | 200 |  |
| /api/v1/admin/backups | 404 |  |
| /api/v1/admin/bank | 404 |  |
| /api/v1/admin/blog | 404 |  |
| /api/v1/admin/bonds/coupon-logs | 404 |  |
| /api/v1/admin/bonds/list | 404 |  |
| /api/v1/admin/bonds/overview | 404 |  |
| /api/v1/admin/business-types | 404 |  |
| /api/v1/admin/controls | 401 | login_required |
| /api/v1/admin/controls/auto-policy | 404 |  |
| /api/v1/admin/controls/consent-versions | 404 |  |
| /api/v1/admin/discord | 404 |  |
| /api/v1/admin/discord-outbox-events | 404 |  |
| /api/v1/admin/economy | 404 |  |
| /api/v1/admin/economy/ai-status | 404 |  |
| /api/v1/admin/economy/alerts | 404 |  |
| /api/v1/admin/economy/council-debate | 404 |  |
| /api/v1/admin/economy/macro-v2 | 404 |  |
| /api/v1/admin/economy/monetary/status | 404 |  |
| /api/v1/admin/economy/scenario-lab/preview | 404 |  |
| /api/v1/admin/economy/stats | 404 |  |
| /api/v1/admin/economy/tax-policy | 404 |  |
| /api/v1/admin/economy/velocity | 404 |  |
| /api/v1/admin/enterprises/dividend-logs | 404 |  |
| /api/v1/admin/enterprises/overview | 404 |  |
| /api/v1/admin/enterprises/private | 404 |  |
| /api/v1/admin/enterprises/soes | 404 |  |
| /api/v1/admin/fx/status | 200 |  |
| /api/v1/admin/kdic/ledger-integrity | 200 |  |
| /api/v1/admin/kdic/overview | 200 |  |
| /api/v1/admin/logs | 404 |  |
| /api/v1/admin/logs/system | 404 |  |
| /api/v1/admin/me | 200 |  |
| /api/v1/admin/operations/storage | 404 |  |
| /api/v1/admin/pension/overview | 404 |  |
| /api/v1/admin/pension/recent-payouts | 404 |  |
| /api/v1/admin/season-events | 404 |  |
| /api/v1/admin/security | 200 |  |
| /api/v1/admin/security/ip-blocks | 200 |  |
| /api/v1/admin/shop/items | 401 |  |
| /api/v1/admin/stocks | 401 | login_required |
| /api/v1/admin/stocks/dynamics | 404 |  |
| /api/v1/admin/stocks/market-events | 404 |  |
| /api/v1/admin/treasury/backup/status | 404 |  |
| /api/v1/admin/treasury/budgets | 404 |  |
| /api/v1/admin/treasury/donations/top | 404 |  |
| /api/v1/admin/treasury/expenditure | 200 |  |
| /api/v1/admin/treasury/governance/votes | 404 |  |
| /api/v1/admin/treasury/grants | 404 |  |
| /api/v1/admin/treasury/grants/my | 404 |  |
| /api/v1/admin/treasury/health-insurance | 404 |  |
| /api/v1/admin/treasury/overview | 200 |  |
| /api/v1/admin/treasury/reconciliation | 404 |  |
| /api/v1/admin/treasury/revenue | 200 |  |
| /api/v1/admin/treasury/swf | 200 |  |
| /api/v1/admin/treasury/tax-rates | 404 |  |
| /api/v1/admin/treasury/tax/wealth | 404 |  |
| /api/v1/admin/treasury/transactions | 200 |  |
| /api/v1/admin/treasury/user-money-flows | 404 |  |
| /api/v1/admin/users | 401 | login_required |
| /api/v1/admin/work | 404 |  |
| /api/v1/admin/work/stats | 404 |  |

## Finish / 종료
Recorded on isolated QA branch only. No Test startup, Production mutation, main merge or promotion. P0 RELEASE HOLD.
