# 월덕 머니버스 — 개인 공간·도시 프로젝트 기획 명세서

> 버전: v2026.09.12.11
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [PERSONAL_SPACES_CITY_PROJECTS_SPEC.md](PERSONAL_SPACES_CITY_PROJECTS_SPEC.md)

## 0. 목적

기존 소비처 기획에서 넓게 정의되어 있던 두 영역을 실제 개발 가능한 시스템으로 구체화한다.

1. **개인 공간** — 방, 오피스, 갤러리, 본사, 장식 모듈로 경제 능력을 판매하지 않으면서 지속적인 WLD 소비처를 만든다.
2. **도시 프로젝트** — 유저가 자발적으로 WLD를 소각하고 경제 우위 대신 도시 변화·명예·기록을 받는 공동 프로젝트를 만든다.

기본 정책은 **한도 없음**이다. 일일 방문, 꾸미기, 리모델링, 기부, 가구 구매, 공간 보유량에 구현 편의 목적의 임의 하드캡을 두지 않는다. 제한은 보안·악용 방지·실제 희소성·무결성·법적 요구·시스템 안정성 이유가 있을 때만 허용한다.

## 1. 제품 목표

### 개인 공간

- 신규 유저 첫 주에 저가 정체성 소비처 제공
- 중·고자산 유저에게 세금 대신 확장형 소비 제공
- 수집품·업적·시즌 트로피·사업 역사를 전시
- 상점·수집·직업·사업·클럽·시즌을 능력치가 아닌 전시가치로 연결
- 단순 가격 인상이 아니라 신규 모듈·테마로 장기 수요 생성

### 도시 프로젝트

- 고자산 WLD를 자발적으로 대규모 소각
- 소비가 실제 도시 변화로 보이게 함
- 자산구간별 참여 의미를 제공하되 경쟁 능력은 판매하지 않음
- 시즌별 기여자 기록과 영구 아카이브 생성
- 인플레이션 대응을 플레이 제한보다 신규 소비처로 수행

## 2. 개인 공간 IA

기본 진입은 `프로필 -> 공간`이다. 홈 추천, 상점의 공간/장식, 수집품의 전시하기, 사업 본사, 시즌 장식, 도시의 내 전시/후원에서도 진입할 수 있다.

메인 화면에는 대표 공간, 보유 공간, 미완료 확장, 최근 해금 장식, 미전시 수집품, 다음 추천 확장, 공개범위에 따른 방문/공유를 표시한다.

필수 화면 상태: 로딩, 공간 미보유 온보딩, 빈 공간, 편집, 방문자 읽기전용, 일부 데이터, 저장충돌, 점검, 권한없음.

## 3. 공간 유형과 가격안

| 코드 | 공간 | 초기 가격안 | 대상 | 경제 능력 |
|---|---|---:|---|---|
| `SPACE_ROOM_STARTER` | 스타터 룸 | 5,000 WLD | 신규 | 없음 |
| `SPACE_STUDIO` | 스튜디오 | 25,000 WLD | 중간 | 없음 |
| `SPACE_GALLERY` | 개인 갤러리 | 75,000 WLD | 중간/상위 | 없음 |
| `SPACE_OFFICE` | 개인 오피스 | 100,000 WLD | 상위 | 없음 |
| `SPACE_PENTHOUSE` | 펜트하우스 | 250,000 WLD | 상위/고자산 | 없음 |
| `SPACE_HQ` | 기업 본사 | 1,500,000 WLD | 고자산/사업 | 없음 |
| `SPACE_LEGACY_HALL` | 레거시 홀 | 2,000,000 WLD | 명예 | 없음 |

가격은 튜닝 시작점이다. `max_owned_spaces` 기본값은 `null`/unlimited다. 제작된 공간 템플릿 수가 유한한 것은 콘텐츠 제약이지 계정 하드캡이 아니다.

## 4. 임의 상한 없는 확장

방 확장 가격안: `100단위 반올림(8,000 * 1.35^확장인덱스)`.

갤러리 윙 가격안: `1,000단위 반올림(75,000 * 1.45^윙인덱스)`.

확장은 바닥면적, 전시슬롯, 받침대, 배치공간, 시각적 변형을 늘릴 수 있다. 작업 보상·주식수익·대출조건·사업정산·리그점수는 증가시키지 않는다.

본사 모듈 예시:

| 모듈 | 가격안 | 가치 |
|---|---:|---|
| 리셉션 홀 | 200,000 | 기업/프로필 전시 |
| 아카이브 룸 | 280,000 | 사업 역사 |
| 전략실 | 350,000 | 장식형 대시보드 |
| 트로피 아트리움 | 500,000 | 시즌·리그 보상 |
| 파운더 플로어 | 750,000 | 명예 외형 |
| 스카이라인 확장 | 1,000,000+ 기하급수 | 장기 명예 소비 |

## 5. 가구·장식 SKU 계약

각 SKU에는 안정적인 `sku`, 다국어 이름/설명, content type, 태그, 기본가격, 상점별 가격/노출 오버라이드, 보유방식, 배치제약, 전시분류, 시즌/이벤트 출처, 거래 가능 여부, 판매기간, config version을 둔다.

영구 SKU 정체성은 카탈로그에, LiveOps 가격·노출은 store/config 계층에 둔다. PlayFab Economy V2 Stores가 같은 방식으로 카탈로그 아이템 가격을 상점별로 재정의할 수 있다.

참고: https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores

## 6. 편집·저장 계약

편집모드 -> 보유 아이템 선택 -> 로컬 미리보기 -> 서버 entitlement/배치 검증 -> revision 저장 -> canonical snapshot 저장 -> 최신 revision 반환 순서다.

레이아웃 저장은 무료다. 구매·색상변경·리모델링만 비용을 받는다. 같은 멱등키는 중복차감하지 않는다. 오래된 revision 저장은 `SPACE_LAYOUT_CONFLICT`와 최신 revision을 반환한다.

공개범위는 `private`, `friends_followers`, `club`, `public`을 지원하며 신규 공간은 계정 기본 프라이버시를 따른다.

## 7. 개인 공간 소비처

| 소비처 | 분류 | 가격안 | 반복 | 가치 | 원장유형 |
|---|---|---:|---|---|---|
| 벽/바닥 리모델링 | HARD_SINK | 1,000 | 무제한 | 외형 | `SINK_HOUSING_RENOVATION` |
| 가구 | HARD_SINK | 300–25,000 | 품목별 | 장식 | `SINK_HOUSING_PURCHASE` |
| 색상 변경 | HARD_SINK | 250–1,500 | 무제한 | 개인화 | `SINK_HOUSING_RENOVATION` |
| 각인 명패 | HARD_SINK | 800–10,000 | 무제한 | 기록/명예 | `SINK_ITEM_ENGRAVING` |
| 방 확장 | HARD_SINK | 기하급수 | 단계형 | 전시공간 | `SINK_HOUSING_RENOVATION` |
| 갤러리 윙 | HARD_SINK | 기하급수 | 단계형 | 수집 전시 | `SINK_HOUSING_RENOVATION` |
| 본사 모듈 | HARD_SINK | 카탈로그/기하급수 | 단계형 | 명예 | `SINK_BUSINESS_UPGRADE` |
| 향후 유저 장식 거래 | TRANSFER + fee | 시장가 | 무제한 | 유동성 | transfer + marketplace fee |

## 8. 자산구간별 여정

첫 7일에는 스타터룸 무료 미리보기와 온보딩 장식 1개를 제공한다. 유동자산이 적으면 5,000 WLD 방보다 300~1,500 WLD 장식을 먼저 추천하며, 구매 후 잔액이 거의 0이 되는 소비는 강하게 유도하지 않는다.

1만~10만 WLD는 스튜디오·방 확장·테마세트·소형 갤러리, 10만~100만은 갤러리 윙·오피스·트로피 전시, 100만 이상은 본사·레거시 홀·네임드 윙·박물관급 전시를 중심으로 한다.

## 9. 도시 프로젝트

기본 진입은 `커뮤니티 -> 도시`이다. 도시 화면은 기부목록이 아니라 현재 세계상태 대시보드다.

상태머신: `DRAFT -> ANNOUNCED -> FUNDING -> FUNDED -> BUILDING -> COMPLETED -> ARCHIVED`.

예외는 `FUNDING|BUILDING -> PAUSED`, `PAUSED -> FUNDING|BUILDING|CANCELLED`다. 모든 상태전환은 서버 권위, 타임스탬프, 버전, 감사기록을 남긴다.

조달 방식:

1. `GLOBAL_GOAL`: 전체 목표금액까지 공동 소각
2. `STAGED_GOAL`: 단계별 목표와 실제 화면 변화
3. `OPEN_ENDED_PATRONAGE`: 총액 상한 없이 마일스톤/명예만 확장

`max_contribution_per_user` 기본값은 `null`/unlimited다.

## 10. 초기 도시 프로젝트

| 코드 | 프로젝트 | 목표안 | 방식 | 결과 | 경제보상 |
|---|---|---:|---|---|---|
| `CITY_GARDEN_01` | 강변정원 복원 | 250,000 | GLOBAL_GOAL | 정원+명패 | 없음 |
| `CITY_PLAZA_01` | 중앙광장 확장 | 1,000,000 | STAGED_GOAL | 공공미술/무대 | 없음 |
| `CITY_MUSEUM_01` | Moneyverse 역사박물관 | 3,000,000 | STAGED_GOAL | 아카이브 전시 | 없음 |
| `CITY_FESTIVAL_S1` | 시즌1 도시축제 | config | GLOBAL_GOAL | 시즌 장면/외형 | 없음 |
| `CITY_LANDMARK_01` | 스카이라인 랜드마크 | 10,000,000 | STAGED_GOAL | 영구 랜드마크 | 없음 |
| `CITY_PATRONAGE` | 도시 레거시 후원 | 무제한 | OPEN_ENDED_PATRONAGE | 후원자 아카이브 | 없음 |

## 11. 기여 UX

상세화면은 스토리, 예상 변화, 현재 단계, 누적 소각액, 단계목표, 다음 변화, 본인/클럽 기여, 명예단계 미리보기, 기여이력, WLD가 영구 소각되고 금융수익이 없다는 안내를 표시한다.

거래흐름: 서버 quote+project version -> 금액 입력 -> 차감 후 잔액 미리보기 -> 서버 상태/잔액 검증 -> 원장차감+contribution 원자적 기록 -> 멱등 결과 -> commit 후 단계완료 이벤트 처리.

## 12. 명예 시스템

초기식: `명예점수 = floor(100 * ln(1 + 누적기여 / 1,000))`.

기여자 배지, 명패, 프로필 칭호, 박물관 기록, moderation을 거치는 네이밍 토큰, 후원자 벽, 시즌 아카이브 마커를 제공할 수 있다.

명예점수는 WLD·사업수입·주식우위·작업보상·대출조건·체결우선순위·리그점수로 바꾸지 않는다.

단일 최고기부자 순위만 두지 않고 최근기여자, 참여 프로젝트 수, 클럽기여, 마일스톤, 후원등급 등 여러 관점을 제공한다.

## 13. 중앙광장 단계 예시

- 1단계 기반공사 200,000 WLD
- 2단계 공공미술 250,000 WLD
- 3단계 행사무대 300,000 WLD
- 4단계 기록명패 250,000 WLD

단계완료마다 실제 UI/세계 변화가 있어야 하며 완료된 단계의 요구액은 소급 인상하지 않는다.

## 14. 시즌 연계

매 시즌 선택형 도시 프로젝트를 운영할 수 있지만 시즌 핵심완료에 고액기부를 요구하지 않는다.

D-21 도시테마 티저, D-14 프로젝트 공개, D-7 콘셉트/목표범위, D-3 Legacy Museum 이관규칙, 시즌종료 기여 스냅샷, 오프시즌 아카이브/레거시 전시 순서로 운영한다.

시즌 기여기록과 영구 도시후원 누적기록은 분리한다.

## 15. 권장 DB 모델

`city_projects`: project code, 상태, funding model, 시작/종료시각, 목표 WLD(null 가능), config version, season id.

`city_project_stages`: project, stage no, 목표액, visual unlock code, 상태, `(project_id, stage_no)` unique.

`city_project_contributions`: project, user, `amount_wld > 0`, ledger transaction unique, idempotency key, project version, 생성시각, `(user_id, idempotency_key)` unique.

`city_project_snapshots`: 총소각액, 기여자수, 단계상태, 명예버전.

`user_spaces`: owner, space type, 표시명, 공개범위, layout revision.

`user_space_modules`: space, module code/index, purchase transaction, config version.

`user_space_layouts`: space, revision, layout JSON, timestamp, `(space_id, revision)` unique.

정규화 배치를 쓰면 저장 시 실제 inventory ownership을 서버가 다시 검증한다.

## 16. API

개인공간: `GET /api/spaces`, `POST /api/spaces/quote`, `POST /api/spaces/purchase`, `GET /api/spaces/:spaceId`, `PUT /api/spaces/:spaceId/layout`, 모듈 quote/purchase, privacy patch.

도시: `GET /api/city/projects`, 상세조회, contribution quote, contribution 실행, 내기여 조회, recognition 조회.

구매/기여 변경 API는 멱등키가 필수다.

## 17. 원장

표준 transaction type: `SINK_HOUSING_PURCHASE`, `SINK_HOUSING_RENOVATION`, `SINK_SPACE_MODULE`, `SINK_PROJECT_DONATION`, `SINK_PRESTIGE`.

메타데이터에는 기능, SKU/project, config/price version, quote, actor, 결과 entitlement/contribution ID를 기록한다.

도시기부는 `HARD_SINK`다. 유저 소유 공동지갑으로 잠시 이동한 transfer를 burn으로 잘못 집계하지 않는다.

## 18. 관리자 콘솔

공간은 SKU 활성화, 미래 가격/config 버전, 판매기간, 구매/entitlement 이상조회가 필요하고 보호 원장 직접변경은 금지한다.

도시는 draft 생성, 단계/목표/visual unlock, 일정, pause/resume 사유, 경제영향 미리보기, 이상기여 조회, 감사 가능한 완료/아카이브, immutable 기여이력 기반 명예 재계산을 제공한다. 기여이력 삭제는 금지한다.

## 19. 분석·경제 대시보드

이벤트: `space_viewed`, `space_purchase_quoted`, `space_purchased`, `space_layout_saved`, `space_module_purchased`, `decor_item_purchased`, `city_project_viewed`, `city_contribution_quoted`, `city_contribution_completed`, `city_project_stage_completed`, `city_project_completed`, `recognition_tier_reached`.

지표: 공간/도시 일·7일 소각액, 구매/기여 유저수, 중앙/P90 금액, 확장빈도, 자산코호트 참여율, 상위1% 기여집중도, 전체 hard sink 중 비중, 7/30일 반복 소비일수, 프로젝트 전후 고자산 잔액 증가율.

한 sink가 장기간 약 60% 이상 소각을 담당하면 가격부터 올리지 말고 소비처 다양성 부족을 우선 검토한다.

## 20. 악용·동시성·롤백

서버 권위 정수 WLD, 클라이언트 최종가격 불신, 0/음수기여 금지, 안정성/악용용 rate control, layout JSON schema/size 검증, 사용자 네이밍 moderation, 위장후원을 위한 순환거래 탐지, 보정원장을 사용한다.

차감+entitlement는 원자적으로 commit한다. 이벤트 발행 실패는 재발행하되 재차감하지 않는다.

동시 기여가 단계경계를 넘으면 transaction/advisory lock 등으로 상태전환을 정확히 한 번만 수행한다. 초과금 처리는 프로젝트 시작 전 config에 명시한다.

## 21. 구현단계

P0: 공간 SKU/config, 스타터룸/스튜디오/기본갤러리, 장식구매, layout revision/privacy, 정원/광장 프로젝트, 원자적 WLD sink, 관리자 config, 경제지표.

P1: 펜트하우스/HQ, 시즌장식, 클럽기여, 박물관, 방문자 반응, 명예 프로필.

P2: 레거시 홀, 무제한 후원, 장식 유저거래소, moderation/security 이후 UGC.

## 22. 완료조건

개인공간은 서버권위 가격/config, 멱등·원자적 차감/entitlement, 임의 한도 기본 null, layout/privacy/conflict 테스트, 경제능력 미판매, 분석-원장 대사, 영문/한글 문서 parity, 테스트서버에서 중복구매·잔액부족·stale config·동시저장·공개범위 검증까지 완료해야 한다.

도시 프로젝트는 감사 가능한 상태머신, immutable hard sink 기여이력, 기여액 기본 unlimited, 동시성 안전한 단계전환, 경제능력 없는 명예, pause/cancel/reconciliation, burn/transfer 분리, 테스트서버에서 단계경계 동시기여·중복기여·잔액부족·pause·archive 검증까지 완료해야 한다.

## 23. 외부 참고

- PlayFab Economy V2 Stores: SKU 정체성과 상점별 가격/노출 분리 참고. https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores
- PlayFab Inventory Collections: 하나의 player identity 아래 여러 inventory collection 분리 참고. https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/inventory/collections
- TradingView The Leap 2026: 별도 preset Paper Trading 대회 계정 구조를 참고해 메인 WLD와 시즌/경쟁 시뮬레이션 잔액을 분리. https://www.tradingview.com/the-leap/

## 24. 다음 우선순위

1. 출시용 가구·장식 50개 이상 SKU seed
2. 도시 프로젝트 관리자 wireframe/권한표
3. Season 1 도시 프로젝트 + Legacy Museum 정확한 일정/보상
4. 개인공간 화면별 frontend interaction spec
5. 자산코호트별 소비처 채택률 시뮬레이션
6. 기존 원장/상점 스키마와 migration/API 구현 매핑
