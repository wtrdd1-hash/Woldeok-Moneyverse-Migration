# 기획 v1534 내부 업데이트

## v2026.10.31.1534 — F675-189 장착 만료 시간 경계·슬롯 정합성 (기능 보완 / 초안 / 운영 보류)
- **회차:** 이전 기능 추가 v1532 → 현재 기능 보완 v1534 → 다음 기능 추가 v1536(잠정). main bf8d0d48f810932b43783d8605dce53954c60cff 확인, 선행 Draft #2075, 개발 #2074, QA v1402 FAILED/P0.
- **시간만 흐르는 진입 누락 수정:** v1532 TTL은 DB 수정 없이 7/30일 범위로 새로 들어오는 장착 아이템을 놓쳤다. validUntilUtc=min(asOf+60초, 기존 대상 중 최초 만료, 범위 밖 아이템의 최초 expires_at-기간)으로 계산하고 정상 빈 목록도 경계에서 stale 처리.
- **전체 슬롯 정합성:** 마이그레이션 114의 장착 인덱스는 비고유이며 장착 슬롯 NULL·상품 분류 불일치를 완전히 막지 않는다. 장착 함수에는 명시적 회원별 직렬화가 없다. 만료 필터 전에 회원 장착 전체 집합을 검증해 중복·오류·수량 0은 409, 이미 만료된 장착 플래그는 자동 해제가 아닌 별도 경고. SQL 동일 문장에서 statement_timestamp() 한 번 사용. 고유 인덱스·잠금은 개발 B/DB 별도 인계, 이번 DDL 없음.
- **백로그:** P0 OPS1534-01 SEC1534-02 FIN1534-03 REL1534-04; P1 IMPACT1534-05 IMPACT1534-06 IMPACT1534-07 IMPACT1534-08 IMPACT1534-09 IMPACT1534-10 (4+6). QA v1402 백엔드 2,653 PASS/126 FAIL/501 SKIP, 프론트 2,701 PASS/55 FAIL, lint 오류 1, 정확 SHA Test/독립 복원 BLOCKED. 합성 10,001건·무수정 진입/이탈 시험은 **미실행**. 운영 보류.
- **외부 근거:** 신규 검증 승인 0, 누적 검증·중복 제거·분류 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 문서만 변경, 런타임/DB/WLD/Test/Production/main 변경 없음. 영문·국문 상세는 통합 마스터와 #2074 참조.

**현재 기획:** v1534 F675-189 시간 창 진입·장착 슬롯 정합성 / 개발 #2074 / 선행 Draft #2075 / 운영 보류.


## v2026.10.31.1534 — F675-189 장착 아이템 만료 경계·슬롯 정합성 보완 (기능 보완 / 초안 / 운영 보류)

**회차:** 이전 기능 추가 v1532 → 현재 기능 보완 v1534 → 다음 기능 추가 v1536(잠정). 최신 main bf8d0d48f810932b43783d8605dce53954c60cff 확인, 선행 Draft #2075, 개발 #2074, 독립 QA v1402 FAILED/P0. 영어 정본과 의미 동등한 기획 문서이며 구현·배포 승인이 아니다.

### 소스에서 확인한 문제와 수정 설계
- **시간 경과만으로 발생하는 조회 대상 진입 누락:** v1532의 validUntilUtc=min(조회시각+60초, 조회 대상 중 가장 빠른 만료시각)는 대상 아이템이 7/30일 창에서 **빠져나가는** 시각만 반영한다. 최초 조회 시 상한 밖에 있던 장착 아이템이 DB 수정 없이 시간이 흐르며 **창 안으로 진입**하는 시각은 누락된다. 따라서 정상적으로 검증된 빈 목록도 60초 전에 틀릴 수 있다. 대상 조건은 UTC 시각 기준 asOf < expires_at <= asOf+withinDays*24시간이며 상한 동등은 포함한다.
- **전체 장착 슬롯 정합성:** 마이그레이션 114에는 8개 슬롯 문자열 CHECK와 (user_id,is_equipped) **비고유** 인덱스만 있다. 장착=true일 때 슬롯 필수, 회원별 슬롯 단일성, 상품 분류와 슬롯 일치를 강제하지 않는다. inventory_equip_item은 허용된 슬롯을 호출자가 지정할 수 있고 명시적인 회원별 직렬화 잠금 없이 UPDATE 2회 실행한다. profile_get_cosmetics는 일부 슬롯에 LIMIT 1을 사용하며 수량·만료를 검사하지 않는다. 이는 **소스 수준의 위험**이며 실제 중복 장착이나 악용 발생이 확인된 것은 아니다.
- 만료 예정 필터를 적용하기 **전** 해당 회원의 is_equipped=true 전체 집합을 검증한다. 7/30일 범위에 하나만 포함되더라도 동일 슬롯 중복, NULL/알 수 없는 슬롯, 분류 불일치(배지 슬롯은 badge, 나머지는 대응 분류), 수량<=0이면 409 EQUIPMENT_SOURCE_CONFLICT. 임의 LIMIT 1이나 정상 빈 목록으로 처리하지 않는다. 이미 만료됐지만 장착 플래그가 남은 경우 EXPIRED_FLAG_STILL_SET 별도 경고를 표시하고, 만료 예정 목록이나 자동 해제 사실로 간주하지 않는다. 만료 NULL은 UNKNOWN이며 영구 소유 증거가 아니다. 판매 중단된 카탈로그의 실제 보유 아이템도 포함한다.
- 대안 비교: 클라이언트 60초 타이머만 사용(진입 누락), **DB 기준 진입·이탈 경계 동시 계산(채택)**, 백그라운드 자동 장착 해제(변경 범위·보안 문제로 제외). 새 회원 테이블, 알림·ICS, 금융 거래, 자동 장착 변경 없음.

### DB/API 및 시간 경계 계약
- Nest GET /api/v1/shop/holdings/expiring/equipped-impact, Next 동일 출처 /api/shop/holdings/expiring/equipped-impact, Android /app-api/v1/shop/holdings/expiring/equipped-impact. withinDays=7|30(기본 7)만 허용하고 실제 인증 세션·동의에서 회원을 결정하며 클라이언트 actor 입력은 거부한다. 성공 응답: asOfUtc, validUntilUtc, withinDays, items [{catalogId,currentName,equippedSlot,quantity,holdingExpiresAtUtc}], warnings [{equippedSlot,reason:EXPIRED_FLAG_STILL_SET}], sourceStatus:VERIFIED. 경고 최대 8개. items가 비어도 경고가 있으면 '장착 이상 없음'으로 표현하지 않는다. 잘못된 200 응답은 503으로 차단한다.
- 전진 전용 SECURITY DEFINER 본인 조회 shop_my_equipped_expiry_impact_v1(actor,within_days), 고정 search_path·테이블 스키마 명시·PUBLIC EXECUTE 회수·moneyverse_app EXECUTE만 허용. **동일 SQL 문장 안에서 statement_timestamp()를 한 번 확정**하고 그 asOfUtc와 목록·경계를 함께 반환한다. REPEATABLE READ 트랜잭션에서도 별도 SQL 문장의 statement_timestamp()는 달라질 수 있으므로 시각을 별도 조회한 후 새 시각으로 필터링하면 안 된다. 다중 문장 사용 시 PoolClient 1개·READ ONLY REPEATABLE READ·COMMIT/ROLLBACK. JS Date.now()를 DB 시각으로 사용하지 않는다. 직접 테이블 권한 부여, 기존 마이그레이션 수정, 금융 쓰기 금지.
- H=withinDays*24시간. 전체 유효 장착 아이템 중 exitBoundary=min(expires_at, asOf<expires_at<=asOf+H), entryBoundary=min(expires_at-H, expires_at>asOf+H)로 계산한다. validUntilUtc=min(asOf+60초, exitBoundary(있을 때), entryBoundary(있을 때)). DB 현재 시각이 validUntilUtc 이상이면 **정상 빈 목록을 포함하여 즉시 STALE**로 처리하고 새 DB 시각으로 재조회한다. 경계가 잘못됐거나 이미 지난 경우 정상 성공을 반환하지 않는다. 페이지네이션·커서 없음(정상 슬롯 최대 8개), 단 결과 제한 전 전체 장착 집합 검사. 요청 간 동일 스냅샷을 보장한다고 주장하지 않는다.
- 별도 개발 B/DB 작업: 중복 데이터 선행 점검 후 is_equipped AND equipped_slot IS NOT NULL 조건의 (user_id,equipped_slot) 부분 UNIQUE 인덱스 검토, 장착 플래그·슬롯·상품 분류 일관성, 회원별 장착 변경 직렬화, 동일 슬롯 두 아이템 동시 장착 회귀시험. 이번 기획 예약에서는 DDL을 실행하지 않으며 쓰기 측 보완 전에도 읽기 측은 오류를 숨기지 않는다.

### 화면·개인정보·관리·시험·배포
- 기능 스위치가 활성화된 /inventory → /inventory/expiring?withinDays=7|30 → **장착 영향 확인** → /inventory/expiring/equipped-impact. 선행 F675-188이 OFF이면 동작하지 않는 CTA를 노출하지 않는다. 현재 변경 가능한 상품명, 슬롯, 수량, KST 보유 만료 시각, 보관함 이동을 표시한다. 정상 빈 목록·만료 후 장착 플래그 경고·409 충돌·진입/이탈 경계 STALE 새로고침·401/403·429·503 재시도를 구분한다. 기존 장착 미리보기와 전체 수량은 보존한다. 계정/기간 전환 시 요청 취소·이전 응답 차단. 320px·200% 확대·키보드·초점·aria-live·WCAG 2.2 AA.
- inventory_equipped_expiry_impact 기본 OFF. Nest/Next/Android/실제 공개 Nginx의 200·4xx·5xx에 private,no-store/noindex,nofollow/no-referrer 적용. 분석에는 회원·상품 ID, 이름, 정확한 만료시각, 토큰을 기록하지 않는다. 관리자에게 회원별 우회 조회 없이 **20명 이상 집계**만 제공. KPI: 화면 진입, 검증된 영향 건수, 만료 플래그 경고율, 409율, 창 진입으로 인한 stale율, p95.
- **수용시험 명세만 작성·미실행:** 격리 PostgreSQL 17.11 전체 마이그레이션, 합성 10,001개, 8개 슬롯, 상한 동등/+1마이크로초, DB 수정 없는 5초 뒤 창 진입·이탈, 빈 목록→대상 발생, 범위 밖 중복 슬롯, NULL·분류 불일치·수량 0, 이미 만료된 장착 플래그 경고, 비활성 상품·NULL 만료, 타인 접근, PUBLIC/앱 직접 권한 부정, 동시 장착, Android/엣지 보안, 계정 전환, 접근성. 경계 이후 stale 200·임의 LIMIT 1·금융 쓰기 금지, p95<=500ms와 메모리 측정. 쓰기 측 동시성 시험은 별도 구현 전 BLOCKED.
- **독립 QA v1402(2026-10-31 02:18~02:32 KST):** 백엔드 2,653 PASS/126 FAIL/501 SKIP, 프론트 2,701 PASS/55 FAIL, lint 파서 오류 1건, 타입검사·빌드 PASS. DEV 311개 중 293개 적용·체크섬 불일치 5건·앱 계정 과도한 DML. 공식 Test 정확 SHA와 독립 복원 BLOCKED. 공개 Production의 비공개 페이지 index/follow, runtime-check FAILED. 운영 승격 HOLD. 문서 CI 통과는 런타임 인증이 아니다.
- **외부 독립 근거 10,000건 게이트:** 이번 신규 검증 승인 0건, 누적 검증·중복 제거·근거 분류 수량 UNKNOWN/10,000 → BLOCKED / IN PROGRESS. 내부 GitHub 기록·합성 데이터·중복 링크는 실적으로 세지 않는다.

### P0/P1 개발 인계 — P0 4건, P1 6건
| 우선순위 | ID | 검증 가능한 완료 조건 |
|---|---|---|
| P0 | OPS1534-01 | 운영 실행 SHA·롤백 해시·독립 복원·공개 엣지 출처 #1984. |
| P0 | SEC1534-02 | DEV 앱 직접 DML 제거, 체크섬 불일치 5건·미적용 18건 원인 규명, 적용 이력 수정 금지 #993. |
| P0 | FIN1534-03 | 국고/MINT/SWF/채권 원장 증빙, 가공 정산·잭팟 금액 금지 #1976/#2077. |
| P0 | REL1534-04 | #2031/#1088 병합 통제, lint·백엔드 126/프론트 55 실패, 정확 SHA Test E2E·공개 엣지·승격 승인. |
| P1 | IMPACT1534-05 | DB/B: 전체 슬롯 검증·DB 시각 1회·진입/이탈 경계·경고·EXPLAIN·쓰기 측 정합성 인계. |
| P1 | IMPACT1534-06 | 백엔드 B: 엄격 DTO·읽기 전용 스냅샷·400/401/403/409/429/503·가짜 빈 목록 금지. |
| P1 | IMPACT1534-07 | 프론트 A/C: 만료 플래그 경고·창 진입 stale 새로고침·계정/기간 보호·접근성. |
| P1 | IMPACT1534-08 | Android C: 세션 동일성·엄격 응답 검증·비공개 no-store. |
| P1 | IMPACT1534-09 | 보안/운영: 공개 엣지 전체 상태 noindex/no-store, 기본 OFF, 관리자 20명 이상 KPI. |
| P1 | IMPACT1534-10 | QA: 격리 DB 10,001건·무수정 진입/이탈·범위 밖 중복·동시 장착·정확 SHA Test·롤백. |

**최종 판정:** DOCUMENTATION PROPOSAL / DRAFT / RELEASE HOLD. 런타임·DB·WLD·원장·Test·Production 변경이나 main 병합 없음. 새 분산 기획 파일 없음.

**현재 기획:** v1534 F675-189 시간 창 진입·슬롯 정합성 보완, 개발 #2074, 선행 Draft #2075, 운영 보류.


## 작업 기록
시작: miniPC Debian 13.6, 스킬 목록 비어 설치된 Superpowers 스킬 직접 확인, 최신 main·QA 확인. 중간: main·기획서·작업 충돌 재조회. 완료: 문서 검사·diff·GitHub 초안/CI·운영 게이트 별도 확인.
