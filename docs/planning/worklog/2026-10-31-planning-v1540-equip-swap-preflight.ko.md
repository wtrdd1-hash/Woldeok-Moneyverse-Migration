# 기획 v1540 — 기능 추가 / 초안 / 배포 보류
## v2026.10.31.1540 — F675-191 회원 장착 교체 사전 검토 (기능 추가 / 초안 / 배포 보류)

**주기:** 이전 기능 보완 v1538 → 현재 기능 추가 v1540 → 다음 기능 보완 v1542(잠정). **근거:** 최신 origin/main `761a55a094fb9dd383d213e817305e68c79fa23c` 시작·중간 재확인, AGENTS.md·README.md·영문 원본 기획서·한국어 대조 확인. Draft #2093(상위 #2089)에 누적하는 문서 전용 제안으로 병합·구현·배포가 아니다. 별도 분산 세부기획서 미생성.

### 문제·실제 코드 근거·범위·대안
- 마이그레이션 `114-economy-faucet-sink-and-shop-2.sql`의 `inventory_equip_item(p_actor,p_catalog_id,p_slot,p_equip)`는 보유 수량과 슬롯 허용 목록만 확인한 뒤 UPDATE 두 번을 수행한다. 보유 만료·상품 분류와 슬롯의 일치·회원별 장착 변경 직렬화를 검증하지 않는다. 8개 슬롯(frame/background/effect/nameplate/title/badge_1/2/3)에 회원별 유일 제약이 없다. `profile_get_cosmetics`는 만료·수량 0 장착행을 표시할 수 있지만 마이그레이션 123의 `shop_my_items_v2`는 제외한다. 이는 **코드 수준의 공백**이지 실제 악용이나 피해의 증거는 아니다.
- 현재 `frontend/src/app/inventory/inventory-view.tsx`는 `/api/v1/shop/holdings/:catalogId/equip`에 POST하며 배지는 모두 badge_1로 지정한다. 서버가 증명한 교체 사전 검토가 없다. Nest 기존 쓰기는 Session/Authenticated/Consent/CSRF 가드가 있으므로 우회하면 안 된다. /inventory의 `apiOrNull || []`은 조회 장애를 빈 목록으로 오인할 수 있다(#1977). F675-188/189/190은 아직 Draft/OFF이다.
- **채택안:** 회원이 이미 보유한 후보 1개와 슬롯 1개를 선택해 읽기 전용으로 교체 준비 상태를 비교한다. F675-190 후보 카드의 `교체 가능 여부 확인 / Review swap`에서 진입한다. 클라이언트만의 판정은 데이터 부족으로 배제하고, 자동 교체/쓰기 기능은 DB 불변조건 미확인으로 배제한다. 구매·장착·유지비 납부·환불·발행·WLD 이체·알림·예약 작업은 하지 않는다. 읽기 성공을 장착 성공 보장으로 표시하지 않는다.

### 회원 흐름·권한·화면·상태·API
- 인증·동의가 유효한 회원 본인만 접근. 비공개 경로 `/inventory/expiring/equipped-impact/replacements/preflight?candidateId=<uuid>&slot=<enum>`. 현재 슬롯 점유 아이템(있다면), 후보의 **현재 카탈로그명**, 수량, 보유 만료, 슬롯 호환성과 검증 시각을 비교한다. 현재 상품명은 과거 구매 당시 이름이 아니며 효과 만료·유지비 납부 증빙은 별도 검증 없으면 UNKNOWN이다.
- `교체 가능 여부 확인`으로 읽기 전용 패널을 열고 `후보 목록으로`·`다시 확인`을 제공한다. V1에는 `지금 장착` 버튼을 제공하지 않는다. 개발 B의 쓰기 경로 보강·슬롯 유일성·정확 SHA 검증 전에는 이 패널에서 쓰기를 활성화하지 않는다. 배지 1/2/3 슬롯을 정확히 유지하고 무조건 badge_1로 바꾸지 않는다.
- 상태: `REVIEWABLE`(수동 검토 가능, **장착 허가 아님**), `BLOCKED_NOT_OWNED`, `BLOCKED_EXPIRED`, `BLOCKED_SLOT_MISMATCH`, `BLOCKED_DUPLICATE_EQUIPMENT`, `BLOCKED_SOURCE_INCONSISTENT`, `UNKNOWN_POLICY`. 400 잘못된 UUID/슬롯, 401 미인증, 403 동의 없음, 404 본인 후보 없음(타인 존재 유출 금지), 409 데이터 변경/장착 충돌, 410 근거 만료, 429 제한, 503 원천 장애. 확인된 빈 슬롯과 UNKNOWN·오류·비정상 응답을 구별하며 503을 빈 패널로 바꾸지 않는다. NULL 만료는 영구가 아니라 UNKNOWN. 낙관적 장착 성공 표시 금지.
- 제안 Nest `GET /api/v1/shop/holdings/equip-preflight?candidateId=&slot=`(세션·인증·동의), Next 비공개 서버 BFF 동일 경로, Android `GET /app-api/v1/shop/holdings/equip-preflight`의 타입·상태 일치. 클라이언트 회원 UUID는 받지 않는다. 응답 `{candidateId,slot,asOfUtc,validUntilUtc,status,reasonCodes,currentOccupant?,candidate:{name,category,quantity,expiresAtUtc},sourceStatus:'VERIFIED'}`. 타인 데이터·원장 원문 제외, UTC 마이크로초 정밀도, 화면 KST 표기.

### DB·트랜잭션·보안·일관성·접근성·지표
- 개발 B와 번호 협의한 **추가형 전진 마이그레이션**에서 `public.inventory_equip_preflight_v1(p_actor uuid,p_candidate uuid,p_slot text)` SECURITY DEFINER, 고정 `search_path=pg_catalog,pg_temp`, 스키마 지정, 모든 user_items 본인 조건, PUBLIC EXECUTE 철회·moneyverse_app EXECUTE만 허용. 보유·카탈로그 관련 테이블의 앱 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 금지 재확인. 적용된 114·123 수정 금지. 기존 PK/FK/수량 제약 유지, 10,001개 합성 데이터 EXPLAIN 후에만 회원·슬롯 인덱스 추가 검토. 신규 테이블·금융 DDL 없음.
- 하나의 SQL 문장 기준 시각과 일관된 읽기 스냅샷(여러 문장이면 READ ONLY REPEATABLE READ). 후보 필터보다 먼저 **회원의 전체 장착행**을 검증: 슬롯 중복, 장착=true·슬롯 NULL, 장착=false·슬롯 비NULL, 수량<=0, 분류 불일치, 만료된 장착행, 이미 장착된 후보, 후보 만료, 기존 점유자, 원천 변경. 응답은 **읽기 근거**이지 쓰기 승인 토큰이 아니다. 진단용 서명 근거 ID를 만들더라도 기존 장착 POST의 권한으로 인정 금지. HTTP 요청 간 트랜잭션/잠금이 없으므로 TOCTOU 없는 장착 보장 불가. 실제 쓰기는 B가 SQL 쓰기 함수를 보강한 뒤 새로 검증해야 한다.
- `validUntilUtc=min(조회시각+30초, 후보/현재 아이템 만료, 관련 7·30일 경계 진입 시각)`. 데이터 수정이 없는 시간 경과로도 근거 무효화. 원본/세션 세대가 바뀌면 패널 폐기·새로고침. 로그아웃·계정 전환·동의 철회·오프라인·뒤로가기에서 이전 계정 응답 노출 금지. 응답 16KiB 이하, 회원별 요청 제한·SQL 타임아웃·민감 매개변수 로그 금지. URL의 후보 UUID가 참조자/로그로 새면 Next BFF에서 읽기용 POST 대안을 검토하되 Nest는 검증된 읽기 GET으로 유지하고 POST를 쓰는 경우 CSRF 정책 준수.
- 실제 공개 edge 및 app-api의 정상/오류/리다이렉트 모두 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` 검증(#2012). 사이트맵·공개 미리보기·UUID 포함 분석 금지. 320px·200% 확대·44px 터치·키보드·초점 복원·스크린리더 비교·aria-live·한영 동등성·WCAG 2.2 AA. Android는 세션 세대 결속·요청 취소·디스크 캐시 금지.
- 관리자에는 20명 이상 서로 다른 회원 집단에서만 사용률·REVIEWABLE/차단/UNKNOWN 비율·409/410/429/503·p95·새로고침·계정 전환 폐기 지표 집계. 회원/후보 UUID, 아이템명, 정확한 시각 저장 금지. **측정 전 목표:** 타인 노출 0, 허위 장착 성공 표시 0, 보유·금융 쓰기 0, 합성 10,001개에서 p95 <300ms.

### 개발 백로그 P0 4 + P1 6 및 배포 게이트
1. **P0 OPS1540-01** — #1984/#2097 운영 실제 프로세스·실행 SHA·릴리스 세대·롤백 자산·독립 외부 복원 증명. 기획 예약의 재시작/정리 금지.
2. **P0 SEC1540-02** — #993/#2094 DEV 앱 직접 DML/TRUNCATE 권한과 적용된 체크섬 불일치 5건 해결; 격리 311/311 마이그레이션 및 앱 직접 테이블 접근 거부 확인.
3. **P0 FIN1540-03** — #1507/#1854 원장 우선 불변조건 유지; 사전 검토로 유지비 납부·구매 증빙·WLD 이동을 주장하지 않음.
4. **P0 REL1540-04** — #2031/#1088/#2012 Draft/HOLD 병합 통제, 실제 edge 비색인, 공식 Test 정확 SHA 전체 frontend/backend/DB/app-api/Android 인증 E2E, 독립 복원·GitOps·운영자 승인 전 Production 승격 금지.
5. **P1 PREFLIGHT1540-05 (B/DB)** — 전진형 본인 전용 SECURITY DEFINER, 슬롯/분류/수량/만료/전체 장착 검증, 부정 권한 시험·인덱스 EXPLAIN·동시성 검증. 장착 쓰기 보강은 B 별도 작업.
6. **P1 PREFLIGHT1540-06 (B/API)** — Nest 읽기 GET·엄격한 UUID/슬롯·오류 매핑·개인정보 로그 금지·응답 크기·세션/동의·속도 제한.
7. **P1 PREFLIGHT1540-07 (A/Next)** — 비공개 비교 패널·접근성 CTA·확인된 빈 상태와 장애 구별·배지 슬롯 유지·계정 전환 방어. 신규 쓰기 금지.
8. **P1 PREFLIGHT1540-08 (C/Android)** — app-api 동등성·로그인/동의/세션 전환·오프라인·디스크 캐시 금지·원천 타입 검증·비공개 헤더.
9. **P1 PREFLIGHT1540-09 (A/QA/ops)** — edge 200/4xx/5xx/리다이렉트 비색인·비캐시, 관리자 20명 집단 지표·악용방지·식별정보 미수집.
10. **P1 PREFLIGHT1540-10 (QA/B)** — **미실행 제안 시험:** 격리 PG 합성 10,001개/회원 2명/슬롯 8개, 분류·만료·NULL·중복 100건, 계정 전환 100건, 시간 경계 100건, 동시 장착/사전 검토 100건, Android/edge 50건; 쓰기 0·기능 OFF 롤백 확인.

**배포:** `inventory_equip_swap_preflight` 기본 OFF, F675-188/189/190 읽기 플래그 선행. 독립 브랜치·Test Docker·공식 Test 정확 SHA·사용자 승인; OFF → 내부 → 소규모 → 확대, 모든 P0 통과 전 보류. 롤백 OFF로 기존 보관함 복원, 데이터/인덱스 삭제 금지. **QA v1405(05:22~05:32 KST)는 이 Draft가 아닌 main 기준:** 백엔드 2,778 PASS/501 SKIP, 프론트 2,770 PASS, lint/typecheck/build PASS, 전체 의존성 감사 exit 1; DEV 권한/체크섬·공식 Test/독립 복원 미해결. 문서 검사로 기능 검증을 주장하지 않음. 외부 독립 근거 신규 승인 **0건**, 누적 검증·중복제거·분류 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. **DRAFT / RELEASE HOLD**, 런타임·DB·WLD·원장·Test·Production·main 미변경.
