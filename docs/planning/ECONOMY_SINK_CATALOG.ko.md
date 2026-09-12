# 월덕 머니버스 — 경제 소비처 카탈로그

> 버전: v2026.09.12.7
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [ECONOMY_SINK_CATALOG.md](ECONOMY_SINK_CATALOG.md)

## 0. 목적

이 문서는 경제 소비처 전략을 개발 가능한 카탈로그로 구체화한다. 사용자의 플레이를 임의로 막는 하드캡은 두지 않는다. 기본 정책은 **플레이 한도 없음**이며, 경제 압력은 사용자가 자발적으로 선택할 수 있고 가치가 분명한 소비처를 충분히 제공해 관리한다.

모든 경제 행동은 다음 중 하나를 주 분류로 가져야 한다.

- `HARD_SINK`: WLD가 플레이어 유통 잔액에서 완전히 제거된다.
- `TRANSFER`: WLD가 다른 사용자에게 이동하지만 전체 플레이어 경제 안에는 남는다.
- `CONVERTER`: WLD가 아이템·자원 등 다른 형태로 바뀐다. 다시 WLD로 현금화 가능한지에 따라 실제 소각 여부가 달라진다.

분석 화면은 `TRANSFER`를 절대로 소각량으로 계산하지 않는다.

## 1. 소비처 공통 설정 계약

서버 설정은 최소 다음 구조를 지원한다.

```yaml
sink_code: SINK_PROFILE_THEME
sink_class: HARD_SINK
currency: WLD
base_price: 750
price_curve_type: FIXED
price_curve_params: {}
repeatable: true
max_per_user: null
max_global: null
starts_at: null
ends_at: null
ledger_tx_type: SINK_PROFILE_CUSTOMIZATION
reward_payload: {}
config_version: 1
enabled: true
```

규칙:

1. `max_per_user`, `max_global` 기본값은 `null = unlimited`이다.
2. 실제 희소성, 보안, 악용 방지, 데이터 무결성, 시스템 안정성, 법적 요구처럼 보호 근거가 있을 때만 제한값을 둘 수 있다.
3. 가격은 서버가 결정하고 `price_version`/`config_version`과 함께 전달한다.
4. 구매 요청은 멱등키를 사용하며 결제·권리 지급·감사 기록이 원자적으로 커밋되어야 한다.
5. 사용자의 자산 규모를 몰래 보고 가격을 다르게 매기는 개인화 가격차별은 금지한다. 동적 가격은 공개된 전역 경제지표나 지역·콘텐츠 설정만 사용할 수 있다.
6. 보안, 계정 복구, 필수 위험교육과 안전정보는 유료화하지 않는다.

## 2. 자산대별 소비 가격대

아래 구간은 접근 제한이 아니라 분석·튜닝용 구간이다.

| 유동 WLD | 적정 소비 범위 예시 | 목표 |
|---|---:|---|
| 초보 `<1만` | 100~2,000 | 저가 꾸미기·수집 소비 |
| 정착 `1만~10만` | 1,000~25,000 | 주거·사업·제작·클럽 성장 |
| 성장 `10만~100만` | 1만~25만 | 지점·본사·고급 수집·공동 프로젝트 |
| 고자산 `100만~1,000만` | 10만~200만 | 대형 공간·박물관·지역 후원 |
| 명예 `1,000만+` | 확장형 | 랜드마크·레거시 프로젝트·명예 경매 |

각 자산대에는 항상 최소 3개 이상의 비 Pay-to-Win 선택지가 남도록 운영한다.

## 3. P0 소비처 카탈로그

표의 가격은 최초 튜닝값이며 실제 운영값은 버전 관리된 서버 설정으로 둔다.

### 3.1 프로필·정체성·수집

| 코드 | 항목 | 분류 | 시작 가격 | 반복 | 가치 | 원장 유형 |
|---|---|---|---:|---|---|---|
| ID-PAL-01 | 프로필 색상 변경 | HARD_SINK | 250 | 가능 | 정체성 | `SINK_PROFILE_CUSTOMIZATION` |
| ID-NAMEPLATE-01 | 네임플레이트 스타일 | HARD_SINK | 750 | 스타일별 | 정체성 | `SINK_PROFILE_CUSTOMIZATION` |
| ID-THEME-01 | 대시보드 테마 | HARD_SINK | 2,500 | 스타일별 | 꾸미기 | `SINK_PROFILE_CUSTOMIZATION` |
| ID-FRAME-PRESTIGE | 명예 프로필 프레임 | HARD_SINK | 7,500 | 스타일별 | 지위표현 | `SINK_PROFILE_CUSTOMIZATION` |
| COL-RESTORE-COMMON | 일반 수집품 복원 | HARD_SINK | 300 | 가능 | 수집 품질 | `SINK_COLLECTIBLE_RESTORATION` |
| COL-RESTORE-RARE | 희귀 수집품 복원 | HARD_SINK | 2,000 | 가능 | 수집 품질 | `SINK_COLLECTIBLE_RESTORATION` |
| COL-ENGRAVE | 수집품 각인 | HARD_SINK | 800 | 가능 | 개인화 | `SINK_ITEM_ENGRAVING` |
| COL-FUSE | 중복 외형 합성 수수료 | HARD_SINK | 1,200 | 가능 | 수집 진행 | `SINK_CRAFT_FEE` |

프로필·수집품은 작업 보상, 주식 체결우위, 대출조건, 리그 점수에 영향을 주지 않는다.

### 3.2 주거·방·오피스

| 코드 | 항목 | 분류 | 가격/곡선 | 반복 | 가치 | 원장 유형 |
|---|---|---|---|---|---|---|
| HOME-ROOM-BASE | 기본 개인 공간 | HARD_SINK | 5,000 | 공간별 | 개인 전시공간 | `SINK_HOUSING_PURCHASE` |
| HOME-WALL | 벽지·바닥 변경 | HARD_SINK | 1,000 | 무제한 | 꾸미기 | `SINK_HOUSING_RENOVATION` |
| HOME-FURN-BASIC | 기본 가구 묶음 | HARD_SINK | 1,500 | 스타일별 | 장식 | `SINK_HOUSING_RENOVATION` |
| HOME-EXPAND | 방 확장 | HARD_SINK | `8,000 * 1.35^(확장횟수)` | 점진형 | 전시공간 확대 | `SINK_HOUSING_RENOVATION` |
| HOME-GALLERY | 개인 갤러리관 | HARD_SINK | 75,000 | 점진형 | 수집 전시 | `SINK_HOUSING_RENOVATION` |
| HOME-PENTHOUSE | 펜트하우스 외형 등급 | HARD_SINK | 250,000 | 업그레이드형 | 명예·전시 | `SINK_HOUSING_PURCHASE` |

임의의 총 확장 한도는 두지 않는다. 실제 제작된 공간 콘텐츠가 유한할 때만 콘텐츠 한계를 표시한다.

### 3.3 사업 소비처

| 코드 | 서비스 | 분류 | 가격/곡선 | 반복 | 가치 | 원장 유형 |
|---|---|---|---|---|---|---|
| BIZ-REG | 사업체 등록 | HARD_SINK | 10,000 | 사업체별 | 사업 콘텐츠 접근 | `SINK_BUSINESS_REGISTRATION` |
| BIZ-SIGN | 간판·브랜드 변경 | HARD_SINK | 2,500 | 무제한 | 정체성 | `SINK_BUSINESS_UPGRADE` |
| BIZ-STORAGE | 창고 확장 | HARD_SINK | `6,000 * 1.4^(단계-1)` | 점진형 | 운영 유연성 | `SINK_BUSINESS_UPGRADE` |
| BIZ-BRANCH | 지점 개설 | HARD_SINK | `25,000 * 1.45^(지점순번)` × 공개 지역계수 | 점진형 | 사업 확장 | `SINK_BUSINESS_UPGRADE` |
| BIZ-MAINT | 정기 유지보수 | HARD_SINK | 규모/매출 정책 | 반복 | 시설 정상운영 | `SINK_BUSINESS_MAINTENANCE` |
| BIZ-AD | 브랜드 캠페인 | HARD_SINK | 5,000 / 15,000 / 40,000 | 반복 | 노출·브랜드 목표 | `SINK_BUSINESS_ADVERTISING` |
| BIZ-HQ-WING | 본사 확장관 | HARD_SINK | 200,000 × `1.4^(관순번)` | 점진형 | 전시·관리공간 | `SINK_BUSINESS_UPGRADE` |
| BIZ-MUSEUM | 기업 역사 박물관 | HARD_SINK | 750,000 | 확장형 | 레거시·명예 | `SINK_BUSINESS_UPGRADE` |

휴면기간만으로 감당할 수 없는 유지비 빚이 누적되는 구조는 금지한다.

### 3.4 제작·외형 변환

| 코드 | 기능 | 분류 | 가격 | 반복 | 원장 유형 |
|---|---|---|---:|---|---|
| CRAFT-BASIC | 일반 제작 서비스 | HARD_SINK | 300 | 무제한 | `SINK_CRAFT_FEE` |
| CRAFT-ADV | 고급 제작 서비스 | HARD_SINK | 1,500 | 무제한 | `SINK_CRAFT_FEE` |
| CRAFT-RECOLOR | 색상·외형 변경 | HARD_SINK | 500 | 무제한 | `SINK_CRAFT_FEE` |
| CRAFT-ARCHIVE | 보관 외형 레시피 복원 | HARD_SINK | 5,000 | 가능 | `SINK_CRAFT_FEE` |

숨겨진 확률을 사용하는 유료 랜덤 제작은 도입하지 않는다.

### 3.5 WDX 시장·유저 거래소

| 코드 | 기능 | 분류 | 가격 | 반복 | 원장 유형 |
|---|---|---|---|---|---|
| MKT-EXEC-FEE | WDX 체결 수수료 | HARD_SINK | 체결당 0.20%, 최소 1 WLD 초기안 | 체결별 | `SINK_MARKET_FEE` |
| MKT-REPLAY-DECOR | 과거시세 리플레이 외형팩 | HARD_SINK | 500 | 스타일별 | `SINK_MARKET_TOOL` |
| UGC-LIST | 유저마켓 등록 수수료 | HARD_SINK | 25 + 등록가 0.10% | 등록별 | `SINK_LISTING_FEE` |
| UGC-SALE | 유저마켓 판매 수수료 | HARD_SINK | 거래액 1.0% | 체결별 | `SINK_MARKETPLACE_FEE` |
| UGC-PAYMENT | 구매자→판매자 지급액 | TRANSFER | 상품가 | 거래별 | `TRANSFER_MARKETPLACE_PAYMENT` |

안전·위험교육은 무료로 유지한다. 거래소 등록 개수는 기본 무제한이며 스팸은 rate control, 등록비, 이상행위 탐지로 관리한다.

### 3.6 은행·교통·물류

| 코드 | 서비스 | 분류 | 가격 | 반복 | 가치 | 원장 유형 |
|---|---|---|---:|---|---|---|
| BANK-STATEMENT | 꾸미기형 보관 명세서 | HARD_SINK | 200 | 가능 | 기록 편의 | `SINK_BANK_SERVICE` |
| BANK-RESTRUCTURE | 선택형 대출 일정 조정 | HARD_SINK | 정책 수수료 | 필요 시 | 일정 편의 | `SINK_BANK_SERVICE` |
| MOVE-CITY | 도시 이동·배차 | HARD_SINK | 50~250 | 가능 | 편의 | `SINK_TRANSPORT` |
| LOGI-DELIVERY | 사업 물류 배송 | HARD_SINK | 100 + 거리/물량 | 가능 | 물류 선택 | `SINK_LOGISTICS` |
| LOGI-STORAGE | 외부 보관창고 | HARD_SINK | 500/주 + 사용구간 | 반복 | 재고 유연성 | `SINK_STORAGE` |

보안 조치, 계정복구, 필수 기록·고지는 무료다.

### 3.7 클럽·소셜 공간

| 코드 | 서비스 | 분류 | 가격/곡선 | 반복 | 원장 유형 |
|---|---|---|---|---|---|
| CLUB-CREATE | 클럽 창설 | HARD_SINK | 7,500 | 클럽별 | `SINK_CLUB_CREATE` |
| CLUB-BANNER | 클럽 배너 디자인 | HARD_SINK | 2,500 | 스타일별 | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-ROOM | 클럽하우스 공간 | HARD_SINK | `20,000 * 1.35^(공간순번)` | 점진형 | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-TROPHY | 트로피 전시관 | HARD_SINK | 12,000 | 점진형 | `SINK_CLUBHOUSE_UPGRADE` |
| CLUB-EVENT | 클럽 이벤트 무대 | HARD_SINK | 25,000 | 반복 | `SINK_CLUB_EVENT` |

클럽 출연금 중 실제 소각액과 단순 공동계정 이전액을 구분해 보여준다.

### 3.8 도시·커뮤니티 프로젝트

| 코드 | 프로젝트 | 분류 | 목표/구조 | 보상 | 원장 유형 |
|---|---|---|---|---|---|
| CITY-GARDEN | 공공정원 복원 | HARD_SINK | 전역 25만 WLD, 개인기부 무제한 | 명판 | `SINK_PROJECT_DONATION` |
| CITY-PLAZA | 도시광장 확장 | HARD_SINK | 100만+ 단계형 | 기여자 벽 | `SINK_PROJECT_DONATION` |
| CITY-MUSEUM | 공공박물관관 | HARD_SINK | 300만+ 단계형 | 전시 크레딧 | `SINK_PROJECT_DONATION` |
| CITY-FESTIVAL | 시즌 도시축제 | HARD_SINK | 시즌별 가변 | 이벤트 외형·칭호 | `SINK_PROJECT_DONATION` |
| CITY-LANDMARK | 도시 랜드마크 | HARD_SINK | 1,000만+ 확장형 | 영구 시즌 기록 | `SINK_PROJECT_DONATION` |

개인 기부량에는 임의 한도를 두지 않는다. 다만 명예점수는 로그형으로 증가시켜 고액기부가 경제 권력으로 바뀌지 않게 한다.

`명예점수 = floor(100 * ln(1 + 기부액 / 1,000))`

명예점수는 WLD·주식 우위·작업 보상·리그 점수로 전환하지 않는다.

### 3.9 직업·프레스티지

| 코드 | 소비처 | 분류 | 시작가 | 반복 | 가치 | 원장 유형 |
|---|---|---|---:|---|---|---|
| PROF-EXAM | 직업 자격시험 | HARD_SINK | 1,000 | 재응시 가능 | 전문화 진행 | `SINK_PROFESSION_SERVICE` |
| PROF-SPEC | 전문분야 등록 | HARD_SINK | 5,000 | 추가/변경 시 | 콘텐츠·정체성 | `SINK_PROFESSION_SERVICE` |
| PROF-PRESTIGE | 프레스티지 의식 | HARD_SINK | 25,000 × 프레스티지 단계 | 점진형 | 배지·기록·외형 | `SINK_PRESTIGE` |
| LEGACY-PLAQUE | 직업 레거시 명판 | HARD_SINK | 100,000 | 스타일별 | 명예의전당 | `SINK_PRESTIGE` |

이미 획득한 핵심 직업기능을 유지하기 위해 반복 결제를 강요하지 않는다.

### 3.10 고자산 명예 소비처

| 코드 | 소비처 | 분류 | 시작가/곡선 | 경제 우위 | 원장 유형 |
|---|---|---|---|---|---|
| PRESTIGE-HQ | 스카이라인 본사 | HARD_SINK | 150만 + 모듈 확장 | 없음 | `SINK_PRESTIGE` |
| PRESTIGE-GALLERY | 개인 명예 갤러리 | HARD_SINK | 200만 + 전시관 | 없음 | `SINK_PRESTIGE` |
| PRESTIGE-SPONSOR | 지역 후원 | HARD_SINK | 캠페인당 250만 | 없음 | `SINK_PROJECT_DONATION` |
| PRESTIGE-LANDMARK | 랜드마크 후원 | HARD_SINK | 500만+ | 없음 | `SINK_PROJECT_DONATION` |
| PRESTIGE-AUCTION | 시스템 명예 경매 | HARD_SINK | 동적 최저가, 낙찰액 소각 | 없음 | `SINK_PRESTIGE_AUCTION` |

명예 경매 최저가 초기 공식:

`reserve = max(설정최저가, 전역_P90_유동잔액 * 0.02)`

개인 자산을 몰래 참조하지 않는다. 경매 보상은 번호형 트로피, 전시권, 명판, 외형 변형에 한정한다.

## 4. 가격곡선 라이브러리

런타임은 기능마다 가격공식을 하드코딩하기보다 명시적인 곡선 타입을 사용한다.

- `FIXED(base)` — 일반 상점·서비스.
- `GEOMETRIC(base, ratio, index)` — 방/지점/본사 확장.
- `PIECEWISE(metric_bands[])` — 공개된 유지비·물류 구간.
- `GLOBAL_INDEX(base, metric, coefficient, floor, ceiling?)` — 전역 경제지표 기반 이벤트/경매. `ceiling` 기본값은 null.
- `PROJECT_STAGE(stages[])` — 도시 프로젝트 단계별 목표.

가격 확정 전 현재 가격과 이유를 사용자에게 보여준다. 견적 후 가격버전이 바뀌면 몰래 다른 금액을 차감하지 않고 새 견적을 요구한다.

## 5. 시즌 연동

시즌마다 단순히 이전 가격을 올리는 대신 최소 1개의 새로운 소비처 계열을 추가한다.

메인 WLD 시즌 소비처 예시:

- 시즌 도시축제 기부;
- 시즌 테마 주거 리모델링;
- 시즌 박물관 전시;
- 기념 각인;
- 클럽 이벤트 무대;
- 시즌 종료 `Legacy Museum` 기부.

`Legacy Museum`은 개인 기부한도가 없는 자발적 `HARD_SINK`이며 보상은 기록·외형·명예만 제공한다.

시즌 토큰(`ST`)은 WLD와 별도 경제로 유지한다. ST 소비를 WLD 소각량에 합산하지 않는다. 시즌 종료 때 메인 WLD는 초기화하거나 강제 소각하지 않는다.

## 6. 분석 이벤트

필수 이벤트:

- `sink_quote_viewed`
- `sink_purchase_started`
- `sink_purchase_succeeded`
- `sink_purchase_failed`
- `sink_upgrade_completed`
- `community_project_contributed`
- `prestige_auction_bid_burned`
- `season_sink_used`

가능한 경우 다음 차원을 개인정보 최소화 방식으로 기록한다.

`sink_code`, `sink_class`, `price_version`, `currency`, `season_id`, `progression_band`, `repeat_count_bucket`, `balance_before_bucket`, `balance_after_bucket`, `failure_domain_code`.

## 7. 경제 대시보드와 검토 트리거

필수 지표:

- 발행원별 WLD 발행량;
- 소비처 코드/분류별 실제 소각량;
- 순발행 = 발행 - 실제 소각;
- hard-sink 비율;
- transfer volume;
- 평균/중앙/P90/P95/P99 유동 WLD;
- 상위 1%·10% 유동자산 점유율;
- 소비처별 소각 비중과 상위 3개 집중도;
- 코호트별 실제 구매일수;
- 고자산 코호트 중앙잔액 증가율;
- 첫 구매 전환율과 첫 의미있는 소비까지의 기간.

다음 수치는 자동 하드캡이 아니라 운영 검토 신호다.

1. 7일 순발행이 양수이면서 유통 WLD의 10%를 넘는 상태가 3일 지속되면 경제 검토.
2. 상위 3개 소비처가 hard-sink의 60%를 넘으면 소비처 집중 검토.
3. 사실상 필수 소비처가 전체 소각의 35%를 넘으면 사용자 부담 검토.
4. 고자산층 중앙잔액 증가율이 28일 기준 전체의 2배를 넘으면 자발적 고가 소비처 확대.
5. 잔액은 증가하지만 구매활성일이 떨어지면 세금보다 소비처 매력도 확대를 먼저 시행.

모든 임계치는 운영 튜닝값이다.

## 8. 악용·무결성

- 차감은 서버 권위로 처리한다.
- 모든 구매/차감 API는 멱등키를 사용한다.
- 원장 금액, 소비처코드, config version은 커밋 후 불변이다.
- 유저 거래대금은 `TRANSFER`, 수수료만 `HARD_SINK`다.
- 재시도·취소로 중복 소각 또는 중복권리 지급이 발생하지 않아야 한다.
- 견적 만료·가격버전 불일치는 재견적을 요구한다.
- 고액 프로젝트·명예경매는 이상행위 탐지와 관리자 감사대상이다.
- 관리자 설정변경은 행위자, 이전값, 새값, 적용시각을 감사로그에 남긴다.
- 명시적 부채상품 계약이 아닌 소비처가 잔액을 음수로 만들면 안 된다.

## 9. 구현 우선순위

### P0

1. 프로필·테마 꾸미기
2. 수집품 복원·각인
3. 개인 방·가구·리모델링
4. 사업등록·창고·지점·유지비
5. WDX 수수료 분류
6. 클럽 창설·배너·클럽하우스
7. 도시 프로젝트 1개
8. 경제 대시보드의 burn/transfer 분리

### P1

- 제작·합성 수수료
- 유저마켓 등록·판매 수수료
- 박물관·아카이브
- 시즌 Legacy Museum
- 직업 자격·프레스티지
- 고급 주거·본사 모듈

### P2

- 명예 경매
- 지역 후원
- 다단계 랜드마크
- 시즌 커뮤니티 메가프로젝트
- 장기 레거시 갤러리·명예의전당

## 10. 런타임 Definition of Done

소비처는 구매 버튼만 생겼다고 완료가 아니다. 다음 조건을 모두 충족해야 한다.

- 소비가치와 가격을 설명하는 UI
- 견적/확인/처리중/성공/멱등재생/거절 상태
- 서버 권위 가격과 자격검증
- 원자적 원장차감 + 권리지급 + 감사상태
- 중복방지 멱등 계약
- `HARD_SINK`/`TRANSFER`/`CONVERTER` 분류
- 보호목적 외 제한값은 `null`/unlimited 지원
- 분석 이벤트와 대시보드 귀속
- 악용·오류·동시성 테스트
- 접근성·반응형 검증
- 영문 기준 + 한국어 문서 일치
- 원장 영향 런타임은 실제 PostgreSQL 통합검증
- 정확한 후보 SHA를 테스트 서버에 배포 후 QA
- 운영 배포 후 원장 소각합계와 대시보드 소각합계 대사

## 11. 변경하면 안 되는 원칙

1. 기본은 무제한 플레이이다.
2. 소비처는 부자를 벌주기 위한 장치가 아니라 사용자가 갖고 싶은 가치와 경쟁해야 한다.
3. 고자산 소비처는 경제권력이 아니라 정체성·공간·수집·커뮤니티 레거시를 판매한다.
4. 유저간 이전을 소각으로 속이지 않는다.
5. 보안과 필수 위험교육은 무료다.
6. 모든 소비처는 Pay-to-Win이 아니어야 한다.
7. 매 시즌 새로운 소비 이유를 추가하며 단순 가격인상에 의존하지 않는다.
