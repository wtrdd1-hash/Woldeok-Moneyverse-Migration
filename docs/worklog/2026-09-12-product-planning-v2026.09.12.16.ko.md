# 제품 기획 작업기록 — v2026.09.12.16

기준일: 2026-09-12
브랜치: `docs/player-market-crafting-v2026.09.12.16`
범위: 유저 거래소 + 제작 시스템 제품기획 / 문서-only

## 시작점

작업 전 최신 Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec, Economy Sink Catalog와 현재 Personal Spaces & City Projects 통합 PR을 다시 확인했다.

기존 경제 문서에는 거래소 등록/판매 수수료와 기본 제작 소비처가 있었지만 다음 구현계약이 부족했다.

- 아이템 거래가능 정책;
- 에스크로 소유권;
- 판매등록/정산 상태머신;
- 동시구매 충돌 처리;
- WLD와 아이템의 원자적 정산;
- 재시도/멱등성;
- 결정형 레시피 계약;
- 유저시장 어뷰징 탐지;
- 거래소/제작 DB·API·관리자 계약;
- 시즌·개인공간 연계.

한도 없는 플레이를 유지하면서 반복 가능한 WLD 소비처를 확장하는 데 직접 도움이 되는 공백이라 이번 회차의 우선 기획으로 선정했다.

## 최신 외부 자료 확인

1. Microsoft PlayFab Economy V2 Catalog/Stores — 기본 카탈로그 정체성과 판매처별 가격/기간을 분리.
2. Microsoft PlayFab Economy V2 Inventory 최신 문서 — item transfer, transaction history, 원자적 batch operation, retry-safe idempotency 제공.
3. Microsoft PlayFab idempotent transaction guidance (2026-04-15) — 논리 작업마다 고유 멱등키 사용과 중복 재시도 시 원결과 반환 권장.
4. EVE Online Monthly Economic Report — March 2026 — faucet과 sink를 분리해 보고하므로 Moneyverse도 거래총액/transfer와 실제 WLD 소각을 분리해야 함.

## 제품 결정

- P0 거래소는 고정가격 판매만 사용한다.
- 일반 active listing, 구매횟수, 제작횟수 하드캡은 두지 않는다.
- 스팸은 등록수수료, API 보호, 이상행위 탐지로 제어한다.
- 기존 초기값인 등록수수료 `max(25 WLD, 등록가의 0.10%)`, 체결수수료 `1%`를 유지한다.
- 구매자→판매자 원금은 `TRANSFER`, 거래소/제작 시스템 수수료만 `HARD_SINK`로 집계한다.
- 판매 등록 시 아이템은 논리 에스크로로 이동해 동시에 사용/제작/이전할 수 없다.
- 구매는 구매자 차감, 판매자 지급, 수수료 소각, 소유권 이전을 한 트랜잭션으로 처리한다.
- P0 제작은 결정형 우선이다. 숨은 확률 유료 제작은 도입하지 않는다.
- 시즌 랭크/명예 보상은 기본 계정귀속이고 Season Token/League WLD는 거래소 결제통화로 쓰지 않는다.
- 자기거래, 원형거래, wash volume, 가격지표 조작, 봇 폭주, 중복정산을 검토하되 관련 없는 영구자산을 조용히 몰수하지 않는다.

## 추가 문서

- `docs/planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
- `docs/planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md`
- v2026.09.12.16 영문/한국어 changelog
- v2026.09.12.16 영문/한국어 내부 worklog
- 문서 INDEX 항목

## 작업 중 최신 상태 재확인

작업 시작 시 `main`은 `c318048d3604876a285f34dd9523bd1de1eaa03b`였고 Personal Spaces 통합 PR #170이 열려 있었다.

작업 중 `main`은 hourly integration audit 문서 병합으로 `0f5b7ac5d196487459f8ecbf2f36ffeaad2b5122`까지 전진했고 PR #170도 새 base를 반영했다. 동시 변경은 운영/감사 문서이며 이번 제품기획 계약과 직접 충돌하지 않는다.

이번 변경은 최신 Personal Spaces 기획 라인 위에 stacked 방식으로 유지해 해당 기획을 중복하거나 잃지 않도록 한다.

## 검증

이번 변경은 문서-only이다. 애플리케이션 코드, API 구현, DB migration, 원장 동작, 배포 상태는 바꾸지 않았다. 따라서 이 문서 변경 자체는 테스트 서버 배포가 필요하지 않다.

실제 구현은 별도 개발 브랜치에서 최소 다음을 검증해야 한다.

- 실제 PostgreSQL migration parity;
- 아이템 소유권/에스크로 불변식;
- 동일 listing 동시구매;
- buy/list/cancel 멱등성;
- 구매자 차감/판매자 지급/수수료 소각/소유권 이전 대사;
- 제작 input/output 원자성;
- 자기거래/어뷰징 방지;
- 정확한 Test 후보 SHA의 백엔드/API 기동 및 대표 사용자 흐름.

Test를 통과한 정확한 revision만 Production으로 승격한다.

## 다음 우선순위

1. 주택·수집·사업·시즌용 초기 제작 레시피/재료 SKU 50개 이상 정의;
2. 거래소 화면과 판매자/구매자 알림 규칙을 화면별 상세화;
3. Season 1/2 아이템의 거래가능/귀속 매트릭스와 archive 시점 정의;
4. 자산구간별 거래수수료 소각·transfer velocity·제작 sink 사용률 모델링;
5. 현재 저장소 ledger/inventory 스키마와 실제 구현 매핑;
6. 다음 시즌 명세 갱신에서 `DEFAULT_LIMIT_POLICY.md`와 충돌하는 기존 hard-cap 형태 수치를 정리.