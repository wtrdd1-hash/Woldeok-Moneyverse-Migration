# Woldeok Moneyverse — 장기 미사용 보유품 재활용·큐레이션 리텐션 성장 명세

> 버전: v2026.09.15.101
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-15
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md`
> 영문 기준 문서: [DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.md](DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드는 변경하지 않음

## 1. 이번에 선택한 공백

최신 제품 현실에는 두 변화가 함께 존재한다. `v2026.09.15.98`에서는 회원 marketplace 작업대에 `미장착` 필터와 `오래된 획득순` 정렬이 추가되어 장기 미사용 보유품을 훨씬 쉽게 찾을 수 있게 됐다. 이번 기획 작업 도중 `main`은 다시 `v2026.09.15.100`으로 이동했고 cosmetic sink item 통합이 반영됐다. 즉 보유품의 종류는 계속 넓어지는 동시에 오래된 보유품도 더 잘 보이게 됐다.

따라서 가장 큰 리텐션 공백은 다음이다.

**사용자가 오래된 미장착·중복 보유품을 발견했을 때, Moneyverse가 그것을 다시 정체성·기억·목표로 연결하는가? 아니면 더 큰 카탈로그가 더 많은 잡동사니와 신규획득 압박만 만드는가?**

현재 `/marketplace`는 회원전용 준비 작업대이며 실제 판매등록·구매 mutation을 노출하지 않는다. 플레이어 간 이전·제작 정산도 권위 있는 계약이 구현·검증될 때까지 비활성이다. 이 경계를 그대로 보존하며, 이번 문서에서는 거래 API·에스크로·제작 정산·파괴 규칙·DB 변경을 설계하지 않는다.

## 2. 소비자 약속

**오래된 아이템은 더 사고·팔고·투기하게 만드는 잡동사니가 아니라, 기억·전시·계획·의도적 정리로 다시 의미를 얻어야 한다.**

오래된 보유품을 봤을 때 사용자는 다음을 이해할 수 있어야 한다.
- 내가 이걸 왜 얻었는가?
- 지금도 내 정체성·직업·컬렉션·시즌 기록에 연결되는가?
- 다시 전시할까, 챕터로 묶을까, 일상 화면에서 잠시 치울까, 그냥 둘까?
- 미래 거래/제작이 생기더라도 오늘 이미 가능한 기능처럼 보이지 않는가?
- 아무것도 새로 획득하지 않고도 정리 세션을 만족스럽게 끝낼 수 있는가?

engagement를 만들기 위해 인위적인 inventory scarcity, 저장공간 압박, 강제 청산, 숨은 만료, 거래 강제를 만들지 않는다.

## 3. Stewardship ladder

장기 보유 루프는 다음을 지향한다.

`Acquire → Use → Curate → Reinterpret`

**Acquire:** 정체성·컬렉션·편의·시즌·의미 있는 보상을 위해 획득한다.

**Use:** 장착·전시하거나 현재 경험의 일부로 사용한다.

**Curate:** 무엇이 지금 중요한지 직접 선택한다. feature/group/display/일상 화면에서 보관/later 등이 이에 해당한다.

**Reinterpret:** 새로운 시즌, 직업 복귀, 개인 회고, 전시, 커뮤니티 프로젝트를 통해 과거 아이템이 다시 의미를 얻는다.

`오래됨`과 `미장착`은 발견 신호이지 `쓸모없음` 판정이 아니다.

## 4. 가역적 정리 선택 사다리

오래된 미장착 보유품을 보여줄 때 기본 선택은 가능한 범위에서 가역적이어야 한다.
1. 그대로 보이게 두기
2. 다시 전시·사용하기
3. 시즌·직업·테마·챕터로 묶기
4. 소유·역사를 지우지 않고 일상 화면에서 보관하기
5. 불이익 없이 나중에 다시 보기
6. 실제로 별도 구현·검증된 기능이 존재할 때만 미래 지원 행동 준비하기

현재 marketplace 필터는 후보를 찾는 데 사용할 수 있지만, 필터 결과를 거래가능·이전가능 판정처럼 보이게 해서는 안 된다.

## 5. 사용자 생애주기에서의 역할

### 첫 30초 / 첫 3분 / 첫 세션
inventory cleanup은 신규 사용자 activation 조건이 아니다. 지속형 세계라는 약속, WLD/WDX game-only 경계, 유용한 sample 하나, authored interest 하나가 먼저다. 첫 구매·marketplace 방문·정리는 activation이 아니다.

### D1
처음 고른 thread를 복원한다. 하루 된 계정에 engagement를 만들기 위해 정리 숙제를 주지 않는다.

### D3
최적화·처분보다 이미 가진 것의 의미 있는 사용·이해를 먼저 만든다.

### D7
작은 컬렉션이 생겼다면 한 아이템을 다시 전시하거나 그룹으로 묶는 정도의 가벼운 큐레이션을 제안한다. inventory turnover보다 취향 형성이 우선이다.

### D14
충분한 보유품이 있는 사용자에게 최근/오래된 획득, 장착/미장착, 수량, 고유번호 등을 이용한 선택적 정리 기회를 준다. `나중에`도 정상 outcome이다.

### D30
무엇을 얻었는지, 계속 쓰는지, 챕터로 묶었는지, 의도적으로 치워뒀는지, 다시 발견했는지가 보이는 것이 성공이다. 목표는 **거래횟수가 아니라 역사와 저자성이 있는 보유품**이다.

## 6. 세션 설계

### 1~3분 quick check
- 오래된 미장착 아이템 하나 찾기
- 과거 최애 하나 다시 전시하기
- 한 아이템 그룹화하기
- `나중에` 선택하기
- 아무 손실 없이 종료하기

### 5~15분 meaningful session
`오래된 순 + 미장착` 같은 좁은 필터로 소수의 보유품만 확인하고, 몇 개의 의도적 큐레이션 선택을 한 뒤 짧은 before/after 요약을 보고 명확하게 종료할 수 있어야 한다.

### 30분+ deep session
시즌 아카이브 구성, 갤러리/정체성 공간 재구성, 과거·현재 테마 비교, 개인 회고, public-safe 전시 준비, 실제 출시된 경우에만 미래 거래/제작 계획을 할 수 있다.

큐레이션 자체를 인위적인 행동상한으로 막지 않는다.

## 7. 재해석 루프

- **시즌:** 오래된 테마와 새 챕터의 관계를 설명하되 재판매 가치상승처럼 표현하지 않는다.
- **직업:** 해당 직업으로 복귀할 때 관련 cosmetic/object를 다시 발견하게 한다.
- **컬렉션:** 혼자 떨어져 있던 과거 아이템이 나중에 하나의 챕터·전시 일부가 되게 한다.
- **개인 회고:** `이 시기에 처음 얻었다`는 실제 맥락을 보여주고 다시 전시할지 선택하게 한다.
- **커뮤니티:** private inventory 기본 비공개를 유지하며 opt-in public-safe 전시 기여만 허용한다.

아이템의 나이를 `지금 팔아야 한다`가 아니라 **이야기 맥락**으로 바꾼다.

## 8. Marketplace 경계

별도 구현·검증 전까지 성장 문구에서 다음을 암시하지 않는다.
- 지금 다른 사용자가 내 아이템을 살 수 있음
- 표시된 값이 보장된 시장가격임
- 즉시 WLD로 판매 가능함
- 오래됨·serial·희귀도가 가치상승을 보장함
- cleanup = listing임
- `오래된 순` 또는 `미장착` = 이전 가능품임

향후 player trading이 실제 출시돼도 거래량만으로 리텐션 성공을 판단하지 않는다. 소유권·provenance·안전·공정참여가 우선이다.

향후 판매등록·제작/재활용·선물 기능은 별도 product/security/fraud/legal QA가 필요하다. 비가역 또는 가치변경 행동 전에 사용자는 무엇이 통제에서 빠지는지, 수수료·가격영향, 가역성, provenance/history 손실, 확률형 결과 여부, WLD/WDX의 game-only 성격을 이해해야 한다.

## 9. 바이럴 / 유입 / SEO

공유가치가 있는 것은 private inventory 양이 아니라 사용자의 authored transformation이다.
- 정리 전/후 갤러리
- 다시 발견한 최애 아이템
- 시즌 아카이브 챕터
- 직업 히스토리 선반
- 오래된 보유품으로 만든 큐레이션 세트
- opt-in 커뮤니티 전시 기여

수신자 funnel:

`public-safe artifact → 테마/이야기 이해 → 유용한 sample → authored interest → 필요 시 contextual signup → meaningful action → D7`

개인 보유품은 SEO 자산이 아니다. 사용자 holdings, 계정과 연결된 획득일, private serialized holdings, 구매기록, cleanup recommendation, draft listing, 잔액·부채·카지노·security·recovery 상태를 색인하지 않는다.

public season retrospective, 전시/큐레이션 가이드, fictional item lore/provenance, workbench와 미래 거래의 차이를 설명하는 공식 안내를 우선한다. `아이템 × 사용자 × 획득일 × 희귀도` 페이지를 대량 생성하지 않는다.

## 10. 수익화

잡동사니 자체를 monetization trigger로 만들지 않는다.
- 카탈로그 증가를 이유로 기본 정리를 유료화하지 않는다.
- 기본 inventory capacity를 줄여 storage relief를 팔지 않는다.
- cleanup session이 길다는 이유로 광고를 늘리지 않는다.
- item과 비가역/이전 결정 사이 sponsor를 끼우지 않는다.
- 반복조회나 attachment를 이용해 몰래 가격을 올리지 않는다.
- `오래된 아이템 가치가 떨어진다`는 압박문구를 쓰지 않는다.

반복가치와 애착이 확인된 뒤 non-P2W gallery/archive theme, presentation cosmetic, 적절한 public editorial sponsorship, 투명한 subscription benefit을 검토할 수 있다.

보호구간:

`오래된 보유품 발견 → 맥락 이해 → 큐레이션 → 보존상태 확인 → 종료`

## 11. Funnel과 KPI

핵심 funnel:

`보유 역사 존재 → 정리 후보 발견 → keep/feature/group/later 선택 → 정리 결과 확인 → D7/D14 자발적 재방문 → D30 durable chapter → 선택적 재해석/공유`

핵심 지표:
- 오래된/미장착 발견 → meaningful curation
- 신규획득 없는 cleanup completion
- old-item re-feature rate
- grouping/chapter rate
- voluntary cleanup-session finish
- cleanup 후 D7 return
- D14 두 번째 자발적 curation session
- D30 durable-history coverage
- season/profession reinterpretation rate
- share → visit → activation → D7

품질 진단:
- search/filter success 및 zero-result recovery
- 원하는 보유품을 찾는 시간
- 의미 있는 선택 전 abandonment
- `그대로 두기`/`나중에`도 정상 outcome으로 측정
- missing/hidden item 문의
- workbench와 live trading 오인율

수익·경제 지표는 retention 아래에 둔다. retention-adjusted shop spend, purchase→actual-use/display, ARPU/ARPDAU, LTV/CAC, ad-induced churn, fraud/support 비용 반영 contribution margin을 함께 본다.

신뢰 guardrail에는 phishing/ATO, multi-account/reward duplication, inventory privacy complaint, 향후 wash trading/collusion/manipulation, bot sniping, finance-like appreciation misunderstanding, youth pressure, public/private leakage가 포함된다.

## 12. 실험 backlog

### A. 오래된 아이템 재해석 vs 신규 아이템 추천
충분한 보유품과 오래된 미장착 아이템이 있는 사용자를 대상으로, 신규획득 추천 전에 `오래된 아이템 하나 다시 발견` 경로를 보여준다. 주지표는 D30 durable history/reinterpretation. D30 성숙 cohort까지 관찰하며 매출급락·혼동·압박·privacy·abuse를 guardrail로 둔다.

### B. Cleanup 종료요약 vs endless grid
`확인/다시전시/그룹/나중에` 요약과 `오늘은 여기까지`를 제공한다. 주지표는 voluntary-finish 만족도와 D7 return. 강제 세션연장·support burden·잘못된 count를 감시하며 주간 성숙 cohort 2개 이상 관찰한다.

### C. 중립 stewardship 문구 vs 청산 framing
`다시 발견/정리/유지`와 `미사용 가치/정리판매/나중에 팔기` 같은 거래중심 문구를 비교한다. 주지표는 meaningful curation과 `현재 live trading이 아님` 이해도. support ticket·금융가치 오인을 guardrail로 둔다.

### D. 시즌 재해석 vs 신규 rotation만 홍보
관련된 기존 보유품 하나를 새 테마와 연결하고 선택적으로 신규 콘텐츠를 보여준다. 주지표는 D14 meaningful session과 old-item reuse/display. privacy·false provenance·FOMO·notification opt-out을 감시한다.

### E. Private cleanup vs opt-in public transformation artifact
사용자가 직접 고른 테마·결과만 포함하고 exact holdings/잔액/history는 제외한 public-safe before/after artifact를 제공한다. 주지표는 recipient→useful preview→meaningful activation→D7. privacy·spam·referral fraud·phishing·leakage를 감시한다.

## 13. 보안·악용·개인정보 검토

### HIGH — marketplace/cleanup 사칭 phishing·ATO
`오래된 아이템 발견`, `미사용 아이템 판매`, `보관 확인`, `marketplace 가치 수령` 등을 사칭할 수 있다. 최소조건은 canonical domain/brand 일관성, password·OAuth code·recovery code 요구 금지, URL에 secret/session/recovery 정보 금지다. 신규 외부 cleanup 메시지 전 별도 QA가 필요하다.

### HIGH — private inventory leakage
exact holdings, serial, acquisition history는 표적 사기에 악용될 수 있다. holdings private-by-default, public-safe allowlist, 명시적 sharing scope, cleanup analytics/share URL에서 balance/debt/casino/security/moderation 상태 제외가 필요하다.

### HIGH — 미래 wash trading·collusion·multi-account abuse
raw cleanup/list/open/share에 meaningful WLD/WDX를 보상하지 않는다. 기존 account-age, eligibility, anomaly, replay, ledger 경계를 유지한다. player trading은 별도 fraud/market-integrity QA가 필요하다.

### HIGH — destructive-action manipulation
향후 recycle/craft/destroy가 생긴다면 비가역성을 명확히 검토 가능하게 보여주고 history/serial loss를 설명해야 하며 destructive action을 기본 cleanup 선택으로 둘 수 없다.

### HIGH — 금융형 가치상승·투기 framing
old/rare/serialized item을 보장상승 투자자산처럼 홍보하지 않는다. game-only 고지, 현금가치·보장수익·투자안전 claim 금지를 유지한다.

### MEDIUM — inventory history 기반 프로파일링
private holding history를 광고/third-party analytics에 기본 전송하거나 attachment/cleanup behavior로 hidden individualized pricing을 만들지 않는다. 신규 tracking/pricing 실험은 privacy/legal review가 필요하다.

## 14. 법규·정책 주의

한국에서는 개인정보 처리 현실과 고지가 일치해야 한다. 개인정보보호위원회가 2026년 7월 TikTok·Apple 사건에서 타사 행태정보 등 개인정보의 적법한 처리근거, 실질적 동의권, 국외이전 고지 문제를 다시 집행한 만큼 inventory age·구매이력·attachment 신호를 무제한 광고 profile로 확장하지 않는다.

미국 FTC의 2026년 8월 personalized-pricing enforcement-policy statement는 **아직 제안 단계이며 최종 규칙이 아니다.** 2026년 9월 의견수렴 기간 연장도 진행 중임을 명시한다. Moneyverse는 법적 확정 여부와 별개로 cleanup/attachment history가 숨은 개인별 가격을 결정하지 않는 보수적 원칙을 채택한다.

FTC의 2026년 7월 Elite Events 조치는 scarcity/resale 시장이 fake account·proxy·구매제한 우회를 유발할 수 있다는 방향성 근거로만 사용하며, BOTS Act가 Moneyverse 가상아이템에 직접 적용된다고 단정하지 않는다.

## 15. Research note — 2026-09-15 검토

**직접 채택:** Epic Games Fortnite Archive 현행 지원문서(삭제가 아닌 가역적 숨김), Pinterest 2025-10-27 board personalization(저장 콘텐츠의 정리·취향 형성을 통한 반복가치), Steam 현행 Trade Protected Items 안내(아이템 거래는 별도 보안·보호 경계).

**참고/guardrail:** FTC Elite Events 2026-07, FTC personalized-pricing 제안 및 2026-09 의견기간 연장, eBay Authenticity Guarantee collectible coins 확대 2026-08-18, Discord Trust & Safety phishing 안내 2026-07-23 갱신, 개인정보위 TikTok·Apple 제재 2026-07-27.

## 16. Runtime Product Reality Audit — 2026-09-15

Production 공개 홈은 접근 가능하며 WLD/보상이 game-only·비현금성 데이터임을 명확히 안내한다. 첫 화면은 여전히 여러 shortcut과 sponsored placement를 persistent-world 설명 전후에 함께 보여준다.

저장소 기준 authenticated marketplace는 member-only/noindex이고 search, category, rarity, effect, 최소수량, 획득기간, equipped/unequipped/serialized, newest/oldest를 제공한다. 필터가 거래가능 여부를 뜻하지 않는다고 명시하며, listing/purchase mutation을 노출하지 않고 권위 있는 transfer/crafting 계약이 구현·검증되기 전까지 실제 거래를 활성화하지 않는다.

이번 기획에서는 회원계정으로 Production marketplace를 독립 E2E 실행하지 않았다. 따라서 Runtime verification은 **부분 가능**이다. 공개 Production은 확인했고 authenticated marketplace는 최신 `main` 구현을 확인했으나 Production E2E는 미검증이다.

## 17. 결정

identity-safe merchandising 다음 성장 bridge로 **dormant-inventory stewardship**를 채택한다.

핵심 가설:

`오래된 보유품 발견 → 의미 이해 → keep/feature/group/later → authored 정리 결과 → 자발적 복귀 → D30 durable history → 선택적 public-safe 재해석`

이번 문서-only 회차에서는 live trading, destructive cleanup, reward-heavy marketplace action, public inventory exposure, hidden individualized pricing, finance-like item valuation을 확대하지 않는다.
