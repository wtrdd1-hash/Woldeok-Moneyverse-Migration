# Woldeok Moneyverse — 컬렉션 소유감→큐레이션 리텐션 기획

> 버전: v2026.09.14.61
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md`, `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md](COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md)
> 변경 유형: 문서-only; 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번 회차에서 선택한 공백

직전 컬렉션 활성화 기획은 쇼케이스 수신자가 컬렉션을 이해하고, 작은 선택을 하고, 연속성을 저장하기 위해 가입한 뒤 첫 의미 있는 컬렉션 상태에 도달하는 경로를 정의했습니다. 이제 가장 큰 리텐션 공백은 그 다음 일주일입니다.

**첫 컬렉션 행동이 충분한 소유감을 만들어 사용자가 보상이나 숙제 때문이 아니라 스스로 다시 와서 정리·해석·전시까지 깊어지는가, 아니면 또 하나의 보상 체크리스트로 끝나는가?**

이번 기획은 다음의 좁은 루프를 정의합니다.

`첫 의미 있는 컬렉션 상태 → D1 인식 → 아직 이어갈 의미 확인 → D3 자발적 심화 → D7 진전 증명 → 첫 큐레이션 선택 → 오래 남는 챕터 → 선택적 쇼케이스`

목적은 referral payout, 공개 활동피드, 컬렉션 수익화, 보상 중심 습관을 확대하기 전에 **내 것이라는 감각**이 실제 리텐션을 만드는지 검증하는 것입니다.

이 문서는 컬렉션 DB 스키마, 인벤토리 API, scheduler, notification service, reward contract, moderation backend, public-profile 구현을 새로 추가하지 않습니다.

## 2. 소비자 약속

**“다시 올 때마다 컬렉션이 단순히 커지는 것이 아니라 점점 더 내 것이 되어야 한다.”**

리텐션이 형성된 사용자는 네 가지를 느껴야 합니다.
- **인식:** 서비스가 내가 고른 것을 기억한다.
- **진전:** 지난 방문 이후 무엇이 달라졌는지 알 수 있다.
- **저자성:** 무엇이 중요한지, 어떻게 묶고 보여줄지 내가 고른다.
- **미완성 열망:** 잃을까 무서워서가 아니라 다음 챕터가 궁금해서 돌아온다.

다음 방식에 의존하지 않습니다.
- 매일 보상 수령 압박;
- streak reset 공포;
- 컬렉션 소유권 만료;
- 인위적 희소성;
- 컬렉션 화면을 열었다는 이유만으로 큰 WLD 지급;
- 재산이나 소비 규모 위주 순위;
- 현재 컬렉션의 의미를 만들기 전에 다음 아이템 구매만 계속 재촉하는 구조.

## 3. D1 — 새것보다 먼저 “내가 하던 것”을 보여준다

첫 복귀는 새 인벤토리보다 연속성을 먼저 증명해야 합니다.

D1 첫 화면 우선순위:
1. 사용자가 고른 정확한 starter theme/intention;
2. 첫 조각 또는 비공개 draft 상태;
3. 무엇이 저장되어 있는지 한 문장;
4. 방금 선택과 직접 연결된 작은 다음 행동 하나.

목표 감정은 다음입니다.
**“내가 여기까지 했던 게 그대로 있네.”**

좋은 D1 행동:
- 첫 조각의 이야기/provenance 살펴보기;
- 작은 전시에서 어디에 둘지 고르기;
- 관련 조각/테마 하나를 관심표시;
- 제한된 private note/label 선택;
- `이해`, `완성`, `큐레이션`, `전시` 같은 다음 목표 선택.

D1을 다음 중심으로 만들지 않습니다.
- `오늘 보상 받기`;
- `streak가 초기화됩니다`;
- `놓친 수입이 있습니다`;
- `지금 WLD를 예치하세요`;
- `가격 바뀌기 전에 거래하세요`;
- `카지노에서 손실을 복구하세요`.

## 4. D3 — 전체 서비스가 아니라 같은 스레드를 한 단계 깊게

D3에서는 사용자가 같은 컬렉션에 대해 더 알고 싶거나 더 손대고 싶은지를 확인합니다.

인접 심화 경로는 최대 하나만 제안합니다.
- **의미:** lore, provenance, 시즌 맥락, 가상 세계 역사;
- **완성:** 세트 관계와 남은 부분;
- **큐레이션:** 순서, 그룹, 라벨, 시각적 배열;
- **연결:** 관련 직업, 공간, 시즌, public-safe 프로젝트 하나.

3일이 지났다는 이유로 은행, 대출, 가상주식, 사업, 카지노 등 서로 무관한 시스템을 한꺼번에 소개하지 않습니다.

컬렉션을 원하지 않는 사용자는 다른 Moneyverse 기능을 자유롭게 써야 합니다. 컬렉션은 열망 경로이지 필수 튜토리얼 잠금이 아닙니다.

## 5. D7 — 진전 증명과 첫 큐레이션 결정

D7은 이번 기획의 핵심 리텐션 증명 지점입니다.

짧은 `그때 → 지금 → 다음` 이야기를 보여줍니다.
- **그때:** 무엇을 골랐거나 시작했는가;
- **지금:** 무엇을 완성·학습·배열·보존했는가;
- **다음:** 내가 고를 수 있는 의미 있는 방향 하나.

D7 컬렉션 복귀가 성공했다고 보는 행동:
- 조각을 다시 배열하거나 그룹으로 묶기;
- favorite/featured piece 고르기;
- 제한된 annotation 추가;
- 아직 완성하지 않은 set goal 선택;
- 지원되는 경우 오래된 조각 복원/재구성;
- room/archive/museum 맥락에 배치;
- private로 유지하거나 public-safe showcase 준비 선택.

D7에 반드시 새 아이템을 획득할 필요는 없습니다. **이미 가진 조각만으로도 해석과 전시를 통해 가치가 생겨야 합니다.**

## 6. 소유감 사다리

### 1단계 — Have
“조각을 하나 가지고 있다.”

### 2단계 — Understand
“왜 이 조각이 의미 있는지 안다.”

### 3단계 — Connect
“테마·시즌·직업·이야기와 어떻게 이어지는지 안다.”

### 4단계 — Curate
“어떻게 배열하고, 라벨을 붙이고, 강조하고, 보존할지 골랐다.”

### 5단계 — Express
“이 컬렉션은 내 취향처럼 보인다.”

### 6단계 — Remember
“내 Moneyverse 역사 일부를 기록한다.”

### 7단계 — Reinterpret
“옛 컬렉션이 새 시즌·전시·이야기에서 다시 의미가 생겼다.”

획득은 시작일 뿐입니다. 건강한 컬렉션은 아이템 공급을 계속 늘리지 않아도 유지 사용자가 의미를 만들 수 있어야 합니다.

## 7. 세션 길이별 경험

### 1~3분 quick check
- `그때 → 지금 → 다음` 확인;
- 대표 조각 하나 고르기;
- 다음 컬렉션 의도 하나 선택;
- 접속을 끊어도 진행을 잃지 않음.

### 5~15분 meaningful session
- lore/provenance 챕터 하나 보기;
- 작은 전시 배열;
- 관련 조각/테마 두 개 비교;
- 큐레이션 milestone 하나 완료.

### 30분+ deep session
- exhibit/archive chapter 만들기;
- 개인 전시 공간 리디자인;
- 여러 시즌/테마 연결;
- moderation/privacy가 준비된 범위에서 더 풍부한 안전 annotation;
- 사용자가 opt-in한 경우에만 public-safe museum/community project 참여.

이 기획은 임의의 일일 하드캡을 추가하지 않습니다. 가치 이동을 보호하는 기존 anti-abuse/economy 제한은 유지하지만, 컬렉션 해석 활동을 희소성 연출 목적으로 막지 않습니다.

## 8. D14 / D30 / 장기 리텐션 연결

### D14 — 내가 만든 전시
배열, favorite, annotation, theme, archive grouping, display context 중 최소 하나는 사용자가 직접 바꿀 수 있어야 합니다.

### D30 — 오래 남는 챕터
아무에게도 공유하지 않아도 보관할 가치가 있는 컬렉션 챕터가 생겨야 합니다. 공개 공유는 선택입니다.

### D60+ — 재해석
오래된 컬렉션은 다음을 통해 다시 흥미로워질 수 있습니다.
- 새 시즌 맥락;
- 순환 editorial exhibit;
- restoration/reframing goal;
- 개인 retrospective;
- museum/archive theme;
- club/city 문화 프로젝트;
- 과거 기록을 무효화하지 않는 새 presentation layer.

이는 기존 장기 열망 기획의 `Acquire → Understand → Complete → Curate → Reinterpret`와 연결됩니다.

## 9. Funnel과 cohort

핵심 컬렉션 리텐션 funnel:

`첫 의미 컬렉션 행동 → D1 인식 → D3 같은 스레드 심화 → D7 진전 증명 → 첫 큐레이션 행동 → D14 authored display → D30 durable chapter → 선택적 showcase/share → 수신자 preview`

유입 출처별 분리:
- 직접 쇼케이스 수신;
- 일반 신규 온보딩;
- organic guide/lore;
- community/Discord;
- creator/partner;
- 향후 paid acquisition.

첫 의도별로도 나눕니다.
- complete;
- learn lore;
- curate;
- build a display.

서로 다른 의도를 하나의 평균 retention cohort로 합치지 않습니다.

## 10. KPI 추가

### 소유감/activation quality
- first-collection-state completion;
- first-goal set rate;
- first-value proof completion;
- user-selected intention mix;
- time-to-first-owned-state.

### D1~D7 retention quality
- D1 exact-thread recognition rate;
- D1 recognition → meaningful action;
- D3 same-thread continuation;
- D7 collection return;
- D7 `then → now → next` completion;
- D7 first-curation-action rate;
- comeback/daily 경제보상 없이 스스로 심화한 D7 사용자 비율.

### 장기
- D14 authored-display rate;
- D30 durable-chapter rate;
- collection revisit rate;
- collection curation rate vs acquisition-only rate;
- archive/museum revisit;
- older-collection reinterpretation rate;
- own-showcase creation;
- second-generation share → activation → D7.

### Business
- collection-intent cohort별 D30/D60 LTV;
- 반복가치 이후 cosmetic/presentation revenue;
- attachment 증명 이후 subscription conversion;
- ad-induced churn;
- retention-adjusted contribution;
- share-assisted 유입의 fraud-adjusted CAC.

### 신뢰 guardrail
- privacy complaint rate;
- public/private leakage incidents;
- phishing/ATO signal rate;
- fake-signup/referral-fraud rate;
- suspicious reward duplication;
- spam/report rate;
- collection prestige manipulation rate;
- accidental-ad-click rate;
- FOMO/pressure complaint rate;
- finance-like claim complaint rate.

## 11. 실험 backlog

### 실험 A — D1 recognition-first vs novelty-first
가설: 새 아이템보다 정확히 저장된 컬렉션 상태를 먼저 보여주면 D1 의미 행동이 증가한다.
대상: 첫 의미 컬렉션 행동을 완료한 사용자.
진입점: activation 후 첫 복귀.
Control: 일반 홈/새 콘텐츠 추천.
Treatment: 저장된 theme/piece/intention + 다음 행동 하나.
Primary: D1 recognition → meaningful collection action.
Guardrail: 혼동, 상태복구 불만, auth/session failure, privacy exposure.
최소 관찰: D7이 성숙한 cohort 1개 이상.
후속: D1과 D7이 함께 좋아지고 신뢰/지원 부담이 악화되지 않을 때만 채택.

### 실험 B — `그때 → 지금 → 다음` vs 보상 recap
가설: claimable reward 강조보다 진전 이야기가 D7 연속성을 더 만든다.
대상: D7에 도달한 컬렉션 사용자.
Control: reward/claim 중심 recap.
Treatment: 진전 증명 + 사용자가 고르는 다음 방향 하나.
Primary: D7 return → first curation action.
Guardrail: 압박감 불만, reward inflation, abandonment.
관찰: 성숙한 주간 cohort 최소 2개.

### 실험 C — curation prompt vs 다음 획득 prompt
가설: 새 구매/획득보다 기존 조각을 배열·강조·주석하는 것이 D30 애착을 높인다.
Control: 다음 item acquisition CTA.
Treatment: 기존 조각 큐레이션 우선.
Primary: D14 authored display, D30 durable chapter.
Guardrail: sink pressure, confusion, monetization complaint.
관찰: D30 성숙 cohort.

### 실험 D — 사용자 선택 열망 vs 시스템 지정 목표
가설: 되돌릴 수 있는 사용자 선택 목표가 자발적 리텐션을 높인다.
Control: 시스템이 정한 다음 collection milestone.
Treatment: `complete`, `learn`, `curate`, `display` 중 선택.
Primary: intention별 D7/D30 continuation.
Guardrail: choice regret, 과도한 변경, decision paralysis.
관찰: 가능하면 D30 성숙 cohort.

### 실험 E — value-first monetization vs 조기 presentation upsell
가설: D7 큐레이션/반복가치 뒤까지 수익화를 미루면 retention-adjusted contribution이 좋아진다.
Control: 조기 cosmetic/theme upsell 또는 reviewed ad.
Treatment: first-piece → D1 → D7 curation 경로에는 interruptive monetization을 넣지 않고 attachment 후 수익화.
Primary: D30 + contribution margin.
Guardrail: ad-induced churn, accidental click, subscription complaint, CWV regression.
관찰: D30 성숙 cohort + 충분한 monetization volume.

## 12. Viral/brand 영향

큐레이션 기반 컬렉션은 wealth보다 taste를 표현하므로 공유 아티팩트로 더 적합합니다.

선호 공유 신호:
- 사용자가 직접 고른 favorite piece;
- 배열/전시 theme;
- 완료한 chapter;
- before/after curation;
- season/lore interpretation;
- archive/museum milestone.

기본 공유에서 제외:
- WLD 잔액/wealth percentile;
- WDX 보유량·평단·수익률;
- loan/debt;
- casino win/loss;
- private social graph;
- account/security/recovery state;
- moderation state;
- 정확한 현실 위치/법적 실명.

브랜드 약속은 **“Moneyverse는 내가 고른 것을 기억하고 그것을 나만의 역사로 만들게 해준다”**입니다. “가장 부자가 가장 잘 보이는 서비스”가 아닙니다.

## 13. SEO와 콘텐츠 발견

개별 컬렉션 상태, 배열, 메모, D7 recap을 모두 색인하지 않습니다.

독립적인 공개 가치가 있는 색인 후보:
- 충분한 collection/lore guide;
- editorial museum-style exhibit;
- season/world archive;
- 컬렉션과 연결된 fictional-company/profession history;
- 명시적으로 공개되고 맥락이 충분한 community project;
- trust review를 거친 충분한 원문 맥락의 opt-in public showcase.

기본 비색인/private/unlisted 후보:
- private collection dashboard;
- first-piece state;
- personal progress recap;
- draft;
- balance/holding/debt/casino history;
- security/recovery/moderation state;
- referral/claim page;
- 얇은 자동생성 user page.

Google의 현재 UGC 가이드는 abuse policy, 신고, spam account 탐지, 저신뢰/신규 콘텐츠 `noindex` 고려를 권고합니다. 검색 노출을 대량 저품질 컬렉션 페이지 생성의 보상으로 만들지 않습니다.

Organic funnel:
`유용한 lore/exhibit → collection exploration → qualified signup → first owned state → D1 → D7 curation → D30 durable chapter → optional public exhibit → retention-adjusted contribution`

## 14. 수익화

진행을 유지할 권리가 아니라 **애착이 생긴 뒤의 표현**에 수익화를 연결합니다.

후보:
- non-P2W display theme;
- archive/museum presentation skin;
- room/office/gallery cosmetic;
- 경제 결과에 영향 없는 visual layout;
- 반복가치 이후 ad-free subscription;
- 명확히 표시된 sponsor/editorial exhibit.

판매하지 않을 것:
- 더 좋은 WDX/loan/casino 결과;
- cosmetic처럼 포장된 collection-completion odds 우위;
- 숨은 sponsored ranking;
- organic prestige처럼 보이는 moderation/search visibility 우대;
- 컬렉션 챕터 유지에 필요한 강제 결제;
- 전환을 위한 fake scarcity/irreversible pressure.

구독의 중요 조건은 결제 전 명확해야 하고, express informed consent 후 결제하며, 해지는 단순해야 합니다. 해지 방해를 리텐션 전략으로 사용하지 않습니다.

## 15. 보안·개인정보·악용 검토

### High — 컬렉션 연속성에서 비공개 상태 노출
사용자 영향: stalking, 표적사기, 창피함, 계정 표적화.
악용 시나리오: D1/D7 recap 또는 공개 exhibit에 private inventory, balance, holding, debt, social graph, account identifier, security/recovery state가 섞임.
최소 보호조건: public-safe allowlist, personalized collection state 기본 비공개, 명시적 공개선택, URL/analytics/share payload에 secret/session/recovery 금지.
별도 개발/QA: personalized public continuity/showcase 구현 전 필요.

### High — 컬렉션 진전 메시지를 이용한 phishing/ATO
사용자 영향: credential 탈취, account takeover.
악용 시나리오: `컬렉션이 바뀌었습니다`, `희귀 조각을 받으세요`, `전시가 만료됩니다` 같은 사칭 메시지로 credentials/OAuth code 요구.
최소 보호조건: 공식 도메인/브랜드 일관성, asset-loss urgency 금지, 콘텐츠 내부 credential/auth-code 요청 금지, 알림에 민감 계정정보 금지.
별도 개발/QA: email/push/external deep-link 전 필요.

### High — prestige/farming 조작
사용자 영향: 사회적 증거 왜곡, 실험 데이터 오염, 경제 악용.
악용 시나리오: bot/다계정으로 값싼 조각 획득, view/share 조작, reward 반복수령 후 collection prestige 부풀림.
최소 보호조건: raw view/share/open에 의미 있는 WLD/WDX 지급 금지, fraud-adjusted metric, 의심 cohort 의사결정 제외, 공개 prestige 도입 시 abuse-resistant eligibility.
별도 개발/QA: 경제/소셜 ranking incentive 전 필요.

### High — annotation/public exhibit UGC 악용
사용자 영향: 괴롭힘, 사칭, doxxing, 악성링크, 유해콘텐츠.
악용 시나리오: annotation/exhibit 설명에 개인정보, 사기, 악성 링크 삽입.
최소 보호조건: 첫 pilot은 bounded/preset text, 신고/삭제, external-link policy, 실명 강제 금지, public visibility opt-in.
별도 개발/QA: open-ended public UGC 전 필요.

### Medium — 행동 프로파일링/미성년자
컬렉션 취향은 관심사를 드러낼 수 있습니다. 민감특성을 추론하거나 미성년자 맞춤광고를 강화하는 데 사용하지 않습니다. 청소년 대상 공개 discovery, stranger interaction, behavioral ads, 새 tracking vendor는 별도 최신 privacy/safety/legal review가 필요합니다.

## 16. Runtime Product Reality Audit — 2026-09-14

공개 런타임 `https://easy-scraping.com/` 접근 가능.

관찰:
- 홈은 WLD/보상이 game-only virtual data임을 명확히 표시;
- 빠른 바로가기는 여전히 지갑, 게임, 거래소, 상점, 퀘스트 중심;
- `SPONSORED ADVERTISEMENT` 영역이 여러 곳 존재;
- `Monthly notes`는 여전히 공개 운영 소식을 준비 중이라고 표시;
- 로비는 조용하거나 비어 보일 수 있음;
- 시작 가이드는 로그인 → 지갑 잔액 → 퀘스트/직업 → 복리예금/상점 순서를 중심으로 하며 예금·국채·대출·주식 시세차익/배당·패시브소득·사업·카지노를 광범위하게 전면화;
- 현재 홈/가이드/공지에서는 public collection `first state → D1 recognition → D7 curation` 경로를 확인하지 못함.

시사점: 컬렉션 리텐션은 현재 경제 중심 onboarding에서 자동으로 생긴다고 가정하면 안 됩니다. ownership-to-curation이 검증되기 전에는 컬렉션 광고, referral payout, public prestige를 확대하지 않습니다.

## 17. Research note — 2026-09-14

| 출처 | 날짜 | 핵심 관찰 | 반영 |
|---|---|---|---|
| Supercell — New Collection Levels & Mastery Changes | 2026-05-13 | 진행체계가 복잡하고 개인 목표와 분리됐다고 설명하며 모든 컬렉션 업그레이드가 의미 있고 다음 목표가 명확한 구조로 개편. | **직접채택:** 불투명 XP/보상층보다 사용자가 고른 컬렉션의 진전을 명확히 표시. |
| Supercell — June Update 2026 | 2026-05/06 | Collection Level이 XP를 대체하고 기존 진행을 반영. | **참고:** 세션/시스템 변화 뒤에도 연속성과 진행이 보이게 함. |
| FIFA Collect — Dynamic Collectibles | 2026-06-26 | 대회 진행에 따라 collectible이 변하며 팀의 여정을 기록하는 living record가 됨. | **직접채택:** 새 획득만이 아니라 변화하는 맥락·역사가 복귀 이유가 될 수 있음. |
| Discord — Profile Widgets FAQ | 2026-09-08 업데이트 | 사용자가 무엇을 보여줄지 선택·재배치·삭제할 수 있음. | **직접채택:** 큐레이션/공개표현은 authored·reversible. |
| Xbox Wire — Achievement improvements | 2026-04-08 | 100% completion을 강조하면서 profile에서 게임을 숨길 수도 있음. | **직접채택:** 완성 자부심과 공개 통제를 함께 제공. |
| Google Search Central — Prevent User-Generated Spam | 현재 | abuse policy, 신고, spam account 탐지, 저신뢰/신규 콘텐츠 noindex 고려 권고. | **가드레일:** 얇은 collection/UGC 대량 색인 금지. |
| FTC — Shutterstock settlement | 2026-05-13 | 중요조건 불명확, informed consent 부족, 해지곤란을 문제 삼음. | **가드레일:** attachment를 구독 dark pattern 근거로 사용 금지. |
| FTC — Genesis Tech subscription case | 2026-06 | 숨은 recurring term, 무단청구, 해지방해 의혹. | **참고:** recurring monetization 조건 명확화와 쉬운 해지. |
| 개인정보보호위원회 — COPPA 2.0 국외동향 | 2026-04-01 | 미국에서 청소년까지 privacy 보호와 맞춤광고 제한을 강화하려는 입법 동향을 소개. 현행 한국법으로 취급하지 않음. | **재검토 trigger:** minors collection personalization/ads를 보수적으로 운영하고 출시 시 법률 재확인. |

주요 URL:
- https://supercell.com/en/games/clashroyale/blog/news/new-collection-levels-and-mastery-changes/
- https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2026/
- https://collect.fifa.com/blog/dynamic-collectibes-fifa/
- https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ
- https://news.xbox.com/en-us/2026/04/08/xbox-insiders-may-2026-console-features/
- https://developers.google.com/search/docs/monitor-debug/prevent-abuse
- https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices
- https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-sues-stop-sprawling-enterprise-operating-unlawful-subscription-schemes
- https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060030000&nttId=11938

## 18. 법규/정책 주의점

- WLD/WDX는 virtual/simulated/game-only입니다. 컬렉션 진전·희귀성·큐레이션·prestige가 현금가치, 예금안전, 가치상승 보장, 실제 투자수익을 암시하면 안 됩니다.
- sponsored/compensated collection exhibit·creator promotion은 적용되는 경우 material relationship을 적절히 표시해야 합니다.
- subscription/autorenewal 변경은 출시 시점 최신 법률 검토가 필요하며 중요조건 명확화, informed consent, 쉬운 해지는 제품 가드레일로 유지합니다.
- 개인화/공개 컬렉션은 개인정보 최소화와 safe visibility 기본값을 유지합니다. 컬렉션 관심사를 민감특성 추론의 지름길로 사용하지 않습니다.
- 청소년 대상 discovery, 공개공유, stranger interaction, behavioral advertising은 별도 최신 한국/미국 privacy·safety review가 필요합니다.
- 이 Living Spec은 제품기획이며 법률자문이 아닙니다.

## 19. 결정

다음 좁은 성장 질문은 **컬렉션 소유감→큐레이션 리텐션**으로 둡니다.

먼저 사용자가 큰 경제보상 없이도 같은 컬렉션 스레드로 자발적으로 돌아와 이전 선택을 알아보고 D7에 큐레이션 행동을 하는지 증명해야 합니다.

아직 확대하지 않을 것:
- wealth/portfolio share card;
- raw-signup/referral WLD payout;
- public collection leaderboard;
- 개인 collection page 대량 색인;
- open-ended public annotation;
- aggressive comeback reward;
- first-piece → D7 경로 내부의 추가 interruptive ad inventory.

검증 후 다음 성장 질문:

**D14~D30에 큐레이션된 컬렉션 챕터가 오래 남는 개인 아카이브이자 선택적 소셜 아티팩트가 되어, prestige를 wealth 경쟁이나 privacy 압박으로 만들지 않고 D30/D60 리텐션을 높일 수 있는가?**