# 월덕 머니버스 — 컬렉션 프리뷰→첫 조각 활성화 기획

> 버전: v2026.09.14.60
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`
> 영문 기준 문서: [COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md](COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md)
> 변경 유형: 문서-only; 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번 회차에서 선택한 공백

직전 컬렉션 쇼케이스 기획은 “무엇을 공유할 것인가”를 정했습니다. 이제 가장 큰 공백은 수신자의 다음 90초입니다. **컬렉션을 흥미롭게 본 비회원이 왜 구경만 하고 떠나지 않고, 가입 이유를 이해한 뒤 첫 의미 있는 컬렉션 행동까지 가는가?**

따라서 다음의 좁은 가치 연결부를 정의합니다.

`쇼케이스 이해 → 안전한 컬렉션 프리뷰 → 내 선택 하나 → 연속성을 저장할 때만 가입 → 첫 조각/목표 → 다음 단계 확인 → D1 인식 → D7 진전`

이 문서는 신규 컬렉션 백엔드, 보상 서비스, 공개 프로필 스키마, deep-link 계약, 인증 계약을 추가하지 않습니다. 소비자 의미·순서·지표·안전조건·실험만 정의합니다.

## 2. 소비자 약속

**“가입하기 전에 컬렉션의 재미를 먼저 체험한다. 내 선택을 저장하고 이어가고 싶을 때 가입한다.”**

수신자는 Moneyverse 경제 전체를 이해하지 않아도 컬렉션 경로가 자신에게 흥미로운지 판단할 수 있어야 합니다.

프리뷰는 다음 질문에 답해야 합니다.
1. 이 컬렉션/테마는 무엇인가?
2. 공유자는 왜 이것을 전시했는가?
3. 계정 없이 지금 무엇을 골라보거나 살펴볼 수 있는가?
4. 로그인하면 정확히 무엇이 저장되는가?
5. 로그인 직후 첫 의미 행동은 무엇인가?

## 3. 첫 30초

우선순위:
- 컬렉션/세트 정체성;
- 공유자가 직접 고른 하이라이트와 짧은 맥락;
- 완성/큐레이션/시즌 상태;
- 수신자가 해볼 수 있는 경로 한 문장;
- `이 컬렉션 경로 체험하기` 같은 주 CTA 하나;
- 경제 개념이 있을 경우 virtual/game-only 고지.

먼저 보여주지 않을 것:
- 시작 WLD 잔액;
- 지갑 설정;
- 예금/대출/국채;
- WDX 수익률/가격;
- 카지노 결과;
- 전체 기능 그리드;
- 동등한 여러 CTA;
- 제품 CTA로 오인될 수 있는 광고.

## 4. 첫 3분 — 가입 전 작은 선택

프리뷰는 가짜 보상이 아니라 사용자가 만든 작은 선택을 남겨야 합니다.

후보 행동:
- 2~3개 starter theme 중 하나 선택;
- 대표 아이템 2~3개와 lore 보기;
- 작은 샘플 세트를 세션 안에서 배열해 보기;
- 관심 아이템/테마 하나 고르기;
- `완성`, `큐레이션`, `lore 학습`, `전시 만들기` 중 첫 의도 선택.

금지:
- 익명 사용자에게 spendable WLD/WDX 발행;
- 익명 상태 경제적 우위 제공;
- 타인의 비공개 인벤토리/잔액 노출;
- 가입 후 희귀 아이템 보장 표현;
- `지금 가입하지 않으면 영원히 잃는다`식 긴급성;
- 가치를 이해하기 전에 Discord/Google 연결 강제.

## 5. 가입 이유

좋은 가입 문구:
**“이 테마를 저장하고 첫 컬렉션 챕터를 이어가세요.”**

약한 가입 이유:
- 이유 없는 `계속하려면 가입`;
- `무료 WLD 받기`;
- `투자 기능 해금`;
- `보상을 잃지 마세요`.

가입 전 선택 자체도 사용자가 가입하지 않더라도 의미가 있어야 합니다. 인증은 가치를 감추는 벽이 아니라 **연속성·정체성·진행을 저장하기 위한 단계**입니다.

## 6. 가입 후 첫 의미 행동

인증 성공은 activation이 아닙니다.

다음처럼 의미 상태가 만들어져야 합니다.
- starter collection theme 선택;
- 기존 정상 제품 흐름을 통한 비경쟁 starter piece 선택/획득;
- 컬렉션 스레드 저장;
- lore/sample 상호작용 완료;
- 다음 컬렉션 목표 설정;
- 첫 private draft arrangement 만들기.

activation으로 보지 않을 것:
- OAuth 성공;
- 약관 동의만 완료;
- 지갑 열기;
- WLD 잔액 확인;
- 광고 클릭;
- 일반 홈 방문.

### 첫 가치 증명
첫 의미 행동 직후 다음을 보여줍니다.
- 내가 무엇을 골랐는가;
- 무엇이 저장되었는가;
- 다음 목표 하나;
- 언제/왜 다시 오면 좋은가.

## 7. 세션 길이별 경험

### 1~3분 quick session
- 쇼케이스 보기;
- 테마 하나 선택;
- 컬렉션 스레드 하나 저장/팔로우;
- 다음 목표 하나 남기기.

### 5~15분 meaningful session
- 세트 lore 탐색;
- 첫 컬렉션 행동 완료;
- 작은 전시 배열/주석;
- 관련 시즌/세계관 맥락 보기.

### 30분+ deep session
- 테마 비교;
- 더 큰 전시 큐레이션;
- 아카이브/박물관/역사 탐색;
- 선택적으로 public-safe 커뮤니티 프로젝트 참여.

이 기획은 임의의 일일 행동 하드캡을 추가하지 않습니다. 기존 경제 보호를 위한 diminishing reward가 있더라도 컬렉션 활동 자체를 희소성 연출 목적으로 막지 않습니다.

## 8. D1 / D3 / D7 / D14 / D30

### D1 — 인식
사용자가 골랐던 정확한 테마/의도를 보여줍니다. 핵심 감정은 **“내 선택이 그대로 있다.”**입니다.

### D3 — 인접 의미
관련 아이템, lore, 전시 아이디어, 시즌/직업 연결 중 하나만 제안합니다.

### D7 — 진전 증명
사용자의 컬렉션 경로에서 실제 변화·진전·작은 목표 완료·정직한 다음 단계를 보여줍니다. 놓친 보상이나 streak reset을 강조하지 않습니다.

### D14 — 저작/큐레이션
순서, 설명, 복원, 테마, 아카이브, 전시 선택을 확장합니다.

### D30 — 정체성 아티팩트
공유하지 않아도 가치 있는 컬렉션 챕터/전시가 남고, 원할 경우 public-safe 쇼케이스로 전환할 수 있어야 합니다.

## 9. 획득·퍼널

`회원 쇼케이스 → 수신자 이해 → 프리뷰 → 내 선택 → 맥락형 가입 → 의미 있는 컬렉션 행동 → 첫 가치 증명 → D1 → D7 → D30 → 선택적 자기 쇼케이스`

채널별로 분리 측정:
- 친구 직접 공유;
- Discord/커뮤니티 공유;
- organic search/editorial;
- creator/partner;
- 향후 paid acquisition.

Paid는 CAC를 activation, D7/D30, LTV, contribution margin까지 연결할 수 있을 때만 평가합니다. 값싼 signup이나 share open은 성공이 아닙니다.

## 10. 실험 backlog

### A — preview-before-auth vs auth-first
가설: 30~90초 public-safe preview가 qualified signup과 activation을 높인다.
대상: 비회원 쇼케이스 수신자.
진입점: 쇼케이스 주 CTA.
Control: interaction 전 인증.
Treatment: 프리뷰 후 `저장하고 이어가기` 가입.
Primary: recipient → signup → meaningful activation.
Guardrail: fake signup, privacy complaint, leakage, abuse.
최소 관찰: D7 성숙 cohort + 방향성 판단 가능한 표본.
후속: activation/D7이 좋아지고 trust가 악화되지 않을 때만 채택.

### B — authored choice vs passive lore
가설: 작은 선택 하나가 읽기만 하는 것보다 소유감을 만든다.
Control: lore-only.
Treatment: starter theme/intention 선택 + lore.
Primary: preview→meaningful action, D1 recognition.
Guardrail: confusion, abandonment, accessibility complaint.

### C — contextual signup vs generic signup
가설: `이 테마 저장하고 이어가기`가 `Moneyverse 가입`보다 signup→activation 품질을 높인다.
Guardrail: misleading-copy complaint, OAuth abandonment, fake signup.

### D — first-piece proof vs balance-first
가설: share-entry cohort에서 지갑/잔액보다 컬렉션 선택 상태를 먼저 보여주는 편이 time-to-first-value와 D7을 높인다.
Control: 일반 경제 중심 post-login.
Treatment: 원래 선택한 컬렉션으로 복귀 + first-value proof.
Guardrail: auth/session failure, broken-intent return, support burden.

### E — value-first monetization
가설: artifact→preview→first-value 구간을 광고/구독 방해에서 보호하면 retention-adjusted contribution이 좋아진다.
Primary: D7 + contribution margin.
Guardrail: accidental ad click, ad-induced churn, CWV regression.

## 11. KPI·cohort

Acquisition/preview:
- engaged showcase view;
- primary CTA rate;
- preview start/completion;
- theme/intention choice;
- qualified signup.

Activation:
- signup→meaningful collection action;
- time-to-first-value;
- first-session completion;
- first-goal set rate;
- intent-preservation success signal.

Retention:
- share-recipient D1/D3/D7/D14/D30;
- D1 recognition return;
- D7 collection progress;
- D30 durable collection chapter;
- own-showcase creation;
- second-generation share.

Business:
- CAC/fraud-adjusted CAC;
- share-assisted LTV;
- cohort revenue;
- 반복가치 이후 ARPU/ARPDAU·구독전환;
- retention-adjusted contribution.

Trust guardrails:
- abuse/fake-signup/referral fraud;
- phishing/ATO signal;
- privacy complaint;
- spam/report;
- suspicious reward duplication;
- public/private leakage;
- finance-like claim complaint;
- accidental ad click.

## 12. SEO·콘텐츠 발견

각 preview state, 아이템 선택, 개인 draft마다 indexable URL을 만들지 않습니다.

색인 후보:
- 충분한 컬렉션 가이드;
- lore/역사;
- 시즌/아카이브;
- editorial museum showcase;
- 맥락이 충분한 public-safe community project.

비색인/비공개 유지 대상:
- 개인 preview state;
- private draft;
- 계정 진행상태;
- 잔액/보유/대출/카지노 기록;
- 보안/복구 상태;
- referral claim.

People-first를 유지하고 thin 자동생성, doorway, keyword stuffing, 개인페이지 대량생성을 제외합니다. 신규/저신뢰 UGC는 Moneyverse 도메인에 있다는 이유만으로 검색 노출을 얻지 않습니다.

## 13. 수익화

가치 증명 뒤에 수익화를 붙입니다.

후보:
- 비-P2W showcase/display theme;
- 박물관/공간 전시 꾸미기;
- archive/profile 표현 확장;
- 반복가치 이후 광고제거 구독;
- 명확히 표시된 sponsor/editorial collection content.

금지:
- 컬렉션 완성 확률/경제적 우위 판매;
- WDX/은행/대출/카지노 우위;
- 가짜 희소성;
- 숨겨진 유료 노출순위;
- 현금/투자 가치처럼 보이는 signup reward.

구독은 중요 조건을 명확히 고지하고 결제 전 명시적 동의를 받으며 해지를 단순하게 유지해야 합니다. 해지 마찰을 retention 수단으로 쓰지 않습니다.

## 14. 보안·개인정보·악용

### High — 프리뷰의 비공개 데이터 누출
영향: 스토킹, 표적사기, 당혹, 계정 타기팅.
시나리오: 비공개 인벤토리·잔액·보유·부채·소셜그래프·계정ID·보안상태가 preview/analytics에 포함.
최소조건: public-safe allowlist, 최소수집, 기본 비공개, URL/analytics에 secret/session/recovery 금지.
별도 개발/QA: personalized public preview 전 필요.

### High — `첫 조각 저장/받기` 피싱
영향: credential theft/ATO.
시나리오: 가짜 페이지가 starter item을 약속하며 credential/OAuth code/지갑성 정보를 요구.
최소조건: 일관된 공식도메인·브랜딩, auth 전 유용한 맥락, 공유물 내부 credential/code 요구 금지, asset-loss urgency 금지.
별도 개발/QA: 외부 deep-link/message campaign 전 필요.

### High — 다계정/referral farming
영향: 성장지표 오염·경제 어뷰징.
시나리오: script 계정이 preview/signup을 반복해 starter/referral 보상 채굴.
최소조건: preview/raw signup에 의미 있는 spendable reward 금지, fraud-adjusted CAC, 의심 cohort를 의사결정에서 제외.
별도 개발/QA: 경제적 referral/starter incentive 전 필요.

### High — UGC caption/lore link 악용
영향: 괴롭힘·사칭·doxxing·악성링크.
최소조건: 첫 pilot은 bounded/preset text, 신고/삭제, 외부링크 정책, 실명 강제 금지.
별도 개발/QA: open-ended public UGC 전 필요.

### Medium — 미성년자·행동 개인화
컬렉션 행동으로 민감한 연령특성을 추론하거나 미성년자 맞춤광고를 강화하지 않습니다. 청소년 공개발견·행동광고·낯선 사람 상호작용은 별도 privacy/safety/legal review가 필요합니다.

## 15. Runtime Product Reality Audit — 2026-09-14

공개 서비스 접근 가능.

관찰:
- 홈은 WLD/보상이 game-only 가상데이터임을 명확히 고지;
- 공개 첫 shortcut은 지갑·미니게임·거래소·상점·퀘스트 중심;
- sponsored advertisement 영역이 이미 여러 개 존재;
- 월간 소식은 아직 준비 중;
- 로비는 조용하거나 비어 보일 수 있음;
- 시작 가이드는 login→잔액→퀘스트/직업→복리예금/상점이며 예금·국채·대출·주식 시세차익/배당·패시브소득·`대표 자본가` 성장 서사를 강하게 전면화;
- 현재 홈/가이드에서 public collection showcase→preview→first-piece activation 경로는 확인되지 않음.

시사점: collection viral wedge를 share open으로 평가하면 안 됩니다. referral payout, 광범위 public UGC, mass SEO, 추가 광고를 넓히기 전에 **수신자 이해→내 선택→첫 가치→D1/D7**을 먼저 증명해야 합니다.

## 16. Research note — 2026-09-14

| 출처 | 날짜 | 핵심 | 적용 |
|---|---|---|---|
| Discord Profile Widgets FAQ | 2026-09-08 | 사용자가 관심/게임진행을 직접 선택·재배치·삭제 | **직접채택:** authored choice와 표현 통제 |
| Discord game discovery/social play | 2026-08-20 | discovery를 downstream play/retention과 연결 | **직접채택:** open보다 activation/D7 평가 |
| Xbox achievement improvements | 2026-04-08 | completion을 강조하면서 프로필 숨김 통제 제공 | **직접채택:** 완성 축하 + 공개 통제 |
| Pokémon TCG Pocket community/support | 2026-05-12 업데이트 | collection social transfer에 이용기간/기록 같은 제한 존재 | **참고:** raw signup incentive보다 성숙 후 social action |
| Google UGC spam prevention | 현재 | 신고·spam account 탐지·저신뢰 noindex 고려 권고 | **직접 guardrail:** thin/low-trust showcase 대량색인 금지 |
| Google Site Reputation Policy | 2026-08-28 | host reputation 악용 목적 third-party content 제한 | **직접 guardrail:** collection page를 SEO inventory로 만들지 않음 |
| FTC Shutterstock settlement | 2026-05-13 | 중요조건 고지·명시적 동의·쉬운 해지 강조 | **직접 guardrail:** retention-safe subscription |
| FTC Publishing.com final order | 2026-07 | 수익주장·대가성 endorsement의 근거/공개 문제 | **직접 guardrail:** 숨은 광고/수익 마케팅 금지 |
| 개인정보보호위원회 COPPA 2.0 국외동향 | 2026-04-01 | 미국의 청소년 보호·맞춤광고 제한 논의 소개, 현행 한국법 아님 | **법률 재검토 trigger** |

## 17. 법규·정책 메모

- WLD/WDX는 virtual/simulated/game-only이며 현금가치·예금안전·수익보장·실제 투자기회를 암시하지 않습니다.
- 대가성 creator/member showcase는 해당되는 경우 material relationship을 명확하게 표시해야 합니다.
- 구독/자동갱신은 적용 법규에 따라 중요조건 고지, 명시적 동의, 쉬운 해지를 유지해야 합니다.
- 공개/개인화 collection 경험은 data minimization과 안전한 기본 공개범위를 사용합니다. 미성년자 대상 discovery/ads는 출시 전 최신 한국·미국 privacy/legal review를 별도로 수행합니다.
- 실제 구현/출시 시 법령·정책을 다시 확인합니다. 이 Living Spec은 법률자문이 아닙니다.

## 18. 결정

다음 좁은 성장 검증은 **collection preview-to-first-piece activation**입니다.

아직 확대하지 않을 것:
- wealth/portfolio share card;
- 경제적 referral payout;
- 개인페이지 mass indexing;
- 광범위 public activity feed;
- 공격적 comeback reward;
- 추가 interruptive ad inventory.

다음 성장 질문:

**첫 컬렉션 행동이 충분한 소유감을 만들어 D7 사용자가 보상 때문이 아니라 큐레이션·아카이브·전시를 스스로 깊게 이어가는가?**
