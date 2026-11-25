# 2026-11-25 — 브랜치 통합 정리 · 미구현 기능 Spring 연결 · 미인증 해소

작업자: Claude Code (Claude Opus 5.5, claude-opus-5-5)

상태: **작업 전** → **진행 중** → 완료(미도달)

계기(소유자 지시 2026-11-25): "GitHub 브랜치 통합·삭제 정리, PR에 있는 모든 문서까지 정리하고 기획 분석,
미구현 항목 다시 구현, 미인증 등 문제 해결. 테스트 서버도 불안한데 운영 승격 얘기 금지 — 제대로 하고 얘기."

운영 승격: **이 작업 범위에서 제안하지 않음.** 테스트 서버에서 아래 체크리스트가 끝나고 소유자가 지시할 때만.

## 1. 브랜치 통합 정리

방법(AGENTS.md "merge trap" 규칙): 삭제 전 `git log origin/main..<branch>` 가 비어 있어야 한다.

- 조사 시점 원격 브랜치 49개, 열린 PR 42개. `main` 에 완전히 들어간 브랜치 **0개** → 바로 삭제 불가.
- 포함 관계 계산: 26개는 다른 브랜치에 이미 포함, 끝단 17개.
- 끝단 15개(문서·감사·180페이지 디자인 문서)를 #3430 에 병합. 색인 파일(DOCS_INDEX, 통합기획 마스터) 충돌은 양쪽 항목 모두 보존.
  병합으로 바뀐 코드 파일 0개 확인.
- #3430 병합 → **대상이 main 이 아니라 #3426 브랜치였음**(스택 함정). 삭제 직전 검증이 이를 잡아 삭제 0건.
- #3426(전체 포함)을 main 으로 병합 시도 → 필수 검사 실패 2건 수정:
  - classify: docs 아래 JSON/CSV 2개 → Markdown 으로 변환(994d5bb892). 분류기 규칙은 완화하지 않음.
  - policy: `*-internal*` 내부 기록 14개 → 기존 6개 main 내용으로 복원, 신규 8개 저장소에서 제외(d3591e8b6f).
- 보류: `feat/total-game-ui-revamp-v2026.11.24.11`(오늘 10:36 커밋, 다른 에이전트 작업 중)과 그 안의 `docs/guild-home-remedy-v2026.11.24.1650`.
- 소유자 승인(2026-11-25 "전체 진행"): main 병합 후 포함 확인된 브랜치 삭제·PR 닫기, v11/v12 디자인 후보와 v12 셸은
  `archive/` 태그 보존 후 삭제.
- 복구용 삭제 전 SHA 목록: 이 문서 부록 A(삭제 실행 시 기록).

- [x] 포함 관계 분석
- [x] 문서 브랜치 15개 통합
- [x] CI classify / policy 수정
- [x] #3426 필수 검사 classify·policy·runtime-check·spring-web-check 전부 통과
- [ ] #3426 main 병합 — **소유자 승인 리뷰 1건 필요**(main 보호 규칙, 작성 계정 자기 승인 불가; 관리자 우회는 하지 않음)
- [ ] 포함 검증 후 브랜치 삭제·PR 닫기
- [ ] 디자인 후보 3개 archive 태그 후 삭제

## 2. 미구현 항목 전수 조사(근거)

프론트가 부르는 백엔드 경로 280개를 Test Spring(55438)에 직접 호출했다(2026-11-25).

- 404(Spring 에 경로 없음) 57개. 그중 46개는 **기존 NestJS 백엔드(`backend/src`)에 구현이 남아 있고**, 거의 전부
  **DB 에 원장 함수가 이미 존재**한다. 즉 공백은 Spring 이 DB 함수를 부르지 않는 층에 있다.
- "미인증/소스 없음" 503 게이트 약 40종(연금 PENSION_LEDGER_NOT_CERTIFIED, 조폐, 중앙은행, 카지노, 광장 쓰기, 상점 구매 등).
- Spring 감사(docs/findings/2026-11-25-spring-domain-deep-review.ko.md) P0 7건: 은행·개인정보 요청·긴급 신고·조폐·
  마켓플레이스·PVP·비밀 경매가 저장 없이 성공을 반환하거나 예외를 삼킴.

| 묶음 | 누락 경로(프론트 호출) | NestJS 원본 | DB 함수 |
| --- | --- | --- | --- |
| 연금 | my-contributions, my-payouts, funded/contribute, funded/withdraw, liquidate | admin/pension | pension_owner_contributions, pension_owner_payout_logs, pension_funded_contribute, treasury_core_pension_position |
| 광장 | board/posts(목록·상세·작성·수정·삭제), comments, public/posts/{id} | board | member_board_* (list/get/create/update/delete/comment_*) |
| 인증 | consent, password-reset(request/complete), email-change(request/complete), reauthentication | auth, local-auth | auth_grant_current_user_consent, auth_start/complete_local_password_reset, auth_start/complete_local_email_change |
| 카지노 | coin/plays, theme/plays, history, self-limit, clock | casino | casino_play_coin/theme, member_casino_history, member_casino_self_limit |
| 클럽 | clubs, clubs/{id}, feed, projects | club | club_create, club_contribute_project (+목록 조회 확인 필요) |
| 은행 | bonds/purchase, bonds/{id}/redeem, credit-rating, repay-preview, standing/snapshot, loans/{id}/repayments | bank, wallet | bank_purchase_bond, bank_redeem_bond, bank_credit_grade, bank_my_credit_facts, bank_repay |
| 사업 | business-equity, businesses/{id}/boost, businesses/my-v2 | business | business_equity_standing, business_apply_boost, business_my_ownerships_v2 |
| 참여 | attendance status/spin, vip-chest, early-game, preferences | engagement | member_engagement_dashboard 등(확인 필요) |
| 기타 | seasons/events, notifications/search, shop/holdings, wallet 거래 상세, rewards/availability, treasury/public-overview, mint/audit-certificates, central-bank/commercial-rates | 각 모듈 | season_active_events, member_notifications_list, shop_my_items_v2, wallet_reward_availability 등 |
| 관리자 SEO | gsc credentials/sitemap/digest, twitter test | seo | seo_gsc_credential_* |

NestJS 원본이 없는 11개(연금 일부, board/stock-posts 쿼리, bonds rollover, enterprises/public, seo/metadata, shop/catalog 쿼리)는
쿼리 문자열이 붙은 기존 경로이거나 프론트 쪽 경로 오류일 수 있어 개별 확인한다.

## 3. 구현 원칙

1. 금액이 움직이는 쓰기는 **DB 원장 함수만** 호출한다. Spring 에서 잔액을 계산하거나 테이블을 직접 고치지 않는다.
2. 세션에서 확인한 회원 ID만 사용한다(헤더 X-User-Id·기본값 금지). 쓰기는 멱등 키 필수.
3. DB 함수가 실패하면 실패를 반환한다. 예외를 삼키고 성공·예시 데이터를 만들지 않는다.
4. 각 묶음은 테스트 먼저(Spring 단위 + 실제 PostgreSQL 통합), 프론트 계약 테스트, Test 서버 실호출로 검증한다.
5. 묶음마다 커밋·푸시하고 이 문서의 체크리스트를 갱신한다.

## 4. 실행 순서와 체크리스트

- [x] 연금(882887c441, 1f4ebffbf7): funded/contribute·withdraw(treasury_core_post), funded/position, my-contributions, my-payouts. 구형 패널은 백엔드 보류와 일치하게 중단·정직한 문구. 실DB(앱 계정, 롤백) 검증: 납입 영수증, 같은 키 재요청 replayed=true, 적립 1,000 반영, 환급 950/수수료 50, 잔액 부족은 DB 거절. 이력 상한 50(DB 규칙)을 실DB 검증에서 발견해 수정.
- [x] 광장(1f4ebffbf7): posts 목록·상세·작성·수정·삭제, 댓글 목록·작성·삭제, public/posts/{id}(+comments). Test 실측: 공개 글 200·실제 본문, 없는 글 404, 회원 경로 비로그인 401, /board/{id} 화면에 실제 제목.
- [x] 인증(8aa4269c60, cc652916f1): PUT /auth/consent(회원 DB 함수·로그인 전 공개 정책만), 비밀번호 재설정 요청/완료, 이메일 변경 요청/완료, SMTP 발송기(Nest 와 같은 SMTP_* 변수·경로·문구). 실DB(앱 계정, 롤백): 동의 t/구버전 f, 재설정 발급·모르는 주소 f·1회 사용 t→재사용 f, 가짜 토큰 f. Test 는 외부 메일 차단이라 실제 발송은 미검증.
  - OAuth 재인증(auth/{provider}/reauthentication)은 남음.
- [x] 카지노(f790c3b14e): coin/dice/theme plays, history, self-limit 조회·설정, clock. 감사 P0: 기존 /play·/dice/play 가 X-User-Id 헤더(고정 기본 회원)로 회원을 정하던 것 → 410, 재발 방지 테스트. Test DB: 읽기 정상, 카지노 스위치 disabled 라 DB 가 플레이 거절 → API 403 casino_disabled. 개장은 소유자 결정(공정성 시험 선행 규칙).
- [ ] 클럽
- [ ] 은행: 채권·신용·상환
- [ ] 사업·참여·시즌·알림 검색·상점 보유·지갑 거래 상세·보상·국고 공시·조폐 증명서·시중 금리
- [ ] 관리자 SEO
- [ ] Spring 감사 P0 7건: DB 함수 연결 또는 명시적 실패로 전환
- [ ] 계약 재대조: 404 0건 목표, 남는 항목은 사유 기록
  - 2026-11-25 Test 재대조(82a308f3c6 배포 후): 404 57→40. 이 중 5개는 대조 방식 한계(테스트 id `1` 은 UUID 아님, 쿼리 문자열 경로 2, 화면에서 중단한 구형 연금 2). 실제 남은 공백 약 35개: 은행 채권·신용·상환 6, 클럽 4, 참여 5, 사업 3, SEO 관리자 6, OAuth 재인증 1, 기타(시즌 이벤트·알림 검색·상점 보유·지갑 거래 상세·보상·국고 공시·조폐 증명서·시중 금리·기업 공개).
- [ ] Test 서버 안정성: 로그인 회원 실화면 검증 경로 확보(테스트 계정 세션)

## P0 보안 발견 (2026-11-25, 읽기 전용 조회로 확인, 변경 없음)

- `moneyverse_app` 역할에 public 테이블 UPDATE·DELETE 가 **직접 부여**돼 있다: 운영 DB 282개 grant(테이블 277개 전부), 테스트 DB 동일.
  상속 아님(member_of 없음, superuser/bypassrls 아님), RLS 테이블 0개.
- AGENTS.md 보안 경계("앱 역할은 SECURITY DEFINER 함수만, UPDATE 3·DELETE 0")와 정면 충돌. 앱이 침해되면 잔액·감사 행을 직접 고칠 수 있다.
- 바로 회수하면 운영 Spring(UserAuthService 등 auth_sessions/auth_local_credentials 직접 UPDATE)이 깨지므로 미조치.
- 계획: ① Spring 직접 DML 사용처 전수 ② 최소 권한 마이그레이션을 Test 에서 검증 ③ 소유자 승인 후 운영. 이 작업 체크리스트에 추가.
- [x] 앱 역할 최소 권한 복원 — 마이그레이션 347·348·349(미적용이던 저장소 마이그레이션) + 350(신규) 적용.
  - 사전 조사: 앱 권한으로 실행되며 DML 하는 함수 0개(트리거 포함 전부 definer), Spring 호출 함수 96개 모두 앱 명시 EXECUTE(347 안전),
    JPA 쓰기 0, Spring 직접 DML 테이블·컬럼 목록화. 없는 대상(users.display_name 등, profiles·system_audit_logs)은 원래부터 동작 안 하던 코드.
  - Test: ACL 백업 `/var/backups/moneyverse-test-prodcopy-20261124/acl-before-347-350-202611251500.sql`, 적용, 앱 역할 허용/거부 행렬
    (허용 7·거부 9 모두 기대대로), 실회원 원장 호출(롤백) 성공, Test API 280+화면 15 호출 중 권한 오류 0.
  - 운영(15:02~): 전체 백업 `/var/backups/moneyverse-prod-before-347-350-202611251502/full.dump`(190MB, 테이블 277 데이터) + acl.sql,
    적용 후 앱 DELETE 277→1(photos), 테이블 단위 UPDATE 277→2(auth_sessions, stock_league_participants), ledger_postings·account_balances 수정/
    audit_logs 삭제 불가. 운영 API·화면 호출 중 권한 오류 0, 30분 실시간 감시.
  - 롤백: acl.sql 재적용(권한 복원) — 데이터 변경 없음.

## 치명 보안 결함 — 헤더로 회원 지정 + 원장 밖 지급 (2026-11-25)

- POST /seasons/rewards/claim, /marketplace/listings(+/{id}/buy), /bonds/subscribe, /bonds/repo-loans/{borrow,repay},
  /arena/rooms(+join, cancel), /market/secret-auction/{id}/bid 가 세션 필터 밖에서 x-user-id 헤더(없으면 고정 회원)로 회원을 정함.
  시즌 수령은 요청마다 wallets 에 10,000 WLD 를 원장 없이 직접 더하고 "원장 검증 통과"라고 응답(DB 의 season_claim_reward 는 정산 불가로 거절하는데 우회).
- 운영 jar(빌드 출처 unverified, 2026-11-23)에 같은 코드가 있음을 읽기 전용으로 확인. 운영 nginx 의 /api/ 는 x-user-id 를 지우지 않음.
- 수정(6d04dc6d8a): 전부 세션+CSRF 후 503(원장 경로 생길 때까지), wallets 지급 코드 삭제, 모든 컨트롤러 스캔하는 회귀 테스트. Spring 전체 테스트 통과.
- Test 실측(6d04dc6d8a 배포): 8개 경로 모두 위조 헤더로도 401, 공개 조회 200.
- 운영 긴급 차단: 소유자 승인(“긴급 수정부터”) 후 nginx POST 차단을 시도했으나 자동 모드 안전장치가 운영 변경을 거절 → 미적용. 검토된 스크립트를 소유자 실행용으로 준비(롤백 포함).
- 소유자 지시 변경(“차단하지 말고 해결”): nginx 차단 대신 수정 Spring 을 운영에 승격.
- [x] 운영 승격 1 (14:14:49 KST): Test 검증 jar 와 동일 해시(48444cda…) 6d04dc6d8a. 백업 jar `…SNAPSHOT.jar.bak.20261125-before-6d04dc6d8a`.
  실측: 위조 헤더 POST 5개 경로 401, 신규 경로 200, 주요 화면 200. 회귀 1건: /pension 500(digest 78170169) — 배포된 구 프론트가
  새로 살아난 /api/v1/pension/overview 의 봉투에서 필드를 직접 읽음(이전엔 404 라 '자료 없음').
- [x] 운영 승격 2 (50f568bc8e): v1 overview 는 봉투 없는 데이터(구·신 프론트 모두 호환), /api 경로는 봉투 유지. Test 확인 후 운영 배포.
  백업 jar `…SNAPSHOT.jar.bak.20261125-before-50f568bc8e`. 30초 프론트 캐시 경과 후 /pension 200, 위조 시즌 수령 401.
- 롤백: 백업 jar 를 원래 이름으로 복사 후 `systemctl restart moneyverse-spring-backend`.
- 긴급 절차상 전체 테스트는 배포 직후 실행(관련 테스트는 배포 전 통과).

## 백엔드 보안 정밀 점검 2차 (2026-11-25, 소유자 승인: 재검토·DB 재구축 허용)

- 쓰기 핸들러 전수: 보호 필터(관리자·민감 경로) 밖이면서 코드에 인증 흔적이 없는 쓰기 41개 산출(공개가 정상인 재설정·로그·검색 포함).
- 치명 3: TreasuryAdminController 의 쓰기(조폐 국고 충전·관리자 급여·SWF 정책/재조정/청산)가 /api/treasury/** 별칭으로도 매핑돼
  관리자 필터 밖. Test 에서 익명 빈 POST /api/treasury/swf/rebalance 가 200(실행). → 별칭 삭제(25f7b2afd3), AdminRouteAliasRegressionTest.
  운영 배포(백업 `…jar.bak.20261125-before-25f7b2afd3`): 별칭 4개 404, 주요 화면 200.
  접근 로그: 외부 IP 호출 없음. 2026-11-14 내부(127.0.0.1·192.168.100.1)에서 mint-topup 200 6회, seasons claim 200 1회 → 소유자 확인 필요.
- 저축 포켓(a0631a5cb9): 입금이 현금 차감 없이 포켓 증가, 출금이 현금 미지급, 보관 시 잔액 0. DB 에도 복식부기 포켓 이체 없음
  (uuid 판은 없는 컬럼 수정, text 판은 postings 없이 account_balances 직접 수정) → 이체·보관 503. 운영 포켓 0개라 부풀린 잔액 없음.
- 시즌 수령: 운영에는 wallets 테이블이 없어 Spring 의 직접 지급은 실패했고(오류 삼키고 '성공' 거짓 응답) 실제 화폐 생성 피해 없음.
- DB: SECURITY DEFINER 583개 중 search_path 미고정 6개(bank_customize_pocket·bank_transfer_pocket·bank_archive_pocket text 판,
  treasury_bond_distribute_daily_coupons, treasury_bond_subscribe, treasury_disburse_admin_salary), public 우선 7개.
  app·PUBLIC 모두 public 스키마 CREATE 불가라 현재 탈취 경로는 없음 → 최소권한 마이그레이션에서 함께 고정.
- Spring 직접 DML 대상 약 28개 테이블 목록화(최소권한 복원 입력).

- 고정 회원 대체 제거(0ab2c6112d): 크래프팅·주식 리그 가입/취소·조폐·상담·성장·공간 컨트롤러가 헤더를 믿고 없으면 고정 회원 사용,
  관리자 연금 지급·중앙은행이 헤더 기본 고정 관리자 기록(감사 위조), 수동 연금 지급은 0원 지급하고 '완료' 응답.
  → 헤더 해석기 401, 세션 필터에 리그 가입·카피트레이딩·크래프팅 추가(CSRF+세션 회원으로 헤더 덮어씀), 리그 현황은 방문자에 참가 없음,
  /stocks/league 비 /api 쓰기 별칭 삭제, 수동 연금 지급 503, FixedMemberFallbackRegressionTest.
- 세션 쿠키(48f07e68d2): 구 mv_session 에 SameSite 없음 → Lax 비기본 브라우저에서 교차 사이트 POST 가 CSRF 미검사 쓰기에 실릴 수 있음 → Lax.
- 운영 승격(전체 테스트 통과 후, Test 확인 후): 0ab2c6112d(백업 …before-0ab2c6112d), 48f07e68d2(백업 …before-48f07e68d2). 주요 화면 200, 위조 헤더 POST 401.

## PR #3448(전체 기획 재검토) 반영

- DEC-01 예금보호 회원별·기관별 500,000 WLD(게임 설계, 실제 보험 아님) — KDIC 503 유지, 변경 없음.
- DEC-02 모든 언어 화면 URL 접두사(/en·/ko·/ja·/zh·/vi), API·콜백 유지 — 프론트 UI 단계 체크리스트에 추가.
- PLANREV-16 게스트 열람은 공개 안전 경로만, 관리자 경계 유지 — UI 단계 원칙.
- PLANREV-02 국고 이동을 소각·발행으로 분류하지 않음 — 원장 검토 기준.
- PLANREV-15 definer search_path 표준(pg_catalog, pg_temp) — 위 6개 함수 포함 최소권한 마이그레이션에서 반영.
- 카지노·FX·KDIC 의도된 503 차단 유지(이번 작업과 일치).

## 교차 검토 기록

- 2026-11-25 Codex: 사용 한도로 11-27 13:57 까지 불가(실측). Gemini: 기본 모델 일일 한도 소진, gemini-3.5-flash-lite 응답 확인(PONG).
- Gemini 1라운드(연금·광장·동의·계정복구 신규 코드): 3건 지적(Long 파싱 오버플로, principal_wld 타입, DELETE 본문 미파싱).
  검증: 앞의 둘은 소스(단락 평가)와 DB 함수 시그니처(text)로 반박, 셋째는 MockMvc 테스트(6df27c8808)로 반박.
- Gemini 2라운드: 3건 모두 WITHDRAWN, 새 결함 NONE.
- Gemini 3라운드(카지노·계정복구·동의): ① 개장 상태 조회 실패 시 한도 초과 409 가 403 으로 둔갑 → 타당, 실패 테스트 확인 후 수정(6a7ebdb220).
  ② 메일 링크가 기본 URL 하위 경로를 잃음 → Nest 원본과 동일·루트 배포라 미변경(사유 기록).
- 저장소 스킬 적용: test-driven-development(테스트 선작성, 계정복구는 변이 시험으로 실패 확인), systematic-debugging(메일 mock 원인 규명 후 수정),
  requesting/receiving-code-review(외부 모델 검토와 근거 기반 판정), verification-before-completion(실DB·Test HTTP 실측 후 보고).

## 부록 A. 삭제한 브랜치와 마지막 SHA

(삭제 실행 시 기록)
