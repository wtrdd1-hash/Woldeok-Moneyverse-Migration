# F675-04 — 공개 계산기 → 금융 개념 학습 → 선택형 가상시장 체험 상세기획

> **v2026.10.15.681** | **PLANNING / AUTHORITY_DRIFT / 운영승격 BLOCKED** | 2026-10-15 KST
> 영문 정본: [F675-04 Calculator Learning Journey](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.md)
> 문서 우선순위: [PROJECT_PLAN](PROJECT_PLAN.ko.md) → [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [v675 전체 기능 계획](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md); v397 API/화면 일치, v530 전체 UI 보류, v523/542/543 가상경제 원장, v507/527 SEO, v487 광고만 현실 수익화 정책은 그대로.
> 시작 `origin/main=8356146e157080704e157b3203e38599baec68ff`; 중간/최종 메인은 [v681 작업기록](../worklog/2026-10-15-f67504-calculator-learning-v681.ko.md). **기획이며 신규 기능 구현·실사용 성공을 의미하지 않는다.**

## 0. 제품 목표와 사용자 약속

방문자가 “복리/평단가/세금/연봉/은퇴 금액을 계산하고 싶다”는 검색 의도로 들어왔을 때 **회원가입 이전에 정확하고 유용한 결과를 받도록** 한다. 이후 그 결과의 의미를 배우고 다른 시나리오와 비교하며, 원하면 머니버스의 **별도 가상 WLD 게임**을 탐색한다. 가입/알림/보상은 이용자 동의와 실제 서버 결과가 확인될 때만 완료라고 표시한다.

동선: **검색 의도 → 공개 계산기 → 근거·가정이 보이는 결과 → 관련 가이드/용어 → 선택적 비교·공유·로컬 보관 → 별도 가상경제 소개 → 희망자만 로그인 → 실제 기능 가용성 확인 후 체험**.

제외: 키워드별 수천 개 계산기, 허위 보너스/무조건 10,000 WLD, 실제 주식거래·현실 투자 조언, 실제 원화/KRW와 WLD 혼동, 보장수익, 허구 종목의 예시 가격을 실시간 시세로 둔갑, 광고 클릭 유도 미끼, 카지노 유입 강제, 게임 보상 발행, 기존 /tools·/guide를 다시 만드는 별도 사이트. F675-05 첫 사용 안내는 독립적인 기획으로 둔다.

## 1. 실제 소스 점검 — C681-01~09

| ID / 우선순위 | 확인한 파일·작동 방식 | 문제 및 선행 해결 |
|---|---|---|
| **C681-01 P1** | `frontend/src/app/tools/page.tsx`에 복리·주식·은퇴·세금·목표·상점/가상경제 등 도구가 있으며 /guide/glossary도 존재 | 중복 URL·중복 도구 개발 금지, 검색 의도에 맞는 기존 계산기/학습 링크 정리 |
| **C681-02 P0** | `calculator-retention-funnel.tsx::handleSetAlert`가 로컬 React 상태만 켜면서 실제 알림이 설정됐다고 안내 | **실제 서버 등록·동의·구독 해지/전송 검증 전에는 활성화/완료 표시 금지** |
| **C681-03 P0** | 같은 파일 `handleClaimBonus`가 10,000 WLD 지원금이 예약됐다고 토스트를 표시하지만 해당 핸들러에서 서버 지급 영수증 확인 없음; `calculator-conversion-banner.tsx`도 가입 즉시 확정 보너스를 홍보 | **확인되지 않은 WLD 보상 약속 중단**. 실제 지급은 경제 정책/적격성·Mint 권한·원장 거래영수증과 별도 수용 뒤에만 고지 |
| **C681-04 P0** | `calculator-save-action.tsx`: localStorage 예외 때도 저장 완료 상태, 인증상태를 쿠키 문자열/로컬저장소 추정, 서버 `fetch('/api/portfolio/watchlist')` 응답 성공 불검사 | 브라우저 임시보관과 서버 영구보관을 분리, 계정 인증은 서버에서 확인, 저장 실패를 성공이라 표시 금지 |
| **C681-05 P1** | `/tools/compound-calculator/page.tsx`: JavaScript number, Math.pow/round, 8.5% 예시 기본값, 일/월/연 이율 적용·월 적립 시점의 단순화 | 실제 공식, APR/APY, 납입 시각·반올림·세금/수수료 제외·효력연도·예시/보장 아님 공개, 독립 골든 계산테스트 |
| **C681-06 P1** | `/tools/stock-calculator/page.tsx`: POPULAR_STOCKS에 하드코딩 가상 종목 가격 존재, 평균단가·거래비용에 Number 사용 | 고정 값은 SAMPLE 표시, 게임의 실제 가상시세와 현실 금융 가정치 명확히 구분, 분모 0·범위·오버플로 테스트 |
| **C681-07 P0 정확성** | `/tools/tax-calculator/page.tsx`는 코드에 박힌 세율·공제 프리셋 사용, 도구 허브는 “2026 세법”으로 소개 | 각 세금/연봉/연금 상품의 **국가/적용연도/개정일/국세청·정부 근거·가정·제외 항목** 확인. 근거 부족 시 법률 확정 안내 중단·예시 표시·노출 제한 |
| **C681-08 P1 개인정보** | 브라우저 localStorage에 계산 시나리오 및 로그인 추정 정보 사용 | 원치 않는 민감 개인 재무 데이터 저장/URL·분석 전송 금지, 보관 위치·삭제/동의 설명 |
| **C681-09 P1 SEO** | 한국어 복리 계산기와 영/일/중 복리 경로, 여러 [preset]/[ticker] 페이지, /guide와 용어사전 이미 존재 | URL 중복·언어별 실제 본문 번역·hreflang/캐노니컬·검색 노출 확인 전 확장 금지. 얇은 변형 페이지 기본 noindex |

이것은 **확인한 메인 소스의 구조적 문제**이며 전 경로 실제 로그인 브라우저에서 같은 문제가 재현됐거나 운영서버가 검증됐다는 뜻은 아니다. F675-01 기능 실재성의 같은 SHA 근거가 필요하다.

## 2. 실제 사용자 관점: 검증할 8개 과제

| 이용자 유형 | 실제 질문 | 막아야 할 불편 | 테스트 과제 |
|---|---|---|---|
| 복리 계산기 검색 비회원 | “월 저축액과 기간·이율을 바꾸면 어떻게 되지?” | 계산 전에 강제 가입/보너스 광고, 이율을 보장으로 오해 | 입력→결과→명목/APY 및 납입가정 설명 |
| 사회초년생 급여/세금 계산 | “올해 내 예상 실수령액은?” | 적용국가·연도가 불명확하거나 옛 세율을 법률 확정으로 표시 | 기준연도·세법 근거 확인, 예외 이해 |
| 주식 평단가 학습자 | “추가 매수하면 평균단가는 어떻게 움직이지?” | 현실 종목 계산에서 갑자기 허구 게임 실시간 호가로 연결 | 두 가지 비교·수수료·학습 후 종료 가능 |
| 이전 계산 결과 재방문자 | “브라우저에 저장했나, 내 계정에 저장됐나?” | 가짜 클라우드 성공·캐시 삭제 후 사라짐 | 저장 상태/로그인 상태별 복구·실패 확인 |
| 한국어/영어 언어 변경 방문자 | “같은 공식과 세법 지역을 이해할 수 있나?” | 번역 누락/나라 불일치/잘못된 hreflang | 언어 변경 후 동일한 공식·가정 확인 |
| 저속망·스크린리더·모바일 | “드래그 없이도 계산 가능하고 결과가 읽히나?” | 슬라이더 전용·JS 오류·화면 밀림 | 키보드 입력, 오류 수정, 320px·400% 확대 |
| 게임에 관심 있는 비회원 | “현금 없이 가상시장만 먼저 살펴볼 수 있나?” | 10,000 WLD 지급 보장·수익 보장·강제가입 | WLD/현실 분리, 게임 안내는 선택 |
| 이미 가입한 플레이어 | “주식/은행 기능이 지금 실제 가능하고 성공했나?” | 죽은 링크/스위치 미확인/토스트만 성공 | 서버의 가용성·권한·실제 영수증 확인 |

아직 실제 인터뷰/설문·실험 결과는 없다. 동의한 다양한 재무지식·언어·장애 접근성 참여자를 대상으로 소재별 소규모 탐색 연구(필요시 각 과제 3~5명)를 제안한다. 이 숫자는 통계적 표본이 아니다. 개인 급여·계좌·식별정보 대신 가상 예제를 사용한다.

## 3. 기존 도구를 연결하는 사용자 화면

**/tools 허브 유지.** 실질적인 필요에 맞게 저축·복리, 대출, 주식·수수료, 세금·실수령, 은퇴·목표, 머니버스 **가상시장 별도** 그룹으로 안내한다. 같은 계산 목적에 대해 지역별 권위 있는 대표 URL을 하나 정한다.

**계산기 상세 8단계:**
1. 검색 의도에 맞는 명확한 제목과 “로그인 없이 계산 가능” 안내, 적용 국가/연도/통화/예시값 명시.
2. 2~5개 중요한 입력 필드에 단위·기간·이율기준·허용 범위를 표기. 기본값은 “예시”로 표시, 개인 데이터인 것처럼 기록하지 않는다.
3. 즉시 결과와 항목별 분해·가정을 전달. 실제 입력 변경이 없는데 최신 결과시각을 갱신해 실측처럼 꾸미지 않는다.
4. “이 결과 이해하기”: 한 단락 설명, 실제 공식과 처리 방식, 예제 1개, 관련 용어/가이드 2~3개로 연결.
5. “두 가지 비교”: 같은 국가·통화·기준기간을 사용한 서로 다른 금액·이율·기간, 공식 버전과 가정 표시.
6. 선택적 **개인정보 없는 공유 프리셋** 및 브라우저 임시 보관. 로컬과 서버 저장 상태·보관/삭제·로그인 필요성을 정확히 알린다.
7. 결과를 충분히 제공한 후 **가상시장 별도 체험** 배너. 건너뛰어도 계산·학습 기능은 전부 이용 가능. 서버 검증된 가입 상태와 기능 가용성 확인 후만 상호작용 연결.
8. 정보출처·공식/검토일·면책·피드백. 광고는 승인된 공개 영역에만, 필수 결과와 주의문구 사이를 가로막거나 계산버튼처럼 꾸미지 않는다.

## 4. 계산식·적용 시점·결과 진실성

구현 후보 CalculatorDefinition은 id/canonicalPath/class(REAL_WORLD_ESTIMATE, FICTIONAL_WLD_SIMULATION, EDUCATIONAL_SAMPLE)/locale/formulaId/formulaVersion/jurisdiction/effectiveFrom/reviewedAt/primarySourceUrls/roundingPolicyId/assumptions/unit/canonicalPresetIds/editorialOwner/sourceState를 갖는다. 법률·세율 출처가 없으면 sourceState=UNKNOWN 또는 ILLUSTRATIVE, 검증된 기간에만 VERIFIED_FOR_PERIOD. 서버로 저장하거나 새 DB 테이블을 임의 추가하는 것은 이 기획 범위 아님.

**복리:** FV = 초기원금×(1+r/n)^(n×t) + 각 월말 납입액의 미래가치 합. 월 납입시점·명목 APR·실효 APY = (1+r/n)^n−1, 기간계산/윤년·반올림·세금/수수료·인플레이션 제외를 분리. 같은 소스 함수끼리만 비교하지 말고 독립 계산 골든 케이스로 검증. 0/음수 금리(허용 시), 무한대/NaN, 수량 0, 38자리 게임 WLD, KRW와 WLD의 단위 분리 등 부정 테스트.

**세금/급여:** 한국을 포함한 국가별 법률·정부 1차 자료, 개정일·시행일·공제·예외 확인이 없는 “2026 세법 정밀 확정 계산” 등은 철회하거나 ‘교육용 가정’임을 분명히. 이번 작업에서 특정 한국 세율의 법적 정확성을 별도로 검증하지 않았으며, 그 확인은 실제 코드 수정 전 별도 검토가 필수다.

**주식:** 하드코딩 종목·가격은 SAMPLE로, 현실 투자 계산과 서버의 현재 WLD 가상거래 가격을 혼합하지 않는다. 수수료·수량·거래세를 사용자 가정/출처로 분리하고 미래 수익을 보장하지 않는다.

## 5. 저장·알림·게임의 서로 다른 상태

- 계산: READY / INVALID_INPUT / MODEL_UNAVAILABLE.
- 저장: NOT_SAVED / LOCAL_ONLY / SERVER_PENDING / SERVER_CONFIRMED / FAILED / OUTCOME_UNKNOWN. 브라우저 저장 실패/서버 fetch 실패를 성공으로 표시 금지.
- 알림: UNAVAILABLE / CONSENT_REQUIRED / REQUESTED / SERVER_CONFIRMED / FAILED / UNKNOWN. 버튼 클릭만으로 알림 등록·발송을 약속하지 않는다. 등록이 가능한 기능이면 서버 구독·전송권한·해지까지 확인한다.
- 게임: PUBLIC_PREVIEW / LOGIN_REQUIRED / ELIGIBLE / DISABLED / UNKNOWN 및 실제 보상·거래의 CONFIRMED/UNKNOWN은 별개. 브라우저 쿠키 문자열만 보고 로그인/보상 적격성을 추측하지 않는다.

**시정해야 할 표현:** “가입 즉시 10,000 WLD 100% 지급”, “보상 예약됨”, “100% 무손실 보장”, “목표 알림이 활성화됨”, “클라우드에 영구 저장됨”은 실제 정책·적격성·DB/원장 결과·서버 API가 확인되기 전 노출 금지. 대신 “가상시장 소개 보기”, “로그인 후 실제 이용 가능 여부 확인”처럼 검증 가능한 행동을 안내한다. WLD 신규 발행·국고 지출을 이 기능이 지시하지 않는다.

## 6. 한국어·영어 상황 문구 10종

| 경우 | 한국어 | English |
|---|---|---|
| 공개 입력 | 로그인 없이 계산할 수 있습니다. 예시 값은 바꿀 수 있습니다. | Calculate without signing in. You can change the sample values. |
| 결과 | 선택한 가정에 따른 추정 결과입니다. 실제 수익을 보장하지 않습니다. | This is an estimate based on your assumptions, not a guaranteed return. |
| 가정 | 사용한 계산식·적용기간·가정을 확인해 보세요. | See the formula, period and assumptions used. |
| 근거 오래됨 | 적용 연도·법령 근거를 확인하지 못했습니다. 신고에 사용하지 마세요. | We cannot verify the applicable year's rules. Do not use this for filing. |
| 임시 저장 | 현재 브라우저에만 저장했으며 다른 기기로 동기화되지 않습니다. | Saved only in this browser. It is not synced to other devices. |
| 저장 실패 | 결과를 저장하지 못했지만 화면에서 계속 확인할 수 있습니다. | Your result was not saved. It remains available on this page. |
| 알림 미구현 | 목표 알림 기능이 연결되지 않았습니다. 신청 완료 상태가 아닙니다. | Goal alerts are not connected. No alert has been activated. |
| 게임 소개 | 현실 금융 계산과 별개로 머니버스 가상시장을 살펴볼 수 있습니다. 선택 사항입니다. | Optionally explore the fictional Moneyverse market, separate from real finance. |
| 보상 불확실 | 실제 가입 보상 적격성·지급 여부는 로그인 후 정책과 거래 기록에서 확인하세요. | Check actual reward eligibility and your ledger after signing in. |
| 잘못된 입력 | 숫자·단위·허용 범위를 확인한 뒤 다시 계산하세요. | Check the value and unit, then calculate again. |

## 7. 프론트·서버·SEO·개인정보 명세

**컴퓨팅:** 가능한 계산은 공개 페이지에서 검증된 순수 함수로, 실제 외부 현행 자료가 필요한 경우에만 서버를 호출한다. 서버에는 observedAt, sourceVersion, isSample 등 확인 시점·근거를 포함한다. 세션·자산·급여·세무 개인정보를 결과 URL·JSON-LD·Open Graph·분석 이벤트로 전송 금지.

**보관:** 별도 사용자 동의와 실제 로그인 서버검증 후만 계정 동기화; CSRF/권한/멱등성·실패 응답 검증 필요. 기존 watchlist 서버가 없거나 오류인데 저장 성공이라고 주장하지 않는다. 영구 보관 기능이 없다면 명확하게 LOCAL_ONLY.

**게임 진입:** v677 기능상태의 실제 화면→BFF→Nest→스위치→DB/worker→Test 증거를 확인. 게임 기능이 이용 불가하면 공개 가이드로 안전한 이동 또는 비활성 안내. 로그인 후에도 자동 시장주문·화폐 발행 금지.

**SEO:** 계산 의도별 유용한 대표 도구와 독창적인 설명/출처를 우선. 한국어 복리 및 영어·일본어·중국어 경로는 단순 키워드 복제 여부를 검사하여 실제 번역된 본문/캐노니컬/hreflang만 연결. 별개 [preset]/[ticker] 경로의 얇은 페이지는 검증 전 noindex. Search Console은 제출·크롤링·색인·실제 클릭 별개이며 Google 선택 canonical과 실제 검색어/국가를 대조해야 한다. 잘못된 SoftwareApplication·FAQ 리치 결과나 색인 성공을 보장하지 않는다.

**접근성:** 320~430px, 200/400% 확대, 슬라이더 외 숫자 입력, 오류 시 입력값 유지, 키보드/스크린리더 결과 갱신, 색상만으로 상승·하락 표시 금지. 실제 서비스 계측 후 모바일/데스크톱 p75 LCP 2.5초 이하·INP 200ms 이하·CLS 0.1 이하를 목표로 하되, **이번 작업에서 현 서비스 수치 측정 없음**. 광고는 기존 승인된 공개 위치에만.

## 8. 계측과 실증 검토 (성과 창작 금지)

계산 결과 도달, 가정 열람, 관련 용어 학습, 두 시나리오 비교 완료, 비민감 프리셋 공유, 실제 로컬 저장, 가상시장 소개, 검증된 로그인 진행, 서버 확정 첫 가치, 오해 신고 등을 별도 이벤트로 기록한다. 사용자 개인 급여/잔액/세율 입력값, 세션키, 원본 URL/개인 식별자는 로깅하지 않는다.

**핵심 지표:** 정확한 계산 결과를 받은 이용자 중 *두 번째 유익한 행동*(가정 이해/비교/학습/안전 공유)을 수행한 비율. 보조 지표는 자발적 가입과 실제 서버 확인된 첫 게임활동, 동의 가능한 코호트의 D1/D7, GSC 검색어·페이지·국가의 노출/클릭, 승인된 광고 위치의 실측 Page RPM. 허위 보상 클릭/광고조회만으로 성공으로 단정 금지. 실험군 모두 공식/법률/가상시장 분리 고지를 유지한다. 실제 수치는 아직 UNKNOWN.

## 9. D0~D7 구현·검증 계획

| 단계 | 실행 대상 | 테스트·차단 조건 |
|---|---|---|
| **D0** 소스 재인벤토리 | tools·[locale]·guide·glossary·pSEO 설정, 구체 URL/브랜치 SHA | 중복·이용가능성·법률·실데이터 출처 대조 |
| **D1** 사용자 기만 P0 방지 | retention-funnel/conversion-banner/save-action 코드를 **별도 승인된 개발 PR**에서 수정 | 가짜 10k WLD·알림·클라우드 성공 0, 실패 테스트 RED→GREEN |
| **D2** 계산식 신뢰 | 복리/평단가/세금/급여 계산을 출처·버전 있는 순수 함수로 | 독립 골든 계산·소수점/0/오버플로/경계·적용연도 |
| **D3** 결과→학습 | 기존 /tools·용어사전·가이드 정밀 연결 | 비회원에게 결과 전체 제공, 모바일·접근성 |
| **D4** 비교/공유 | 비민감 프리셋/URL의 형식·범위 검사 | 결정적 직렬화, 개인정보 URL 유출 0, 중복 SEO 0 |
| **D5** 선택형 게임 | 실제 가용한 기존 회원/가상주식·은행 CTA | 강제가입·허위 보상/조작 없는 서버 상태 검증 |
| **D6** SEO·분석 | 본문 품질·캐노니컬·hreflang·GSC·CWV | 얇은 페이지 색인 차단, 제출 ≠ 색인, 실제 성과 기준 |
| **D7** 출시 안전 | 단위·계약·부정권한, Test 정확 SHA/세션·무중단 롤백·관리자 포함 전체 UI 5회 | v530 UI, v523/542/543 원장, v397 API/UI·실제 Test/Production 신원 불일치 시 **운영 HOLD** |

필수 부정 픽스처: 입력 0/음수·무한대·NaN, 종목 수량 0, 계산 기간 경계/윤년, 큰 금액, 다른 나라 세법·낡은 근거, 실시간처럼 보이는 고정 가상시세, localStorage 오류, 서버 fetch 실패, 쿠키 기반 가짜 로그인, 보상 미승인, 알림 거절, 개인정보 담긴 공유 URL, 중복 프리셋, 저속망·스크린리더·320px·400% 확대·언어 혼합. **이번 작업에서 실제 앱 테스트/운영승격 합격을 주장하지 않는다.**

## 10. 공식·실무 레퍼런스 14개 (2026-10-15 확인)

| ID | 출처 | 설계에 적용 |
|---|---|---|
| **R681-01** | [Google 방문자 중심 콘텐츠](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | 계산 결과 자체의 가치·설명·저자/방법 공개 |
| **R681-02** | [Google 캐노니컬](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | 대표 URL/중복 방지 |
| **R681-03** | [Google 다국어](https://developers.google.com/search/docs/specialty/international/localized-versions) | 실제 번역·hreflang |
| **R681-04** | [Google 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies) | 얇은 대량 페이지와 거짓 기능 차단 |
| **R681-05** | [Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start) | 제출·색인·클릭 구분 |
| **R681-06** | [Google SoftwareApplication 데이터](https://developers.google.com/search/docs/appearance/structured-data/software-app) | 적절하고 사실인 경우만 구조화 데이터 |
| **R681-07** | [GOV.UK 질문 페이지](https://design-system.service.gov.uk/patterns/question-pages/) | 필수 입력만/슬라이더 대체 |
| **R681-08** | [GOV.UK 서비스 시작](https://design-system.service.gov.uk/patterns/start-using-a-service/) | 가입 전 가치·적격성 |
| **R681-09** | [GOV.UK 필드 오류](https://design-system.service.gov.uk/components/error-message/) | 값 유지/수정 가능한 설명 |
| **R681-10** | [GOV.UK 오류 요약](https://design-system.service.gov.uk/components/error-summary/) | 화면읽기·키보드 포커스 |
| **R681-11** | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 접근성/상태 |
| **R681-12** | [web.dev Core Web Vitals](https://web.dev/articles/vitals) | 실제 사용자 성능지표 |
| **R681-13** | [Google 페이지 경험](https://developers.google.com/search/docs/appearance/page-experience) | 검색 도구의 실질 UX 품질 |
| **R681-14** | [Google AI 생성 콘텐츠](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | 저가치 자동 콘텐츠 양산 방지 |

자료는 사용자 중심 설계 근거이지 현재 사이트 검색 순위·사용자 검증·세법 정확성의 합격 증거가 아니다. 특정 한국 세율·연도별 법률은 향후 개발 직전 국세청·법제처 등 관련 공식 자료로 별도 검증.

**끝 상태:** 문서와 기획만 변경하는 v681. 앱 코드/모델/원장/사용자/DB/Test/Production 변경 및 실제 기능 배포는 수행하지 않는다.
