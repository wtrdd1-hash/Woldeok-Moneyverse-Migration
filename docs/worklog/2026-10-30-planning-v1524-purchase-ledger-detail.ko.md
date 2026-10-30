## v2026.10.30.1524 — F675-187 본인 구매 영수증 원장 증빙 상세 (기능 추가 / 초안 / 운영 보류)
- **회차:** 이전 보완 v1522 → 현재 추가 v1524 → 다음 보완 v1526(잠정). main bf8d0d48f810932b43783d8605dce53954c60cff, 시작·중간 확인. 기획 #2036 → #2042, 개발 #2046, 배포 사고 #2031. 문서 전용, main 병합·운영 승인 없음.
- **현황:** /shop의 본인 구매 기록은 기본 최근 30건, 필터 시 최근 100건만 표시하며 개별 원장 검증이 없다. 마이그레이션 009의 과거 구매 레코드에는 nullable 결제 필드가 있다. 별도 카탈로그 구매·유지비 영수증은 범위 밖이다.
- **V1:** /shop → /shop/purchases/:receiptId 본인 전용 상세, Nest GET /api/v1/shop/purchases/:receiptId/evidence, Next BFF·Android 동등. VERIFIED_LEDGER_POSTINGS / RECEIPT_RECORDED_UNVERIFIED / LEGACY_INCOMPLETE 구분, 타인/미존재 동일 404, 원천 장애 503. SHOP_PURCHASE의 거래자·금액·정확히 두 전표 USER_CASH credit / SINK debit·균형·outbox 검증. 현재 소유·환불 여부는 추론 금지.
- **보안:** 세션/인증/동의, 전방 SECURITY DEFINER 함수 EXECUTE만, 직접 테이블 권한 금지, 읽기 전용 GET, 정확한 BIGINT WLD 문자열, 실제 edge 전 상태 private/no-store/noindex, 320px·200% WCAG AA, Android 계정 전환, 관리자 20명 이상 집계, 기능 기본 OFF. 신규 테이블·금융 쓰기·런타임 배포 없음.
- **백로그:** P0 OPS1524-01 SEC1524-02 FIN1524-03 REL1524-04, P1 PURCHASE1524-05..10 총 10건(4+6). QA v1396 main 런타임 2 FAIL 및 lint 구문 FAIL, 공식 Test c2129625 vs 공개 Production v1935 bf8d0d48f810932b43783d8605dce53954c60cff; 정확 SHA Test·독립 복원 BLOCKED. 합성 10,001건·음성 시험은 정의만 하고 미실행.
- **외부 근거:** 신규 검증 0, 누적 중복 제거·분류 UNKNOWN / 10,000, BLOCKED / IN PROGRESS. 초안·운영 보류. 상세는 통합 마스터와 #2046.

### 시작 — 2026-10-30 22:06 KST
- [x] 스킬 커넥터 URI가 없어 miniPC 설치 스킬 직접 읽음. miniPC·main·AGENTS·README·영문/국문 기획서·Draft #2042·GitHub 조사.
- [x] 독립 worktree, A/B/C/QA·운영 영역 미변경.
### 중간 — 2026-10-30 22:10 KST
- [x] 과거 상점 SQL·원장 방향·Next/Nest/Android·QA v1396·P0 #2031 확인.
- [x] 원격 main bf8d0d48f810932b43783d8605dce53954c60cff·기획 Draft #2042 재조회, 개발 이슈 #2046·P0 4/P1 6 인계.
### 완료 — 최종 CI 확인 대기
- [ ] 문서 동등성·DOCS_ONLY 분류·원격 CI·Draft PR 결과 기록.
- [ ] 런타임/DB/WLD/Test/Production 무변경 확인. 외부 독립 근거 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.

- **신규 개발 DB 읽기 전용 실측(2026-10-30 22:13 KST):** PostgreSQL 17.11, BEGIN READ ONLY/ROLLBACK, 과거형 public.purchases **0건**. moneyverse_app 유효 권한: purchases SELECT=true, DELETE=true; ledger_postings SELECT=true, DELETE=false; account_balances UPDATE=true; shop_list_my_purchases(uuid,integer) EXECUTE=true. 함수 전용 최소 권한 정책과 충돌하여 P0 SEC1524-02/#993에 반영한다. 개발 DB만 확인했으며 운영 권한·실제 구매/결제 증빙을 의미하지 않는다. Android 게이트웨이는 shop/purchases 경로에 private/no-store/noindex를 적용하지만 중첩 상세·오류·공개 edge·Referrer-Policy는 별도 검증이 필요하다.
