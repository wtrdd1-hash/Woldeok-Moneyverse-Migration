# 월덕 머니버스 — 리텐션 안전형 수익화 성장 명세

> 버전: v2026.09.13.44
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> 영문 기준 문서: [RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md](RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번에 선택한 가장 큰 공백
검토 완료된 공개 콘텐츠 광고는 운영에서 기본 활성화됐고 기존 성장 기획은 수익화를 사용자가 가치를 경험한 뒤 연결해야 한다고 규정한다. 따라서 이번 공백은 **광고를 기술적으로 노출할 수 있는 공개 페이지에서 언제 그 광고가 단기수익이 아니라 장기 성장에 도움이 되는가**이다.

기준 원칙: **먼저 관심을 얻고 → 페이지의 핵심 가치를 전달하고 → 다음 의미 행동을 방해하지 않는 범위에서 수익화하고 → 수익을 D7/D30·신뢰와 함께 판단한다.** 광고 기본 활성화는 노출 극대화 허가가 아니다.

## 2. Runtime Product Reality Audit
2026-09-13 실제 공개 서비스를 다시 확인했다. 홈은 정상 접근되며 game-only 고지, 제품 설명, 로그인/시작 경로와 신규사용자 안내가 있다. 운영 소식 페이지도 접근 가능하지만 아직 공개 공지가 없다.

텍스트 기반 검증만으로 특정 지역·동의·fill 상태의 실제 시각 광고 렌더링 여부를 확정할 수 없으므로 광고가 실제 보였다고/안 보였다고 단정하지 않는다. 대신 광고가 채워졌을 때도 충분한 자체 가치가 먼저 있는지를 평가한다.

결론: 홈은 첫 방문 가치가 있지만 운영 소식은 아직 empty 상태다. 비어 있는 페이지가 allowlist라는 이유만으로 광고 중심 목적지가 되어서는 안 된다.

## 3. 소비자 수익화 상태
- **A 가치 전달 전:** 제품 약속 이해 전, loading/empty, 동의 중단, 약속한 콘텐츠 도달 전. 광고노출을 최적화하지 않고 설명·복구·콘텐츠를 우선한다.
- **B 첫 유용가치 전달 후:** 핵심 답변/스토리/업데이트 제공 후, 맥락형 다음 행동을 밀어내지 않는 범위에서 명확히 분리된 검토 광고/스폰서 1개는 후보가 될 수 있다.
- **C 의미있는 이어가기 의도:** 미리보기 시작, 관심 스레드 선택, 맥락형 가입/복귀 CTA, 학습 복기 직전에는 추가 노출보다 이어가기가 우선이다.
- **D 민감/경제 행동:** 로그인, 지갑, 송금, 은행/대출, WDX 주문/포트폴리오 결정, 카지노/게임, 계정/보안/관리자 등은 계속 광고 금지다.

## 4. 배치 우선순위
`페이지 목적/game-only 맥락 → 핵심 유용 정보 → 맥락형 다음 행동 → 명확히 분리된 광고/스폰서 → 보조 탐색`

첫 진입 splash/interstitial, CTA를 가리는 sticky, 닫기 카운트다운, 과도한 애니메이션, 오클릭이 쉬운 버튼 인접 배치, Moneyverse 내비게이션·보상·공지·게시물처럼 보이는 광고, 자체 콘텐츠가 비었는데 광고가 두드러지는 페이지는 피한다.

## 5. 첫 가치 계약
첫 30초에는 Moneyverse가 virtual/game-only라는 점, 무엇을 할 수 있는지, 유용한 콘텐츠/미리보기 하나로 가는 경로를 먼저 이해하게 한다. 첫 3분에는 광고 방해 없이 의미있는 미리보기/스레드 하나까지 도달하게 한다.

`공개 약속 → 유용한 콘텐츠/미리보기 → 맥락형 이어가기 → 경로 주변에서 선택적 수익화`

로그인 후 첫 세션의 경제·학습·시장·은행·카지노·계정 행동은 기존 차단 경계를 유지한다.

## 6. 리텐션 민감형 광고량
일괄 인상 수 목표를 두지 않는다. 표본이 충분하면 신규/복귀 비회원, 유입원, activation 후 7일 이내/기존 유지 유저, 모바일/데스크톱, 콘텐츠 축, 동의/개인화 상태, 무료/광고제거 구독 코호트로 나눠 평가한다.

eCPM이 올라가도 qualified activation, D7/D30, 콘텐츠 완료, 신뢰, Core Web Vitals가 나빠지면 채택하지 않는다.

`리텐션 조정 기여 = 광고/구독 기여 - 관측 가능한 이탈·신뢰·지원·CWV 비용`

## 7. Empty/Loading/Error
약속한 자체 콘텐츠가 없으면 무엇이 표시될지 설명하고 유용한 인접 경로 하나를 제공하며, 충분한 콘텐츠가 생기기 전까지 광고 억제를 우선 검토한다. Loading 광고는 결과물처럼 보이거나 CTA를 밀어내면 안 된다. Error/offline/maintenance는 계속 광고 금지다.

## 8. 스폰서·편집 신뢰
네이티브/스폰서 모듈은 상업적 성격을 해당 콘텐츠 가까이 명확하게 표시한다. 유료 가상시장/lore 분석을 중립 Moneyverse 편집 판단처럼 보이게 하지 않는다. 스폰서십으로 WDX 가격, 랭킹, 중립처럼 보이는 추천 우선순위, 대출조건, 모더레이션 특혜를 구매할 수 없다.

## 9. 개인정보·동의
광고수익을 이유로 불필요한 개인정보 처리를 늘리지 않는다. 개인화가 명확히 정당화되지 않으면 contextual/non-personalized를 우선하고, 맞춤광고는 지역·연령·privacy review 뒤에만 확대한다. 경제행동에서 민감특성을 추론해 타기팅하지 않고 credential/session secret/복구·보안상태/불필요한 비공개 경제정보를 광고·분석 payload에 넣지 않는다. 동의 UX는 수락률만으로 최적화하지 않는다.

2026-09-11 Google AdSense Privacy & messaging 업데이트는 운영 참고자료일 뿐 Moneyverse 개인정보 기준을 낮추는 근거가 아니다.

## 10. 구독 관계
광고제거 구독은 일부러 광고를 불편하게 만든 뒤 해결책처럼 파는 것이 아니라 반복가치를 느낀 뒤 제안한다. WLD/WDX 수익, 체결, 대출조건, 확률, 랭킹, 모더레이션 우위는 제공하지 않는다. 반복 가격·주기·갱신/체험 전환을 결제 전에 명확히 보여주고 명시적 동의를 받으며 해지는 단순해야 한다.

## 11. KPI
수익: ARPU/ARPDAU, eCPM, fill, viewability, CTR, 구독 전환/해지, engaged visitor/cohort당 contribution margin.

성장: visitor→signup, visitor→첫 의미 행동, time-to-first-value, 콘텐츠 완료, contextual CTA 완료, D1/D3/D7/D14/D30, returning-user share, organic→activation→D7/D30, share/referral→activation→D7.

신뢰 guardrail: ad-induced abandonment, accidental-click signal, 광고 숨김/신고/불만, privacy complaint, 광고량별 CLS/LCP/INP·모바일 사용성, 광고 관련 지원, consent refusal/limited-ad 완료, 해지 어려움 불만, fraud-adjusted acquisition.

## 12. 실험 backlog
- **E1 가치 전달 후 광고 vs 조기 광고:** Primary는 engaged visitor당 retention-adjusted contribution. Guardrail은 bounce, activation, D7/D30, 오클릭, 불만, CWV. 최소 한 번의 전체 주간 주기와 코호트 비교가 가능한 activation 표본을 본다.
- **E2 empty page no-ad:** Primary는 meaningful next-action rate. Guardrail은 재방문, bounce, 불만, 수익손실.
- **E3 검토 슬롯 1개 vs 높은 광고밀도:** Primary는 retained visitor당 contribution margin. Guardrail은 콘텐츠/CTA 완료, CWV, 불만/오클릭.
- **E4 반복가치 후 광고제거 구독 vs 조기 제안:** Primary는 30/60일 유지 구독자 기여. Guardrail은 D7/D30, 해지/환불 불만, 지원비용.
- **E5 contextual 기준선 vs 검토된 personalization:** privacy/legal 준비 후에만 실행하며 CTR/eCPM 상승만으로 출시하지 않는다.

## 13. 보안·악용·개인정보
### High — 오클릭/기만 내비게이션
강한 시각 분리, 고정 레이아웃 공간, 민감 CTA 인접 금지, 모바일 visual QA, accidental-click 모니터링이 최소조건이다. 배치 변경 시 별도 개발/QA가 필요하다.

### High — 민감 맥락 광고 유출
현재 광고 금지면을 유지하고 광고분석에 비공개 경제/보안 필드를 보내지 않는다. 라우팅/동의 변경 시 별도 runtime/security QA가 필요하다.

### High — 동의/프로파일링 과잉
최소수집, contextual 기본, 연령/지역 검토, 이해 가능한 선택, 민감추론 타기팅 금지가 최소조건이다. 맞춤광고 확대 전 legal/privacy review가 필요하다.

### Medium — 광고/추천 사기
노출·클릭·raw signup 자체를 성장 성공으로 보지 않고 fraud-adjusted acquisition과 retained activation으로 평가한다.

## 14. SEO·브랜드
광고 인벤토리를 늘리기 위해 얇은 페이지를 만들지 않는다. 실제 도움이 되는 가이드, 가상기업 설명, 시즌/세계 아카이브, 충분한 컬렉션/lore, public-safe 프로젝트 회고만 색인 후보로 둔다.

`impression → qualified click → useful understanding → contextual continuation → activation → D7/D30 → retention-adjusted contribution`

첫 방문자가 가장 먼저 인식해야 하는 것은 광고 인벤토리가 아니라 Moneyverse의 가치와 신뢰다.

## 15. Research note — 2026-09-13
### 직접 채택
1. Deloitte + Google AdMob (2025-06-10): 방해성 광고가 신뢰·리텐션을 훼손할 수 있다는 방향을 리텐션 우선 광고 품질 기준으로 채택. 발표 수치는 Moneyverse 예측값으로 사용하지 않음. https://www.deloitte.com/us/en/about/press-room/deloitte-improve-mobile-game-advertising.html
2. Google AdSense Program Policies (2026 현재): 광고가 내비게이션처럼 보이거나 오해성 상호작용을 만들지 않는 배치 기준 채택. https://support.google.com/adsense/answer/48182
3. Google AdSense Privacy & messaging (2026-09-11): CMP coverage/optimization 변화를 동의 운영 검토 트리거로만 사용. https://support.google.com/adsense/answer/18189118

### 참고/규정 guardrail
4. FTC Native Advertising guide: 네이티브 광고의 상업적 성격을 명확하고 가까이 표시. https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
5. FTC Shutterstock settlement (2026-05): 구독 핵심조건 명확 고지, 명시적 동의, 단순 해지. https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 16. 법규/제품 주의
WLD/WDX는 계속 virtual/simulated/game-only다. 맞춤광고, 아동 대상/13세 미만 인지 운영, 신규 민감 프로파일링, 새로운 추적 확대는 별도 legal/privacy review가 필요하다. 실결제 구독/상품은 출시 시점 한국·미국 기준을 다시 검토한다.

## 17. 버전·동시작업 기록
이 명세는 처음 v2026.09.13.43으로 작성했으나 필수 중간 `main` 재확인에서 다른 동시 작업이 user-app API coverage audit에 이미 v2026.09.13.43을 사용한 것을 확인했다. 따라서 완료 전에 이번 소비자 성장 버전을 **v2026.09.13.44**로 정정했다.

## 18. 다음 우선순위
현재 비어 있는 공개 운영 소식을 **작지만 반복 가능한 주간 복귀 제품**으로 만들고, 광고 인벤토리를 늘리기 전에 `세계 변화 → 맥락형 이어가기 → D7`이 실제 유기적 복귀를 만드는지 검증한다.