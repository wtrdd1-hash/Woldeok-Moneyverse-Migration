# Woldeok Moneyverse — 컬렉션 아카이브→시즌 재해석 성장 기획

> 버전: v2026.09.14.62
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.md](COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.md)
> 변경 유형: 문서-only; 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번 회차에서 선택한 공백

직전 컬렉션 기획으로 검색/공유 유입, 가입 전 프리뷰, 첫 의미 있는 소유 상태, D1 인식, D7 큐레이션, D30 durable chapter까지 연결했습니다. 이제 가장 큰 리텐션 공백은 **그 챕터가 어느 정도 완성된 뒤**입니다.

**왜 D30~D90 사용자가 완성한 컬렉션을 끝난 콘텐츠로 버리지 않고 다시 돌아와 보게 되는가?**

이번에 좁힌 루프는 다음입니다.

`D30 durable chapter → 손실 없이 아카이브 → 조용한 기간 → 새 시즌/맥락 신호 → 오래된 조각·챕터 하나 재해석 → 사용자가 만든 before/after 의미 → D60/D90 복귀 → 선택적 공개 전시/공유 → 다음 시즌 기억`

목적은 강제 소멸, 만료되는 소유권, 자산 경쟁, 끝없는 신규 아이템 공급이 아니라 **기억과 재해석**으로 장기 복귀를 만드는 것입니다.

이 문서는 archive DB 테이블, season migration, scheduler job, notification API, ranking service, moderation backend 같은 구현 상세를 새로 정의하지 않습니다.

## 2. 소비자 약속

**“챕터를 끝냈다면 쓸모없어지는 것이 아니라 내 역사로 남아야 한다.”**

장기 컬렉션 사용자는 다음 네 가지를 이해해야 합니다.
- **보존:** 내가 완성한 것은 그대로 남고 나중에도 이해할 수 있다.
- **맥락:** 새 시즌이 오래된 챕터를 다시 흥미롭게 만들 수 있지만 원래 역사는 덮어쓰지 않는다.
- **저자성:** 다시 해석할지, 전시할지, 공유할지는 내가 고른다.
- **갱신:** 새 챕터는 이전 노력을 무효화하지 않고 새로운 관점을 더한다.

장기 리텐션을 다음 방식으로 만들지 않습니다.
- 오래된 컬렉션 삭제·성능 저하;
- 돈을 내지 않으면 오래된 아이템의 의미나 기본 보존이 사라지는 구조;
- 아카이브 유지에 일일 출석 요구;
- `지금 안 오면 기록을 잃는다`는 메시지;
- WLD 자산, WDX 수익률, 부채, 카지노 활동, 실제 결제액 중심 장기 랭킹;
- 새로움을 만들기 위해 아이템만 계속 대량 추가하는 방식.

## 3. D30 — 오래 남는 챕터를 봉인한다

D30에는 한 컬렉션 스레드를 하나의 챕터로 기억할 수 있어야 합니다.

기초 세트를 100% 획득하지 않았더라도 사용자가 의미를 만들었다면 하나의 보존 가능한 챕터가 될 수 있습니다. 예시는 다음과 같습니다.
- 사용자가 고른 대표 조각;
- 선택한 배열이나 묶음;
- 안전한 범위의 짧은 주석·테마 라벨;
- preset 기반 `이 챕터에서 중요했던 것` 선택;
- 시즌/lore 맥락;
- 비공개 archive cover 또는 표현 스타일.

아카이브 순간은 다음 질문에 답해야 합니다.
1. 무엇으로 시작했는가?
2. 무엇을 이해·완성·큐레이션했는가?
3. 무엇을 남기기로 했는가?
4. 비공개/링크공개/명시적 공개 중 어느 상태인가?
5. 앞으로 어떤 맥락이 생기면 다시 볼 가치가 생기는가?

챕터를 보존하기 위해 결제할 필요가 없어야 합니다.

## 4. 조용한 기간을 허용한다

장기 리텐션은 컬렉션이 잠시 조용해져도 실패로 취급하지 않아야 합니다.

D30 이후 일정 기간에는:
- streak 손실이 쌓이지 않고;
- 자산 손실 위협을 보내지 않고;
- 반복적인 `지금 수령` 알림을 요구하지 않고;
- 사용자가 직업·공간·사업·커뮤니티 등 다른 시스템을 이용해도 되며;
- 의미 있는 새 맥락이 생길 때까지 컬렉션은 안정된 기억으로 남습니다.

복귀가 의무가 아니라 **의미 있는 선택**으로 느껴져야 장기 애착이 형성됩니다.

## 5. D60+ 재해석 트리거

오래된 챕터는 실제 이유가 있을 때만 다시 주목시킵니다.

유효한 재해석 계기:
- 같은 테마와 연결되는 새 시즌;
- 맥락을 바꾸는 새 가상기업·직업·도시 이야기;
- 운영 검토 editorial museum/exhibit 테마;
- 원래 provenance를 바꾸지 않는 복원·재프레이밍;
- 서로 다른 시기의 개인 기록을 연결하는 retrospective;
- 사용자가 opt-in한 클럽/도시 문화 프로젝트;
- 오래된 조각이 왜 중요했는지 설명하는 새 lore.

재해석 안내에는 반드시 다음이 보여야 합니다.
- **과거:** 어떤 보존된 챕터·조각인가;
- **현재:** 어떤 시즌·이야기·맥락이 새로 생겼는가;
- **행동:** 사용자가 자발적으로 할 수 있는 큐레이션 한 가지;
- **불변:** 원래 역사/provenance와 비공개 상태는 무엇이 그대로인지.

알림을 보내기 위해 만든 가짜 이벤트는 금지합니다.

## 6. 시즌 브리지 — FOMO 없이 기대감 만들기

기존 `SEASON_SYSTEM_SPEC.md`는 시즌 종료 후 identity와 archive를 남기는 원칙을 이미 갖고 있습니다. 이번 문서는 그 위에 소비자 복귀 계약을 추가합니다.

### D-14 — relevance preview
기존 컬렉션·직업·역사 중 어떤 것이 새 시즌에서 다시 흥미로워지는지 보여줍니다. 경제적 이득을 보장하는 것처럼 표현하지 않습니다.

### D-7 — 오래된 스레드 하나 선택
사용자가 새 시즌으로 이어갈 과거 챕터 하나를 직접 고릅니다. 관심 표시일 뿐 경제적 약정이 아닙니다.

### D-3 — 연결 이유 설명
왜 그 오래된 챕터가 새 테마와 연결되는지 한 가지 명확한 이유만 보여줍니다. countdown 압박이나 `뒤처진다`는 표현을 피합니다.

### D-1 — 시작점 준비
짧은 recap과 되돌릴 수 있는 다음 행동 하나를 제공합니다. 준비를 위해 결제·거래·대출·카지노 이용을 요구하지 않습니다.

### 시즌 시작
이 코호트의 첫 화면은 보상 벽이 아니라 `과거 의미 → 새 맥락 → 내가 고를 행동 하나`여야 합니다.

## 7. 재해석 후 첫 세션

### 첫 30초
사용자는 다음을 이해해야 합니다.
- 어떤 오래된 챕터를 다시 보는지;
- 왜 지금 다시 관련 있는지;
- 원래 챕터가 그대로 보존된다는 점;
- 지금 탐색하거나 바꿀 수 있는 한 가지.

### 첫 3분
낮은 마찰의 행동 하나를 할 수 있어야 합니다.
- 새로운 대표 조각 선택;
- 새 시즌 라벨/맥락 추가;
- `그때 vs 지금` 비교;
- 새로운 전시·테마와 연결;
- 아무것도 바꾸지 않고 새 맥락만 archive에 남기기.

### 5~15분 meaningful session
- 두 챕터를 anthology로 묶기;
- museum/archive 표현 다시 꾸미기;
- 컬렉션 역사를 직업·공간·시즌 이야기와 연결;
- 비공개 retrospective 만들기.

### 30분+ deep session
privacy/moderation/public safety 준비가 된 뒤에만 더 풍부한 exhibit나 community project를 허용합니다.

## 8. 장기 기억 사다리

장기 컬렉션 루프를 다음과 같이 확장합니다.

`Acquire → Understand → Complete → Curate → Preserve → Revisit → Reinterpret → Anthologize`

- **Preserve:** 안정적인 챕터를 남긴다.
- **Revisit:** 새 보상이 없어도 다시 본다.
- **Reinterpret:** 원래 역사는 유지하면서 새 맥락을 더한다.
- **Anthologize:** 여러 시즌·챕터를 연결해 사용자가 만든 기록으로 만든다.

성공은 inventory 수량이 아니라 이 단계 사이 이동으로 측정합니다.

## 9. 퍼널과 코호트

핵심 장기 퍼널:

`D30 durable chapter → archive revisit → D60+ 유효한 재해석 계기 → reinterpretation preview → 의미 있는 큐레이션 행동 → 복귀 후 D7 → 다음 시즌 연속성 → D90/multi-season retention → 선택적 공유`

분리해서 볼 코호트:
- 최초 유입 채널;
- 첫 컬렉션 의도(`complete`, `learn`, `curate`, `display`);
- 챕터 연령(30~59일, 60~89일, 90일+);
- 현재 시즌 참여 여부;
- 비공개 vs 명시적 공개;
- 기존 활성 사용자 vs 복귀 사용자;
- 법적으로 안전하고 필요한 경우에만 연령민감 코호트.

자연스럽게 옛 기록을 다시 보는 사용자와 경제적 인센티브에만 반응하는 사용자를 하나로 평균내지 않습니다.

## 10. KPI 추가

### 장기 리텐션
- D30 chapter-preservation rate;
- D60 archive revisit rate;
- valid-context reinterpretation rate;
- reinterpretation → meaningful action;
- D7-after-reinterpretation return;
- D90 / multi-season retention;
- old-chapter-to-new-season continuation;
- anthology creation rate;
- 경제 보상 없이 발생한 reinterpretation session 비율.

### 브랜드 / 바이럴
- archive/anthology share intent;
- opt-in public exhibit rate;
- 수신자 engaged-read → 맥락 탐색 → activation → D7;
- hide/unpublish/remove rate;
- branded/direct returning share.

### 수익성
- 컬렉션 의도별 D60/D90 LTV;
- 반복 애착 뒤 cosmetic/presentation 매출;
- archive/season 복귀 중 ad-induced churn;
- 충분한 반복 가치 이후 subscription conversion;
- retention-adjusted contribution.

### 신뢰 guardrail
- privacy complaint;
- public/private leakage;
- `archive updated`, `season memory` 사칭 phishing/ATO signal;
- fake prestige/bot/multi-account manipulation;
- UGC report;
- suspicious reward duplication;
- accidental ad click;
- FOMO/pressure complaint;
- finance-like claim complaint.

## 11. 실험 backlog

### A. 재해석 vs 신규 아이템 중심
가설: 오래된 챕터와 실제 새 맥락의 연결이 새 아이템만 보여주는 것보다 D90 애착을 높인다.
대상: D30 durable chapter 보유 사용자.
진입점: D30 이후 첫 관련 시즌/맥락 업데이트.
Control: 새 시즌/새 아이템 피드.
Treatment: `오래된 챕터 → 새 맥락 → 큐레이션 행동 하나`.
Primary: reinterpretation meaningful-action rate, D7-after-return.
Guardrail: 혼란, 압박 피드백, privacy exposure, 시즌 이탈.
관찰: 가능하면 D90 성숙 코호트; 그 전에는 D7/D30-after-trigger를 방향성 지표로만 사용.
후속: 장기 연속성이 좋아지고 신뢰 악화가 없을 때만 기본화.

### B. 사용자 선택 과거 챕터 vs 시스템 선택 memory
가설: 사용자가 직접 고른 과거 챕터가 자동 생성 memory보다 소유감을 높인다.
대상: eligible chapter 2개 이상 사용자.
Control: 시스템이 하이라이트 챕터 선택.
Treatment: 사용자가 이어갈 챕터 선택.
Primary: reinterpretation action, next-season continuation.
Guardrail: 선택마비, 후회, private exposure.
관찰: 가능하면 두 번 이상의 season-transition cohort.

### C. 영구 archive vs 만료형 comeback incentive
가설: `기록은 그대로 남아 있다`는 메시지가 `지금 안 오면 만료`보다 더 건강한 복귀를 만든다.
Control: 시간제한 보상/복귀 압박.
Treatment: preservation-first recap + 현재 맥락 행동 하나.
Primary: D7-after-return, D30-after-return.
Guardrail: FOMO complaint, reward inflation, churn farming, multi-account abuse.
관찰: 최소 2개 성숙 복귀 코호트.

### D. anthology recap vs raw activity statistics
가설: 세션수·거래수·자산액보다 사용자가 만든 여러 시즌 이야기 묶음이 공유 의향과 브랜드 복귀를 높인다.
Control: 숫자형 activity recap.
Treatment: 사용자 선택 favorite/curation 중심 chapter anthology.
Primary: meaningful revisit/share intent, 이후 D30 return.
Guardrail: privacy regret, 위험행동 미화, 금융성 오인.
관찰: retrospective cycle 1회 이상.

### E. 재해석 후 수익화 vs 가치 전 수익화
가설: `archive → reinterpretation → authored action`까지 광고/업셀 방해를 막으면 retention-adjusted contribution이 높아진다.
Control: 재해석 행동 전에 reviewed ad/cosmetic upsell.
Treatment: 약속한 맥락·행동 완료 후 수익화.
Primary: D30-after-trigger + contribution margin.
Guardrail: ad-induced churn, accidental click, subscription complaint, CWV regression.
관찰: 충분한 monetization volume + 성숙 D30 cohort.

## 12. SEO와 acquisition

장기 SEO 자산은 개인별 비공개 archive가 아니라 **그 자체로 읽을 가치가 있는 공개 맥락**입니다.

색인 후보:
- 충분한 설명이 있는 season archive;
- editorial museum/exhibit;
- 가상기업/직업 역사;
- 독창적 설명이 있는 collection/lore guide;
- 명시적 공개 동의가 있는 club/city project retrospective;
- 충분한 독창성이 있고 trust review를 거친 opt-in public anthology.

기본 비공개/noindex/unlisted 후보:
- personal archive dashboard;
- private anthology;
- balance/holding/debt/casino history;
- account/security/recovery/moderation state;
- 얇은 자동생성 memory 페이지;
- referral/claim 페이지.

Google의 현재 people-first 가이드는 콘텐츠가 독창적이고 충분하며 검색노출과 무관하게 사용자에게 유용해야 한다고 권고합니다. Naver도 실제 사용자 가치, 정확한 제목·설명과 검색 전용 스팸 회피를 강조합니다. 따라서 archive 성장의 목표는 페이지 수가 아니라 콘텐츠 가치입니다.

Organic funnel:
`유용한 season/lore archive → 관련 collection 탐색 → qualified signup/comeback → owned chapter → D30 보존 → 이후 재해석 → D90/multi-season return → retention-adjusted contribution`

## 13. 바이럴과 브랜드 영향

권장 장기 공유물:
- `그때 vs 지금` 컬렉션 챕터;
- 사용자 authored anthology cover;
- 두 시즌에 걸친 favorite piece;
- museum/exhibit transformation;
- 사용자 선택 reflection 하나가 있는 season history;
- 공개 동의가 있는 club/city cultural project 결과.

기본 prestige 서사로 WLD 자산, WDX 수익률, 부채 규모, 카지노 결과, 세션 시간을 사용하지 않습니다.

브랜드 방향:
**Moneyverse는 사용자의 선택을 기억하고 시간이 지나며 새로운 의미를 붙일 수 있는 곳이어야 한다.**

## 14. 수익화

애착 이후 자연스러운 수익화 후보:
- archive/museum theme;
- anthology cover/layout cosmetic;
- room/gallery presentation cosmetic;
- 비-P2W restoration/reframing style;
- 반복 가치 확인 후 광고제거 구독;
- 명확히 광고/스폰서임을 표시한 editorial/cultural exhibit.

판매하지 않는 것:
- 기록을 보존할 권리;
- 더 좋은 WDX/대출/카지노 결과;
- 숨겨진 sponsored prestige/search ranking;
- 기본 privacy control;
- 가짜 희소성·asset-loss threat;
- `잃은 가치를 복구` 같은 금융성 표현.

구독 조건은 결제 전에 명확해야 하고, informed affirmative consent가 필요하며, 해지는 단순해야 합니다.

## 15. 보안·개인정보·악용 검토

### High — private history leakage
사용자 영향: 스토킹, 사기, 당혹감, 표적형 계정 공격.
악용 시나리오: archive/anthology가 잔액, 보유, 부채, 비공개 관계, 계정 연령, 보안/복구 상태, 실명정보를 노출.
최소 보호조건: public-safe allowlist, 기본 비공개, 명시적·되돌릴 수 있는 공개, 공유 전 preview, URL/analytics에 secret/session/recovery 값 금지.
별도 개발/QA: 개인화 public archive/anthology 전에 필요.

### High — archive/season 사칭 phishing 및 ATO
사용자 영향: credential theft, account takeover.
악용 시나리오: `archive가 변경됨`, `season memory 만료`, `복원된 희귀 조각 받기`를 사칭해 credential/OAuth code 요구.
최소 보호조건: 공식 도메인/브랜드 일관성, asset-loss 긴급성 금지, 알림에 민감정보 금지, 콘텐츠 내부 credential/auth code 요구 금지.
별도 개발/QA: 이메일/푸시/외부 deep-link 전에 필요.

### High — prestige/social-proof manipulation
사용자 영향: 신뢰 왜곡, 실험 데이터 오염.
악용 시나리오: bot/다계정으로 exhibit view, archive prestige, referral attribution 조작.
최소 보호조건: archive open/view/share 자체에 의미 있는 WLD/WDX 보상 금지, fraud-adjusted metric, public prestige 전 abuse-resistant eligibility.
별도 개발/QA: 경제·사회적 ranking reward 전 필요.

### High — public exhibit UGC abuse
사용자 영향: 괴롭힘, 사칭, doxxing, 악성링크, 유해 콘텐츠.
최소 보호조건: 초기 pilot bounded/preset text, 신고/삭제, 안전한 outbound-link 정책, 실명 강제 금지, 공개 opt-in.
별도 개발/QA: open-ended public annotation 전 필요.

### Medium — 미성년자·관심추론 광고
장기 컬렉션은 관심사와 행동패턴을 드러낼 수 있습니다. archive history로 민감특성을 추론하거나 미성년자 맞춤광고를 강화하지 않습니다. 청소년 대상 공개 discovery, stranger interaction, 새 tracking vendor, personalized ads는 최신 법률·개인정보·안전 검토가 필요합니다.

## 16. 법규·정책 주의점

- WLD/WDX는 virtual/simulated/game-only이며 투자·예금·증권·현금가치·수익보장으로 표현하지 않습니다.
- 스폰서 exhibit/creator relationship은 이해관계가 있으면 명확히 표시해야 합니다.
- 미국 subscription/negative-option 규정은 변화 중입니다. FTC의 2026년 3월 ANPRM과 5월 Shutterstock 사건은 중요조건 고지, 명시적 동의, 쉬운 해지를 계속 강조합니다.
- 공개 사용자 artifact에는 공개 동의와 삭제/숨김 통제가 필요하고, 미성년자는 보수적으로 다룹니다.
- 공개 UGC 확대, 경제적 referral reward, personalized advertising, 새 tracking vendor는 한국+미국 출시 시점 재검토가 필요합니다.

## 17. Runtime Product Reality Audit — 2026-09-14

공개 서비스 `https://easy-scraping.com/` 접근 가능.

확인 사항:
- WLD/보상이 game-only 가상 데이터임을 명확히 표시;
- 홈 첫 진입은 여전히 지갑·게임·거래소·상점·퀘스트 shortcut 중심;
- sponsored advertisement가 이미 여러 곳 존재;
- 월간 공개 소식은 아직 준비 중;
- lobby는 비어 보일 수 있음;
- `/announcements`에는 현재 공개 공지가 없지만 광고 영역은 존재;
- `/guide`는 예금·국채·대출·가상주식 시세차익/배당·사업·카지노를 초반부터 강하게 설명하는 금융/경제 중심 서사 유지.

`D30 archive → D60 reinterpretation → next-season authored return` 런타임 경로는 확인되지 않았습니다. 현재는 구현된 기능이 아니라 검증해야 할 기획 가설입니다.

## 18. Research note — 2026-09-14

| 출처 | 날짜 | 핵심 시사점 | 적용 |
|---|---|---|---|
| FIFA Collect — Dynamic Collectibles for World Cup 2026 | 2026-06-26 | 수집품이 이벤트와 함께 변화하며 정적인 보유물이 아니라 오래 남는 역사 기록이 될 수 있음 | **`living memory/history` 원칙만 직접 채택.** 거래가치·희소성·실물효용은 채택하지 않음 |
| FIFA Collect — Dynamic Match Collectible 페이지 | 2026-09-14 확인 | 실제 결과가 한 이벤트의 영구적 역사 챕터로 남는 프레이밍 | **참고** |
| Discord — Profile Widgets FAQ | 2026-09-08 업데이트 | 사용자가 공개 정체성 요소를 직접 선택·재배치·삭제 가능 | **사용자 공개통제·가역성 직접 채택** |
| Google Search Central people-first content | 2026-09-14 확인 | 독창적·충분·사용자에게 직접 유용한 콘텐츠 우선 | **archive/SEO 색인 기준에 직접 채택** |
| Naver Search Advisor content/basic/markup | 2026-09-14 확인 | 실제 사용자 가치, 정확한 고유 제목·설명, 검색만을 위한 콘텐츠 회피 | **한국 검색 discovery에 직접 채택** |
| Google Search Preferred Sources global rollout | 2026-04-30 | 사용자가 직접 선택한 반복 정보원/출처에 더 높은 관심을 보이는 구조 | **사용자 선택형 복귀 경로 참고**; Moneyverse 성과 예측치로 사용하지 않음 |
| FTC Negative Option ANPRM | 2026-03 | 구독·자동갱신 규정이 여전히 검토 중 | **법적 guardrail/launch-time 재검토** |
| FTC Shutterstock settlement | 2026-05 | 중요조건 고지, express informed consent, simple cancellation 강조 | **구독 신뢰 guardrail 직접 채택** |

## 19. 변경하지 않은 것

- 런타임 코드, DB schema, API contract, 인증 흐름, security architecture, migration, scheduler, infrastructure, deployment 동작을 변경하지 않았습니다.
- 기존 auth/session/RBAC/admin/ledger/privacy/ad/community security boundary를 유지합니다.
- 시즌 구현 상세는 계속 `SEASON_SYSTEM_SPEC.md`가 기준이며 이번 문서는 소비자 성장 프레이밍만 추가합니다.
- 오래된 컬렉션 보유, 재해석, 공유, public display에 경제적 우위를 추가하지 않습니다.

## 20. 다음 성장 우선순위

다음에 좁게 검증할 루프:

`D30 보존 챕터 하나 → 진짜 새 시즌 맥락 하나 → 자발적 재해석 행동 하나 → 복귀 후 D7 → D90/multi-season retention`

이 루프가 privacy/fraud/phishing/pressure를 악화시키지 않고 장기 리텐션을 올리는 증거가 생기기 전에는 public prestige leaderboard, 경제적 referral payout, 대량 개인페이지 SEO, open-ended public annotation, archive 기반 행동광고, 추가 interruptive ad inventory를 확대하지 않습니다.