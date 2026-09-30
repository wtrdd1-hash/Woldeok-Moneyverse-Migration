# 국고·세금·참여도 조사 검토 — v2026.10.01.492

> 상태: EVIDENCE INPUT / 기획 근거
> 날짜: 2026-10-01
> 기준언어: 영문
> 영문 원문: [TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.md](TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.md)
> 제품 권위: PROJECT_PLAN / ADMIN_TREASURY_MANAGEMENT_SPEC가 명시적으로 채택한 부분만 권위가 된다.
> 런타임 완료 주장: 없음.

## 1. 조사 질문

Moneyverse에서 일반 플레이를 벌주는 느낌 없이 가상 세금·수수료 종류를 더 세분화하고, 걷힌 국고를 유휴잔액이 아니라 눈에 보이는 새 활동으로 어떻게 순환할 것인가?

이번 검토는 직접 관련성이 높은 자료를 재확인한 targeted review이며 대규모 코퍼스 전수 수동검토 주장이 아니다.

## 2. 직접 확인한 패턴

### 2.1 EVE Online — 주문 수수료와 거래 성립세 분리

CCP의 현행 지원문서는:
- 비즉시 주문 생성 시 broker fee;
- 판매 후 seller sales tax;
- Broker Relations / Accounting 및 standing에 의한 제한형 fee 감소를 분리한다.

출처:
- EVE Online Support, “Broker Fee and Sales Tax,” 2026-03-02 갱신:
  https://support.eveonline.com/hc/en-us/articles/203218962-Broker-Fee-and-Sales-Tax

Moneyverse 적용:
- 장터 판매세와 listing/broker/reprice fee를 분리한다.
- commit 전 fee를 보여준다.
- 숙련할인은 핵심세 면제가 아니라 지정 서비스 fee의 공개된 floor 안에서만 허용한다.

### 2.2 Old School RuneScape — 거래세 + 아이템 제거 개입

OSRS 커뮤니티 위키는 Grand Exchange tax와 수집된 가치 일부를 선택 아이템 매입·삭제에 사용하는 item-sink 구조를 설명한다. 정확한 현행 게임 수치는 Moneyverse 기본값으로 복제하지 않는다.

출처:
- OSRS Wiki, Grand Exchange tax/item sink:
  https://oldschool.runescape.wiki/w/Grand_Exchange

관련 실증연구는 causal inference로 해당 개입을 분석하여 연구한 tax boundary에서 거래량의 의미있는 감소를 찾지 못했고, item sink가 luxury 가격을 높일 수 있음을 보고했다.

출처:
- Hogan-Hennessy, Xenopoulos & Silva:
  https://arxiv.org/abs/2210.07970

Moneyverse 적용:
- 세금액/sink액 자체를 성공지표로 쓰지 않는다.
- 품목군 가격·거래량·대체수요·집중·구매력을 함께 본다.
- item buyback/salvage는 allowlist, reference-price band, 조작방지가 있어야 한다.

### 2.3 New World — 세금과 settlement upkeep/Town Project 연결

Amazon Games의 settlement/governance 자료는 지역 세금·수수료를 upkeep 및 Town Project와 연결했고 이후 release에서 세율 pooling/upkeep 구조를 조정했다.

출처:
- https://www.newworld.com/en-gb/news/articles/making-your-mark-on-aternum-settlements-and-governance
- https://www.newworld.com/en-us/game/releases/brimstone-sands-release
- https://www.newworld.com/en-us/game/releases/season-one-fellowship-and-fire

Moneyverse 적용:
- 세입이 커뮤니티/도시 프로젝트와 공공 서비스로 보이게 한다.
- pooled revenue -> public unlock의 관계를 표시한다.
- 특정 유저그룹이 전체 국고를 사유화하는 대신 중앙 pool + 제한형 프로그램 배분을 사용한다.

### 2.4 Guild Wars 2 — 명시적 거래 fee와 treasury upgrade

ArenaNet 지원문서는 Trading Post에 5% listing fee와 sale 후 10% exchange fee를 설명한다. 정확 수치는 Moneyverse에 복제하지 않는다.

출처:
- https://help.guildwars2.com/hc/en-us/articles/222384087-Missing-Gold

Guild Wars 2 Wiki는 guild treasury 기여가 건물·혜택·guild mission 등을 해금하는 upgrade에 사용된다고 설명한다.

출처:
- https://wiki.guildwars2.com/wiki/Guild_upgrades
- https://wiki.guildwars2.com/wiki/Guild_hall

Moneyverse 적용:
- listing friction과 체결세를 구분한다.
- pooled 기여의 결과가 보이는 공공 프로젝트 meter를 둔다.
- “세금을 많이 내면 개인 파워 증가”가 아니라 집단 프로젝트/미션 해금을 지향한다.

## 3. v492 채택 결론

1. **경제행동별 tax class 분리:** sale tax, listing/broker, reprice, business profit, luxury/property, temporary levy를 따로 측정한다.
2. **일반·신규 보호:** P2P 0% 기본, 기본보상/환불 비과세, minimum taxable base, starter waiver.
3. **국고는 재순환 pool:** 국고 WLD는 burn이 아니며 reserve/reconciliation 정상일 때 적격잉여금을 활동재원으로 쓴다.
4. **지출을 보이게:** Treasury Today, project progress, “어디에 쓰이나”, public contract pool.
5. **재정을 게임플레이로:** 도시 matching, 공공조달 계약, 시즌 공공사업, fee-relief, item salvage, civic weekly challenge.
6. **납세액 대신 참여 폭 보상:** 최고납세자 랭킹·세금복권·납세액 비례 power 금지.
7. **부작용 측정:** 가격/거래량/대체, 코호트 부담, retention, 참여 폭, payout 집중, abuse, reserve를 함께 검증.

## 4. 조사 근거를 반영한 재미 기능

- Treasury Today 미터
- 도시/커뮤니티 국고 matching
- 제작·물류·유지보수·직업 다양화 공공계약
- 공공사업 unlock chain
- 건전한 국고 상태의 fee-relief festival
- allowlist item salvage drive
- Accounting/Commerce 서비스 fee 숙련할인
- 납세액이 아닌 프로젝트 참여 폭 기반 civic archive/title

## 5. 구현 전 남아 있는 위험

- 개별세율은 낮아도 중첩 실효부담이 커질 수 있음
- listing/reprice fee가 높으면 정상 가격발견 저해
- 관련계정이 matching을 farming할 위험
- public procurement가 가격하한/조작표적이 될 위험
- 직접 WLD 보조금이 휴면공급을 활성화해 inflation을 높일 위험
- item buyback이 희소/luxury 가격을 올릴 위험
- fee discount가 core progression까지 확대되면 veteran advantage가 될 위험

따라서 simulation, Test replay, reconciliation, exact-SHA 증거 전 Production 파라미터로 확정하지 않는다.
