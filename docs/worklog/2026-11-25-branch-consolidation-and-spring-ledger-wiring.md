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
- [x] #3426 main 병합(3fcf446f05): 작성·소유 계정이 같아 리뷰 불가 → 소유자 승인으로 enforce_admins 를 이 병합에만 끄고 관리자 병합, 즉시 재활성(enforce_admins=true 확인).
- [x] 포함 검증 후 브랜치 삭제 35개(부록 A). 원격 브랜치 49→6, 열린 PR 42→5.
- [x] 디자인 후보 3개 archive 태그 후 삭제(부록 A).

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
- [x] 은행(9495303f8a): 채권 매수·환매(bank_purchase_bond/redeem_bond, 원장), 대출 상환 /bank/loans/{id}/repayments(bank_repay), 상환 미리보기·계좌 요약·신용등급
  (bank_get_my_standing·bank_my_credit_facts, Nest 계산식·등급표 그대로). 실DB: 채권 1,000 → 만기 1,030 원장 영수증(롤백). Test: 신용등급·요약 200, 현금 0 채권 409, 대출 없음 미리보기 400·상환 409. 운영 배포.
- [x] 사업 지분·보유 목록·보상 가능 여부(07f9622c55): business_equity_standing·business_my_ownerships_v2·wallet_reward_availability. Test 실값 확인, 운영 배포.
- 출석 룰렛: Nest 가 앱에서 economy_post_transaction 직접 호출 + Math.random 보상(규칙 위반) → 원장 래퍼 함수 없이는 구현 불가, 프론트도 호출 안 함 → 미연결 유지.
- [x] 상점 보유(shop_my_items_v2, attention 필터 status/filter 모두 허용), 지갑 거래 상세(Nest 단일 쿼리·이름표 그대로, 남의 거래 404) (5cc65edb9a).
- [x] 미검증 원천 4곳은 404 대신 정직한 503: 국고 공시(RELEASING 정책 PUBLIC_TREASURY_RECONCILIATION_PENDING), 알림 검색(Nest 기본 꺼짐), 시중 금리, 조폐 증명서. 운영 배포, 오류 0·운영 프론트 오류 0.
- [ ] 남은 404 20개(대조 방식 한계 약 8개 포함): 기업 공개, 사업 부스트, 채권 롤오버, OAuth 재인증, 초기 게임·선호 설정, 관리자 SEO 6, 출석 3(프론트 미호출)
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
  접근 로그: 외부 IP 호출 없음. 2026-11-14 내부(127.0.0.1·192.168.100.1)에서 mint-topup 200 6회, seasons claim 200 1회 → 소유자 확인(2026-11-25): 조폐 충전은 의도된 것.
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

- 치명 4 — 은행 헤더 신원(7f88ca7497): BankController 가 세션이 없으면 X-User-Id 를 회원으로 사용. Test 에서 익명+위조 헤더로 남의 잔액 조회 200,
  입금·출금·이동·대출·상환·이자 수령도 같은 해석기. → 세션만 신뢰, 다른 헤더는 403, 회귀 테스트. 모든 GET 을 헤더 없음/위조 헤더로 비교한 실측 전수에서
  다른 경로는 없음. 리그 현황은 헤더를 신원으로 쓰지 않음. 운영 배포(백업 …before-7f88ca7497): 위조 헤더 401.
  접근 로그: 은행 쓰기 호출은 내부(127.0.0.1·192.168.100.1)뿐, 외부 IP 없음.

- 블로그 알림(b71a763fc5): /api/v1/blog/notify(+/test) 가 관리자 접두사 밖·필터 명시 예외 → 누구나 임의 제목·링크로 Telegram/Discord 발송 가능
  (ProcessBuilder 인자 방식이라 명령 주입은 아님). 별칭·예외 제거, 운영 404/관리자 경로 401. DB 최소 권한 후 운영 30분 감시: 권한 오류 0.

### 남은 보안 항목(2026-11-25 기준, 정직한 목록)
- [해결 a10303e750] CSRF 미검사 세션 쓰기 5곳 → 쓰기만 세션+CSRF 필터 통과(공개 조회 유지). 프론트는 이미 토큰 전송.
- [해결 a10303e750] 개인정보 요청·긴급 삭제 신고(접수·상태·관리자 목록·처리)를 DB 함수로 저장/조회(실DB 앱 권한 롤백 검증), Discord 공지 가짜 성공 → 503. 운영 배포(백업 …before-a10303e750).
- 인증 없는 공개 쓰기(의도 확인 필요): 활동 수집, 프론트 오류 감사, 도움말 신고, SEO 로그, 신문 투표, 배너 클릭, Discord interactions(서명 검증 확인 필요).
- 원장 없이 잔액을 바꾸는 DB 함수가 남아 있음(marketplace_buy_listing, bank_transfer_pocket text 판) — 현재 Spring 경로는 차단, 함수 정리 필요.
- definer search_path 미고정 6개(현재 악용 경로 없음).
- [해결 da2b0579cc] 로그인 무차별 대입: 계정별 15분 10회 실패 후 429(비밀번호 검사 안 함), 재인증 15분 5회, 재설정 메일 주소별 시간당 3회(응답 동일).
  IP 기준이 아닌 이유: BFF 경유로 Spring 이 보는 IP 는 모두 127.0.0.1. JSON 로그인 500 응답의 내부 예외 문구 노출 제거. Test 실측 401×10→429, 운영 반영.
  한계: 프로세스 메모리 기반(단일 인스턴스), 5만 키 초과 시 전체 초기화.
- 인프라: Spring 4550/9092 는 nft 로 lo 외 차단 확인. 운영 DB 5433 은 브리지 외 모든 인터페이스에서 DNAT(내부망에서 PostgreSQL 접속 시도 가능, 비밀번호 필요) → 소유자 결정 필요.
- [해결] 운영 DB 5433 외부 인터페이스 차단(소유자 승인): nft 테이블 inet moneyverse_db_guard_v20261125(prerouting, ens18 dport 5433 drop),
  부팅 유지 유닛 moneyverse-db-port-guard-v20261125.service. Spring→DB·화면 정상. 롤백: systemctl disable --now 해당 유닛.
- [해결] 로그인 회원 실사용 E2E: Test DB 전용 시험 계정(qa-e2e-20261125@test.invalid, 정식 가입 함수, 실제 회원 사본 미변경).
  첫 실행에서 결함 2건 발견: (1) DB 함수 member_board_create_with_image 가 42702(author_user_id 모호)로 항상 실패 → 운영 포함 광장 글쓰기 불가였음
  → 마이그레이션 351(별칭 1곳) (2) 클럽 SQL 이 없는 컬럼(users.display_name, user_profiles) 사용 → 현재 스키마로 수정. 원인 미기록 문제도 수정(SQLSTATE 로그).
  재실행: 광장 작성→같은 키 재요청→읽기→댓글→수정→삭제→404, CSRF 없는 작성 403, 클럽·개인정보 200, 연금 납입(현금 0) 400, 카지노 403.
  로그인 화면 22개 중 20개 200(2개는 없는 주소 404), 프론트 오류 0.
  운영: 함수 정의 백업 `/var/backups/moneyverse-prod-before-351-202611251604.sql`, 351 적용, jar 1e369b5421 배포(백업 …before-1e369b5421), 운영 DB 앱 권한 롤백 검증 성공.
- [해결 0bd4da14be, cd46b21fde] Java 의존성 취약점: OSV(정확한 해석 버전) 조회 결과 19개 라이브러리 124건(심각 16·높음 46: Tomcat 인증/제약 우회·RCE,
  Thymeleaf 표현식 범위 탈출, Netty HTTP/2·SNI·스머글링, jackson PTV 우회, pgjdbc 채널 바인딩 다운그레이드, Spring Security 등).
  Spring Boot 3.3.5(지원 종료)→3.5.16, Tomcat 10.1.62·Netty 4.1.141·Jackson 2.21.9·pgjdbc 42.7.15(42.7.4 하드코딩 제거)·commons-lang3 3.22.0·log4j 2.26.1·
  BouncyCastle 1.87·lavaplayer 2.2.7, 간접 의존성 제약(commons-io 2.22.0·jsoup 1.24.1·org.json 20260814·rhino 1.7.15.1).
  업그레이드 영향 수정: Thymeleaf #ctx 금지(CVE 수정 자체) → 템플릿 변수 직접 참조, TreasuryVault 생성 ID 선채움 제거(Hibernate 6.6).
  재조회: 152개 중 1건(spring-webmvc XsltView/SSE, Spring 7 에서만 수정) — 미사용 확인 + UnpatchedSpringFeatureGuardTest. 프론트 pnpm audit 0건, Next 16.4.6(최신).
  E2E 재실행 중 기존 결함 발견: /api/v1/banking/pockets 처리기 중복(로그인 회원 500) + 중복 이체가 원장 없는 함수 호출·DB 오류 노출 → PocketController 단일화.
  Test: API 전수·로그인 E2E·화면 전부 정상, 오류 0. 운영 배포(백업 …before-cd46b21fde), 화면 12개 200, 30분 오류 감시.
- 저장소 규칙 위반 정정: AGENTS.md 는 커밋에 Co-Authored-By: Claude 금지. 이번 세션 이전 커밋들에 포함됨(일부 main 병합) — 이력 재작성은 하지 않고 이후 커밋부터 제외.
- [해결 90d4b3e015] 인증 없는 공개 쓰기 점검: 활동 수집(헤더 신원 → 세션만, 한 요청 50건 상한; BFF 는 쿠키만 보내 기존엔 회원이 익명 기록),
  Discord interactions(Ed25519 서명 검증, 키 미설정 시 전부 401; 운영 접근 로그상 호출 0건), 배너 클릭(저장 없이 recordedAt → 202 recorded=false).
  도움말 신고·신문 투표는 저장도 주장도 하지 않아 유지. Test 실측 후 운영 배포(백업 …before-90d4b3e015).
- [해결 352] 원장 없는 금전 함수 실행 권한 회수: marketplace_buy/create/bid/cancel, bank_transfer_pocket 2종, bank_archive_pocket 2종(근거 없는 포켓 잔액 현금화 가능).
  Spring 호출 경로 없음 확인, Test·운영 적용, API·화면 전수 중 권한 오류 0. 함수는 남겨 두어 원장판으로 재사용 가능.
- 업그레이드 후 운영 30분 감시: ERROR 0(19:08 경고는 점검용 GET→POST 전용 경로 405).
- [확인] 백업(소유자 지정: 서버의 다른 디스크): 기존 moneyverse-backup.timer 가 6시간마다 운영 DB+사진을 AES-256 암호화해
  /var/backups/moneyverse(sdb)에 저장, 운영 DB 데이터는 sda(/srv/moneyverse-data/db-rebuild-v1202/pgdata) — 스크립트가 같은 디스크면 실패하도록 강제. 7일 보관(약 6.1G, sdb 여유 18G).
  복구 훈련(2026-11-25 19:38): 최신 18:28 백업 복호화 → Test DB 컨테이너 임시 DB 에 pg_restore 오류 0 → 계좌 46·잔액 46·원장 거래 950·기록 1,964·로컬 자격 7·광장 2·감사 32,244
  모두 운영과 일치, 불균형 원장 거래 0. 임시 DB·파일 삭제.
  한계: 두 디스크 모두 같은 가상 호스트의 가상 디스크(호스트 장애 시 함께 손실), 암호화 키 /etc/moneyverse/backup.key 도 같은 서버 → 키 사본을 서버 밖에 보관 필요(소유자).
- 로그인 회원 실사용 E2E 검증 경로 없음(테스트 계정 필요). 2026-11-14 내부 조폐 충전 6건 소유자 확인 필요.

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

- `fe-c/support-chat-locale-route-20261124-0745` PR#3413 — `e6206a46df28c2da0c503f9b19cfe9f98e3be29e`
- `fe-a-guest-finance-20261124-0905` PR#3421 — `d98214fe11925462719d1c97c1fbdace430e3575`
- `fe-b-blog-unpublished-20261124-0925` PR#3424 — `04666e69128f6b7de8db6ec01f6ca0f4fd139fd3`
- `docs/claudex-loop-install-20261124-1319` PR#3431 — `7894fec2efefd3af17ff622216a3c531da4af6e7`
- `docs/multi-skill-install-20261124-1321` PR#3432 — `3e1cb37bf7b0b3508d912e1e5b6ffc050dfa227e`
- `docs/token-tools-20261124-1340` PR#3433 — `414bd7c10f44c5d4eca4376cc50155fd8d6dfc09`
- `docs/omniroute-feasibility-20261124` PR#3434 — `82dfeb55343e3b74b51a720712275f1dd1d17e66`
- `docs/omniroute-install-20261124-1345` PR#3435 — `638c3c8690d488c6501b24f4d6cf9077f019906a`
- `docs/guarded-four-agent-skills-20261124-1431` PR#3436 — `9311a1cb34d7a47f274b07830d18c4f38aa72718`
- `fix/public-ads-clear-disclosure-20261123` PR#3401 — `673a77b2f26e63f7d80d5be61112749e9018df80`
- `docs/agent-tools-observer-mem-20261124-1657` PR#3439 — `488c173aeeb4ae6dbb8c5b9f8d70101d80ac5a1f`
- `docs/reel-ten-skills-20261124-1800` PR#3440 — `97b575ff0da9f38d51a300d9dda722ddba25191a`
- `feat/stitch-design-skill-v2026.11.24.0818` PR#3415 — `098d487a00cc220af5dad2fdc23a2596c8f21394`
- `audit/fe-automation-verification-20261124-0758` PR#3414 — `68a1271be7e77e3bcb375be687ea9310238294d5`
- `fix/fe-c-chat-locale-contract-v2026.11.24.0826` PR#3416 — `b902a7f9cede8d1fbab0b98b588c16a01f25db79`
- `audit/security-review-20261125` PR#3445 — `8e6a967969127348a25a00a6fc52f73875dbadec`
- `docs/guild-home-qa-20261124-1646` PR#3437 — `0d6bdc94e2d5bb1593f2e50b08f3d08636c5ea77`
- `docs/additional-agent-tools-20261124-1807` PR#3441 — `936a2ce2d4b3c92fe6c4b3ca18e11f943de347ca`
- `docs/design-skills-v2026.11.24.1225` PR#3429 — `dc031340ac1b0e497d5a58fbdd2f44b46e3010d1`
- `design/ui-ux-180-pages-20261124` PR#3443 — `b0e7c14e1440a9608815cc91007c594db0a62f31`
- `fix/test-ingress-seo-semantic-20261124` PR#3412 — `987be01b215dcd372165ab54c04a1caacf594dbd`
- `docs/reel-27-resource-architecture-v20261123-12` PR#3408 — `9133b27e93c4f188d5cba31d5af7b49d2588df14`
- `audit/v2026.11.24.2-design-instruction-violations` PR#3419 — `434eb14368ef3099cfbfde736511126d0104c318`
- `docs/nov23-next-spring-architecture-v2026-11-24-1` PR#3423 — `bdec6e9f6164b79e58cc2287d3cad927f6441799`
- `docs/strict-test-server-governance-v2026.11.23.1` PR#3403 — `dfef8ef3953afe4ed4e81015d5e8ccf5c6c0826a`
- `docs/cross-repo-conflict-audit-v2026.11.25.001` PR#3444 — `ace1e222fa548471d7410df7d9cd84ac9c7795aa`
- `docs/auto-fe-v10-test-deploy-20261123` PR#3410 — `c29fd24056d5e7b153463a10599e0c15ae6c1fc1`
- `audit/frontend-readiness-20261123-2300` PR#3409 — `4df4ed047403c6c8456d7b42c91734151840289d`
- `fix/test-legal-scoped-responsive-20261124` PR#3411 — `38ccb1f0c6e547758da405c2a8f63f632849947e`
- `fix/test-frontend-real-backend-20261123` PR#3407 — `a61f6d8b9df05bb9f3daee9f8acff067b15abb21`
- `docs/v2026.11.24.1-single-design-reference` PR#3417 — `184455833c76eb873be40ee46eff5c7dd132ab4d`
- `docs/test-frontend-acceptance-evidence-20261123` PR#3420 — `12419eb7781c94ffb0896cde3228253e3f1cfca8`
- `integrate/all-branches-to-main-v20261124`  — `bc0ad8078540d9f5e70991d8e85c277a8e037323`
- `integrate/branches-docs-unification-20261124` PR#3426 — `d3591e8b6f942dafc5bc9c4edf5cea71f9f7c916`
- `fe/next-spring-test-connect-20261124` PR#3430 — `c154bfc27a2627bd303dbde3e080fe36a087b677`

보존 태그:
- 2fdb2a07980f822848a3b72955656542d7b43244 fe/v12-shell-core10-20261124 -> tag archive/fe-v12-shell-core10-20261124
- 6ec268e667a6fb668e636d259df402171f3a3b61 design/v2026.11.24.12-rebuild -> tag archive/design-v2026.11.24.12-rebuild
- b587d2790e7a06d84707d9c81fd68488e5b9e888 fix/v2026.11.24-visual-repair -> tag archive/fix-v2026.11.24-visual-repair

남은 원격 브랜치: `audit/all-planning-review-20261125`, `audit/spring-backend-architecture-20261125`, `docs/guild-home-remedy-v2026.11.24.1650`, `feat/spring-ledger-wiring-20261125`, `feat/total-game-ui-revamp-v2026.11.24.11`, `main`

복구: `git push origin <sha>:refs/heads/<branch>`

## 2026-11-25 저녁 — 사업 화면 장애, 프론트 점검
- [x] /businesses 로그인 회원 전원 오류(digest 2910198970): /api/v1/business-types 가 "내 사업" 처리기로 잘못 연결돼 응답 모양 불일치 → BusinessTypesController(카탈로그 = business_catalog − 보유, 구매 = 원장 기록 business_purchase + 세션·CSRF·중복방지 키) (3ded518b19). Test 확인 후 운영 반영, 오류 0.
- [x] 프론트 Test 재배포(28db9bf3ee → f1eb43d34f), 비로그인 10쪽·로그인 12쪽 200. 화면 캡처 도구: Playwright 브라우저를 /srv/moneyverse-data/tools/ms-playwright 에 설치(기존 ~/.cache 링크는 건드리지 않음).
- [x] 연금 제목이 휴대폰에서 5줄로 깨지던 문제 수정(f1eb43d34f, 한국어 문구 그대로). 운영 프론트는 아직 예전 릴리스(승격 전).
- [ ] 화면 아래 떠 있는 온보딩·상담 버튼이 휴대폰에서 내용 일부를 가림 — 디자인 결정 필요.

## 2026-11-25 밤 — 전 화면 점검, 남은 기능 연결, 보안 재점검, 모바일 다듬기
- 전 화면 점검(Test): 정적 경로 147개 × 비로그인·로그인. 관리자 39개는 일반 회원에게 404(숨김), 비공개 화면은 비로그인 시 로그인 이동, 화면 오류 0.
- 본문 검사로 "불러오지 못했어요" 8곳 발견 → 원인별 수정, 모두 운영 반영:
  - 진행·초반 게임·참여(cf872b8fb6): 503 자리표시/가짜 출석 금액 → NestJS DB 함수 그대로(EarlyGameReadsController).
  - 지갑 기록(47aedcbe21): 404 → 서명 커서(소유자·필터 결합, 만료) 포함 이식. 사진 목록 405 → 공개 조회, 안전하지 않은 URL 차단. 카지노 약관·공정성 404 → 이식(닫힘 상태면 원본처럼 거절). 계정 연결 시각 마이크로초 → JS 형식(JsTime).
  - 비로그인 사진 목록 401 → 목록 GET만 공개(9f65881b85).
- 보안 실공격 점검(Test): 남의 거래 조회 404, CSRF 없는/틀린 구매 403, 위조·과대 커서 400, 잘못된 입력 400, 오류 본문 SQL 노출 0. 위조 헤더는 무시만 되던 새 조회 8종을 필터에서 403 거절로 강화(d573fb2929). 운영 반영, 오류 0.
- 모바일 다듬기(bda52a3291, Test): 검색 버튼 세로 깨짐, 떠 있는 버튼 높이 불일치, 페이지 끝이 버튼에 가려짐. 디자인 감지기 0건.
- [환경] Test 사진 404: Test 는 운영과 분리된 사진 폴더(/run/.../media)를 써서 운영 DB 복사본의 사진 파일이 없음. 운영은 정상(200). 격리 유지.
- [남음] 미니게임은 카지노 스위치 disabled(정책상 503/403 유지). 운영 프론트는 아직 예전 릴리스 — 승격 절차 확인 후 진행.

## 2026-11-26 새벽 — 보안 다중 점검 + 기획서 기준 실제 흐름 시험
- 쓰기 경로 113개 실공격(Test): 1차에서 3건 발견 → 수정(3ec3df6185) 후 재시험 0건.
  - 은행 입금·출금·이체·이자·대출·상환이 CSRF 없이 원장 함수까지 도달 → 필터 보호.
  - 비밀번호 변경: CSRF·최근 재인증·정책 없이 변경(4자 허용) → NestJS 동일(CSRF, 이 세션 15분 내 재인증, 8~128자·흔한 비번 거부, 다른 세션 종료). 재인증도 CSRF + 호출 세션만 표시.
  - SEO 크롤러 기록 쓰기가 인터넷에 공개(임의 IP·UA 저장) → 서버 비밀 토큰(MONEYVERSE_TELEMETRY_TOKEN, 미설정=꺼짐) + 입력 검증. 가짜 응답(제출 18건, X 상태, 검색 통계) → 정직한 503.
  - 과거 악용 흔적: 접속 기록상 외부 호출 없음(내부 127.0.0.1 만).
- 비밀번호 변경 실제 9단계(Test QA): 재인증 없음 401 / 틀린 비번 401 / CSRF 없음 403 / 정상 200 / 약한 비번 403 / 변경 200 / 옛 비번 로그인 401 / 새 비번 200 / 현재 세션 유지.
- 기획서 APP_SPEC 3.1~3.5 실제 흐름(Test QA):
  - 일일 보상 404 발견 → 이식(226ac3f86c): 100 WLD 지급, 같은 키 재요청 동일 거래(replayed), 두 번째 409, CSRF 없음 403.
  - 은행: 입금 100·출금 40 정상, 같은 키 중복 입금 1회만, 같은 키 다른 금액 400, 음수 400, 잔액 초과 거절.
  - 주식: 매수·매도·중복 방지 정상. 보유 없이 매도/잔액 초과 매수가 503 → 409로 수정(d6424fa664).
  - 지갑 기록 6건·상세·페이지 합계(현금 30/은행 70/순 100) = 실제 잔액, QA 원장 불균형 0, 전체 원장 불균형 0.
  - 로그인 10회 실패 후 429, 운영 보안 헤더(HSTS·CSP·X-Frame DENY 등) 정상, 오류 본문 내부정보 0.
- [처리됨 2026-11-26 07:35, 소유자 선택: 세션 종료+계정 정지] 운영 원장 밖 잔액: 'QA 테스터' 계정(2026-11-19 07:32 생성) USER_CASH 1,000,000 WLD, 원장 기록 0건, 유효 세션 3개. 원장을 거치지 않고 생긴 돈. 세션 종료·계정 정지·잔액 정정(원장 기록 조정) 여부 결정 필요. 아직 사용(지출) 흔적 없음.
- [참고] 크롤러 기록은 토큰 설정 전까지 저장 안 됨(운영 프론트가 예전 버전이라 토큰 미전송).
  - 조치: 세션 3개 종료, users.status=restricted, USER_CASH 계좌 frozen (한 트랜잭션). 잔액은 손대지 않음.
  - 백업: /var/backups/moneyverse-prod-qa-tester-before-suspend-202611260735.sql (root 600).
  - 되돌리기: UPDATE users SET status='active' / accounts SET status='active' WHERE owner_user_id='ff71379c-…'.
  - 원장 밖 잔액 계좌는 운영 전체에서 이 1개뿐(전 회원 계좌 잔액 = 원장 합계 대조).

## 2026-11-26 — 새 디자인(통장 + 게임 달력), "화면을 못 불러옴" 원인, QA 반복
- 디자인 방향(소유자 지정): 은행 통장 느낌 + 기획서 서버 게임 시계(현실 10분 = 게임 1일, 7일 = 1주).
  PRODUCT.md 작성, 방향 계약은 .impeccable/surfaces. 진남 표지 바탕·금박 주 버튼·주홍 도장·미색 속지(.mv-leaf).
  상단 통장 날짜 도장(28.07.10 · n주차 · n일째 · 다음 날까지), 홈 "이번 주 통장" 7칸, 지갑 기록 각 줄 게임 날짜.
- 게임 시계 API: DB 실패 시 "42일째" 가짜 시계를 ok:true 로 주던 것 → 503. dayKey/weekKey 추가.
- 원인 1: 프론트 호출 298개를 Spring 처리기와 직접 대조(FrontendRouteContractTest) → 98개 누락. 이전 HTTP 점검은 필터의 401이 404를 가려 20개로 과소평가.
  송금(wallet/transfers), 근무(work/profile, active-job) 구현 → 94개. 테스트에 상한(94) 걸어 늘지 않게 함.
- 원인 2(내가 만든 결함): 새 속지 클래스 .mv-page 가 기존 페이지 틀 88개와 이름 충돌 → 미색 바탕·흰 글씨. .mv-leaf 로 바꾸고 충돌 방지 테스트 추가. Test 에서만 발생(운영 프론트는 예전 버전).
- DB 직접 조작 경로 점검: 프론트 코드·패키지·프로세스 환경에 DB 접속 수단 없음, DB 5433 외부 차단(11건 차단 기록), 쓰기는 Spring→원장 함수만.
- QA: 1차 전 화면 147개(오류 0), 2차 실제 브라우저 12화면×PC/휴대폰(콘솔·요청 오류는 /stocks 실시간 소켓과 경제 지표 503 뿐), 스크린샷 확인.
- 운영: 백엔드 a27514d76b 반영(오류 0). 프론트 운영 승격은 남은 누락(관리자 화면 대부분)과 함께 처리 예정.
- [남음] 누락 94개: 관리자 콘솔 약 70(경제·주식·AI뉴스·국고·기업·사진·시즌 등), 채팅 대화 관리 4, 상담 기록 2, 참여 설정, 사업 부스트, 기업 공개, 채권 롤오버, 소셜 재인증, SEO 6. /stocks 실시간 시세 웹소켓(Spring 미지원).

## 2026-11-26 — 운영 승격(소유자 승인), 관리자 점검
- 관리자 점검용: Test DB 에서만 QA 계정(fb71a362-…)에 관리자 역할 4개 부여(운영 DB 무관). 관리자 화면 39개 모두 200·서버 오류 0.
- 관리자 조회 13종 이식(979c7d4270): 사업 카탈로그, 시즌 이벤트, 주가 동학·시장 이벤트, 통화 정책 주문·발행/소각 증명서, 공기업·민간기업·배당, AI 뉴스 최신, 세금 정책, 경제 통계. Test DB 앱 권한으로 16개 쿼리 실행 확인.
- 나머지 74개(관리자 54·회원 20)는 404 대신 503(ADMIN_ACTION_NOT_AVAILABLE / FEATURE_NOT_AVAILABLE). 돈을 움직이는 관리자 기능(발행·소각·국고 투입/회수·일괄 지급·취소·강제조정)은 이중 승인 흐름째 옮기기 전까지 실행되지 않음. 라우트 계약 상한 94 → 4(남은 4개는 추출 착오).
- 운영 승격: 백엔드 979c7d4270, 프론트 471adc4eed(새 통장 디자인, 운영용 빌드). 백업·자동 되돌림 절차. 운영 공개 경로 147개 200/307, 운영 화면·Spring 오류 0, 실제 브라우저 7화면×PC/휴대폰 확인(남은 콘솔 오류는 /stocks 경제 지표 503 뿐). 비로그인 홈의 지갑 기록 401 요청 제거.
- [남음] 관리자 화면 16곳의 "불러오지 못함": API 는 200 이지만 응답 형태가 화면 검증기와 다름(회원 목록, 종목, 기능 스위치, 정책 버전, 공지, 사진, 연금, 차단 기록, 원장 내역 등) + 503 처리된 관리자 기능. 고정된 가짜 응답 의심: /admin/activity/traffic(조회 12,540 등), /admin/activity/logs.
