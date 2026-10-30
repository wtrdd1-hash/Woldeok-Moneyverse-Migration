# 기획 v1536 — 시작·중간·완료 근거

## v2026.10.31.1536 — F675-190 만료 예정 장착 슬롯의 보유 아이템 대체 후보 미리보기 (기능 추가 / 초안 / 운영 보류)

**회차:** 이전 기능 보완 v1534 → 현재 기능 추가 v1536 → 다음 기능 보완 v1538(잠정). 최신 main 761a55a094fb9dd383d213e817305e68c79fa23c 시작·중간 재확인, 선행 Draft #2080, 개발 이슈 #2088. 영어 원본과 동등한 한국어 기획이며 구현·배포 승인이 아니다.

### 실제 소스와 기능 목적
- 마이그레이션 071: user_items 회원·상품 복합 PK, 수량 0 이상, 만료시각 NULL 가능; 카탈로그 이름·분류·판매 활성 상태는 변경 가능하다. 마이그레이션 114: 프레임·배경·효과·이름표·칭호·배지 3개 총 8개 슬롯, 그러나 회원별 동일 슬롯 UNIQUE와 상품 분류 일치 제약은 없다. inventory_equip_item은 호출자가 슬롯을 지정할 수 있고 UPDATE 두 번으로 장착을 변경한다. 123의 shop_my_items_v2는 보유·유지비·효과 정보를 제공하지만 NULL 만료=영구 소유, 체납액 0=완납을 증명하지 않는다.
- 현재 Next /inventory는 장착 아이템을 표시하고 /api/v1/shop/holdings/:id/equip POST를 호출한다. Nest GET /api/v1/shop/holdings는 본인 범위 shop_my_items_v2를 조회한다. 확인한 main에는 대체 후보 전용 조회 화면/API가 없다. 선행 F675-188·F675-189는 아직 Draft/OFF이므로 두 기능이 활성화되기 전에는 동작하지 않는 버튼을 노출하지 않는다.
- **신규 기능:** 만료 예정 장착 슬롯에서 이미 본인이 보유한 같은 분류의 **현재 미장착** 아이템을 수동 검토용 후보로 보여준다. 구매 유도·자동 장착·자동 연장·WLD 지출·환불·유지비 납부·효과 보장·장착 프리셋(#1142)·캘린더/ICS(#1267) 중복은 제외한다. 기존 보관함으로 이동해 사용자가 직접 재확인·장착하도록 한다.
- 대안 검토: 클라이언트 기존 목록 필터는 조회 장애를 빈 목록으로 오인하고 DB 시간·페이지 정합성이 약하므로 제외; **본인 전용 읽기 SQL과 엄격한 API 채택**; 자동 대체·결제는 승인되지 않은 쓰기이므로 제외.

### 회원 화면·권한·상태
- 대상: 인증·동의 완료 회원. /inventory → /inventory/expiring?withinDays=7|30 → /inventory/expiring/equipped-impact → 영향받는 슬롯의 **보유 중 대체 후보 보기** → /inventory/expiring/equipped-impact/replacements?slot=...&withinDays=7|30(기본 7일). 슬롯은 frame/background/effect/nameplate/title/badge_1/badge_2/badge_3만 허용. 타인 조회·관리자 우회 조회 없음.
- 현재 변경 가능한 상품명(구매 당시 이름 아님), 만료시각 KST, 수량, 판매 중단 상품 배지, NULL 만료는 **만료 정보 확인 필요**, 후보 상태 REVIEW_ONLY(장착 가능 여부는 적용 시 재확인)로 표시. 기본 20개·최대 50개, 다음 페이지 버튼. **보관함에서 직접 확인** 버튼은 /inventory로만 이동하며 신규 화면에서 장착 POST를 실행하지 않는다.
- 로딩, 검증된 빈 목록, 후보 있음, 다음 페이지, 409 원천 변경/시간 경과, 410 커서 만료, 400 입력 오류, 401 미인증, 403 동의 필요, 429 요청 제한, 503 DB/응답 장애를 구분. 503·잘못된 HTTP 200을 정상 빈 목록으로 표시 금지. 회원·세션·슬롯·기간 전환 시 기존 목록 삭제, 요청 취소·이전 응답 차단. 320px·200% 확대·키보드·초점·aria-live·WCAG 2.2 AA.

### API·DB·트랜잭션·보안
- Nest GET /api/v1/shop/holdings/expiring/equipped-impact/replacements, Next BFF GET /api/shop/holdings/expiring/equipped-impact/replacements, Android GET /app-api/v1/shop/holdings/expiring/equipped-impact/replacements. slot, withinDays=7|30, pageSize 1~50(기본 20), 불투명 cursor만 받는다. 중복·알 수 없는 필드·클라이언트 회원 UUID 거부. SessionGuard/AuthenticatedGuard/ConsentGuard, 실제 세션의 requireUserId·requireSession.id 사용. 기능 스위치 inventory_equipped_replacements 기본 OFF.
- 전진 전용 SECURITY DEFINER public.shop_my_equipped_replacement_candidates_v1(p_actor uuid,p_slot text,p_within_days integer) 제안. search_path pg_catalog,pg_temp 고정, 테이블 스키마 명시, PUBLIC EXECUTE 회수, moneyverse_app EXECUTE만 허용, 테이블 직접 SELECT/DML 권한 신규 부여 금지. 함수 내부 회원 필터를 강제한다. 단, actor 인수만으로 SQL 호출자의 암호학적 신원을 입증하지 못하므로 HTTP 인증 세션 결속과 SQL 침해 위협 모델을 별도 검증한다.
- **후보 조회 전에 전체 장착 집합 검증:** 범위 밖 중복 슬롯, NULL·허용 외 슬롯, 상품 분류 불일치(배지 3슬롯은 badge), 수량 0이면 409 EQUIPMENT_SOURCE_CONFLICT. 이미 만료됐지만 장착 플래그가 남은 것은 경고이며 자동 해제 증거가 아니다. 선택 슬롯에 (DB asOf, asOf+7/30일] 범위 만료 예정인 실제 장착 보유분이 없으면 409 TARGET_NOT_IMPACTED.
- 후보 조건: 회원 본인, 같은 상품 분류, 수량>0, is_equipped=false, 대상 장착 상품과 다른 catalog_id, expires_at NULL 또는 DB asOf보다 미래. 판매 중단된 실제 보유 상품도 포함하되 표시한다. NULL 만료를 영구 소유로 표시하지 않고, suspended=false·체납액 0·효과 영수증만으로 장착 가능·납부 완료·효과 적용을 보장하지 않는다. 후보는 오직 REVIEW_ONLY.
- **하나의 SQL 문장 안에서 statement_timestamp() 1회 확정**하고 그 시각으로 검증·필터·경계를 함께 계산. 다중 문장일 경우 하나의 PoolClient, READ ONLY REPEATABLE READ 트랜잭션. 페이지 정렬은 (sc.name COLLATE "C" ASC, sc.id ASC), 키셋 커서 HMAC-SHA256에 회원·세션·슬롯·기간·asOfUtc·validUntilUtc·전체 원천 지문·마지막 이름·UUID 결속, 최대 15분. MAC 상수 시간 비교·키 교체 정책. 지문은 **보이는 페이지만이 아닌 전체 장착 집합과 동일 분류 후보 전체**의 UUID·수량·분류·현재 이름·마이크로초 만료·장착 여부·판매 활성 상태를 포함하며 페이지마다 재검증한다. 원천 변경 시 409; 서로 다른 요청 간 동일 DB 스냅샷이라고 주장하지 않는다.
- validUntilUtc=min(asOf+60초, 가장 빠른 후보의 실제 만료, 영향받는 장착 아이템 만료, 장착 아이템이 7/30일 창에 새로 진입하는 가장 빠른 경계). DB 현재시각>=validUntilUtc면 검증된 빈 목록도 409 STALE. 커서 자체 만료는 410. 임의 LIMIT 1, 이상 데이터 잘라내기, JS 시각 권위 사용 금지. 기존 user_items PK·카탈로그 PK·장착 인덱스 우선 사용하고 합성 10,001건 EXPLAIN에서 병목이 확인될 때만 별도 검토한 전진 마이그레이션 인덱스 제안. 신규 테이블·금융 원장·outbox·자동 작업·DB 쓰기 없음.
- **커서 페이지의 DB 시각 계약:** 첫 페이지는 동일 SQL 문장의 statement_timestamp()를 asOfUtc로 고정한다. 다음 페이지에서는 서버가 검증한 서명 커서의 asOfUtc를 SQL 함수에 전달하되, 그 **동일 문장**에서 새로운 dbNow=statement_timestamp()를 구해 dbNow<validUntilUtc 및 고정 asOf 기준 전체 원천 지문을 다시 검사한다. 커서로 asOf·validUntil·기간·정렬을 재설정할 수 없다. 후보 10,001건을 모두 Nest로 보내 JS에서 페이지를 나누지 않고 SQL의 p_after_name/p_after_catalog_id와 p_limit<=51 키셋으로 제한하되 전체 원천 정합성·지문은 먼저 검사한다. 시간/원천 변경 시 부분 페이지 대신 409, 실제 SQL 실행 계획에서 p95 검증.
- 정상 DTO: {asOfUtc,validUntilUtc,slot,withinDays,candidates:[{catalogId,currentName,quantity,holdingExpiresAtUtc|null,catalogActive,reviewStatus:'REVIEW_ONLY'}],nextCursor,sourceStatus:'VERIFIED'}. 오류 400/401/403/409/410/429/503. 200과 오류 모두 Nest/Next/Android/공개 Nginx에서 private,no-store/noindex,nofollow/no-referrer. 공개 비공개 페이지 index/follow #2012 미해결. 세션/IP 요청 제한, 계정 전환 보호. 조회 GET은 부작용이 없으며 별도 승인 없는 POST·CSRF 쓰기 작업 없음.
- 관리자: 회원별 조회 우회 없이 **20명 이상 집계**만 표시. 화면 진입, 후보 있음/빈 목록 비율, 409/503, p95, 보관함 이동률; 회원·상품 UUID, 이름, 정확한 만료시각, 토큰·커서 원문은 분석 로그에서 제외. 목표 합성 10,001개 p95<=500ms. 기능 기본 OFF, 선행 기능 활성 확인 후 단계적 노출.

### 검증·배포·롤백 및 개발 백로그
- **시험 설계만 수행, 실제 미실행:** 격리 PostgreSQL 17.11 전체 전진 마이그레이션, PUBLIC·앱 직접 테이블 권한 부정, 회원 2명 분리, 합성 10,001개, 8개 슬롯, 만료 NULL·판매 중단·수량 0·분류 오류·범위 밖 중복 장착, 상한 동등·+1마이크로초, DB 수정 없는 후보 만료/기간 진입, 이름·수량 변경, 커서 변조·계정 재사용·15분 경과, 잘못된 200, 503/빈 목록 구분, Android·엣지·접근성·동시성·EXPLAIN, WLD·원장 쓰기 0. 전체 CI·정확 SHA 공식 Test 인증 E2E·독립 백업 복원·불변 롤백 이미지·명시적 운영 승격 승인 필요.
- 별도 개발 브랜치와 격리 Test 정확 SHA 검증 전까지 배포 금지. 롤백은 기본 OFF 스위치와 읽기 API·화면 제거로 가능해야 하며 기존 보관함/장착 기능 유지. 새 인덱스가 필요한 경우 별도 승인한 전진 마이그레이션으로 처리한다.
- **P0 4건:** OPS1536-01 운영 실행 SHA·롤백·독립 복원(#1984); SEC1536-02 개발 DB 과도한 DML·체크섬 5건·미적용 18건(#993); FIN1536-03 국고/MINT/SWF/채권·잭팟 원장 근거(#2077); REL1536-04 Draft/HOLD 병합 통제(#2031/#1088)·전체 lint·126/55 실패·정확 SHA Test·엣지 #2012.
- **P1 6건:** REPLACE1536-05 B/DB 본인 SQL·전체 집합·EXPLAIN·권한 부정; REPLACE1536-06 B Nest DTO·커서·오류; REPLACE1536-07 A/C Next 화면·계정 전환·접근성; REPLACE1536-08 C Android 계약·오류 차단; REPLACE1536-09 보안/운영 엣지·스위치·20명 이상 관리자 KPI; REPLACE1536-10 QA 격리 PG 10,001건·회귀·배포 게이트.
- **최신 확인 독립 QA v1402(2026-10-31 02:18~02:32 KST):** 백엔드 2,653 PASS/126 FAIL/501 SKIP, 프론트 2,701 PASS/55 FAIL, lint 파서 오류 1, 타입검사·빌드 PASS. DEV 마이그레이션 293/311·체크섬 5건 불일치·과도한 앱 DML, 공식 Test 정확 SHA·독립 복원 BLOCKED, Production 비공개 페이지 index/follow·런타임 검사 FAIL. 이번 신규 기능의 수용시험 결과가 아니며 운영 보류 유지.
- **외부 독립 레퍼런스 10,000건 게이트:** 이번 신규 검증 승인 0건, 누적 검증·중복 제거·근거 분류 승인 UNKNOWN/10,000 → BLOCKED / IN PROGRESS. 내부 GitHub·합성 데이터는 제외.

**판정:** 기획 문서 초안 / DRAFT / RELEASE HOLD. 런타임·공유 DB·WLD·원장·Test·Production·main 변경 없음. 새 분산 기획 파일 없음.

**현재 기획:** v1536 F675-190 보유 대체 후보 미리보기, 개발 #2088, Draft PR 작성 예정(선행 #2080), 운영 보류.
