# 월덕 머니버스 — 리텐션 안전형 수익화 성장 명세

> 버전: v2026.09.13.43
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> 영문 기준 문서: [RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md](RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번에 선택한 가장 큰 공백

현재 가장 큰 성장 공백은 광고가 있느냐가 아니다. 검토 완료된 공개 콘텐츠 광고는 운영에서 기본 활성화됐고, 기존 성장 기획은 수익화를 사용자가 가치를 경험한 뒤 연결해야 한다고 이미 규정한다.

따라서 이번 공백은 **광고를 기술적으로 노출할 수 있는 공개 페이지에서 어떤 조건을 충족해야 단기 광고수익이 아니라 장기 성장에 도움이 되는가**이다.

기준 원칙:

**먼저 관심을 얻고 → 페이지의 핵심 가치를 전달하고 → 다음 의미 행동을 방해하지 않는 범위에서 수익화하고 → 수익을 D7/D30·신뢰와 함께 판단한다.**

광고 기본 활성화는 노출 극대화 허가가 아니다. 검토된 인벤토리를 운영에서 사용할 수 있다는 뜻일 뿐이다.

## 2. 현재 제품 현실

현재 Living Project Plan은 광고를 검토된 공개 정보/콘텐츠 경로에만 허용한다. 로그인/계정, 지갑/송금, 가상시장/주식, 대출, 카지노/게임플레이, 관리자, 오류/상태 등 민감·거래 화면은 광고 금지 상태를 유지한다.

실제 공개 홈은 정상 접근되며 game-only 고지, 제품 설명, 로그인/시작 가이드, 신규사용자 안내를 제공한다. 운영 소식 페이지도 접근 가능하지만 아직 공개 공지가 없다.

텍스트 기반 공개 검증만으로는 방문자의 지역·동의·fill 상태에 따라 실제 시각적 광고 슬롯이 렌더링됐는지를 확정할 수 없다. 따라서 이번 감사는 실제 광고가 보였다고 또는 안 보였다고 단정하지 않고, **해당 공개면이 광고가 채워졌을 때도 먼저 충분한 자체 가치를 제공하는지**를 본다.

결론: 홈은 첫 방문 가치가 존재한다. 반면 운영 소식은 아직 empty 상태다. 콘텐츠가 거의 없는 공개면이 allowlist라는 이유만으로 광고 중심 페이지가 되어서는 안 된다.

## 3. 소비자 수익화 상태

### A — 아직 가치 전달 전
첫 화면에서 제품 약속을 이해하기 전, loading/empty 상태, 동의 화면 중, 약속한 가이드/콘텐츠에 도달하기 전.

정책: **광고 노출을 최적화하지 않는다.** 설명·복구·콘텐츠가 먼저다.

### B — 첫 유용한 가치 전달 후
페이지의 핵심 설명·답변·스토리·업데이트를 사용자가 이미 받았다.

정책: 맥락형 다음 행동을 밀어내지 않는다면 명확히 분리된 검토 광고/스폰서 1개는 후보가 될 수 있다.

### C — 의미 있는 이어가기 의도
미리보기를 시작하려 하거나, 관심 스레드를 고르거나, 맥락형 가입/복귀 CTA를 누르려 하거나, 학습 복기를 마치는 순간.

정책: 추가 광고노출보다 이어가기가 우선이다. 의도와 다음 의미 행동 사이에 끼어드는 광고를 넣지 않는다.

### D — 민감/경제 행동
로그인, 지갑, 송금, 은행/대출, WDX 주문/포트폴리오 결정, 카지노/게임, 계정/보안/관리자 등은 기존 정책대로 광고 금지다.

## 4. 수익화 배치 우선순위

공개 콘텐츠의 권장 순서:

1. 페이지 목적과 game-only 맥락;
2. 핵심 유용 정보/스토리/업데이트;
3. 맥락형 다음 행동;
4. 명확히 분리된 검토 광고/스폰서;
5. 보조 탐색.

충분한 본문 중간의 비침해성 광고는 실험할 수 있지만, 내비게이션처럼 보이거나 핵심 CTA와 시각적으로 경쟁하면 안 된다.

피해야 할 것:
- 첫 진입 splash/interstitial 광고;
- 모바일 CTA나 콘텐츠를 가리는 sticky 광고;
- 닫기 카운트다운;
- 사용자 과업에서 시선을 뺏는 과도한 애니메이션;
- 실수 클릭이 쉬운 버튼 인접 배치;
- Moneyverse 내비게이션·보상·시스템 공지·커뮤니티 게시물처럼 보이는 광고;
- 자체 콘텐츠가 비어 있는데 광고만 두드러지는 페이지.

## 5. 첫 방문·Activation 계약

### 첫 30초
수익보다 이해가 우선이다. 사용자는 먼저 Moneyverse가 가상/game-only 경제라는 점, 무엇을 할 수 있고 어떤 정체성을 만들 수 있는지, 유용한 콘텐츠/미리보기 하나로 가는 경로를 이해해야 한다.

이를 이해하기 전에 광고 때문에 이탈률이 올라간다면 수익이 나더라도 성장 실패다.

### 첫 3분
광고 방해 없이 의미있는 미리보기/스레드 하나까지 갈 수 있어야 한다.

`공개 약속 → 유용한 콘텐츠/미리보기 → 맥락형 이어가기 → 경로 안이 아니라 주변에서 선택적 수익화`

### 로그인 후 첫 세션
기존 차단 경계를 유지한다. 첫 경제·학습·시장·은행·카지노·계정 행동을 광고로 수익화하지 않는다.

## 6. 리텐션 민감형 광고량

일괄적인 인상 수 목표를 두지 않는다. 표본이 충분할 때 신규/복귀 비회원, 유입 채널, activation 후 7일 이내/기존 유지 사용자, 모바일/데스크톱, 콘텐츠 축, 동의/개인화 상태, 무료/광고제거 구독 코호트로 나눠 평가한다.

eCPM이 높아져도 qualified activation, D7/D30, 콘텐츠 완료, 신뢰, Core Web Vitals가 나빠지면 채택 근거가 되지 않는다.

판단 프레임:

`리텐션 조정 기여 = 광고/구독 기여 - 관측 가능한 이탈·신뢰·지원·CWV 비용`

이는 모든 요소를 완벽히 돈으로 환산한다는 의미가 아니라 실험과 코호트 비교를 위한 판단 틀이다.

## 7. Empty·Loading·Error 수익화

공지처럼 약속한 자체 콘텐츠가 없으면 광고가 페이지의 주가치가 되어서는 안 된다. 무엇이 표시될지 설명하고 유용한 인접 경로 하나를 제공하며, 충분한 자체 콘텐츠가 생기기 전까지 광고를 숨기는 방안을 우선한다.

Loading 광고는 결과물처럼 보이거나 레이아웃 이동으로 CTA 위치를 바꾸면 안 된다. Error/offline/maintenance는 기존대로 광고 금지다.

## 8. 광고·스폰서·편집 신뢰

네이티브/스폰서 모듈은 상업적 성격을 해당 콘텐츠 가까이 명확히 표시하고, 상황에 맞게 `광고`, `스폰서`, `Ad`, `Advertisement`, `Sponsored` 같은 이해 쉬운 표현을 사용한다. 유료 가상시장/lore 분석을 중립 Moneyverse 편집 판단처럼 보이게 하지 않는다. 돈으로 WDX 가격, 랭킹, 중립처럼 보이는 추천 우선순위, 대출조건, 모더레이션 특혜를 구매하지 않는다. 공유/재게시 시에도 이해관계 표시를 유지한다.

## 9. 개인정보·동의 성장 원칙

광고수익을 이유로 불필요한 개인정보 처리를 늘리지 않는다.

- 개인화 처리가 명확히 정당화되지 않으면 contextual/non-personalized를 우선한다.
- 맞춤형 광고는 지역·연령·개인정보 검토를 거친다.
- Moneyverse 경제 행동에서 민감특성을 추론해 광고 타기팅하지 않는다.
- 광고/분석 데이터에 credential, session secret, 복구/보안상태, 불필요한 비공개 경제정보를 넣지 않는다.
- 동의 UX를 수락률만으로 최적화하지 않고 거절/limited-ad 경로도 이해 가능하고 정상 동작해야 한다.

2026-09-11 Google AdSense Privacy & messaging 업데이트는 운영 참고자료이지 Moneyverse 자체 개인정보·법률 기준을 약화시키는 근거가 아니다.

## 10. 구독 관계

광고제거 구독은 광고를 일부러 불편하게 만든 뒤 해결책처럼 파는 것이 아니라 반복가치 경험 후 제안한다.

광고제거, 비-P2W 표현·아카이브·프로필 편의는 가능하지만 WLD/WDX 수익, 체결, 대출조건, 확률, 랭킹, 모더레이션 우위는 제공하지 않는다.

결제 전 반복 가격·주기·갱신·체험 전환 조건을 명확히 보여주고 명시적·충분한 동의를 받으며 해지는 단순해야 한다.

## 11. KPI

수익: ARPU/ARPDAU, eCPM, fill, viewability, CTR, 구독 전환/해지, engaged visitor/cohort당 contribution margin.

성장: visitor→signup, visitor→첫 의미 행동, time-to-first-value, 콘텐츠 완료, contextual CTA 완료, D1/D3/D7/D14/D30, returning-user share, organic→activation→D7/D30, share/referral→activation→D7.

신뢰/품질 guardrail: ad-induced abandonment, accidental-click signal, 광고 숨김/신고/불만, 개인정보 불만, 광고량 코호트별 CLS/LCP/INP·모바일 사용성, 광고 관련 고객지원, consent refusal/limited-ad 완료, 구독 해지 어려움 불만, 캠페인·추천 인센티브가 있을 때 fraud-adjusted acquisition.

## 12. 실험 backlog

### E1 — 가치 전달 후 광고 vs 조기 광고
가설: 첫 유용 구간 이후 광고가 activation/D7을 지키면서 수익을 유지한다.
Primary: engaged visitor당 retention-adjusted contribution.
Guardrail: bounce, activation, D7/D30, 오클릭, 불만, CWV.
최소 관찰: 최소 한 번의 전체 주간 주기와 리텐션 비교가 가능한 activation 표본.
결정: 단기수익이 높아도 리텐션/신뢰 손실이 더 크면 기각.

### E2 — empty page 광고 억제
가설: 자체 콘텐츠가 비어있는 공지/커뮤니티 공개면에서 광고를 숨기면 신뢰와 유용한 다음 행동이 개선된다.
Primary: meaningful next-action rate.
Guardrail: 재방문, bounce, 불만, 수익손실.

### E3 — 검토 슬롯 1개 vs 높은 광고밀도
Primary: retained visitor당 contribution margin.
Guardrail: 콘텐츠 완료, CTA 완료, CWV, 불만/오클릭.

### E4 — 반복가치 이후 광고제거 구독 vs 조기 제안
Primary: 30/60일 유지 구독자 기여.
Guardrail: D7/D30, 해지/환불 불만, 지원비용.

### E5 — contextual/non-personalized 기준선 vs 검토된 personalization
개인정보/법률 준비 후에만 실행한다. CTR/eCPM 상승만으로 개인화를 출시하지 않는다.
Primary: incremental contribution margin.
Guardrail: 동의 불만, opt-out, 리텐션, 연령/지역 위험, 개인정보 사고.

## 13. 보안·악용·개인정보 검토

### High — 오클릭/기만 내비게이션
광고가 Moneyverse CTA처럼 보이거나 레이아웃 이동으로 사용자의 탭 위치에 들어갈 위험.
최소 보호조건: 강한 시각 분리, 고정 공간, 민감 CTA 인접 금지, 모바일 visual QA, accidental-click 모니터링.
배치 변경 시 별도 개발/QA 필요.

### High — 민감 맥락 광고 유출
지갑·시장·대출·카지노·계정/보안·관리자에서 광고/분석 스크립트가 실행되거나 민감 맥락을 전달할 위험.
최소 보호조건: 현재 금지면 유지, 광고분석에 비공개 경제/보안 필드 금지, 라우팅/동의 변경 시 별도 런타임 보안 QA.

### High — 동의/프로파일링 과잉
경제행동으로 민감특성을 추론하거나 고지범위를 넘어 맞춤 타기팅할 위험.
최소 보호조건: 최소수집, contextual 기본, 연령/지역 검토, 이해 가능한 선택, 민감추론 타기팅 금지.
맞춤광고 확장 전 legal/privacy review 필요.

### Medium — 광고/추천 사기
봇/가짜계정으로 수익화 페이지뷰나 캠페인 attribution을 부풀릴 위험.
최소 보호조건: 노출·클릭·raw signup 자체를 성장성과로 보지 않고 fraud-adjusted acquisition과 retained activation으로 평가.

## 14. SEO·브랜드 영향

광고 인벤토리를 늘리기 위해 얇은 페이지를 만들지 않는다. 실제 도움이 되는 가이드, 가상기업 설명, 시즌/세계 아카이브, 충분한 컬렉션/lore, public-safe 커뮤니티/프로젝트 회고만 색인 후보로 유지한다.

`impression → qualified click → useful understanding → contextual continuation → activation → D7/D30 → retention-adjusted contribution`

브랜드 원칙: 첫 방문자가 가장 먼저 인식해야 하는 것은 광고 인벤토리가 아니라 Moneyverse의 가치와 신뢰다.

## 15. Research note — 2026-09-13

### 직접 채택
1. **Deloitte + Google AdMob, 2025-06-10, 업계 연구/공식 파트너 발표.** 방해성 광고가 신뢰·리텐션을 훼손할 수 있다는 방향을 리텐션 우선 광고품질 원칙과 실험 근거로 채택. 발표 수치는 Moneyverse 성과 예측으로 사용하지 않음.
   - https://www.deloitte.com/us/en/about/press-room/deloitte-improve-mobile-game-advertising.html
2. **Google AdSense Program Policies, 2026 현재 공식 퍼블리셔 정책.** 광고를 내비게이션처럼 보이게 하거나 오해성 상호작용을 유도하지 않는 배치 기준을 직접 채택.
   - https://support.google.com/adsense/answer/48182
3. **Google AdSense Privacy & messaging, 2026-09-11 공식 업데이트.** EEA/영국/스위스 CMP 메시지 coverage/optimization 변화를 동의 운영 검토 트리거로만 채택.
   - https://support.google.com/adsense/answer/18189118

### 참고/규정 guardrail
4. **FTC Native Advertising guide.** 네이티브 광고의 상업적 성격을 명확하고 눈에 띄게 가까이 표시하는 원칙을 계속 적용.
   - https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
5. **FTC Shutterstock settlement, 2026-05.** 구독 핵심조건의 명확한 고지, 명시적 동의, 단순 해지를 구독 신뢰 guardrail로 적용.
   - https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 16. 법규/제품 주의

WLD/WDX는 계속 virtual/simulated/game-only다. 맞춤형 광고, 아동 대상/13세 미만 인지 사용자 운영, 신규 민감 프로파일링, 새로운 추적 확대는 별도 legal/privacy review가 필요하다. 실결제 구독/상품 출시 전에는 한국·미국의 가격표시, 반복결제, 해지/환불, 미성년자, 광고표시 의무를 출시 시점 기준으로 다시 검토한다.

## 17. 완료 기준

제품 이해 전에 광고가 관심을 빼앗지 않고, empty/loading/error가 광고 중심 경험이 되지 않으며, 의미 행동으로 이어지는 경로가 광고로 끊기지 않아야 한다. 민감/경제 화면은 광고 금지를 유지하고 광고/스폰서는 광고임을 알아볼 수 있어야 한다. 수익화 실험은 CTR/노출만이 아니라 D7/D30·신뢰·contribution margin으로 판단한다. 구독은 불편한 광고를 피하기 위한 강요가 아니라 선택 가능한 가치교환이어야 한다.

다음 성장 우선순위는 현재 비어 있는 공개 운영 소식을 **작지만 반복 가능한 주간 복귀 제품**으로 만들고, 광고 인벤토리를 늘리기 전에 `세계 변화 → 맥락형 이어가기 → D7`이 실제 유기적 복귀를 만드는지 검증하는 것이다.