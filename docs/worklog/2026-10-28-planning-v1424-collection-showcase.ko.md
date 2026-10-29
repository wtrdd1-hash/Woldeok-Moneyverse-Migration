# 기획 v1424 — 검증 가능한 회원 컬렉션 쇼케이스 (초안 / 운영 보류)

- **시작:** 2026-10-28 20:05 KST; main `35971c600f25869c96f1c666d4b9f58927202730` 기반 독립 브랜치 `auto/planning-v1424-verified-collection-showcase-20261028-2005`.
- **회차:** 이전 기능 보완 v1422 → 현재 기능 추가 v1424 → 다음 기능 보완 v1426(잠정).
- **범위:** F675-162, 회원의 명시적 동의에 따라 유효기간과 철회 기능을 갖춘 **검증된** 컬렉션 공개 쇼케이스. 문서만 작성하며 기능 구현, DB 변경, 배포 및 테스트 통과를 주장하지 않음.
- **코드 근거:** `frontend/src/app/collections/curation-retention-flow.tsx`의 고정 `?showcase=arch-1063` 공유 링크, `DEFAULT_PIECES` 및 localStorage 대체 표시; `backend/src/collection/collection.repository.ts`의 조회 시 4개 조각 자동 INSERT와 직접 테이블 조회/변경; migration 232에는 획득 증빙 연결이 없음. 이는 검증된 소유권이 아님.
- **운영 차단:** QA v1347 FAILED, 과거 18,000 WLD 원장 불일치, 데이터 디스크 97–98%, 독립 백업 복원 미검증, 앱 계정 DML 및 마이그레이션 차이, 운영 버전 unknown, 공식 Test exact-SHA 미검증.
- **외부 근거:** 독립 근거 10,000건 게이트: 신규 승인 0, 누적 중복 제거 승인 UNKNOWN, BLOCKED / IN PROGRESS.
- **점검:** [x] 스킬·main 확인 [x] UI/API/DB/앱 경로 조사 [x] 영문·국문 통합 기획 [x] 프로젝트 계획·검토·로그 반영 [x] 문서 대조 및 diff 검사 [x] GitHub 이슈·Draft PR [x] 완료 기록.

## Design checkpoint / 설계 중간 기록

## v1424 / F675-162 — 검증 가능한 회원 동의형 컬렉션 쇼케이스 (기능 추가 / 초안 / 운영 보류)

**회차:** 이전 기능 보완 v1422 → 현재 기능 추가 v1424 → 다음 기능 보완 v1426(잠정). **기준 main:** 35971c600f25869c96f1c666d4b9f58927202730 (시작·중간 재확인), AGENTS.md·README.md·영문 PROJECT_PLAN.md 정본·국문 PROJECT_PLAN.ko.md 대조. **개발 전달:** [이슈 #1739](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1739). QA v1347 FAILED. 문서 설계일 뿐 실제 구현·DB·미디어·WLD·Test·Production 변경 없음.

### 1. 실제 코드 근거, 목적 및 제외 범위
- frontend/src/app/collections/curation-retention-flow.tsx는 회원이나 선택 항목과 무관하게 고정된 /collections?showcase=arch-1063 링크를 복사한다. collections 페이지에는 해당 쿼리의 공개 조회 기능이 없다. DEFAULT_PIECES를 먼저 표시하고 통신 실패 시 localStorage 자료를 대신 보여준다. 복사 링크와 로컬 데이터는 서버가 확인한 소유권 증거가 아니다.
- backend/src/collection/collection.repository.ts는 GET 시 ensureSeedPieces()로 기본 수집품 4개를 INSERT하며 public.user_collections를 직접 SELECT/UPDATE한다. Migration 232의 (user_id,code) 유일키에는 신뢰 가능한 지급 이벤트·발행 주체·증빙 결속이 없다. 이는 **코드에서 확인한 신뢰성·개인정보 설계 문제**이지 실제 운영 악용 증거는 아니다.
- **목적:** 회원이 진짜 획득 증거가 확인된 수집품만 선택해 명시적으로 동의하고, 기한이 있으며 언제든 철회 가능한 비공개 링크를 생성한다. **대상:** 로그인·동의 회원, 링크를 받은 방문자, 증빙·감사 권한만 가진 관리자. **성공 조건:** 허위 검증 표시 0건, 타인 정보 노출 0건, 철회·만료 정확성, 모바일 API 동등성 및 접근성.
- **제외:** 신규 수집품 지급, WLD 보상·원장 거래, 거래소, 검색 가능한 공개 전시, 외부 기관 인증, 이미 열람한 내용의 소급 회수. 기존 자동 지급 예시는 독립 근거를 검증하기 전까지 반드시 UNVERIFIED로 유지하고 임의로 검증 완료 처리하지 않는다.

### 2. 회원 화면·CTA·상태 및 동의 흐름
1. /collections 로그인 화면에 **개인 소장품**과 **검증된 쇼케이스 공유**를 구분한다. 로딩·오류·검증/미검증 수를 표시한다. DEFAULT_PIECES 또는 localStorage를 검증 소유권으로 표시하지 않으며 서버 장애 시 공유 CTA 비활성·재시도를 제공한다.
2. 동의 대화상자에서 검증된 조각만 최대 20개 선택하고 별칭(기본 익명), 공유 내용 미리보기, 명시적 동의 체크박스, 기본 7일 만료, 상대방의 스크린샷 보관 가능성을 안내한다. 검증된 항목이 0개이거나 증빙을 확인할 수 없으면 **비공개 링크 만들기**를 비활성화한다.
3. 생성 성공 시 서버가 192비트 난수 토큰을 단 한 번 전달한다. **링크 복사·미리보기·철회**, 만료 시각, 활성 링크 최대 5개 관리 화면을 제공한다. 클립보드 실패를 성공으로 표시하지 않는다. 새로고침 후 목록에는 토큰을 반환하지 않으며 잃어버린 링크는 새로 발급한다.
4. 수신자는 /collections/showcase/[token]을 연다. 공개 필드는 선택적 별칭, 검증된 이름·등급·일 단위 획득일·검증된 공개 출처 요약만 허용한다. 회원 ID·개인 메모·원본 증빙 ID·계좌·잔액·저장소 키를 반환하지 않는다. 존재하지 않음·만료·철회·기능 OFF는 동일한 비열거형 404로 처리한다.
5. 회원이 철회하면 서버 확인 후 UI를 갱신하고 캐시를 무효화한다. 이미 저장된 스크린샷은 회수할 수 없다고 안내한다. 로그아웃·계정 변경 시 이전 계정의 토큰·미리보기·응답을 폐기한다. 미리보기만으로 공개 링크를 생성하지 않는다.
6. 관리자는 지급 근거와 남용 지표만 감사하며 증거 없는 수집품을 VERIFIED로 변경하거나 토큰을 열람할 수 없다. 공개 링크는 검색 노출과 개인 SNS 미리보기에서 제외한다.

### 3. API·권한 계약
- 기존 GET /api/v1/collections, PUT /api/v1/collections/:id는 호환 유지하되 조회 중 INSERT를 중단하고 기본 예시와 실제 검증 지급을 구분한다. 앱 계정에 테이블 전체 권한을 부여하는 임시 해결 금지.
- 회원 GET /api/v1/collections/showcases: 본인 showcaseId·status·createdAt·expiresAt·revokedAt·verifiedPieceCount만 반환, 원본 토큰 제외. 회원 POST /api/v1/collections/showcases: {pieceIds: uuid[1..20], displayAlias?: string, expiresInDays: 7, idempotencyKey: uuid} → 최초 {showcaseId, shareUrl, expiresAt, replayed:false}. 동일 요청 재실행은 원본 처리 메타데이터만 반환하며 토큰을 재노출하지 않는다. 동일 UUID·다른 내용은 HTTP 409.
- 회원 DELETE /api/v1/collections/showcases/:id: {idempotencyKey:uuid} → {showcaseId, revokedAt, replayed}; 반복 철회는 멱등 처리. 공개 GET /api/v1/collections/showcases/public/:token은 레이트 리밋·no-store·동일 404·토큰 형식 검증을 적용한다. Next.js 공개 페이지는 얇은 BFF로 토큰을 로그·분석에 기록하지 않는다.
- Android /app-api/v1/collections/showcases 및 /:id는 회원용 웹 API와 동등한 계약을 적용한다. 공개 딥링크는 별도 보안 검증 전 브라우저로만 연다. 공통 타입·route-map 버전 관리, CSRF/세션/동의 가드, 클라이언트 지정 actorId 금지.

### 4. PostgreSQL 스키마·인덱스·트랜잭션·권한
- 실제 개발 시 main의 최신 번호를 확인하여 신규 마이그레이션을 배정한다. collection_award_receipts(id uuid PK, owner_id FK, piece_id FK, issuer_type, source_kind, source_event_id, evidence_digest bytea, awarded_at, verified_at nullable, revoked_at nullable, created_at), UNIQUE(source_kind,source_event_id,owner_id,piece_id), 증빙 지문 길이·시간 제약. **기존 시드 항목에 자동 검증 영수증을 만들지 않는다.** VERIFIED는 발행자·원본 이벤트가 독립적으로 확인된 경우에만 허용한다.
- collection_showcases(id uuid PK, owner_id FK, token_digest bytea UNIQUE, alias text 길이 1..40, created_at, expires_at, revoked_at, request_id uuid, request_hash bytea), CHECK 만료>생성 및 7일 이내, UNIQUE(owner_id,request_id). 토큰 원문이 아닌 SHA-256/HMAC 지문만 저장. (owner_id,created_at DESC,id DESC), 만료/활성 인덱스. collection_showcase_items(showcase_id FK RESTRICT, award_receipt_id FK RESTRICT, ordinal 1..20, PRIMARY KEY(showcase_id,award_receipt_id), UNIQUE(showcase_id,ordinal)).
- **생성:** 회원 행 FOR UPDATE로 최대 5개 활성 링크 제한 직렬화 → 회원 활성·기능 ON·1~20개 중복 없는 동일 소유 검증 영수증·발행 근거 확인 → 요청 내용 지문과 함께 전부 INSERT 또는 전부 ROLLBACK. 수집품 지급·WLD 차감·원장 변경을 동반하지 않는다.
- **공개 조회:** 난수 토큰 형식 검사 후 지문 조회, 쇼케이스 행 FOR SHARE 등 일관된 잠금과 만료·철회·기능 OFF 재확인, 현재 유효한 검증 영수증과 허용 필드만 조인. 증빙이 취소된 항목은 비공개 또는 명확한 비식별 처리; 오래된 검증 주장을 노출하지 않는다. **철회:** 행 FOR UPDATE로 철회 시각 저장, 이후 조회 차단; 이미 처리 중인 조회의 경쟁 의미를 정의하고 no-store로 캐시 유출을 막는다.
- SECURITY DEFINER 함수에 SET search_path = pg_catalog, pg_temp와 스키마 명시. 서버 세션에서 회원 식별 후 함수 내부에서도 소유권 확인. moneyverse_app/PUBLIC에 신규 증빙·공유 테이블 직접 SELECT/INSERT/UPDATE/DELETE 금지, 필요한 EXECUTE만 허용. 격리 실제 PostgreSQL에서 42501 권한 거부·타인 조회·직접 DML 실패를 검증한다.

### 5. 관리자·보안·SEO·모바일·접근성·KPI
- 관리자: 검증 발행처·고아 증빙·유효/철회/만료 링크 수·남용 집계, 감사 로그. 증거 없는 임의 수집품 지급·토큰 조회·회원 비공개 메모 노출 금지. 권한 분리, 증빙 취소 시 관리자와 사유 기록.
- 보안: 최소 192비트 토큰, 저장 지문·필요 시 상수 시간 비교, IP·회원별 레이트 리밋, 비열거형 404, 요청 UUID·내용 결속, 별칭·출처 XSS 차단, Referrer-Policy: no-referrer, 모든 공유 응답 no-store, 외부 스크립트·토큰 로깅·오류 추적 노출 금지, CSRF·링크 미리보기 봇·계정 전환 방어.
- SEO: 개인 /collections와 토큰 페이지 모두 noindex; 토큰 페이지 nofollow/noarchive 및 X-Robots-Tag, 사이트맵·토큰 canonical·개인 OpenGraph 데이터 금지. KPI는 익명화한 미리보기/생성/철회/만료/실패 수, 무단 노출 0, 철회 차단 100%, 허위 VERIFIED 0을 측정한다. 실제 기준값은 배포 후 검증한다.
- WCAG 2.2 AA: 키보드 포커스 가두기·복귀, 대화상자 이름, 복사/철회 라이브 영역, 시각적 만료 안내, 색상 외 상태 표시, 320px 화면·터치 영역·스크린리더 404 테스트. Android API의 소유권·오류·철회 의미를 웹과 통일한다.

### 6. 테스트·회귀·무중단 배포·롤백 조건 (설계만, 미실행)
- 격리 PostgreSQL 17.11에 합성 10,001건을 넣어 실제 발행 증빙 없으면 **10,001건 모두 미검증**인지 확인한다. 정상 발행 증빙, 21개 선택 거부, 활성 링크 5개 제한과 동시 100개 생성의 6번째 요청 거부, 난수/지문 저장, UUID 동일·상이 재시도, 타인/위조 요청 100개, 만료, 읽기/철회 경쟁, 증빙 취소, OFF, 직접 DML 거부를 시험한다.
- 웹·Android에서 기본 예시/localStorage 검증 오표시 방지, 검증 0개 CTA 비활성, 동의·클립보드 거부·계정 전환·로그아웃·오프라인 재시도, noindex/no-store, 분석·Referrer 토큰 비노출, 기존 메모·즐겨찾기·큐레이션 회귀를 확인한다. 공개 읽기/철회 100개 동시 경합. 성능 목표 공개 조회 p95 300ms 미만은 공식 Test 부하 측정 전 미달성 상태로 기록한다.
- 무중단 순서: 스키마 확장 및 기능 OFF → 독립 근거 있는 지급만 검증 → 기존 시드 UNVERIFIED 유지 → 격리 DB ACL·독립 백업 복원 → 정확 SHA 공식 Test 회원/관리자/Android·금융 E2E → 서명 manifest → 승인된 GitOps 단계적 활성화. 장애 시 공개 읽기·생성 OFF 및 노출된 토큰 철회, 감사·영수증 보존. 코드 롤백으로 철회 링크가 다시 열리면 안 된다.
- **P0:** ENV1424-01(디스크 98%·독립 복원), FIN1424-02(과거 18,000 WLD 불일치·국고 0, 본 기능과 분리), SEC1424-03(허위 소유권·공개 링크·DB 최소권한), REL1424-04(정확 SHA·공식 Test·미병합 PR 보존).
- **P1:** COL1424-05(스키마·인덱스·증빙), COL1424-06(트랜잭션·철회·만료·멱등), COL1424-07(NestJS/Next.js/Android), COL1424-08(회원 UI·동의·접근성), COL1424-09(관리자·개인정보·SEO·KPI), COL1424-10(격리 PostgreSQL·회귀·롤백). 개발 예약이 각각 독립 브랜치와 실행 근거를 소유한다.
- **외부 독립 레퍼런스 10,000건 게이트:** 이전 검토 발행처 PostgreSQL·OWASP·W3C, 이번 신규 승인 0, 누적 실제 획득·중복 제거·근거 분류·승인 UNKNOWN/10,000. **BLOCKED / IN PROGRESS**. 합성 시험, GitHub 이슈, 발행처 수를 검증된 독립 레퍼런스 수로 세지 않는다. 새로운 분산 기획 파일 없이 통합 정본에 흡수한다.

## Final checkpoint / 완료 기록
- GitHub issue #1739 OPEN; Draft PR #1740 OPEN. Two prior documentation-only commits on branch; final log commit to follow. No main merge.
- EN/KO eight-document and ten backlog-ID checks PASS; git diff --check PASS; docs-only scope verified. No runtime, SQL or financial tests executed in this planning run. GitHub CI release-input/classify were IN_PROGRESS at initial PR check; do not call CI complete.
- Main 35971c600f25869c96f1c666d4b9f58927202730 unchanged on midpoint and pre-final fetch; QA v1347 FAILED, disk 98%, independent restore and exact-SHA Test unverified, 18k WLD divergence. Release HOLD. New approved external references 0, cumulative UNKNOWN/10,000 BLOCKED.
- Work remains on separate development branch with actual issuer evidence, exact-SHA official Test, real PostgreSQL privileges and authorized GitOps; no Production or feature switch changes. Next cycle Feature Improvement v1426 provisional.
