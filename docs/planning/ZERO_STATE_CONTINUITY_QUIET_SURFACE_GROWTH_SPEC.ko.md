# 월덕 머니버스 — Zero-State 연속성·조용한 화면 성장 명세

> 버전: v2026.09.14.75
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md`, `FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md](ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임, DB, API, 인증, migration, 인프라, scheduler, 보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse는 첫 가치, 리텐션 사다리, 사용자 직접 priority, World Pulse, 컬렉션, creator/community 유입, 첫 사회적 연결, 리텐션 안전 수익화까지 이미 상세한 기획을 갖고 있다. 이번에 남은 가장 큰 activation/retention 공백은 더 좁고 실제 Production에서도 보인다. **화면이 정상적으로 비어 있거나, 조용하거나, 현재 사용자에게 해당 콘텐츠가 없거나, 첫 기여를 기다리는 순간에 그 상태를 설명하는 수준을 넘어 하나의 유용한 다음 행동으로 연결하는 소비자 성장 계약이 아직 통합되어 있지 않다.**

현재 Production 예시:
- 홈 Monthly Notes가 검토된 공개 소식을 준비 중이라고 안내한다.
- 운영 소식 페이지에는 공개된 공지가 없지만 광고가 표시된다.
- 커뮤니티 로비는 대화가 없을 때 먼저 인사해 보라고 안내한다.
- 시작 가이드는 신규 사용자의 WLD 잔액 0과 비어 있는 원장 기록이 정상이라고 설명한다.

프론트엔드의 공통 `EmptyState` 컴포넌트는 이미 “아직 데이터가 없음”과 “서비스가 도달 불가함”을 다른 사실로 취급한다. 이번 명세는 그 정직한 구분을 유지한 채 소비자 경험을 정의한다.

좁은 성장 루프:

`zero/quiet state → 왜 비어 있는지 이해 → 무엇이 안전하게 남아 있는지 확인 → 유용한 대체 행동 하나 → 의미 있는 상태 하나 생성/저장/팔로우 → D1 인식 → D7 연속성 → 이후 실제 콘텐츠가 zero state를 대체`

소비자 약속:

**“아직 아무것도 없다는 말은 할 게 없다는 뜻이 아니다. Moneyverse는 지금 상태가 무엇인지 설명하고, 정직한 다음 행동 하나를 보여준다.”**

이 문서는 error-state 구현, loading component 계약, API fallback 구조, cache 정책, backend availability 설계가 아니다.

## 2. 서로 다른 상태를 하나로 합치지 않는다

소비자 문구와 성장 로직은 최소 다음 5가지를 구분해야 한다.

1. **진짜 zero state** — 신규 사용자라서 거래기록, 컬렉션 챕터 등이 실제로 없음.
2. **조용한 커뮤니티 상태** — 커뮤니티는 정상이나 현재 관련 대화·활동이 없음.
3. **콘텐츠 미게시 상태** — 공개 화면은 있으나 검토 완료된 게시물이 아직 없음.
4. **필터 결과 없음** — 콘텐츠는 있을 수 있으나 현재 필터/priority와 일치하는 항목이 없음.
5. **실패/접근불가 상태** — 데이터 로딩, 인증, 권한, 서비스 상태 때문에 정상 내용을 가져오지 못함.

실패를 “아직 아무것도 없어요”로 숨기지 않고, 정상 zero state를 장애처럼 보이게 하지 않는다. 기존 공통 `EmptyState` 구현의 의미 구분을 소비자 문구도 그대로 지켜야 한다.

## 3. 첫 30초와 첫 3분

### 첫 30초
사용자는 zero/quiet state를 보자마자 다음을 이해할 수 있어야 한다.
- 왜 비어 있는가;
- 내 데이터/기록은 안전한가;
- 내가 지금 꼭 해야 할 것이 있는가;
- 가장 좋은 다음 행동 하나는 무엇인가;
- 그 행동은 선택사항인가.

zero-state 화면이 광고만 눈에 띄는 막다른 길이 되어서는 안 된다.

### 첫 3분
맥락에 맞는 bounded continuation 하나만 제공한다.

예시:
- **운영소식 없음:** 가짜 소식을 만들지 말고 evergreen 시작 가이드, 서비스 상태, 시즌/세계 아카이브 중 하나를 보여준다.
- **조용한 로비:** open-ended chat보다 먼저 규칙, 관심사 선택, newcomer-friendly prompt 또는 공개 프로젝트 하나를 보여준다.
- **빈 지갑/원장:** 신규라면 정상이라고 설명하고 은행·카지노 압박이 아니라 검증 가능한 starter activity 하나로 이동시킨다.
- **컬렉션 기록 없음:** 빈 inventory grid 대신 starter theme 또는 sample artifact 하나를 보여준다.
- **priority와 맞는 World Pulse 없음:** 관련 변화가 없었다고 정직하게 말하고 저장한 priority나 evergreen continuation으로 돌아간다.
- **검색/필터 결과 없음:** 필터 초기화나 인접 카테고리를 제안하고 결과를 조작해 만들지 않는다.

사용자는 아무 불이익 없이 나갈 수 있어야 한다.

## 4. Zero-State Continuity Card 원칙

중요한 zero/quiet surface는 개념적으로 네 질문에 답해야 한다. 이는 구현 컴포넌트 요구사항이 아니라 UX·콘텐츠 계약이다.

1. **State:** 지금 사실은 무엇인가?
2. **Reason:** 왜 비어 있거나 조용한가?
3. **Continuity:** 무엇이 안전하게 저장되어 있거나 계속 사용할 수 있는가?
4. **Next:** 지금 할 수 있는 유용한 다음 행동 하나는 무엇인가?

예시:
- “검토가 끝난 운영 공지는 아직 없습니다. 계정과 게임 진행에는 영향이 없습니다. 현재 서비스 상태를 보거나 시작 가이드를 확인해 보세요.”
- “아직 로비에 대화가 없습니다. 이곳 메시지는 일시적입니다. 커뮤니티 규칙을 먼저 보거나 newcomer prompt 하나를 골라볼 수 있습니다.”
- “아직 컬렉션 챕터가 없습니다. starter theme 하나를 골라 첫 챕터를 저장해 보세요.”

긴급성 표현, 가짜 활동, 가짜 숫자, 가짜 희소성, “다른 사람은 이미 다 하고 있다”식 압박을 쓰지 않는다.

## 5. 생애주기별 동작

### D0 — 빈 상태를 첫 authored state로 전환
신규 사용자가 first saved interest, starter collection theme, profession direction, learning thread, safe social contribution 같은 작은 개인 연속성을 하나 만들게 한다.

성공은 empty state를 클릭했다는 것이 아니라 **다음에 다시 왔을 때 남아 있을 의미 있는 상태가 생겼는가**이다.

### D1 — 기억을 증명
generic zero state 대신 사용자가 처음 만든 authored state를 정확히 보여준다. 외부에 새 변화가 없어도 그렇다고 정직하게 말하고 사용자의 저장 스레드로 돌아간다.

### D3 — filler 없이 진행
관련 변화가 실제로 있으면 보여주고, 없다면 같은 priority를 더 깊게 하는 evergreen step 하나를 준다. session count를 늘리기 위해 “새 소식” 카드를 만들어내지 않는다.

### D7 — zero state 자체를 줄이는 게 아니라 연속성을 만든다
D7까지 활성 사용자는 collection chapter, profession/project path, learning history, season/world follow, useful watchlist, shared project context 중 최소 하나의 durable thread를 가져야 한다.

### D14/D30 — 빈 화면이 아니라 개인 역사로 전환
모든 화면을 피드로 채우는 것이 목표가 아니다. 핵심 화면에 개인에게 의미 있는 history, active goal, archive가 있어야 한다. 공개 소식 화면이 조용해도 개인 연속성이 강하면 된다.

### Comeback
휴면 사용자는 다음 순서로 복귀한다.

`무엇이 남아 있는가 → 실제로 무엇이 바뀌었는가 → 무엇은 무시해도 되는가 → 지금 안전하게 할 행동 하나`

실제 변화가 없으면 가짜 “부재 중 변화” 피드를 만들지 않는다.

## 6. 조용한 커뮤니티 설계

현재 활동이 없는 커뮤니티가 social pressure나 fake proof를 만들면 안 된다.

권장 fallback 순서:
1. 커뮤니티 목적/규칙;
2. newcomer-friendly 공개 artifact/prompt 하나;
3. 비금전 bounded contribution 하나;
4. 관련 thread 저장/팔로우;
5. 맥락을 이해한 뒤 open-ended posting.

실제 사람이 아닌 fake online count, fake trending, 운영자가 만든 가짜 댓글·반응을 실제 사용자 활동처럼 표시하지 않는다.

조용한 상태 자체는 문제보다 정직한 상태다. 성장 목표는 진짜로 다시 올 가치가 있는 스레드 하나를 시작하는 것이다.

## 7. 콘텐츠·에디토리얼 zero state

공지, 시즌 업데이트, World news, editorial content가 비어 있을 때:
- 화면을 활발해 보이게 만들기 위한 filler 게시물을 만들지 않는다;
- SEO를 위한 얇은 event page를 대량 생성하지 않는다;
- 독립적으로 가치가 있는 evergreen alternative 하나를 제공한다;
- 필요하면 마지막 검증 업데이트 날짜를 표시한다;
- “업데이트 없음”과 “서비스 장애”를 구분한다.

Google의 현재 people-first 가이드는 검색트래픽 목적 페이지보다 독창적이고 충분하며 유용한 콘텐츠를 우선한다. Naver Search Advisor도 사용자에게 도움이 되는 방향의 SEO와 정확하고 고유한 제목·설명, 실질적 콘텐츠 가치를 강조한다. 따라서 얇은 freshness 페이지 다수보다 조용하지만 가치 있는 archive가 낫다.

## 8. SEO 경계

### 색인 후보
- 충분한 evergreen 시작 가이드;
- 독창적인 world/season archive;
- 설명 가치가 있는 가상기업 lore;
- 학습 가이드·용어집;
- editorial project/community retrospective.

### 기본 noindex/unlisted 후보
- 사용자별 zero state;
- empty search/filter result;
- private dashboard/portfolio/balance/debt/casino state;
- referral/invite 전용 zero state;
- 비어 있는 personalized feed;
- security/recovery/report/moderation state;
- 독립적 가치 없는 얇은 coming-soon page.

Google은 `noindex`를 page-level 색인 제외 방식으로 문서화하고 있고, confidential/private content는 robots.txt가 아니라 접근통제가 필요하다고 안내한다. 기존 Moneyverse의 private/account/admin 색인 경계를 유지한다.

`empty category × season × company × keyword` 식 doorway 조합을 만들지 않는다.

## 9. 수익화 경계

zero/quiet state를 **남는 광고 inventory**로 보지 않는다.

현재 Production의 운영 소식 페이지는 공개 공지가 없는데도 sponsored advertisement가 존재한다. 이것만으로 정책 위반이라고 단정하지는 않지만 소비자 가치와 publisher policy 리스크가 있다. 실질 콘텐츠보다 수익화가 더 두드러져 보일 수 있기 때문이다.

Google AdSense 가이드는 paid promotion이 publisher content를 압도하지 않아야 하고, deceptive placement와 사용자에게 navigation/content로 혼동되는 광고를 금지하며, little/no-value page와 과도한 광고를 문제로 다룬다.

따라서:
- zero-state 설명과 유일한 유용한 next action 사이에 interruptive ad를 넣지 않는다;
- 비어 있는 화면에서 광고가 가장 두드러진 핵심 콘텐츠가 되지 않게 한다;
- 광고를 “추천 다음 행동”처럼 표시하지 않는다;
- 일반 광고 view/click에 WLD/WDX를 지급하지 않는다;
- subscription/cosmetic promotion은 반복 가치 경험 이후에만 고려한다;
- 광고제거 구독은 명확한 조건, informed consent, 쉬운 취소를 유지한다.

수익화 성공지표는 empty-page impression 매출이 아니라 **retention-adjusted contribution**이다.

## 10. 바이럴·유입 영향

빈 개인상태를 acquisition artifact로 공유하지 않는다. completed collection chapter, project result, season reflection, learning replay, public world artifact처럼 맥락과 자부심이 있는 결과물을 공유한다.

수신자가 조용하거나 비어 있는 공개 화면에 도착했다면:

`맥락 이해 → 유용한 evergreen sample → 관심 하나 선택 → 필요할 때 contextual signup → 첫 의미 행동`

콘텐츠 부족을 referral code, fake counter, giveaway pressure로 보상하지 않는다.

## 11. 실험 backlog

### A — action-oriented zero state vs 설명-only zero state
가설: 상태 설명 + contextual next action 하나가 혼란을 늘리지 않으면서 meaningful activation을 높인다.
대상: legitimate zero state를 보는 신규/방문 사용자.
Control: 상태 설명만 제공.
Treatment: State → Reason → Continuity → Next 하나.
Primary: zero-state→meaningful-action, time-to-first-value.
Guardrail: back/exit frustration, support contact, 고위험 행동으로의 오진입.
최소 관찰: D7 성숙 cohort, 넓은 lifecycle 확대는 D30 확인.
다음 행동: 클릭률이 아니라 downstream retention 개선 시에만 확대.

### B — 정직한 quiet state vs synthetic/filler freshness
가설: “실질 변화 없음”을 정직하게 말하는 편이 저가치 filler보다 신뢰와 D7에 낫다.
Primary: D7 continuation, 만족/신뢰 신호.
Guardrail: bounce, unsubscribe/mute, complaint.

### C — evergreen alternative vs ad-first empty page
가설: 수익화보다 유용한 alternative를 먼저 제공하면 retained-user contribution이 높아진다.
Primary: meaningful action, D7, retention-adjusted contribution.
Guardrail: ad-induced churn, accidental click, policy complaint.

### D — contextual newcomer prompt vs generic “인사하기”
가설: 관심사에 맞춘 bounded prompt 하나가 open-ended greeting보다 유용한 첫 social contribution을 만든다.
Primary: first useful social contribution, D7 shared-thread continuation.
Guardrail: spam, harassment, report/block, privacy complaint.

### E — empty personalized feed noindex vs indexable thin state
가설: personalized/thin zero state를 검색에서 제외하면 organic quality를 보호하면서 qualified acquisition은 유지된다.
Primary: substantive page organic signup→activation→D7.
Guardrail: indexed thin-page count, search complaint, private exposure.

## 12. KPI

Activation:
- surface/cohort별 zero-state encounter rate;
- zero-state comprehension;
- zero-state→meaningful-action rate;
- zero state 이후 time-to-first-value;
- first authored state creation;
- first-session completion.

Retention:
- D1 authored-state 복귀;
- D3 same-thread progress;
- D7 durable-thread rate;
- D14/D30 meaningful-history coverage;
- quiet-state→comeback continuation;
- WAU/MAU, returning-user share, sessions/user, meaningful actions/session.

SEO/Acquisition:
- substantive content qualified organic visit;
- organic visit→sample→signup→activation→D7/D30;
- thin/empty indexed page count;
- recipient/share landing→meaningful action.

Monetization:
- empty page가 아닌 eligible user당 impressions;
- ad-induced exit/churn;
- accidental click signal;
- ARPU/ARPDAU와 subscription conversion을 D7/D30과 함께 평가;
- retention-adjusted contribution, LTV/CAC.

Trust/Security:
- fake-signup/referral-fraud;
- ATO/phishing signal;
- spam/report/block;
- privacy complaint;
- suspicious reward duplication;
- 측정 가능하면 error-vs-empty misclassification report.

## 13. 보안·악용·개인정보 검토

### HIGH — 장애가 empty state로 보이는 위험
영향: 특히 wallet/portfolio/history에서 사용자가 실제 데이터가 없어졌다고 오해할 수 있다.
시나리오: 인증/API 실패가 “아직 거래가 없습니다”로 렌더링되어 자산/기록 소실처럼 보임.
최소 보호조건: 기존 zero와 unavailable/error의 의미 경계를 유지한다. 고위험 account/economy surface는 실패를 조용히 empty로 downgrade하지 않는다.
별도 개발/QA: **필요**. 실제 runtime fallback을 수정할 경우 별도 수행. 이번 회차는 코드 수정 없음.

### HIGH — “도움되는 추천”을 통한 private-state 노출
영향: WLD/WDX 보유, 부채, 카지노 활동, private club/social graph, moderation/security/recovery state 노출.
시나리오: 공개/공유 화면이 “여기엔 아무것도 없습니다. 부채 상환/숨은 클럽/보안 복구를 계속하세요” 식으로 개인상태를 드러냄.
최소 보호조건: public-safe allowlist, 개인화 기본 비공개, URL/metadata/analytics/share payload에 secret/session/recovery identifier 금지.
별도 개발/QA: **필요**. personalized public zero-state recommendation 도입 전.

### HIGH — empty-state recovery 사칭 피싱/ATO
영향: credential/session 탈취.
시나리오: “지갑이 비었습니다—계정 복원”, “시즌 보상 없음—여기서 받기” 링크로 위장 로그인 유도.
최소 보호조건: canonical domain/brand 일관성, growth message에서 password/OAuth/recovery code 요구 금지, 자산손실 긴급성 금지, 인증 전에 safe landing.
별도 개발/QA: **필요**. external deep-link comeback/recovery campaign 전.

### HIGH — quiet state를 지우기 위한 bot/fake activity
영향: 가짜 social proof, referral fraud, spam, economy abuse.
시나리오: 가짜계정이 post/reaction을 생성해 활발해 보이게 하고 보상/추천 자격을 획득.
최소 보호조건: raw post/reaction/view에 의미 있는 WLD/WDX 지급 금지, suspicious activity를 social proof에 포함하지 않음, 경제보상 전 fraud 검토 유지.
별도 개발/QA: **필요**. community/referral 경제보상 도입 전.

### MEDIUM — analytics 과수집
최소 보호조건: zero state와 downstream action만 필요한 범위로 측정하고 private economy/security/social data를 광고벤더로 넘기지 않는다.

### MEDIUM — 저가치 UGC/SEO spam
최소 보호조건: low-trust thin UGC는 필요 시 noindex/unlisted, 신고/삭제, URL이 있다는 이유만으로 자동 색인하지 않는다.

## 14. 최신 외부 리서치 노트 — 2026-09-14

### 직접 채택
- **Threads, 2026-06-16 — Communities와 Your Algo.** 커뮤니티 progress와 사용자가 직접 조절하는 topic preference를 제공한다. 채택: 조용한 화면에서 가짜 활동 대신 사용자가 통제할 interest/progress path를 제공. 출처: https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
- **Discord Community Onboarding, 현재 공식 가이드.** newcomer에게 유용한 기본 채널과 직접 선택하는 역할/채널을 우선하고, 복잡한 verification barrier 대신 raid protection을 함께 사용한다. 채택: quiet social state에서 하나의 bounded relevant continuation 제공. 출처: https://discord.com/blog/community-onboarding-welcome-your-new-members , https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- **Google Search people-first 공식 가이드, 현재.** 채택: editorial zero state를 채우려고 thin freshness page를 만들지 않음. 출처: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **Naver Search Advisor, 현재.** 채택: 사용자에게 도움되는 콘텐츠, 정확하고 고유한 제목/설명, 관련 없는 인기키워드 삽입 금지. 출처: https://searchadvisor.naver.com/guide/seo-help , https://searchadvisor.naver.com/guide/content-basic
- **Google AdSense 정책/도움말, 현재.** 채택: 광고가 publisher content를 압도하거나 navigation/content로 오인되는 배치를 피하고 일반 광고 interaction을 보상하지 않음. 출처: https://support.google.com/adsense/answer/2660562

### 법규/정책 참고
- **FTC Shutterstock 합의, 2026년 5월.** 향후 광고제거/구독 상품은 중요조건 명확 고지, express informed consent, 쉬운 취소를 유지. 출처: https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 15. Runtime Product Reality Audit — 2026-09-14

검증 상태: **가능**.

Production 공개 화면에서 확인한 내용:
- 홈은 WLD/보상이 game-only 가상 데이터임을 명확히 표시한다.
- 홈에는 장문의 제품약속보다 앞서 지갑, 게임, 거래소, 상점, 퀘스트, 로비 shortcut이 보인다.
- Monthly Notes는 공개 운영소식을 준비 중이라고 표시한다.
- 커뮤니티 로비는 대화가 없을 때 “아직 오간 이야기가 없어요. 먼저 인사해 보세요.”라는 zero state를 표시한다.
- 운영 소식 페이지는 공개된 공지가 없는데 `SPONSORED ADVERTISEMENT`가 표시된다.
- 시작 가이드는 신규 지갑 잔액 0과 비어 있는 원장이 정상이라고 설명한 뒤 퀘스트/직업, 이후 은행/주식/사업/카지노로 유도한다.

소비자 결론: Moneyverse는 이미 정직한 기본 zero-state 문구와 코드 수준의 empty/unavailable 의미 구분을 갖고 있지만, **공개 화면 전반에서 zero/quiet state를 context-matched retention-producing next action 하나로 전환하는 방식은 아직 일관되지 않다.** 이번 명세는 성장 가설이며 런타임 변경은 하지 않는다.

## 16. 다음 성장 회차 결정

모든 조용한 화면을 콘텐츠로 채우기 전에 하나의 좁은 루프를 검증한다.

`정상 zero state → State/Reason/Continuity → 유용한 다음 행동 하나 → first authored state → D1 recognition → D7 durable thread`

첫 후보는 비회원도 보는 **운영소식/Monthly Notes quiet state**다. 현재 공개 콘텐츠가 없고 sponsored inventory와 경쟁하기 때문에 소비자 가치 개선 효과를 측정하기 좋다.

가짜 운영소식, 가짜 커뮤니티 활동, mass SEO filler, 조기 수익화 압박, WLD/WDX click reward, 새로운 backend fallback 구현으로 대응하지 않는다. 먼저 useful evergreen continuation이 activation과 D7을 개선하는지 검증한다.