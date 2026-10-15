# F675-01 — 기능 실재성·사용자 신뢰·안전한 오류 복구 상세 명세

> 버전 **v2026.10.15.677** | 상태 **PLANNING / 운영승격 BLOCKED** | 2026-10-15 KST
> 권한 순서: [PROJECT_PLAN](PROJECT_PLAN.ko.md) → [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [v675 전체 기능 재검토](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md).
> 영어 원본: [F675-01 Feature Reality](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md)
> 시작 `origin/main=a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13`; 작업 중·최종 SHA는 [작업 기록](../worklog/2026-10-15-feature-truth-ux-v677.ko.md)에 기록.

## 0. 핵심 제품 결정과 제외 범위

**사용자 약속:** 버튼을 누르거나 관리자 상태창에 초록 표시가 있다는 이유만으로 “처리 성공”으로 오해시키지 않는다. 지금 **할 수 있는 일**, **서버에 제출된 일**, **서버가 확인한 결과**, **결과가 불확실할 때 안전한 다음 행동**을 구별한다. 관리자는 추정된 100%가 아니라 증거와 실제 실패 구간을 확인한다.

**범위:** 지갑·직업·가상주식·은행·계정 등의 기능별 가용성/회복 UX, 관리자용 화면→버튼→BFF→Nest→DB/워커 실제 연결 관리대장, 릴리스 검증 자동화. 기존 `/admin/api-health`, `/admin/controls`, `frontend/src/lib/action-state.ts`, API 계약과 QA 대장을 확장한다. 중복 상태 관리 화면을 만들지 않는다.

**제외:** 무증거 기능 활성화, 서버 내부주소·보안 구성·계정정보 공개, 쓰기 API 상태점검 호출, “전부 정상” 고정 수치, 운영 거래 테스트용 실제 자금 변경, DB 권한 확대, 신규 수익화/실물 금융 서비스, 오류 상태별 색인 대상 URL 자동 생성.

## 1. 현재 코드·기획과의 차이 — 운영 확인과 혼동 금지

| 근거 | 확인된 소스 상태 | 위험 및 검증 의무 |
|---|---|---|
| `backend/src/admin/api-health.controller.ts` | 여러 영역에 정적 `OPERATIONAL`, 성공률 `100.0`, 고정 지연시간이 들어가 있으며 일부 DB 조회만 실제 측정. 응답 `isLiveTelemetry: true`와 혼재 | **T677-01 P0:** 미측정 성공률은 `UNKNOWN`, 예시값은 실제 측정치처럼 표시 금지 |
| `frontend/src/app/admin/api-health/api-health-dashboard.tsx` | 10초 자동 조회 실패 시 예외가 무시되며 이전 화면 값이 유지될 수 있음 | **T677-02 P1:** 마지막 실제 샘플 시각, 신선도 만료, 실패 경고를 구분 |
| `frontend/src/lib/action-state.ts` | 서버 액션 상태 `idle / ok / error` | **T677-03 P0:** 원장·백그라운드 처리 작업에는 대기/결과불명/서버확정 구분 |
| `FULL_ROUTE_UI_QA_SPEC.md` | 모든 화면·권한·상태·모바일 및 5회 전체 검증 의무 | **T677-04 P0:** 자동 기능 대응표로 실제 브라우저 E2E를 대체하면 안 됨 |
| `PROJECT_PLAN` v397·v530 | 버튼과 필요한 API 동시 구현, 모든 관리자 모바일 UI 통과 의무 | **T677-05 P0:** 화면·API 존재만으로 정상기능 판정 금지 |
| v638/v651/v652 과거 감사 | 404, DB 권한 및 Test/운영 버전 불일치 증거 | **T677-06 P0:** 최신 동일 SHA로 재검증. 과거 건수를 현시점 운영수치처럼 주장 금지 |

화면 수나 버튼 수는 실제 생성기를 돌린 후 기록한다. 이번에 검토한 소스가 현재 운영서버에 실행 중이라는 증명은 따로 하지 않았다.

## 2. 실제 사용자 입장 — 목표·좌절·검증할 가설

**이번 검토에서 이용자 인터뷰나 사용성 실험은 실제로 진행하지 않았다.** 다음 사용자의 반응은 기획자가 검증해야 할 가설이지 유저 여론·실측 성과가 아니다. 실제 실험에는 동의를 받고 개인 계좌·잔액·인증정보 수집 없이 진행한다.

| 이용자 유형 | 사용자가 하고 싶은 일 | 불편하거나 위험한 순간 | 사용성 검증 과제 |
|---|---|---|---|
| 검색으로 유입된 비회원 | “계산기/가이드를 보고 게임도 구경하고 싶다” | 버튼이 404 또는 로그인 화면만 열리고 돌아갈 길 없음 | 공개 가이드→로그인→원래 화면 복귀 |
| 한국어 모바일 신규회원 | “내 첫 직업을 수행해 WLD 보상을 확인하고 싶다” | 화면 잘림, 실행 불가 버튼, 실제로 없는 보상 성공 표시 | 직업찾기→수행→영수증 확인 |
| 가상주식 거래 이용자 | “주식 주문이 들어갔나? 두 번 사면 안 된다” | 주문 후 타임아웃, 무조건 다시누르기 유도 | 요청 후 응답 유실을 시뮬레이션 |
| 큰 WLD 보유자·은행 이용자 | “내 WLD 이동·정산이 끝났는지 알고 싶다” | 금액 정밀도·부분반영·낙관적 잔액 | 네트워크 끊김 후 원장 조회 |
| 저속망·보조기술 이용자 | “오류를 읽고 입력 내용을 잃지 않고 이어가고 싶다” | 상태 무음, 자동 재전송, 포커스 이동 | 키보드/스크린리더/접근성 점검 |
| 모바일 관리자·고객지원 담당자 | “어느 화면, 어떤 API가 고장났고 어떻게 고칠까?” | 가짜 초록색 성공률, 내부 비밀 노출 | 실패 버튼 추적 및 담당자 식별 |

초기 사용자 조사 **제안**: 서로 다른 대표 작업·집단에 대해 가능한 범위에서 유형별 3~5명씩 관찰하되 이 표본을 모집단 통계로 보지 않는다. 오류 문구 A/B 사용성 테스트, 접근성 테스트, 개인정보 동의기반 익명 사용행동 분석. 신규·기존·모바일·저시력·키보드 전용 이용자도 포함한다. 실제 사용성 데이터와 기준치는 수집 전까지 `UNKNOWN`.

### 사용자 관점의 6가지 원칙

1. 사용자가 기능을 이용하려는 **해당 화면**에서 상태를 알려준다. 사이트 전체에 빨간 경고창을 계속 노출하지 않는다.
2. **아직 미구현 / 관리자·권한 제한 / 연령·정책 제한 / 데이터 없음 / 장애 / 일시적 오류 / 거래 결과 불명**을 서로 다른 상태로 만든다.
3. 입력값·필터·진행 경로를 가능한 한 보존한다. 서버 오류를 사용자 탓으로 표현하지 않는다.
4. **WLD·주식·은행 등 자산 변경 거래의 처리 결과가 불명확하면 중복 제출을 막고 먼저 원장/영수증 결과를 조회한다.**
5. 오류의 다음 행동을 쉬운 말로 설명하고 내부 시스템 주소·토큰 등은 표시하지 않는다.
6. 화면 색상만으로 결과를 알리지 않는다. 상태 텍스트·키보드·스크린리더 알림을 같이 제공한다.

## 3. 화면·정보 구조 상세

### 일반 사용자 UI

카드·상세페이지·작성 폼에 필요한 경우에만 상태를 노출한다: `이용 가능`, `로그인 필요`, `이용 조건 확인`, `일시적으로 이용 불가`, `아직 제공하지 않음`, `상태 확인 중`. 서비스가 준비되지 않은 기능을 **작동하는 버튼처럼 보이게 하지 않는다**. “곧 출시”는 확정 공개 계획이 있을 때만 사용한다. 비회원이나 권한 없는 이용자는 링크를 아예 숨겨 미로에 빠지게 하기보다 가능한 대체 경로와 필요한 조건을 설명한다. 내부 `IMPLEMENTED`는 소비자에게 “정상 작동”을 보장하는 표지가 아니다.

### 자산/주식 등 변경 요청 화면

상태 전이: `시작 전(IDLE) → 입력검증(VALIDATING) → 제출중(SUBMITTING) → 서버확인대기(PENDING_CONFIRMATION) → 확인완료(CONFIRMED) / 거절(DECLINED) / 결과불명(OUTCOME_UNKNOWN)`.

- `OUTCOME_UNKNOWN`에서는 “마지막 요청이 처리됐는지 확인 중입니다”와 “거래 내역 확인” 안내를 제공한다. **다시 구매/재출금 버튼을 자동 활성화하지 않는다.**
- 반복 제출/이중 탭은 동일 멱등성 키와 서버 상태 확인으로 처리하고 서버가 재시도 안전을 증명하기 전에는 새 거래를 만들지 않는다.
- `CONFIRMED`는 반드시 서버·원장 영수증 또는 서버의 권위 있는 상태 조회 결과로만 표시한다.
- 입력값 유지/이전 화면 복귀/재시도/영수증은 **각 기능이 실제 구현·검증한 경우에만 약속한다**.

### 전체 서비스 공지/상태 페이지

장애가 해당 기능 이용을 방해할 때 짧은 공지로 연결한다. 공공 `/status` 페이지는 실제로 검증 가능한 수집 파이프라인이 확보된 이후만 추진한다. 신뢰도 없는 가용성 표를 새로운 SEO 페이지로 대량 노출하지 않는다. 기본 `noindex`; 계정/관리자 디버깅 화면은 인증과 `noindex`를 유지한다.

### 관리자 UI — 기존 `/admin/api-health`의 ‘기능 상태’ 탭

- 상단: 현재 코드 SHA, Test SHA와 운영 SHA, 마지막 측정 시각·유효기한, 측정 범위, 미확인 항목 수. 격리 Test 불일치는 빨간 검증 차단 신호.
- 검색/필터: 영역, 심각도, 사용자 영향, 상태, 웹/Android, 담당자, 최근 증거 만료 여부, 버전.
- 기능별 행: 버튼·화면·언어·BFF/백엔드·DB/워커·스위치·소유팀·통합테스트·권한테스트·최근 장애·실패지점·이슈 링크.
- 상세: 소스 커밋, OpenAPI 차이, 비식별화된 오류, 트레이스 연결정보, 마지막 사용자용 회복 문구, 테스트 방법.
- 초기 버전은 **조회전용**으로 구현하며 기존 관리자 통제 기능과 연결한다. 장애 상태 변경·스위치 조작 등 쓰기 기능은 추가 권한·CSRF·재인증·불변 감사기록 필요.
- 계정 잔액·개인 채팅·비밀키·원본 SQL·개인 사용자정보는 관리자 상태 목록에서 기본적으로 노출 금지.

## 4. 혼동 없는 다축 상태모델

**A. 기획·개발 단계(내부):** `PLANNING | BLOCKED | IMPLEMENTED | TEST_VERIFIED | PRODUCTION_VERIFIED`. 마지막 둘은 특정 SHA·환경의 증거가 있어야 부여.

**B. 서비스 가용성(환경·시간·기능별):**
- `AVAILABLE`: 기한 내 실제 호출/작동 근거가 있고 심각한 차단 장애 없음.
- `DEGRADED`: 일부 실패/속도저하 발생, 안전한 대체 경로 있음.
- `MAINTENANCE`: 승인된 점검·정책적 닫힘, 기간과 처리중 작업의 상태를 확인할 수 있음.
- `UNAVAILABLE`: 장애 또는 승인된 기능 중단이 확인됨.
- `UNKNOWN`: 관측 없음, 샘플 부족, 실행 SHA 불일치, 만료된 데이터, 계측 오류, 버튼-API 매핑 없음.

`PRODUCTION_VERIFIED`라도 지금 `AVAILABLE`이라는 보장은 없다. 스위치 `enabled`, HTTP 200, 빌드 성공, 오래된 초록 배지는 가용성 근거가 아니다. 권한·보안·경제 금지 조건이 우선한다. 내부 용어 `UNKNOWN`을 일반 사용자에게 그대로 강요하지 않고 필요한 화면에서 “현재 이용 가능 여부를 확인할 수 없습니다”라고 풀어쓴다.

**C. 해당 이용자의 이용 자격:** `ELIGIBLE | LOGIN_REQUIRED | CONSENT_REQUIRED | ROLE_RESTRICTED | AGE_OR_LEGAL_RESTRICTED | POLICY_DISABLED | UNKNOWN`. 서버 판정 우선, 타인 자격정보 유출 금지. 전체 정상 기능이라도 해당 사용자에게는 권한 부족일 수 있다.

**D. 개별 자산 변경 요청:** `NOT_SENT | VALIDATION_REJECTED | SUBMITTED | PENDING | CONFIRMED | REJECTED | OUTCOME_UNKNOWN`. 서버·원장 읽기결과만 `CONFIRMED` 근거.

우선순위: **금지/권한/안전성 제한 → 결과불명 거래 재시도 차단 → 오래된 관측은 UNKNOWN → 그 뒤에만 긍정적 가용성 표시**.

## 5. 화면 문구 시안 (영어·한국어)

| 상황 | 한국어 권장 문구 | 영어 | 안내 버튼 |
|---|---|---|---|
| 비회원 | 로그인하면 이 기능을 이용할 수 있어요. 로그인 후 이 화면으로 돌아옵니다. | Sign in to use this feature. We'll bring you back here. | 로그인 |
| 아직 미구현 | 현재 제공하지 않는 기능입니다. 이용 가능한 다른 기능을 확인해 주세요. | This feature isn't available yet. Try another available activity. | 다른 기능 보기 |
| 이용조건 미충족 | 현재 계정에서는 이용할 수 없습니다. 필요한 조건을 확인해 주세요. | This account cannot use this feature. Check the requirements. | 이용 조건 |
| 일시적 조회 장애 | 지금 정보를 불러오지 못했어요. 입력한 내용은 유지됩니다. | We couldn't load this information. Your input is still here. | 다시 조회 |
| 거래 결과 불명 | 요청 처리 결과를 아직 확인하지 못했습니다. 중복으로 요청하지 말고 거래 내역을 확인해 주세요. | We can't confirm the result yet. Please check activity before trying again. | 처리 상태 확인 |
| 서버에서 거절 확정 | 요청이 처리되지 않았습니다. 사유를 확인하고 다시 시도할 수 있습니다. | The request was not processed. Review the reason before trying again. | 이유 보기 |
| 처리 확정 | 처리되었습니다. 거래 내역에서 확인할 수 있습니다. | Completed. You can review the record in Activity. | 영수증 보기 |
| 계획된 점검 | 현재 이 기능은 점검 중입니다. 진행 중인 요청은 확인 화면에서 조회할 수 있습니다. | This feature is under maintenance. Check the status of any pending request. | 서비스 상태 |

본 문구는 시안이다. 실제 제공되지 않는 입력 보존/복귀/영수증 기능은 안내 문구에서도 약속하면 안 된다. 최종 적용 전 전문 번역·개인정보·법률 검토와 사용자 과제 실험이 필요하다.

## 6. 구현 계약 — 기능 등록부·API 설계

정확한 Git SHA에 종속되는 **기능 증거 매니페스트**를 생성한다. 원천: 프론트 라우트 및 CTA, Next Route Handler·Server Action, Nest/OpenAPI, 작업자 목록, 기능 스위치, DB 함수·권한, 테스트 결과. JS 동적 호출 때문에 자동 추출이 어려운 관계(버튼→액션, 액션→작업자, DB 처리경계)는 담당자가 **명시적으로 기재·검토**해야 한다. 단순 정규식 검사만으로 완전 구현 판정 금지.

최소 내부 레코드 필드: `actionId, domain, sourceSha, surface(client,routeId,component), transport(bff,backend), execution(owner,boundary,effect), policy(auth,featureSwitch), lifecycle, observed(environment,availability,evidenceAt,sampleSize), acceptance(contract,authNegative,idempotency,e2e)`. 영문 문서의 JSON은 **구조 예시**이고 예시 경로/스위치가 실제 연결된다는 뜻은 아니다.

**관리자 조회 전용 후보 API** — 실제 컨트롤러 관례에 맞춰 개발 시 경로 확정:
- `GET /api/v1/admin/feature-reality/summary?sourceSha&environment`: 기능 등록률·증거율·실행 SHA.
- `GET /api/v1/admin/feature-reality/actions?domain&status&cursor&limit`: 필터 및 페이지네이션.
- `GET /api/v1/admin/feature-reality/actions/:actionId`: 해당 동작의 비식별 증거·테스트·담당자·이슈.
- `GET /api/v1/admin/feature-reality/incidents`: 실제 사용자 영향·확인 시각.
- 기존 API 헬스는 측정값과 하드코딩 예시값 혼용을 제거한다.

**회원 이용 자격 읽기모델(추후 개인정보 검토 후):** `GET /api/v1/features/availability?ids=...`. 최대 요청 ID 수, 짧은 캐시, 계정·역할별 격리, 맞춤형 데이터 `Cache-Control: private, no-store`를 요구한다. 응답 기본 필드: `sourceSha, checkedAt, freshUntil, items[{actionId, availability, eligibility, reasonCode, nextSafeAction}]`.

**중요:** 가용성 API가 `AVAILABLE`을 알려도 실제 거래 허가가 아니다. 돈 이동·권한 관련 **실제 비즈니스 API가 매 호출마다 인증·대상 권한·CSRF·최근 재인증·멱등키·원장 검증을 다시 실행**해야 한다. 조회용 GET에 쓰기 부작용 금지. 오래된/누락된 정보는 무조건 성공으로 해석하지 않는다.

HTTP 오류 응답은 기존 계약과 호환되게 점진적으로 RFC 9457 `application/problem+json` (`type/title/status/detail/instance`, 식별 가능한 오류 코드, 비밀 없는 추적 ID)을 검토한다. 서비스 점검·일시 과부하는 503 및 합리적인 경우 `Retry-After`; 이용량 제한은 429. 이용 조건 미달과 500을 섞지 않는다.

## 7. 관측·신뢰·사용자 개인정보

- 실제 거래 API에는 모니터링 목적으로 **운영에서 가짜 송금·주문을 실행하지 않는다.** 테스트 전용 자산 거래 및 운영의 읽기 전용 증빙 조회/안전한 헬스체크를 구별한다.
- Next BFF→Nest→DB/워커의 요청 추적ID를 연계하되 토큰·실제 사용자 ID·원장 금액·개인 채팅·비밀정보를 외부 메트릭/콘솔에 기록하지 않는다.
- 계측 필드: `action_attempt_total, action_confirmed_total, action_rejected_total, action_unknown_total`; 처리시간 히스토그램·매핑 완료율·마지막 증거 시간·미대응 버튼 건수. 서비스·환경·화면 고유ID·결과 정도만 레이블에 허용, 사용자UUID나 요청별 URL은 고카디널리티 라벨 금지.
- 분자·분모·측정시간·미관측 시 상태를 명확히 기재한다. **표본 0건 = UNKNOWN, 성공률 100%가 아님.**
- **설계 초안 임계값(실측 SLA 아님):** 가용성 집계 기본 60초 내 측정, 고위험 액션 최근 5분 성공/실패 표본 20건 이상인 경우 실패 5건부터 관리자 알림 후보. 사용량이 적으면 테스트 환경 시뮬레이션 및 운영 읽기 점검으로 대체한다. 거짓 WLD 성공이 확인되면 건수와 무관하게 P0 처리. 운영 데이터에 맞춰 조정한다.
- 운영 SHA·테스트 SHA가 다르거나 `unknown`이면 상태는 `UNKNOWN`, 초록 성공 불가.
- 사용자 오류 신고·첨부는 사용량 제한·중복제거·개인정보 최소화를 적용한다. 장애 사후 이력과 감사 정보는 기존 규정에 맞게 보존한다.

## 8. 구현 분할·테스트 기준

| 단계 | 결과물 | 반드시 확인할 것 |
|---|---|---|
| D0 현재 동작 파악 | 최신 메인 전체 페이지·버튼→API 대조대장 | 모든 실제 CTA를 열거, 미연결 발견, 수치 조작 금지 |
| D1 상태 증거 엔진 | SHA 기반 등록 매니페스트·스키마 검증기 | 누락된 고위험 버튼은 CI 실패; 측정/정적데이터 구분 |
| D2 일반 사용자 UX | 버튼별 자격·가용성·복구 화면 | 비회원/회원/제한 계정·모바일·키보드·문구 검증 |
| D3 원장 변경 재확인 | 멱등성+영수증 조회 | 서버 처리 완료 후 응답 유실: 중복 WLD 변경 없음 |
| D4 관리자 기능상태 탭 | 증거·장애·담당자·검색/필터 | 실제 성공률만 표시; 갱신 실패시 오래됨/UNKNOWN 표시; 관리자 권한 차단 |
| D5 격리 Test | 실제 DB·워커·모든 사용자 역할·전체 화면 5회 | 320~430px/태블릿/데스크톱/키보드/스크린리더·200/400% 확대, 404/401/403/409/429/500/503/타임아웃 |
| D6 CI·운영 게이트 | 동일 SHA 격리 Test·원장·세션·롤백 증거 | v530 UI 차단·v523/G675 P0 미해결 시 운영승격 금지 |

**필수 부정 케이스:** 비회원/사용자/관리자/타인 계정, 기능스위치 OFF, 실제 API 미존재, 백엔드 다운, 오래된 성공률, 429/503, 잘못된 UUID, 오프라인, 중복 클릭/동시 거래, 서버 커밋 후 응답 유실, 큰 WLD 정수값, 한국어/영어 긴 문구, 화면 읽기 지원. 사용자 A가 사용자 B의 설정/행동 증거를 조회할 수 없고 상태 GET만으로 자금을 움직일 수 없다는 것을 독립적으로 확인한다.

**합격 기준:** 새로 공개하는 고위험 CTA **100% 책임 API 계약 매핑**, 측정되지 않은 성능 수치 **0건**, 서버 쓰기 없는 허위 성공 **0건**, 결과불명 자금 요청은 서버 영수증 조회 또는 ‘불명’ 정직한 상태 유지. 성과 개선 퍼센트는 기준치 실측 전 `UNKNOWN`이다.

기존 DB/원장 권한 문제, v530 인증·모바일 전체 UI 차단, 운영·Test SHA 불일치 게이트는 계속 유효하다. **이번 v677은 기획 상세화만이며 API/DB/운영 기능 구현 완료가 아니다.**

## 9. 외부 공식·실무 레퍼런스 13개 (2026-10-15 검증)

| ID | 출처 | 실제 기획 반영과 주의 |
|---|---|---|
| R677-01 | [GOV.UK 이용자 요구 조사](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) | 기능 나열보다 과제 성공. 인터뷰 결과는 아직 없음 |
| R677-02 | [GOV.UK 오류 메시지](https://design-system.service.gov.uk/components/error-message/) | 오류와 해결방법 안내, 입력 보존 |
| R677-03 | [GOV.UK 서비스 장애 안내](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) | 실패 사유·입력 저장 여부 정확히 설명 |
| R677-04 | [GOV.UK 의도된 서비스 중지](https://design-system.service.gov.uk/patterns/service-unavailable-pages/) | 점검과 돌발장애 구분, 복구 시간 조작 금지 |
| R677-05 | [NN/g 오류 메시지 실무](https://www.nngroup.com/articles/error-message-guidelines/) | 이해할 수 있는 문구·문제 옆에 복구 방법 |
| R677-06 | [Atlassian Statuspage](https://support.atlassian.com/statuspage/docs/what-is-statuspage/) | 서비스 구성요소별 장애·정상·지연·점검 |
| R677-07 | [IETF RFC 9457](https://datatracker.ietf.org/doc/rfc9457/) | HTTP API 오류 상세 표준화 |
| R677-08 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 상태 알림·포커스·오류표시·터치 대상 |
| R677-09 | [OpenAPI 3.2](https://spec.openapis.org/oas/v3.2.0.html) | 메서드·경로·응답 스키마 계약 자동 비교 |
| R677-10 | [OpenTelemetry HTTP 메트릭](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/) | 응답시간·상태코드 측정 규약 |
| R677-11 | [Google SRE 모니터링](https://sre.google/sre-book/monitoring-distributed-systems/) | 사용자 증상과 시스템 원인 분리 |
| R677-12 | [Stripe 중복방지 요청](https://docs.stripe.com/api/idempotent_requests) | 불확실한 재시도에서 이중거래 방지의 설계 사례; Stripe 보관정책을 복사하지 않음 |
| R677-13 | [MDN 503](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503) | 일시적 장애와 429 구별, 안전한 Retry-After |

증거 상태: **SOURCE_OBSERVED**(특정 SHA 소스), **EXTERNAL_STANDARD**(공식/실무 원문), **HYPOTHESIS**(사용자 반응·알림 기준 가설), **LIVE_VERIFIED**(별도 동일 SHA 실서버 확인 필요)로 분리한다. 신규 인터뷰, 조회수나 실제 운영 정상성은 확인되지 않았다.

연결 문서: [기획 델타](deltas/v2026.10.15.677.ko.md) · [작업 기록](../worklog/2026-10-15-feature-truth-ux-v677.ko.md) · [내부/GitHub 업데이트](../updates/v2026.10.15.677-github.ko.md).
