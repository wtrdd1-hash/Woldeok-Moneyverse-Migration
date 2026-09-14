# Woldeok Moneyverse — 정체성 안전형 머천다이징·투명 로테이션 성장 명세

> 버전: v2026.09.15.96
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-15
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`, 최근 브랜드/신뢰/유입 성장 명세
> 영문 기준 문서: [IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md](IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용; 런타임, DB, API, 인증, migration, scheduler, 인프라, 보안 코드 변경 없음

## 1. 이번에 선택한 가장 큰 공백

최신 `main`에는 상점 판매 종료 일정의 이벤트 캘린더 노출, 최근 획득 보유 아이템 필터, 자체 웹 로컬 로그인, 코스메틱·편의 소비처가 새로 통합됐다. Production Store 2.0도 대규모 카탈로그를 공개한다.

따라서 이제 가장 큰 성장 공백은 “살 것이 있는가?”가 아니다.

**회전형 코스메틱과 종료일이 정체성·수집·건강한 재방문을 만들면서도 부자 과시, 카지노/수익 명예, 가짜 희소성, 카운트다운 압박으로 변하지 않게 할 수 있는가?**

현재 공개 상점에는 건강한 표현형 아이템이 많지만 `주식 투자왕`, `100만 WLD 클럽`, `카지노 럭키스타`, `머니 메이커`, `골드 마스터`, `가상경제의 거물` 같은 정체성 문구도 존재한다. WLD/WDX가 game-only여도 이런 문구는 부·수익·투기·카지노 결과를 핵심 prestige처럼 보이게 할 수 있다. 최근 Moneyverse 성장 방향은 잔액보다 정체성·숙련·수집·기여·기록·커뮤니티가 더 오래 남아야 한다.

이번 명세는 상점 API, 재고 테이블, 카탈로그 스키마, scheduler, 가격 엔진을 새로 설계하지 않고 소비자 머천다이징 계약에만 집중한다.

## 2. 소비자 약속

**“타이머나 손실 공포 때문에 사는 것이 아니라, 내가 누구인지·무엇을 했는지를 표현하기 위해 쓴다.”**

건강한 머천다이징은 다음에 답해야 한다.
- 희소성 문구가 없어도 왜 갖고 싶은가?
- 어떤 정체성·수집·기억·커뮤니티 이야기를 표현하는가?
- 판매 종료가 있다면 정확히 언제이며 무엇이 끝나는가?
- 놓쳐도 Moneyverse를 계속 즐길 수 있는가?
- 실제 투자·가치상승·부의 우월성·카지노 성취처럼 보이지 않는가?

## 3. 머천다이징 우선순위

### A — 표현 우선
기본 추천 우선순위:
- 프로필 프레임·시각 테마;
- 방/오피스/갤러리 꾸미기;
- 컬렉션 전시 스킨;
- 직업 정체성 코스메틱;
- 시즌 참여 기억;
- 프로젝트/커뮤니티 기여 표식;
- 세계관/lore 테마;
- 경제적 우위를 만들지 않는 레이아웃·편의.

### B — 맥락 있는 성취 prestige
다음처럼 실제 성취를 표현할 수 있다.
- 직업 chapter 완료;
- 컬렉션 큐레이션;
- 커뮤니티 프로젝트 기여;
- 시즌 아카이브 참여;
- 교육형 replay/숙련 milestone;
- abuse 통제가 가능한 범위의 멘토링·건전한 커뮤니티 기여.

### C — 고위험 prestige
기본 aspiration ladder로 확대하지 않는다.
- WLD 자산 규모;
- 수익/P&L 우월성;
- 카지노 승리·연승;
- 손실 버티기/`diamond hands` 정체성;
- 부채·레버리지 사용;
- 소비액 기반 사회적 rank;
- 투자 실력이나 금융 능력을 증명한다는 표현.

현재 런타임의 이런 문구는 이번 문서에서 삭제 지시하지 않는다. 향후 copy/catalog 변경은 별도 제품·법무·QA 절차가 필요하다.

## 4. 투명 로테이션 계약

회전 상품은 다음을 정직하고 안정적으로 설명한다.
1. 지금 판매 중 / 예정 / 판매 종료 상태;
2. 알 수 있을 때 서버 authoritative 종료 날짜·시간;
3. 사용자가 이해하기 쉬운 현지시간 표시와 authoritative 기준 보존;
4. 만료가 구매, 이벤트 획득, 토큰 교환, featured 배치 중 무엇을 끝내는지;
5. 긴박감을 만들기 위한 타이머 숨은 reset 금지;
6. 실제 서버 재고가 없으면 `N개 남음` 같은 가짜 재고 금지;
7. 재판매 가능성이 있다면 `다시는 안 돌아옴` 금지;
8. 적절한 이벤트에서는 획득 종료 뒤 짧은 교환/큐레이션 grace를 검토.

종료일은 정보이지 리텐션 무기가 아니다.

## 5. 첫 방문·Activation

첫 30초에는 상점이 Moneyverse의 첫 설명이 되지 않는다. 지속형 커뮤니티 세계와 game-only 경계를 먼저 이해시킨다.

상점 preview가 필요하면 표현형 아이템 하나와 `왜 존재하는지`만 보여준다.

첫 3분에는 수십 개 가격·한정품 비교를 요구하지 않는다. 어떤 것을 수집할 수 있는지, P2W인지 아닌지, 구매 전 preview가 가능한지, 회전 상품이 다시 올 수 있는지를 이해시키는 정도가 적절하다.

첫 구매는 activation 필수조건이 아니다. activation은 여전히 의미 있는 첫 행동과 다음 목표 형성이다.

## 6. D1 / D3 / D7 / D14 / D30

- **D1:** 사용자가 선택했던 theme/collection/profession을 먼저 기억한다. 직접 follow하지 않은 상품에 `마감 임박`을 기본 노출하지 않는다.
- **D3:** 관련 아이템/세트/편집 스토리 하나만 제안한다. `곧 사라짐`보다 `내가 고른 경로와 왜 맞는지`를 우선한다.
- **D7:** 수집·큐레이션·정체성 변화와 투명한 예정 로테이션 하나를 보여준다. 미완성 세트가 구매 없이도 의미가 있어야 한다.
- **D14:** 두 번째 테마/시즌/직업 컬렉션을 자발적으로 follow할 수 있다. 나중에/숨김/선호변경에 보상 불이익이 없어야 한다.
- **D30:** 구매 수가 아니라 프로필·전시·컬렉션 chapter가 로테이션 이후에도 의미가 남는지가 성공 기준이다.

## 7. 세션 설계

### 1~3분
- follow한 상품/세트의 종료일 하나;
- 새 표현형 preview 하나;
- `저장 / 관심없음 / 보기` 선택 하나;
- 구매 강제 없음.

### 5~15분
- 소수 아이템 preview/비교;
- 보유 컬렉션 큐레이션;
- 전시 테마 선택;
- 짧은 lore/provenance 확인;
- 이해한 뒤 구매 결정.

### 30분+
- 갤러리/아카이브 구성;
- 여러 시즌 collection chapter 연결;
- 커뮤니티/공간 테마 구성;
- 인위적인 일일 탐색 hard cap 없음.

## 8. LiveOps/Season

D-14/D-7/D-3/D-1 예고는 공포가 아니라 theme·story·일정을 설명한다.

좋은 방식:
- 테마/스토리 공개;
- 일부 코스메틱 preview;
- authoritative 시작/종료일;
- catch-up/종료 후 archive 동작;
- 시즌 종료 뒤에도 개인 기록 유지.

피해야 할 방식:
- 마감 순간 surprise paywall;
- 숨겨진 만료 규칙;
- follow하지 않은 사용자에게 반복 last-chance 알림;
- 시즌 종료와 함께 이미 얻은 정체성/기록 삭제;
- 따라잡기 가능한데도 late joiner를 영구 열위로 고정.

## 9. Social/Viral

공유 우선 artifact:
- 큐레이션된 프로필/의상 theme;
- 완성 collection chapter;
- 시즌 기억 카드;
- 직업 테마 공간;
- 클럽/도시 프로젝트 전시;
- 큐레이션 before/after.

private balance, 정확한 holdings, 부채, 카지노 결과, 비공개 구매이력은 기본 공유재료가 아니다.

비회원도 artifact 맥락을 이해한 뒤 public-safe preview/story로 진입해야 한다. share click·invite acceptance 자체에 의미 있는 WLD/WDX를 지급하지 않는다.

## 10. 수익화

`아이템 이해 → preview → 가격/판매기간 이해 → 자발적 선택 → 구매 → 실제 사용/전시 → 이후 복귀`

최적화하지 않을 것:
- 카운트다운 노출량;
- 마지막 순간 impulse conversion;
- 거절 후 반복 구매 압박;
- 추정 지불의향 기반 숨은 개인별 가격인상;
- 강한 attachment를 이유로 한 불투명 고가 책정.

기본 순서:
1. 게임에서 얻은 WLD의 코스메틱/컬렉션 sink;
2. non-P2W 표현/편의;
3. 반복가치가 확인되고 결제/법규 검토가 된 뒤 optional paid cosmetics/subscription;
4. 명확하게 표시된 sponsorship.

금융게임 우위는 판매하지 않는다.

## 11. SEO

`item × timer × rarity` 얇은 페이지를 대량생성하지 않는다.

우선 후보:
- 큐레이션 시즌 카탈로그;
- collection/lore 페이지;
- 시즌 archive;
- 시즌 변경 가이드;
- 직업/컬렉션 설명;
- public-safe 전시 회고.

개별 공개 상품 페이지가 색인된다면 availability와 expiry는 authoritative public surface와 일치해야 한다. 판매 종료 후에도 검색결과가 `지금 구매 가능`처럼 남는 것은 신뢰 훼손이다.

보유목록, 최근 획득 이력, 구매이력, 잔액, 부채, 카지노 상태, 개인추천, 보안/계정 상태는 비공개·비색인 원칙을 유지한다.

## 12. Funnel/KPI

`qualified discovery → 표현형 preview → identity/collection interest → optional follow/save → meaningful activation → D1 취향 인식 → D7 큐레이션/투명 로테이션 이해 → 자발적 구매/사용 → D30 durable identity → optional public-safe share`

핵심 KPI:
- preview→authored interest;
- interest→meaningful activation;
- first-value before first-purchase;
- time-to-first-expressive-use;
- D1 exact-theme recognition;
- D3 contextual discovery;
- D7 curation/identity progression;
- D14 voluntary second-theme adoption;
- D30 durable display/collection coverage;
- 구매/획득 아이템 실제 재사용·전시율;
- share→visit→activation→D7;
- retention-adjusted revenue/contribution.

수익 진단:
- preview→purchase;
- save/follow→later purchase;
- purchase→actual use/display;
- rotation-end conversion share;
- refund/support complaints;
- value proof 이후 ad/subscription conversion;
- D7/D30과 함께 본 ARPU/ARPDAU/LTV/CAC.

신뢰·안전 guardrail:
- FOMO/압박 불만;
- false-scarcity incident;
- deadline mismatch;
- youth-safety complaint;
- bot/inventory-sniping signal;
- multi-account abuse;
- ATO/phishing signal;
- privacy complaint;
- sensitive-state exposure;
- finance/gambling misunderstanding;
- suspicious reward duplication.

## 13. 실험 backlog

### A — 정체성 우선 vs 부/지위 중심 머천다이징
- 가설: identity/collection/profession framing이 건강한 상점 이용을 유지하면서 D7/D30 품질을 높인다.
- 대상: 하나 이상의 theme/profession/collection 관심을 표현한 activated user.
- 진입점: activation 이후 첫 의미 상점 추천.
- Control: 인기/지위 중심 mixed merchandising.
- Treatment: 표현형 우선, wealth/profit/casino prestige 하향.
- Primary: D7 retained users 중 identity item 사용/큐레이션율.
- Guardrail: revenue 급락, 혼란, finance/gambling 오인, FOMO, abuse.
- 최소 관찰: D7 mature cohort 1회, 광범위 적용 전 D30.
- 다음 행동: retained identity use가 개선되고 trust/safety가 악화되지 않을 때만 채택.

### B — 정확한 authoritative 종료일 vs 모호한 urgency
- 가설: 정확한 날짜·시간이 전환을 크게 해치지 않으면서 압박·문의 혼란을 줄인다.
- 대상: 실제 회전 상품을 보는 사용자.
- 진입점: item preview/detail.
- Control: 일반 `한정/곧 종료` 표현.
- Treatment: authoritative 종료일/시간 + 무엇이 끝나는지 평문 설명.
- Primary: informed preview→자발적 purchase/use.
- Guardrail: deadline mismatch, complaints, support, accidental purchase, D7/D30.
- 최소 관찰: 전체 rotation window + 종료 후 7일.
- 다음 행동: trust가 개선되고 conversion 손상이 크지 않을 때 exact-date 유지.

### C — 즉시 hard cutoff vs 획득 종료 + 교환 grace
- 가설: 짧고 명확한 grace가 이벤트 기대감을 훼손하지 않고 panic/spend와 복귀 friction을 줄인다.
- 대상: 시즌 종료 직전 event token/progress 보유자.
- 진입점: 마지막 72시간 및 post-event return.
- Control: 획득·교환 동시 종료.
- Treatment: 획득은 예정대로 종료, 짧은 교환/큐레이션 grace.
- Primary: D7 post-event healthy return + 획득가치 정상 사용.
- Guardrail: economy leakage, duplicate redemption, multi-account abuse, support, 무기한 grace 오해.
- 최소 관찰: 이벤트 1회 + 종료 후 14일.
- 다음 행동: healthy return 개선과 경제/악용 안정이 동시에 있을 때 채택.

### D — follow intent 기반 알림 vs broad urgency
- 가설: 명시적 follow/save 기반 알림이 spam 압박 없이 질 좋은 comeback을 만든다.
- 대상: 회전 상품/theme를 직접 follow/save한 사용자.
- 진입점: D-3/D-1.
- Control: 광범위 promotional message.
- Treatment: follow한 맥락만 알림, balance/debt/casino 정보 제외.
- Primary: notification→meaningful session→D7.
- Guardrail: opt-out, spam report, phishing/ATO, privacy complaint, accidental purchase.
- 최소 관찰: rotation 2회 이상.
- 다음 행동: retained value와 trust가 모두 좋은 카테고리만 유지.

### E — catalog SEO 양 vs 큐레이션 season/collection 페이지
- 가설: 얇은 item/timer 페이지보다 적은 수의 유용한 페이지가 organic D30 품질을 높인다.
- 대상: non-branded organic visitor.
- 진입점: 검색 landing.
- Control: 광범위 catalog/item discovery.
- Treatment: context와 투명 availability가 있는 season/collection/lore landing.
- Primary: organic visit→meaningful activation→D30.
- Guardrail: misleading availability, doorway/thin-content, bounce, privacy, finance-like mismatch.
- 최소 관찰: 방향 판단 가능한 검색량 + mature D30 cohort.
- 다음 행동: impression이 아니라 retained user를 만드는 content family만 확대.

## 14. 보안·악용·개인정보

### HIGH — 마감 사칭 phishing/ATO
영향: 가짜 `곧 종료`, `보상 수령`, `컬렉션 저장` 메시지로 계정탈취.
최소 보호: canonical domain/brand 일관성, password/OAuth code/recovery code 요구 금지, URL에 session/secret/recovery 값 금지.
별도 개발/QA: 새 email/push/external deep-link 전에 필요.

### HIGH — 가짜 희소성/기만 urgency
영향: 성급한 구매, trust 저하, 미성년자 압박.
최소 보호: authoritative deadline, 정직한 stock/return 정책, 숨은 timer reset 금지, 만료 의미 설명.
별도 개발/QA: 신규 countdown/제한재고 행동 전에 필요.

### HIGH — 부/카지노/수익 prestige 강화
영향: 실제 금융처럼 오인, loss chasing, unhealthy prestige.
최소 보호: raw P/L·부채·casino outcome을 기본 prestige에서 제외하고 game-only·확률·market-integrity 경계 유지.
별도 개발/QA: finance/casino-adjacent prestige/광고 확대 전 legal/product review.

### HIGH — deadline sniping/bot/multi-account
영향: 제한재고 불공정, trust 저하.
최소 보호: raw open/follow/deadline click에 의미 있는 WLD/WDX 금지, 기존 server limit/idempotency/fraud monitoring 유지.
별도 개발/QA: scarcity-linked reward나 실제 제한재고 캠페인 전 필요.

### HIGH — 민감 추천/공유 정보 노출
영향: WLD/WDX, 부채, 카지노, private purchase/security 상태 유출.
최소 보호: personalized state private-by-default, public-safe allowlist, URL/share/notification/3rd-party analytics에 민감상태 금지.
별도 개발/QA: personalized public shop/share 또는 새 광고/분석 연동 전 필요.

### MEDIUM — 개인별 가격/프로파일 과잉
영향: 불투명 가격차등·privacy complaint.
최소 보호: 비공개 individualized pricing 금지, data minimization, 명확한 pricing policy.
별도 개발/QA: 향후 개인별 paid price 실험은 privacy/legal QA 필요.

## 15. 법규/정책 주의

- 한국: 공정위 2025-02-13 `6개 유형 온라인 다크패턴 규제 문답서`는 현재도 중요한 공식 준수 참고자료다. 한국소비자원은 2026 광고감시에서도 소비자 기망형 다크패턴을 명시적으로 모니터링했다. false scarcity·misleading urgency는 단순 copy 문제가 아니라 소비자보호 리스크로 취급한다.
- 미국: FTC는 2026년 8월 personalized pricing 관련 enforcement policy statement 제안에 의견을 받고 있다. 이는 최종 규칙으로 단정하지 않지만, 개인 데이터를 이용해 가격이 달라지면서 고정가격처럼 오인시키는 행위에 대한 현재 집행정책 신호다.
- 미성년자: rotation pressure, probability/casino-adjacent identity, paid cosmetics 확대는 age-sensitive 검토가 필요하다. 이 문서는 새 age-gating architecture를 만들지 않는다.
- WLD/WDX는 virtual/simulated/game-only다. 판매 종료·prestige 문구는 실제 투자 가치, 예금 안전성, 현금 가치상승, 수익보장을 암시하면 안 된다.

## 16. Research note

| 날짜/상태 | 출처 | 핵심 시사점 | 적용 |
|---|---|---|---|
| 현재 지원문서, 2026-09-15 확인 | Epic Games — https://www.epicgames.com/help/cs/c-Category_Fortnite/c-Fortnite_Gameplay/how-to-check-when-an-item-will-be-removed-from-the-fortnite-item-shop-a000089695?lang=en-US | 개별 코스메틱의 정확한 판매 종료 날짜/시간을 표시한다. | **직접 채택:** authoritative end-time 원칙. |
| 2026-01-09 | Supercell Clash of Clans — https://supercell.com/en/games/clashofclans/blog/news/nakr%C4%99%C4%87-si%C4%99-na-wydarzenie-wybuchowe-wyposa%C5%BCenie/ | 이벤트 종료일을 명시하고 교환 탭을 2일 더 유지했다. | **직접 채택:** 일정 투명성 + bounded grace 실험. |
| 2026-08 | U.S. FTC — https://www.ftc.gov/news-events/news/press-releases/2026/08/ftc-seeks-comment-enforcement-policy-statement-regarding-personalized-pricing | browsing/buying history 기반 숨은 personalized pricing이 소비자를 오인시킬 수 있음을 강조. 최종규칙 아님. | **Guardrail/참고:** 숨은 개인별 가격 금지. |
| 2025-02-13, 현행 공식 참고 | 공정거래위원회 — https://www.ftc.go.kr/www/selectBbsNttView.do?bordCd=3&key=12&nttSn=43802 | 온라인 다크패턴 6개 규제유형 준수 문답. | **준수 참고:** urgency/scarcity UX. |
| 2026 모니터링 | 한국소비자원 — https://www.kca.go.kr/home/sub.do?menukey=4003&mode=view&no=1004002526 | 광고감시에서 소비자 기망형 다크패턴을 계속 모니터링. | **최신 관심 신호**. |
| 현재 문서, 2026-09-15 확인 | Google Search — https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google | 가격·availability의 최신성 불일치는 검색 사용자 신뢰 문제를 만들 수 있다. | **SEO 참고만:** 공개 상품 페이지가 있다면 authoritative 상태와 일치. |
| Runtime 2026-09-15 | Moneyverse — https://easy-scraping.com/ , https://easy-scraping.com/shop | game-only 경계는 명확하지만 대규모 catalog와 일부 wealth/profit/casino prestige 문구가 공존한다. | **직접 관찰**. |

## 17. 결정 요약

기획 수준에서 채택:
- identity/collection/profession/community 표현을 wealth/profit/casino prestige보다 우선;
- 정확한 authoritative 종료일;
- 만료 의미 명확화;
- 필요 시 bounded redemption grace 실험;
- follow intent 기반 저압 알림;
- D30 실제 사용/정체성을 최종 성공으로 평가;
- timer-page SEO farm 대신 public-safe curation/season archive.

확대하지 않음:
- fake/resetting countdown;
- raw WLD/P&L/casino prestige 중심 aspiration;
- raw shop open/follow/deadline click WLD/WDX 보상;
- activation을 위한 구매 강제;
- 숨은 individualized pricing;
- 실제 가치상승처럼 들리는 표현;
- broad last-chance notification;
- 민감 private-state 공유/색인.

## 18. Runtime verification

Runtime verification: **공개 홈·상점·가이드는 가능. 인증이 필요한 calendar/holdings 동작은 이번 기획 회차에서 독립적으로 실행하지 못했다.**

확인 내용:
- 홈은 WLD/보상이 game-only이고 현금성이 없음을 명확히 고지한다.
- Store 2.0은 표현형 코스메틱·편의와 영구 WLD sink를 강조하며 대규모 카탈로그를 공개한다.
- 일부 상점 copy는 wealth/profit/casino 중심 prestige를 사용한다.
- 최신 `main`은 member calendar의 authoritative 판매 종료 일정과 holdings 최근 획득 필터를 문서화한다.

v2026.09.15.96은 소비자 성장 문서 변경만 포함한다.
