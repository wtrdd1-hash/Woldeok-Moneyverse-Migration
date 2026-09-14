# 월덕 머니버스 — 신뢰 증거·신뢰도 전환 성장 명세

> 버전: v2026.09.14.88
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
> 영문 기준 문서: [TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.md](TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

브랜드 약속은 이전보다 분명해졌지만, 다음 acquisition/activation 공백은 **증거**다. 첫 방문자는 Moneyverse가 지속형 game-only 커뮤니티 경제라는 설명을 읽어도, 실제로 믿을 만하고 안전하며 투명하고 계정을 만들 가치가 있다는 근거가 더 필요할 수 있다.

Moneyverse에는 가상화폐, 주식, 예금·국채·대출, 카지노형 게임, 커뮤니티, 광고가 함께 보인다. 모두 허구의 게임 메커니즘이더라도 이런 범주는 피싱·사기 페이지가 자주 모방하는 영역이므로 신뢰를 footer 정책이나 `game-only` 한 문장에만 맡기면 안 된다.

2026-09-14 공개 런타임 검증에서는 실제 신뢰 자산도 확인했다.
- 홈은 WLD와 보상이 게임 전용이며 현금 환전되지 않는다는 점을 반복해 안내한다.
- 개인정보처리방침은 처리항목·목적·보유기간·광고 처리 범위를 구체적으로 설명한다.
- 서비스 상태 페이지는 추측하지 않고 수집된 기록만 표시한다고 명시한다.

하지만 동시에 증거 공백도 있다.
- 서비스 상태에는 아직 확인된 기록이 없고 관측 항목은 `확인 중`이다.
- 운영소식에는 게시된 공지가 없는데 sponsored inventory는 보인다.
- 시작 가이드는 game-only 고지와 함께 복리예금·국채·대출·배당·시세차익·패시브소득·`대표 자본가` 자산 사다리를 강하게 전면화한다.
- 금융처럼 보이는 교육/제품 설명에 누가 작성·검토했고 언제 검토했는지를 일관되게 보여주는 consumer-facing provenance 계약이 아직 약하다.

선택한 루프:

`적합한 발견 → 명확한 약속 → 믿을 수 있는 증거 스택 → 안전한 공개 샘플 → 사용자가 고른 관심사 → 맥락형 가입 → 의미 행동 → D1 약속/증거 일치 → D7 획득된 신뢰 → D30 지속 관계/공유`

이 문서는 소비자 신뢰·콘텐츠·전환 기획이다. 새 보안 아키텍처나 구현 계약을 정의하지 않는다.

## 2. 신뢰는 compliance footer가 아니라 전환 전제조건

가입을 요구하기 전에 사용자가 신뢰를 이해할 수 있어야 한다.

첫 방문자가 답할 수 있어야 하는 질문:
1. **실제로 운영되는 서비스인가?** 유지되는 제품, 식별 가능한 운영 이력, 사실 기반 상태 커뮤니케이션이 있다.
2. **경제는 허구인가?** WLD/WDX·주식·은행·대출·카지노·보상은 game-only이며 현금환전이나 실제 금융 수익을 약속하지 않는다.
3. **내 데이터는 어떻게 되나?** 무엇을 왜 수집하고 얼마나 보관하며 광고는 어디서 허용되는지 설명한다.
4. **주장을 확인할 수 있나?** 제품변경·상태·규칙·중요 콘텐츠에 출처와 검토 맥락이 있다.
5. **사회적 증거가 진짜인가?** 활동량·리뷰·사용자수·크리에이터 추천·후기를 조작하거나 독립적인 증거처럼 위장하지 않는다.
6. **거절하거나 떠날 수 있나?** 가입·알림·마케팅·향후 유료상품이 가짜 긴급성이나 숨은 불이익에 의존하지 않는다.

단, 투명성을 강화한다고 내부 보안 구조·비공개 사고정보·관리자 개인정보·개인 사용자 상태·공격자가 악용할 운영 세부정보를 공개해서는 안 된다.

## 3. 공개 신뢰 증거 스택

모든 층을 첫 화면에 다 보여줄 필요는 없지만, 신규 방문자가 Moneyverse를 가짜 투자페이지·보상농장·익명 포털과 구분할 만큼의 근거를 만나야 한다.

### A — 카테고리·정체성 명확성
- 일관된 Moneyverse 이름·도메인·브랜드 표현;
- 제품이 무엇인지 평문 설명;
- 금융처럼 보이는 기능 바로 옆의 game-only/simulated 고지;
- 은행·증권사·예금상품·투자자문·현금도박 서비스처럼 암시하지 않기.

### B — 운영 연속성
- 실제 공개할 내용이 있을 때 검토된 공지/변경이력;
- `정상`, `저하`, `확인 중`, `검증 기록 없음`을 구분하는 정직한 상태;
- 중요한 정책·제품 문서의 날짜;
- 근거가 없을 때 가짜 `live`, `trending`, `active now`, uptime을 만들지 않기.

### C — 개인정보·안전 명확성
- 전체 정책으로 이어지는 짧은 평문 개인정보 요약;
- 개인 경제·계정·보안 상태는 공개 콘텐츠가 아니라는 설명;
- 잔액·거래·부채·카지노 이력이 광고 타기팅 입력값처럼 오인되지 않도록 광고 경계를 설명;
- 가능하면 social 참여 전에 신고·차단·커뮤니티 규칙을 이해할 수 있게 하기.

### D — 콘텐츠 출처/provenance
금융처럼 보이거나 교육적 성격이 있는 페이지에서는 필요한 경우 다음이 이해되어야 한다.
- 누가 작성 또는 검토했는지;
- 언제 마지막으로 중요한 검토를 했는지;
- 게임 규칙·제품 안내·편집 해설·커뮤니티 의견 중 무엇인지;
- 외부 사실 인용의 출처;
- 사용자가 합리적으로 기대할 상황에서는 AI/자동화가 실질적으로 사용됐는지.

근거 없는 `검증된 금융 전문가` 같은 가짜 권위표현이나 가짜 전문가를 만들지 않는다.

### E — 진짜 사회적 증거
사용자수·후기·리뷰·활동·크리에이터 추천·커뮤니티 결과는 실제일 때만 충분한 맥락과 함께 표시한다.

금지:
- 가짜 접속자수;
- 가짜 후기/댓글;
- 가짜 `방금 누군가 획득` 메시지;
- 가짜 희소성/인기;
- 상업적 신뢰를 만들기 위한 bot follower/view;
- 회사가 통제하는 콘텐츠를 독립리뷰처럼 보이게 하는 방식.

공개 social proof가 아직 충분하지 않다면 제품 증거를 쓴다. 예: 실제 archive, 규칙 설명, 컬렉션/프로젝트 예시, 검토된 공지, 정직한 quiet state.

## 4. 첫 30초: 약속 + 믿을 이유 하나

브랜드 약속만 보여주지 않는다.

권장 첫 방문 정보순서:
1. Moneyverse가 무엇인지;
2. 무엇을 만들고·수집하고·따라갈 수 있는지;
3. 투명성/지속성을 믿을 이유 하나;
4. 공개 가능한 샘플 하나;
5. 필요한 곳의 game-only 경계;
6. 다음 행동 하나.

`믿을 이유`는 사실로 검증 가능해야 한다.
- 실제 검토된 시즌/프로젝트 archive;
- 날짜가 있는 공개 변경기록;
- 실제 규칙 설명;
- uptime을 꾸며내지 않는 `아직 검증 기록 없음` 상태;
- 행동이 지속 기록으로 남는 public-safe 예시.

사용자수·수익·uptime·보상·성장률을 크게 주장하려면 출처와 측정 정의가 있어야 한다.

## 5. 첫 3분과 가입

가능하면 **자격증명 제출보다 증거를 먼저** 경험하게 한다.

예시:
`약속 → 실제 샘플 → 출처/맥락 → authored interest → 보존/개인화가 필요할 때 가입`

가상기업 이벤트를 읽는 사람은 가입 전에 기업과 시장이 simulated임을 이해해야 한다. 직업경로 preview에서는 무엇이 남는지 보여준다. 커뮤니티 artifact에서는 어떤 범위가 공개이고 무엇부터 계정이 필요한지 알 수 있어야 한다.

신뢰를 깨는 가입문구 금지:
- `지금 인증하지 않으면 WLD를 잃습니다`;
- `수익이 기다리고 있습니다`;
- `포트폴리오가 위험합니다`;
- 가짜 countdown;
- 거짓 limited access;
- 가짜 보안 경고.

인증·동의는 기존 보안 경계다. 가입전환을 높인다는 이유로 account linking, session, CSRF, RBAC, ledger, privacy 경계를 약화시키지 않는다.

## 6. D1/D3/D7/D14/D30 신뢰 사다리

### D1 — 기억과 일관성을 증명
사용자가 선택한 exact thread로 돌아간다. 유입문구와 game-only 경계가 로그인 후 갑자기 달라지면 안 된다.

### D3 — 기록이 실제임을 증명
실제 변화·결과·변화 없음·저장된 기록 중 하나를 보여준다. 세계가 활발해 보이게 하려고 활동을 만들지 않는다.

### D7 — 운영 신뢰성을 증명
사용자는 제품이력·규칙·정확한 상태/변경·예측 가능한 개인정보 경계를 일관되게 경험해야 한다. 신뢰는 badge 한 번이 아니라 반복되는 일관성에서 나온다.

### D14 — 사용자 통제 증명
미루기·숨기기·떠나기·선호 변경이 가능하고 원하지 않는 social/marketing 압박을 피할 수 있어야 하며 정상 진행을 잃지 않는다.

### D30 — 신뢰를 지속 관계로 전환
사용자에게 적어도 하나의 지속 기록/artifact가 남고 서비스가 어떻게 운영되는지 납득 가능한 이해가 생겨야 한다. 공유는 선택이며 unlock 조건이 아니다.

## 7. Acquisition·SEO

최대 트래픽보다 신뢰할 수 있는 적합한 intent를 우선한다.

### SEO
다음처럼 작성자/출처가 필요한 곳에서 명확하고 독립 가치가 있는 페이지를 우선한다.
- simulated economy 초보자 가이드;
- 명확한 fiction/game 맥락이 있는 가상기업/세계 profile;
- 직업/컬렉션 가이드;
- 시즌/이벤트 archive;
- 용어집·교육 simulation 설명;
- 검토된 community/project retrospective.

익명의 얇은 금융 페이지, 가짜 비교/리뷰, 자동생성 후기, 독립 투자분석처럼 보이게 만든 페이지를 대량생성하지 않는다.

Google의 현재 people-first guidance는 E-E-A-T 요소 중 trust가 가장 중요하다고 설명하고 필요한 경우 `Who`, `How`, `Why`를 명확하게 하라고 권고한다. 특히 재정 안정성·안전에 영향을 줄 수 있는 주제에서 더 강한 신뢰 신호를 요구하므로 Moneyverse도 금융처럼 보이는 콘텐츠의 작성·출처·simulated framing을 보수적으로 다룬다.

Naver Search Advisor도 공신력 있고 유용한 정보 접근과 스팸/낮은 사용자 피드백 문서 억제를 강조한다. 따라서 대량 finance-intent 페이지보다 적은 수의 신뢰 가능한 유지 콘텐츠가 우선이다.

### Paid/creator acquisition
- creator/sponsor의 이해관계를 공개한다.
- 긍정적인 감정/평가를 조건으로 보상하지 않는다.
- creator 인기 자체를 WLD/WDX의 실제 가치 증거처럼 쓰지 않는다.
- clicks/raw signups보다 `trust-qualified activation → D7/D30`을 측정한다.

## 8. Social/Viral 신뢰 루프

권장 루프:

`실제 결과 → public-safe artifact → 출처/맥락 → 비회원이 이해 → 선택적 sample → authored interest → 의미 활성화 → D7`

공유물은 다음을 이해할 수 있어야 한다.
- 무엇을 의미하는지;
- 숫자가 simulated/game-only인지;
- user-created/system-generated/sponsored 중 무엇인지;
- 어떤 개인정보를 의도적으로 제외했는지.

잔액·정확한 holdings·부채·카지노 이력·private club membership·moderation/security state·이메일·내부 ID·session·recovery 정보를 공개하지 않는다.

## 9. 수익화 신뢰 계약

신뢰를 만드는 공간을 수익화가 차지하지 않는다.

초기 보호구간:
`약속 → 증거 → 샘플 → 다음 행동 이해`

이 구간에는 interruptive monetization을 피한다. 반복가치 이후 가능한 모델은 기존과 같다.
- 승인된 공개 콘텐츠의 명확한 광고;
- 광고제거 구독;
- non-P2W profile/space/exhibit/season cosmetic;
- 관계가 표시된 sponsor/creator collaboration;
- WLD/WDX를 실제 금융가치로 재정의하지 않는 B2B2C.

향후 구독은 중요조건의 명확한 고지, 명시적 informed consent, 간단한 취소를 요구한다. FTC의 2026년 구독 집행 사례도 이 기존 guardrail을 강화한다.

## 10. KPI 추가

기존 지표에 아래를 추가한다.

### 신뢰 이해
- 첫 방문 `Moneyverse가 무엇인가` 이해도;
- game-only 경계 이해도;
- scam/실제금융 오인율;
- 개인정보 공개범위 이해도;
- public proof interaction rate;
- 출처를 표시한 콘텐츠의 provenance 인지.

### 전환 품질
- proof view → authored-interest;
- proof view → contextual signup;
- proof 노출 후 signup → meaningful activation;
- time-to-first-trusted-value;
- D1 promise/proof consistency;
- proof 노출별 D7 retained users;
- acquisition proof source별 D30 durable relationship/history.

### 신뢰 guardrail
- phishing/ATO signal rate;
- fake-signup/referral-fraud;
- spam/report;
- privacy complaint;
- misleading-finance complaint;
- ad-induced churn;
- suspicious reward duplication;
- fake/incentivized review/social-proof incident;
- `진짜 서비스인가/사기인가` 혼동을 나타내는 support 문의.

trust badge click, 정책페이지 조회수, 정책페이지 체류시간은 primary success metric이 아니다.

## 11. 실험 backlog

### A — promise only vs promise + 검증 가능한 증거 하나
가설: 사실 기반 reason-to-believe 하나가 첫 화면 복잡도를 크게 늘리지 않으면서 meaningful activation과 D7을 개선한다.
대상: 신규 비회원.
Control: promise + CTA.
Treatment: promise + proof 하나 + sample + CTA.
Primary: meaningful activation, D7.
Guardrail: TTFV, bounce, 오인, privacy/security complaint.
관찰: 최소 D7 mature cohort, 표준화 전 D30.

### B — 일반 가이드 vs provenance-aware 금융유사 가이드
가설: game-rule 맥락·검토일·출처를 표시하면 적합한 engagement를 유지하면서 real-finance 오인을 줄인다.
Primary: comprehension + meaningful activation.
Guardrail: bounce, 가짜권위 인식, SEO quality.

### C — 정직한 quiet state vs 진짜 사회적 증거
Control: honest empty/quiet state.
Treatment 후보: 실제 검증 가능한 활동 증거가 있을 때만 표시.
규칙: fake proof는 실험군이 아니며 금지.
Primary: real proof가 존재할 때 D7 retained activation.
Guardrail: spam, bot activity, privacy complaint, fake-review/social-proof incident.

### D — 짧은 privacy/safety proof vs policy link only
가설: 가입 전 사실 기반 요약이 동의피로를 만들지 않으면서 신뢰를 높인다.
Primary: contextual signup → activation.
Guardrail: policy misunderstanding, consent error, TTFV.

### E — proof 이전 sponsor vs proof 이후 sponsor
가설: 제품/신뢰 이해 이후로 sponsor prominence를 미루면 초기 impression은 줄어도 D30 retained contribution이 좋아진다.
Primary: D30 retained contribution.
Guardrail: ad-induced churn, accidental click, eligible-user revenue.

## 12. 보안·악용·개인정보 검토

### HIGH — 가짜 trust/security 알림을 통한 phishing·ATO
시나리오: `verified Moneyverse`, `계정보안 확인`, `상태 장애`, `WLD 보호`, `portfolio 인증`을 사칭해 자격증명을 탈취.
사용자 영향: 계정탈취·사기·신뢰훼손.
최소 보호조건: canonical domain/brand 일관성, growth/status 메시지에서 password·OAuth code·recovery code 요구 금지, URL에 secret/session/recovery 정보 금지.
별도 개발/QA: 새 email/push/deep-link trust campaign 전 필요.

### HIGH — 가짜 리뷰/social proof/creator 신뢰도
시나리오: bot·직원·유료리뷰·합성 persona가 리뷰·접속자수·view·추천을 부풀림.
영향: 기만적 유입, 규제/신뢰 위험, bot incentive loop.
최소 보호조건: 가짜 count/review 금지, material connection 공개, 긍정감정 조건 보상 금지, system/community/sponsored 콘텐츠 구분.
별도 QA: public review/testimonial/rating 또는 creator reward 확대 전 필요.

### HIGH — transparency를 통한 민감 운영/보안정보 누출
시나리오: 지나치게 상세한 status/incident/changelog가 내부 topology, 관리자 신원, 취약점, 개인정보, 방어세부를 공개.
영향: 표적공격·privacy loss·운영피해.
최소 보호조건: public-safe disclosure scope, 민감정보 집계/마스킹, 기존 incident/security 접근통제 유지.
별도 security review: 새 공개 incident/security transparency surface 전 필요.

### HIGH — 금융 안전성으로 오인되는 신뢰표현
시나리오: `audited`, `safe`, `verified`, `stable`, `guaranteed`가 금융 안정성/수익보장으로 오인됨.
영향: 실제금융 오인·위험한 의사결정·법적 위험.
최소 보호조건: trust claim은 서비스/절차를 정확히 설명, 원금·수익률·투자안전 암시 금지, finance-like 콘텐츠 옆 game-only 언어 유지.
별도 legal/product review: finance-adjacent paid/creator campaign 전 필요.

### MEDIUM — trust analytics 과수집
시나리오: `신뢰 측정`을 이유로 policy/status 행동을 private economy/social/security history와 결합.
최소 보호조건: data minimization, purpose limitation, retention limits, 민감상태 unrestricted export 금지, 필요한 consent/legal basis 적용.

## 13. 법규·정책 메모

- WLD/WDX와 모든 finance-like 기능은 virtual/simulated/game-only다.
- FTC Consumer Reviews and Testimonials Rule은 2024-10-21 시행됐으며 fake/false review, sentiment-conditioned incentive, undisclosed insider review, fake social-media influence 등의 관행을 제한한다. 2025년 경고조치는 현재도 집행관심이 이어지고 있음을 보여준다.
- creator/sponsor material connection은 명확히 공개하고 endorsement는 truthful/non-misleading이어야 한다.
- FTC 2026 구독 집행은 향후 유료상품에서 중요조건 고지·informed consent·쉬운 취소를 계속 요구하는 guardrail이다.
- youth/community 확대 시 age-appropriate safety/privacy review를 유지한다. Discord와 Roblox의 2026 안전 업데이트는 숨은 friction보다 목적과 보호효과를 이해할 수 있게 설명하는 투명성을 강조한다.
- 한국·미국 개인정보·광고·구독·소비자보호 검토는 영향받는 campaign의 release-time gate로 유지한다.

## 14. 리서치 노트 — 2026-09-14

### 직접 채택
- Google Search Central 현재 `Creating helpful, reliable, people-first content`: trust가 E-E-A-T의 가장 중요한 요소이며 필요한 경우 `Who`, `How`, `Why`를 명확하게 한다. 재정 안정성·안전에 영향을 줄 수 있는 주제에서는 특히 보수적으로 적용.
- Discord Transparency Hub 현재 2026: 정책집행·데이터요청·안전활동에 대한 transparency report를 플랫폼 신뢰의 일부로 운영.
- Discord 2026-02-09(2026-02-24 업데이트) Teen Default Experience: 사용자 피드백 후 age assurance 전면확대를 늦추고 검증옵션·vendor transparency·상세 기술문서를 늘리는 방향. 특정 구현이 아니라 안전 목적/투명성 원칙만 채택.
- Roblox 2026-01-07 age checks for chat: age check의 이점을 사용자에게 설명하는 것이 adoption에 중요하다고 명시. 설명가능한 보호와 layered safety 원칙만 채택.
- FTC 2025-12 Consumer Review Rule 관련 10개사 경고: fake/false review, 감정조건 incentive, 미공개 관계, fake influence indicator가 현재도 집행위험.
- Naver Search Advisor 현재 2026: 공신력/유용한 정보 접근과 spam/낮은 사용자피드백 콘텐츠 억제.

### 참고/guardrail
- FTC 2026-05 Shutterstock, 2026-06 Genesis Tech: 중요 구독조건·informed consent·쉬운 취소 유지.
- 개인정보보호위원회 2026-07-22 G7 개인정보 감독기관 논의: 아동·청소년 온라인 개인정보를 community/targeting/profiling 확대 시 활성 검토영역으로 취급.

## 15. Runtime Product Reality Audit — 2026-09-14

검증: **공개 웹 surface에서 가능**.

강점:
- 홈은 WLD와 보상이 game-only라고 반복해서 명확히 표시한다.
- 개인정보처리방침은 데이터항목·목적·보유기간·광고 경계를 비교적 구체적으로 공개한다.
- 상태페이지는 `추측하지 않는다`는 원칙과 미검증 상태를 구분한다.

신뢰 공백:
- 상태페이지는 현재 확인된 기록이 없고 3개 서비스 항목이 모두 `확인 중`이다.
- 운영소식에는 게시된 공지가 없는데 sponsored advertisement placement가 있다.
- 시작 가이드는 복리예금·국채·대출·배당·시세차익·패시브소득·`대표 자본가` progression을 강하게 설명해 최신 persistent-world/game-only 포지셔닝과 경쟁한다.
- finance-like 교육/제품 콘텐츠의 공개 provenance pattern은 아직 일관되게 확인되지 않는다.

따라서 trust-proof conversion은 현재 제품이 이미 해결했다는 주장이 아니라 검증이 필요한 성장 가설이다.

## 16. 다음 성장 우선순위

다음 단일 경로를 먼저 검증한다.

`명확한 약속 → 검증 가능한 믿을 이유 하나 → public-safe 샘플 하나 → authored interest → contextual signup → 의미 행동 → D1 일관성 → D7 획득된 신뢰 → D30 지속 관계`

이 경로가 D7/D30을 개선하고 phishing·privacy·youth-safety·misleading-finance guardrail을 악화시키지 않는다는 근거가 생기기 전에는 fake social proof, broad finance acquisition, 근거 없는 trust badge, sponsor-first landing, raw-signup reward, 금융안전처럼 들리는 신뢰표현, 안전한 공개경계를 넘는 운영 세부 공개를 확대하지 않는다.
