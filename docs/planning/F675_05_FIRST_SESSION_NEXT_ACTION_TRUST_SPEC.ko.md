# F675-05 — 신규 이용자 첫 행동 안내: 실제 보상·완료 검증과 선택형 다음 단계

> **v2026.10.15.686** · **PLANNING / AUTHORITY_DRIFT / 운영승격 BLOCKED** · 2026-10-15 KST
> [영문 기준 문서](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md) · [작업 기록](../worklog/2026-10-15-f67505-first-session-v686.ko.md).
> 권한 순서: [PROJECT_PLAN](PROJECT_PLAN.ko.md) → [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [v675 기능별 검토](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md); [v76 첫 방문 마무리](FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.ko.md), [v82 첫 주 적응](PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.ko.md), F675-01 실제 기능, F675-04 계산·학습, v530 전체 UI, v397 API/UI, v523/542/543 원장, 출시 안전 규칙 그대로 적용.
> 첫 검토 `origin/main=6946398986edba0ad84bc601e6d1076e442f6d05`. **기획/문서이며 실제 코드 배포·Test/운영 수용이 아님.**

## 1. 제품 목표와 절대적 한계

사용자 약속은 **“지금 내가 실제 할 수 있는 한 가지를 이해하고, 다른 길을 선택하거나 안내를 끝낼 수 있으며, 보상/주식 거래가 진짜 완료되었는지 확인하고, 다음 방문에 원한다면 같은 목표를 이어간다”**이다.

기존 /guide 체크리스트/로드맵, 브라우저 온보딩 트래커, 첫 주식 매수 모달, 웰컴 배너, 홈, 실제 서버 원장 기록을 **통합**하며 온보딩 엔진을 중복 개발하지 않는다. 화면은 **추천 행동 최대 3개**, 원칙적으로 가장 중요한 행동 1개 + 인접 활동 1개 + 학습/나중에 하기 1개만 보인다. 3개 완료 의무, 순서 강제, 연속 출석 강요가 아니다. 사용자 또는 서비스 상태가 미확인이면 항상 안전한 공개 가이드로 돌아갈 수 있다.

‘얻기 → 선택 → 진행’은 설명에 사용하는 흐름이지 고정된 강제 순서가 아니다. 자동 주식매수, 은행예치, 카지노·복권, 알림 자동동의, WLD 신규 발행, 보상 금액 확대, 실물 수익 보장, 무기한 중독형 스트릭은 금지한다. WLD 경제·DB 권한/금리/국고 지급 원칙은 기존 기준대로 유지한다.

## 2. 확인한 코드 위험 O686-01~10

| ID / 위험 | 실제 main 소스 근거 | 사용자가 겪는 위험·필수 해결 |
|---|---|---|
| **O686-01 P0** | `frontend/src/lib/onboarding-tracker.ts::claimOnboardingReward`는 로컬 `claimed,totalEarnedWld`와 고정 rewardWld만 기록. 해당 함수는 서버 원장 API를 호출하지 않음 | 브라우저 보상표시를 실제 원장 입금으로 오인시키면 안 됨. 서버 지급·거래ID 대조 전 `LOCAL_CLAIM`은 지급이 아님 |
| **O686-02 P0** | `interactive-onboarding-tracker.tsx::handleClaim`은 위 로컬 수치로 “+WLD가 지갑에 입금” 토스트, 정적 예상 보상 총합 표시 | 허위 지급 완료 방지, 사용자 학습 진행/서버 확정 업무/실제 원장 지급 상태 분리 |
| **O686-03 P0** | `first-trade-onboarding-modal.tsx`가 주문 POST 결과를 검증하지 않고 `.catch(() => null)` 뒤 로컬 보유 주식·완료 상태를 기록, 오류 경로도 완료 처리. 기본 종목 `005930` ‘삼성전자’는 실제 주식 종목코드/회사명 | 서버의 승인/체결 없이는 가상거래 완료라 표시하지 않음. 허구 게임 종목에 실제 기업 주문코드 사용 금지. 수익/보유 생성 경로 서버검증 |
| **O686-04 P1** | `guide/components/onboarding-checklist.tsx`는 로컬에서 완료 체크/전체 완료를 자유롭게 지정. 별도 트래커에도 로컬 완료·수령 상태가 있음 | **직접 체크한 학습완료**를 경제적 활동 완료·원장 지급으로 취급 금지. 체크리스트와 실제 업무진행을 구분 |
| **O686-05 P1** | `guide/components/onboarding-roadmap.tsx`에는 정적 WLD·회원가입 소요시간·퀘스트/직업/은행 경로와 지급 약속 기재 | 서버의 실사용 가능/보상 정책 확인 전 금액·소요시간·즉시 지급 보장 금지 |
| **O686-06 P0** | `welcome-onboarding-banner.tsx`는 비회원에게 10,000 WLD와 무료 잭팟 티켓을 약속; `frontend/src/app/page.tsx` 메타에도 즉시 10k/잭팟 안내 | 배너/SEO 문구는 경제적 지급 증빙이 아니다. 지급 적격성·실제 원장·카지노/연령/지역 정책 확인 전 확정 혜택 선전 금지 |
| **O686-07 P1 UX** | `route-aware-floating-utilities.tsx`에서 일반 화면에 트래커·지원위젯을 함께 렌더; 앱 레이아웃은 첫 매수 모달, 사이트 쉘은 웰컴 배너도 추가 | 모바일/보조기술에서 팝업·플로팅 경쟁. **노출 우선순위 한 곳에서만 결정**, 반복 자동팝업 금지 |
| **O686-08 P1** | `/quests,/work,/bank,/stocks,/guide` 실제 page.tsx 파일 존재 | URL 파일 존재만으로 로그인·스위치·API·DB 작업 준비완료 아님. 실제 서버 자격·쿨다운/제한·Test 증거 필요 |
| **O686-09 P1** | 기존 v76는 첫 활동 이후 사용자 선택 목표/다음 방문 연속성을, v82는 강제된 날짜별 기능 공개 대신 이해 수준·선호를 기준으로 한 단계씩 안내하도록 기획 | 기존 기획을 계승하며 중복 사용자 관심DB/강제 일일 과제 금지 |
| **O686-10 P0** | F675-01/v677 및 v523/542/543: 기능 버튼→API→DB·동일 SHA/경제 원장 정합성 필수 | 이번엔 실제 실행 증빙이 없으므로 미확인 시 `UNKNOWN`과 안전한 가이드 표시. 개발·운영완료 아님 |

**증거 수준 구분:** `SOURCE_OBSERVED` 검토한 Git main 코드, `PREEXISTING_PLAN` 기존 승인된 기획, `HYPOTHESIS` 실험 전 사용자 요구, `TEST_VERIFIED/PRODUCTION_VERIFIED`는 같은 소스 SHA·실제 역할/DB·원장/스위치 부정테스트 통과 후에만. 실제 이용자 계정·보상/거래를 실행하지 않았다.

## 3. 사용자의 입장에서 검증할 9개 과제

| 사용자 | 원하는 것 | 기획할 경험 | 막아야 할 오해 |
|---|---|---|---|
| 검색 유입 비회원 | “게임돈 WLD가 뭔지 먼저 볼래요” | 회원가입 없는 공개 가이드/계산·게임전용 표시 | 돈/주식이 현실 투자·실제 보상으로 보임 |
| 첫 로그인, 보상 없는 회원 | “뭐부터 하면 좋을까요?” | 서버가 실제 가능한 퀘스트/업무 1개를 알려주고 도움말 제공 | 기능 이용 불가/지급 근거 없는 금액 제안 |
| 직업을 정한 회원 | “내 일은 어떻게 이어가나요?” | 이전 직업·서버 진척을 우선 이어감 | 다시 처음 튜토리얼 강제 |
| 쿨다운 중인 회원 | “왜 지금은 못 하나요?” | 잠금 이유/서버가 검증한 다음 시각, 관련 공개 학습 | 휴대폰 시계로 만든 가짜 제한시간 |
| 첫 보상을 실제 수령한 회원 | “내 WLD는 확실히 들어왔나요?” | 거래ID 영수증/실제 지갑 갱신 후 다음 목표 선택 | 로컬 합계만 증가한 금액을 입금으로 표시 |
| 주식 계산기로 넘어온 사용자 | “가상 종목인가 실제 회사인가?” | 허구 시장 소개 후 선택형 탐색, 자동 주문 금지 | 삼성전자 005930을 게임 가상 거래로 오인 |
| 저속망/모바일/장애 보조기술 이용자 | “안내 건너뛰고 나중에 재개할 수 있나요?” | 가벼운 카드·키보드/스크린리더·장애회복 | 320px 중복 플로팅/강제 모달/중복 POST |
| D1/D7 재방문 회원 | “내가 고른 활동은 어떻게 됐나요?” | 실제 변경/무변경 상태를 확인하고 다른 목표로 교체 | 가짜 신규 알림·출석 압박 |
| 연령·지역/정책 제한 사용자 | “운·투자 요소 없이도 즐길 수 있나요?” | 학습·가이드와 허가된 안전 기능만 추천 | 카지노/복권이 초보 필수 기능으로 노출 |

이 표는 실제 연구 결과가 아니라 **검증용 사용자 과제**다. 동의를 받은 첫 방문자/재방문자/한국어·영어/저사양·접근성 참여자와 비식별 테스트 계정으로 평가한다. 개인 WLD/실사용 계정/거래내역을 수집하지 않는다. Baymard의 회원가입 방해 연구는 **가입 강요를 줄이는 UX 유추**이지 머니버스 직접 실험 결과가 아니다. 신뢰도·활성화 개선율은 UNKNOWN이다.

## 4. 화면을 어떻게 구성할지

**첫 30초:** 화면에 머니버스의 허구 경제임을 알리고 하나의 목적과 주요 버튼을 보여준다. 비회원은 ‘게임 알아보기’ 또는 ‘가입 후 가능한 활동 확인’; 실제 서버가 지급을 증명하지 않았다면 ‘10,000 WLD 즉시 지급’ 표기 금지. 회원은 서버확인된 활동 1개만 주로 추천한다. 웰컴/잭팟/추적기/주식팝업이 동시에 경쟁하지 않는다.

**처음 3분:** 최대 3개 권한 검증된 선택지. (1) 실제 가능한 첫 업무 또는 퀘스트(임의 WLD 금액 지급 보장 아님), (2) 학습·용어/개념·가상 주식 소개 등 **기본 안전 선택지**, (3) 본인 관심에 맞는 직업·기업 이야기·은행 구조 등 **관심 방향 선택**. 첫 화면 버튼 클릭은 의사 표시일 뿐 업무 완료가 아니다. 목적 화면에 도착해서 실제 API·자격·쿨다운을 별도 확인한다.

**실제 첫 가치 달성 직후:** “실제 보상 원장 기록/거래번호/확정된 금액·시각”이 있을 때만 성공 메시지. 성공하지 못한 경우 ‘아직 확인 불가, 재시도 전 거래내역 확인’. 회원이 다음에 하고 싶은 목표를 직접 고르게 하고, ‘다른 활동/나중에/오늘 종료’도 명확히 제공한다.

**D1/D3/D7 귀환:** 마지막에 명시적으로 선택한 목표를 먼저 보여주고, 현재 서버상 활동 가능/대기/진행없음/차단/완료를 진실하게 안내. 변경 사항 없으면 ‘변경 없음’이라고 말한다. 목표 해제·교체 자유, 알림자동등록/출석 벌점/벌금/가짜 카운트다운 금지.

**겹치는 UI 정리:** 긴급 장애·보안공지 > 현재 진행 중인 사용자 작업 > 확정된 거래 결과 > 첫 행동 안내 카드 1개 > 일반 도움 위젯. 로그인/관리자/일반 비회원 구별. 계산기 로컬 데이터로 자동 매수 모달 열지 않음. ESC·포커스 복귀·줄어든 동작·닫기 저장이 브라우저 저장 실패 상태에서도 정상이어야 한다.

## 5. 실제 가능한 활동만 추천하는 결정형 상태모델

AI가 투자행동을 자동 추천·실행하는 시스템이 아니다. 기존 F675-01 기능 실재성 서버 증거와 회원 의도를 이용한 **보수적 규칙**으로 최대 3개의 행동을 선택한다.

**후보 데이터:** id, titleKey, reasonKey, href, readiness, requiresMutation, actorVerified, backendEvidenceAt, featureStateVersion, serverVerifiedTransactionId?(본인한정), scope(PUBLIC/PERSONAL). 신뢰된 서버 세션이 회원 신원을 정해야 하며 쿠키 문자열/로컬스토리지 값은 근거가 아니다.

**선정 순서:**
1. 실제 로그인 세션·사용자 자격·기능 스위치·백엔드 readiness·현재 제한을 확인. 누락되면 미확인.
2. 화폐 지급 관련 활동은 국고/원장·정책·쿨다운과 기존 권한을 검사하고 실패하면 표시하지 않음.
3. 카지노/복권/부적합 거래는 연령·지역 정책에 따라 제외. IP로 나이·법적 자격 추측 금지.
4. 회원이 이전에 선택한 목적, 현재 이용 가능성, 읽기 안전성, 난이도에 따라 정렬.
5. 1개 주요 행동, 인접 대안, 학습/종료만 선택. 최대 3개. 서버가 미확인되면 공개 안내 우선.
6. 선택 목표는 사용자 동의 후에만 영속 저장. 임시 보관은 LOCAL_ONLY라고 표시하고 타인 계정·민감정보 공유 금지.
7. 실제 행동 버튼은 화면→BFF→Nest→스위치/DB 경로와 동일 SHA Test 수용을 받아야 함.

**서로 다른 상태 구분:**
- 여정: NOT_STARTED / OFFERED / CHOSEN / NAVIGATED / ACTION_PENDING / VERIFIED_SUCCESS / VERIFIED_FAILURE / OUTCOME_UNKNOWN / RETURN_THREAD_CHOSEN / FINISHED.
- 건너뛰기: SKIPPED / DISMISSED / PAUSED. 불이익/실패/보상 손실을 의미하지 않음.
- 기능: AVAILABLE / LOGIN_REQUIRED / LOCKED / MAINTENANCE / DISABLED / UNKNOWN. LOCKED는 서버가 증명한 사유·시각만.
- WLD 지급: NOT_REQUESTED / SERVER_PENDING / LEDGER_CONFIRMED / REJECTED / OUTCOME_UNKNOWN. 금액은 **문자열/BigInt**, 원본 거래ID와 실제 권한·공급량을 확인.
- 주식 주문: NOT_SENT / ORDER_ACCEPTED / PARTIAL_FILL / FILLED / CANCELLED / REJECTED / OUTCOME_UNKNOWN. 로컬 가상 보유목록으로 거래완료 판정 금지.

## 6. API·정보보호·경제 원장 계약

우선 F675-01의 기능 실재성 읽기 API, 기존 회원/퀘스트/직업/원장 API를 재사용한다. 별도 정보 원천을 만들지 않는다.

**API 후보(아직 없음):** `GET /api/v1/me/next-actions` → 최대 3개, 로그인검증, 관측시각, 상태/소스 버전, 본인 범위의 안전한 링크; `GET /api/v1/me/onboarding/progress` → 서버가 확정한 직업·퀘스트·보상/체결과 단순 로컬 학습 체크 분리. `PUT /api/v1/me/onboarding/return-thread`는 사용자가 명시적으로 동의한 경우에만, 세션/권한·쿠키 CSRF·멱등성·감사·삭제기능 선행. 기존 동등 API가 있으면 새 API 추가 금지.

지급 성공은 실제 원장 거래와 그 시각·정수 문자열로 확인해야 한다. WLD 신규 발행/국고 지출은 온보딩의 권한이 아니다. POST 요청 후 응답 유실은 OUTCOME_UNKNOWN, 조회 전에 자동 재실행/추가 보상·주식매수 금지. 실제 한국 주식코드와 게임 가상종목 명칭은 엄격히 분리한다.

개인화 응답은 private/no-store/검색 noindex, 본인 권한 기반. 사용자ID·잔액·거래번호·OAuth 토큰·연령·IP 위치/개인 선호를 공개 페이지·분석이벤트에 넣지 않는다. 사용자가 이어갈 목표는 수정/삭제 가능하고, 추천기는 실제 금융 액션을 자율 실행할 수 없다.

## 7. 한국어·영어 마이크로카피 12개

| 상황 | 한국어 | English |
|---|---|---|
| 비회원 | 먼저 가상경제를 둘러보세요. 가입 없이 안내를 읽을 수 있어요. | Explore the fictional economy first. You can read the guide without signing in. |
| 첫 추천 | 지금 가능한 활동 하나를 추천합니다. 다른 길도 선택할 수 있어요. | Here is one available action. You can choose something else. |
| 진행 중 | 서버에서 결과를 확인하고 있습니다. | We are checking the result with the server. |
| 실제 입금 | 보상이 원장에 기록됐습니다. 거래내역에서 확인하세요. | Your reward is recorded in the ledger. Check its receipt. |
| 결과 불명 | 지급을 확인하지 못했습니다. 다시 신청하기 전에 거래내역을 확인하세요. | We cannot confirm the reward yet. Check activity before retrying. |
| 대기 | 지금은 수행할 수 없습니다. 가능한 시각이 확인되면 표시합니다. | Not available yet. We’ll show a verified eligibility time when known. |
| 이용 불가 | 이 기능은 현재 사용할 수 없습니다. 대신 이용법을 살펴보세요. | This feature is unavailable now. You can read the guide instead. |
| 로컬 체크 | 학습 체크만 표시한 것입니다. 실제 WLD 입금기록이 아닙니다. | This is a local learning mark, not a reward receipt. |
| 첫 성공 | 첫 활동을 마쳤습니다. 다음에 이어갈 목표를 선택할 수 있어요. | Your first activity is complete. Choose what to continue next time. |
| 종료 | 오늘은 여기서 끝내도 됩니다. 불이익은 없어요. | You can stop here without penalty. |
| 재방문 | 선택하신 목표의 실제 상태를 보여줍니다. 변경이 없어도 그대로 안내합니다. | We show the actual status of your chosen goal, including when unchanged. |
| 가상 주식 | 이 종목은 가상게임용입니다. 실제 투자 주문이 아닙니다. | This is a fictional game stock, not a real securities order. |

기존 “가입하면 무조건 지급/주문 완료/보너스 수령” 문구는 실제 서버·원장·적격성 검증 전 사용 금지.

## 8. 조사·성과·품질

연구에서는 신규 이용자가 WLD의 허구성, 선택권, 보상/거래 성공 증명을 설명할 수 있는지 관찰. 비회원·회원·재방문·저시력/스크린리더·모바일·한영 사용자 포함. 보상/시장 경제 정확성을 다르게 보여주는 실험 금지. **실제 사용자 연구·A/B 결과는 아직 없다.**

개인정보 없는 이벤트: 추천 노출, 선택 의사, 실제 경로 도착, 서버 확정 첫 성과, 영수증 열람, 자발적 다음 목표 저장, D1 목표 재인식, D7 완료/갱신, 차단 사유, 거짓 성공 차단, 5xx. 개인 ID/원장/금액/민감정보·개인 URL은 로그 라벨 금지. 클릭수나 로컬 체크박스보다 **서버 확정 첫 가치**가 핵심. 참여 동의, 봇 제거, 실제 분모와 코호트 정의가 없으면 수치는 UNKNOWN.

성공 시나리오: 3개 이하 선택지, 실제 지급/주식체결 100% 원장·서버 증명, 허위 지급 및 주문 0, 타인 데이터 0, 중복 POST 0, 건너뛰기/종료 가능, 중단 후 안전 복구, 전체 UI/5xx 퇴행 없음. 운영 데이터 없이 향상률을 미리 작성하지 않는다.

## 9. D0~D7 개발·검증 단계

| 단계 | 별도 코드 개발 PR에 인계 | 필수 통과 |
|---|---|---|
| **D0** | 현재 트래커·웰컴·가이드·첫매수·홈과 서버 직업/퀘스트/원장·스위치 최신 재점검 | 실제 API·DB·소스SHA 동등성, v76/v82 일치 |
| **D1 P0** | 브라우저 보상입금/가짜 첫 주식체결·10k WLD SEO/배너 문구를 서버 사실과 일치시키는 TDD | 오류 응답·localStorage 예외에 성공 토스트/보유주식 기록 절대 없음 |
| **D2** | 소유자 한정 기능 가능성/진행/영수증 읽기 모델 | 타인ID 차단, 사용 중단/한도 초과 시 매수·보상버튼 차단 |
| **D3** | 결정적 행동 0~3개 추천·관심/준비 상태 선택 | 중복/비활성 CTA 없이 안전한 공개 안내 대안 |
| **D4** | 겹치는 온보딩 UI 정리와 한영 화면/접근성 | 320/360/390/430px·200/400% 확대·키보드 ESC·스크린리더 |
| **D5** | 완료→선택형 재방문 목표 및 D1/D7 인식 | 출석 벌점/가짜 알림/허위 예정 시각 없음; 삭제 가능 |
| **D6** | 실사용자/동의 데이터 실험·품질/SEO 확인 | 현금·허위 보상 유도 없는 실험, 인증 관련 화면 비색인 |
| **D7** | 단위/권한부정/경제·동시성, 정확한 SHA 격리 Test 백엔드/DB, 관리자 포함 전체 화면 **5회**, 세션/무중단·롤백 | v523/542/543 원장·v397 API·v530 전체 UI·Test 신원 미통과 시 **운영 HOLD** |

필수 부정 테스트: 로그인 없음/첫회원/기존회원/보상 0, 쿨다운, 퀘스트없음, 직업 스위치 OFF, DB 장애, POST는 커밋됐는데 응답만 유실, 중복 클릭, 조작된 쿠키, 005930 실제 주식코드, 타인 거래ID, 모바일 지원위젯과 중복표시, 브라우저 저장 거절, 숨김·재개, 스크린리더/언어, 38자리 WLD, 복권·연령 제한. 이번에는 실제 앱·DB Test나 운영서버 E2E를 수행하지 않았다.

## 10. 외부 레퍼런스 12개 (2026-10-15 검토)

| ID | 공식/실무 근거 | 설계 의미 |
|---|---|---|
| R686-01 | [GOV.UK 사용자 요구 조사](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) | 실제 과제 중심·가설과 연구 결과 구별 |
| R686-02 | [GOV.UK 운영중 포용적 조사](https://www.gov.uk/service-manual/user-research/user-research-in-live) | 장애/저숙련/보조기술 이용자 포함 |
| R686-03 | [GOV.UK 서비스 시작 패턴](https://design-system.service.gov.uk/patterns/start-using-a-service/) | 행동·적격성 명시 |
| R686-04 | [GOV.UK 완료 확인](https://design-system.service.gov.uk/patterns/confirmation-pages/) | 완료된 후에만 증빙/다음 행동 |
| R686-05 | [GOV.UK 오류 문구](https://design-system.service.gov.uk/components/error-message/) | 결과 불명·잠금의 구체적 설명 |
| R686-06 | [Baymard 가입 후순위](https://baymard.com/research-articles/delayed-account-creation) | 전자상거래에서 얻은 가입 강요 최소화 **UX 유추** |
| R686-07 | [Google HEART 연구](https://research.google.com/pubs/archive/36299.pdf) | Task Success/Adoption/Retention을 사용자 목표에 연결 |
| R686-08 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 초점·접근성/리플로·확대 |
| R686-09 | [W3C 상태 메시지](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | 오류·성공 안내의 스크린리더 전달 |
| R686-10 | [OWASP 객체 권한](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | 원장·진행 정보 회원 소유권 검사 |
| R686-11 | [Stripe 멱등성](https://docs.stripe.com/api/idempotent_requests) | 중복 보상·주문 방지와 결과확인 설계 유추 |
| R686-12 | [GOV.UK 오류 요약](https://design-system.service.gov.uk/components/error-summary/) | 키보드 오류 회복 |

위 자료는 설계 근거이며 실제 머니버스 가입/이탈 통계, 보안·법률 인증이나 Test/운영 수용 증거가 아니다.

**v686은 세부기획 문서 작업만 수행하며 실제 보상·주식·UI 코드 수정이나 운영승격은 별도 승인된 구현 단계에서 진행한다.**
