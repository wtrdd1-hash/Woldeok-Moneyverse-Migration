# 월덕 머니버스 — 접근성·반응형 상호작용·UI 상태 명세

> 버전: v2026.09.13.11
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md`
> 영문 기준 문서: [ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md](ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md)

## 0. 목적

Moneyverse에는 이미 일부 `aria-live`, 로딩 상태 등 개별 접근성 패턴이 존재하지만, 접근성은 화면별 선택사항이 아니라 제품 전체 계약이어야 한다. 이 문서는 공개 페이지, 인증 후 게임플레이, 시장·은행, 결제, 커뮤니티, 관리자 화면에 공통 적용할 상호작용·반응형·상태·테스트·릴리스 기준을 정의한다.

제품 내부 목표는 적용 가능한 범위에서 **WCAG 2.2 Level AA**를 지향한다. 이는 제품 품질 목표이며 모든 외부 법제도가 Moneyverse에 WCAG 2.2를 직접 의무화한다는 뜻은 아니다.

## 1. 핵심 원칙

1. 핵심 작업은 키보드만으로 수행 가능해야 한다.
2. 정보는 색상·애니메이션·hover·정밀 포인터·소리에만 의존하지 않는다.
3. focus는 항상 보이며 sticky header, drawer, cookie banner, 고정 CTA에 완전히 가려지지 않는다.
4. 인증·결제·구독취소·주문 등 중요 흐름은 불필요한 기억·인지 테스트나 중복입력을 요구하지 않는다.
5. 모바일은 데스크톱 화면 축소판이 아니라 동일 작업을 끝낼 수 있는 기능적 재배치다.
6. loading, empty, error, offline, maintenance, permission-denied, success를 정식 제품 상태로 정의한다.
7. 핵심 작업 접근성 회귀는 별도 승인된 예외가 없는 한 릴리스 차단 결함이다.

## 2. 적용 대상

공개/계정: 랜딩·가이드·시즌·기업소개, 회원가입·로그인·이메일인증·비밀번호복구·MFA·보안센터, 프로필·개인정보·설정, 결제·구독·환불·취소.

게임/경제: 직업·퀘스트, 지갑·은행·대출, WDX 시장·주문·포트폴리오·저널, 사업·공급망·재고, 상점·인벤토리·거래소·제작, 시즌·리그, 개인공간·도시 프로젝트, 클럽·커뮤니티·신고.

운영자: 관리자 대시보드, 경제/원장/정산, 모더레이션·시장무결성, billing/refund, 보안/세션/사고대응.

## 3. 키보드와 focus

- 가능한 경우 native semantic control을 사용한다.
- Tab 순서는 시각적·업무 순서와 일치한다.
- 양수 `tabindex`로 순서를 강제하지 않는다.
- 모든 조작 가능한 요소는 visible focus를 갖는다.
- modal/drawer가 열리면 focus를 내부로 이동하고, 닫을 때 호출한 요소로 돌려준다.
- 안전한 비파괴 dialog는 `Escape`로 닫을 수 있게 한다.
- 파괴적 확인창에서 위험 버튼을 기본 focus로 두지 않는다.
- 단축키만이 유일한 조작 방법이 되어서는 안 된다.

## 4. 포인터·터치·제스처

- WCAG 2.2 target-size 또는 spacing 예외를 충족한다. 모바일 주요 CTA는 가능하면 44×44 CSS px 이상을 선호한다.
- drag-only 기능은 버튼/키보드 등 대체 조작을 제공한다.
- swipe-only 탐색은 금지하고 보이는 control을 제공한다.
- hover 전용 정보는 focus/tap/상시 텍스트로도 접근 가능해야 한다.
- 차트 핵심 수치를 보기 위해 정밀 포인터 조작만 요구하지 않는다.

## 5. 입력폼과 검증

- 모든 필드는 지속적으로 확인 가능한 accessible name을 갖는다. placeholder만 label로 사용하지 않는다.
- 오류는 어떤 필드가 왜 잘못됐는지 텍스트로 설명한다.
- 오류와 필드를 `aria-describedby` 등으로 연결한다.
- submit 실패 시 error summary 또는 첫 오류 필드로 예측 가능한 focus 이동을 한다.
- 이미 정상 입력한 값은 유지한다.
- 같은 절차에서 이미 입력한 정보를 보안상 꼭 필요하지 않다면 다시 입력시키지 않는다.
- password/session/token/private data를 오류문구에 노출하지 않는다.

## 6. 접근 가능한 인증

- password manager와 붙여넣기를 허용한다.
- password/인증코드 필드의 paste를 막지 않는다.
- CAPTCHA가 필요하면 시각 퍼즐 하나만을 성공 경로로 두지 않고 접근 가능한 대안을 제공한다.
- MFA는 입력 label, 만료/재시도 상태, 오류 알림, 복구 경로를 명확히 한다.
- 재인증 성공 후 사용자가 원래 가려던 위치로 돌아간다.
- 접근성을 이유로 보안 요구조건 자체를 약화시키지는 않는다.

## 7. 상태 알림과 실시간 갱신

`aria-live="polite"`/`role="status"`는 저장 완료, 복사 완료, background refresh 완료, 주문접수 등 비긴급 변경에 사용한다.

매 초 변하는 가격·카운트다운·온라인 인원 수를 매번 읽어주지 않는다. 현재값을 읽을 수 있게 하고 refresh/verbosity를 사용자 통제형으로 설계한다.

즉시 개입이 필요한 치명적 실패만 assertive alert 후보로 본다.

## 8. 금융·게임시장 표시

손익·부채·상환·주가 변동·경제상태를 빨강/초록만으로 표시하지 않는다.

최소한 다음을 병행한다.
- `+` / `-` 기호
- 상승/하락, 이익/손실, 정상/연체 같은 텍스트
- 숫자값
- 보조 색상

차트는 series/metric 명칭, 현재/요약값, 의사결정 핵심 데이터의 표 또는 동등한 키보드 접근 대안, 색상 외 legend 구분, pointer-only가 아닌 tooltip 접근을 제공한다.

주문·대출·송금·결제 최종 확인은 권위값 기준 금액, 단위/통화, 행동, 핵심 결과를 다시 보여준다.

## 9. 모션·애니메이션·긴급성

- 비필수 애니메이션은 `prefers-reduced-motion`을 존중한다.
- 번쩍임·빠른 pulse·작업을 가리는 축하효과를 피한다.
- 구매·주문·대출 주변에 불필요한 countdown/FOMO 연출을 사용하지 않는다.
- 중요한 제한시간은 정확한 종료시각을 텍스트로 표시한다.

## 10. 반응형 레이아웃

### 테이블
데스크톱은 정렬/필터가 가능한 table을 사용할 수 있다. 모바일은 가로스크롤 또는 card/list 변환을 사용하되 핵심 재무·운영 열을 단순히 숨기지 않는다.

### 시장
데스크톱에서는 chart/context/order panel을 병렬 배치할 수 있다. 모바일에서는 chart 탐색과 주문입력을 분리하고, sticky CTA가 focus나 내용을 가리지 않게 한다.

### 관리자
입력 중 자동 refresh로 form 값을 날리지 않는다. stale-data 표시나 사용자 제어 refresh를 사용한다.

### 내비게이션
collapse 후에도 핵심 목적지, 현재 위치, 키보드 접근, screen-reader 이름을 유지한다.

## 11. 필수 UI 상태

주요 화면은 최소한 default, hover(해당 시), focus, active/selected, disabled+사유, loading/skeleton, empty, partial/degraded, validation error, server/network error, offline, maintenance, permission denied, success, stale-data/refresh-available 상태를 정의한다.

0건 결과는 오류가 아니다. empty state는 가짜 데이터를 만들지 않고 다음 가능한 행동을 안내한다.

## 12. 데이터 규모

0건, 1건, 수십건, 수천건 상황을 각각 정의한다.
- pagination/virtualization 이후에도 focus 위치를 가능한 한 보존한다.
- 검색/필터 결과 수 변화는 과도한 반복 없이 전달한다.
- infinite scroll은 접근 가능한 pagination 또는 load-more 대안을 제공한다.
- 비파괴 refresh 시 사용자가 입력한 필터/form 값을 유지한다.

## 13. 디자인 시스템

공통 component library에 spacing/grid, typography hierarchy, semantic colors, visible focus, target-size guidance, tabular 숫자 정렬, WLD/WDX/실제 통화 포맷 구분, timezone/date, table density, responsive breakpoint, light/dark contrast, reduced motion, critical status icon+text 규칙을 정의한다.

icon-only 버튼은 accessible name을 가져야 한다.

## 14. 기능별 접근성 완료조건

새 기능 또는 주요 수정은 다음을 기록한다.
- primary task keyboard path
- focus 이동
- input/button/landmark 이름
- live-region 동작
- 색상 외 상태 표현
- zoom/reflow
- 모바일 CTA/table 동작
- loading/empty/error/offline
- reduced motion
- 자동검사와 수동검사 범위

## 15. QA

자동검사는 semantic/name 문제, 명백한 contrast, invalid ARIA, 알려진 dialog keyboard trap, 대표 viewport smoke를 확인한다.

주요 릴리스 수동점검:
1. keyboard-only
2. visible focus/복귀
3. 적용 가능한 200%/400% zoom·reflow
4. 로그인·주문·결제/취소·신고·고위험 관리자 기능 screen-reader spot check
5. reduced motion
6. mobile portrait/landscape
7. 오류 후 입력값 보존 및 복구

## 16. 분석

접근성 telemetry로 장애 여부를 추론·프로파일링하지 않는다.

허용 가능한 품질지표:
- 필드별 form error rate
- viewport class별 task abandonment
- client error rate
- presentation에 필요한 경우에 한해 reduced-motion preference
- synthetic QA keyboard success
- component/release별 접근성 issue 수
- critical-flow manual QA pass rate

사용자의 장애를 상호작용 패턴으로 추정하거나 광고에 활용하지 않는다.

## 17. 수익·광고

- native/sponsored 콘텐츠는 텍스트로 광고임을 명확히 표시한다.
- 광고가 focus, form, primary CTA를 덮지 않는다.
- checkout/cancel/refund를 일부러 키보드·시각적으로 불리하게 만들지 않는다.
- 광고 layout shift가 focus/reading order를 깨면 안 된다.
- 접근성 개선을 유료 편의기능으로 판매하지 않는다.

## 18. SEO 관계

semantic HTML은 공개 콘텐츠 이해성과 crawl에 도움이 되지만 접근성과 SEO는 별도 품질 축이다.

공개 페이지는 의미 있는 heading/link/alt를 사용한다. 개인/계정/admin 페이지는 접근성 여부와 무관하게 인증+`noindex`를 유지한다.

alt text에 키워드를 억지로 넣지 않는다. 장식 이미지는 적절히 assistive technology에서 제외한다.

## 19. 법률·정책 메모

- 내부 제품 목표는 적용 가능한 WCAG 2.2 AA다.
- 미국 DOJ Title II 웹/앱 규칙은 주·지방정부 대상이며 WCAG 2.1 AA를 기준으로 한다. Moneyverse 민간서비스에 자동 적용된다고 단정하지 않는다. 향후 대상 공공기관과 계약/제공 관계가 생기면 `legal review required`다.
- 한국 웹 접근성 의무·품질인증 적용 여부도 사업자·서비스 맥락에 따라 별도 법률 검토한다.
- 실제 검증 없이 “완전 준수” 표현을 사용하지 않는다.

## 20. Runtime Product Reality

저장소에는 `aria-live`, loading skeleton, 텍스트 상태 피드백 등 부분 접근성 구현이 이미 확인된다. 따라서 현재 UI 전체가 미구현이라고 표현하지 않는다.

다만 이번 회차에서 Production/Test를 정상 확인할 수 없었다. `easy-scraping.com` 외부 접근이 실패하여 실제 keyboard, responsive, assistive-technology 동작은 **runtime verification unavailable** 상태다.

실제 증거가 없는 항목은 planned/not implemented로 유지한다.

## 21. 구현 우선순위

P0: 회원가입/로그인/복구/보안센터, 지갑·은행·송금, 시장·주문·포트폴리오, 결제·취소·환불, 파괴적 확인, 관리자 고위험 기능, 공통 dialog/form/status primitive.

P1: 직업·퀘스트·사업·상점·인벤토리, 시즌·보상, 커뮤니티·신고, 반응형 table/card/chart.

P2: 고급 개인화, 전체 component 접근성 regression suite, 가능한 범위의 assistive-technology 사용자 테스트.

## 22. Definition of Done

사용자 기능은 다음을 만족해야 완료로 본다.
- primary task keyboard 사용 가능
- visible focus 유지
- label/name/status가 의미 있음
- 색상만으로 상태 전달하지 않음
- desktop/tablet/mobile 동작 정의
- loading/empty/error/offline/permission 상태 존재
- 좁은 화면에서도 핵심 데이터 유지
- 필요한 reduced-motion 대응
- 자동검사 통과
- 필요한 수동 critical-flow 점검 기록
- 영문/한국어 문서 동기화

## 23. 조사 기록 — 2026-09-13

### 직접 채택
1. **W3C WAI — Understanding WCAG 2.2**, 2026-02-11 업데이트. 공식 표준 가이드. WCAG 2.2 AA 제품 목표와 status/name-role-value 해석에 채택. https://www.w3.org/WAI/WCAG22/understanding/
2. **W3C WAI — What's New in WCAG 2.2**. 공식 표준 가이드. focus not obscured, dragging 대안, minimum target size, redundant entry, accessible authentication에 채택. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
3. **W3C ARIA Authoring Practices — Dialog (Modal) Pattern**. 공식 구현 가이드. modal focus 이동·tab containment·복귀·적절한 Escape 동작에 채택. https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

### 법률/운영 참고이며 자동 적용하지 않음
4. **미국 DOJ — ADA Title II web/mobile accessibility rule fact sheet**, 2026 IFR 반영. 정부 공식 법률 가이드. 주·지방정부 범위에서 WCAG 2.1 AA와 2027/2028 연장 일정을 확인하는 참고자료. https://www.ada.gov/resources/2024-03-08-web-rule/
5. **Accessibility Korea**, 2026-09-13 확인. 운영형 웹 접근성 진단 참고자료. 자동 진단은 유용하지만 로그인·핵심업무 수동검증을 대체하지 않는 보조 근거로 사용. https://accessibility.kr/

## 24. 배포 메모

문서-only 변경이다. 이번 버전 때문에 Test/Production 배포는 필요하지 않다. 실제 구현은 별도 개발 브랜치 → isolated Test exact-SHA 검증 → backend/API/browser 검증 → Production 순서를 따른다.