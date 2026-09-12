# 월덕 머니버스 — 작업·직업 숙련도 기획 명세서

> 버전: v2026.09.12.26
> 상태: 구현 지향형 Living 제품 기획 명세
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`, `BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md`
> 영문 기준 문서: [JOBS_PROFESSION_MASTERY_SPEC.md](JOBS_PROFESSION_MASTERY_SPEC.md)

## 0. 목적

작업 기능을 단순 보상 버튼이 아니라 `직업 선택 → 과제 수락 → 수행/검증 → 정산 → 숙련도 성장 → 전문화 → 자격/꾸미기/명예 소비 → 더 다양한 작업 → 성과 복기`의 장기 성장 시스템으로 만든다. 일반 작업 수행 횟수와 숙련도 성장에는 임의 일일 하드캡을 두지 않는다.

WLD와 직업 보상은 서비스 내부 가상게임 데이터이며 실제 고용·임금·자격증·직업훈련·수익보장을 의미하지 않는다.

## 1. 핵심 원칙

1. 일반 작업 수락/완료, 숙련도 성장, 직업 전환, 장기 전문화는 기본 `null = unlimited`다.
2. 보상은 검증 가능한 작업상태를 통해 지급하며 단순 버튼 반복으로 지급하지 않는다.
3. 반복행동은 플레이 자체를 막지 않고 동일 저난도 작업의 한계 WLD 보상만 감소시킬 수 있다.
4. 직업레벨은 콘텐츠·선택·정체성 중심이며 무한 복리 WLD 배율을 만들지 않는다.
5. 자격심사·전문화 변경·유니폼·배지·작업공간·커리어 아카이브·명예관을 반복 소비처로 사용한다.
6. 가격·보상·난이도·검증·감소곡선은 서버 정책버전으로 관리한다.
7. 완료/보상/XP/재료변경은 원자적·멱등 정산으로 처리한다.

## 2. 초기 직업군

| 코드 | 직업 | 핵심 활동 | 초반 작업 | 상위 정체성 | 연계 |
|---|---|---|---|---|---|
| `COURIER` | 도시 배달원 | 경로 수행 | City Delivery | 물류 전문가 | 사업/물류 |
| `RETAIL` | 소매 운영원 | 주문/재고 | Shelf Restock | 매장 운영 리드 | 사업 |
| `TECH` | 디지털 기술자 | 진단/수리 | Device Check | 시스템 전문가 | 제작 |
| `CREATOR` | 미디어 크리에이터 | 브리프 작업 | Poster Brief | 크리에이티브 디렉터 | 커뮤니티/시즌 |
| `ANALYST` | 시장 분석가 | 학습/복기 | Watchlist Review | 리스크 분석가 | WDX/리플레이 |
| `CRAFT` | 공방 장인 | 제작/품질 | Basic Assembly | 마스터 장인 | 제작/거래소 |
| `FARM` | 도시 생산자 | 생산계획 | Seed Batch | 생산 전문가 | 사업/공급망 |
| `LOGISTICS` | 물류 운영자 | 배송계획 | Route Plan | 네트워크 플래너 | 사업/클럽 |
| `CIVIC` | 도시 코디네이터 | 공공과제 | Public Notice | 도시 스튜어드 | 도시 프로젝트 |

## 3. 작업 상태머신

`AVAILABLE -> ACCEPTED -> IN_PROGRESS -> SUBMITTED -> VERIFYING -> COMPLETED -> SETTLED`

예외: `ABANDONED`, `REJECTED`, `REVIEW_HOLD`.

정산은 한 번만 가능하며 클라이언트 타이머를 신뢰하지 않는다. 수락 시 정책버전을 저장하고, 재시도는 canonical 상태를 반환한다. 권장 정산키는 `job_settlement:{assignment_instance_id}:{user_id}:{policy_version}`이다.

## 4. 무제한 플레이와 한계보상

일반 작업 횟수 기본값은 무제한이다. 경제를 망가뜨리는 단일 저난도 작업 무한반복은 횟수를 막는 대신 다음과 같은 한계보상 곡선으로 제어한다.

`effective_wld = base_wld * max(floor_multiplier, 1 / sqrt(1 + repeat_index * k))`

튜닝 예시: `k=0.08`, WLD 최저 배율 `0.35`, 숙련 XP 최저 배율 `0.70`. 수집/업적 진척은 부정행위 신호가 없는 한 유지한다. 감소 적용 시 UI에 실제 정산액과 대체 작업을 명확히 보여준다.

## 5. 보상 모델

`gross_reward = base_reward * difficulty_factor * quality_factor * context_factor`

`net_reward = gross_reward * marginal_repeat_factor`

난이도 0.8~2.5, 품질 0.7~1.3, 정상 이벤트/상황계수 0.8~1.2, 반복계수 0.35~1.0을 튜닝 시작범위로 둔다. 영구 보너스를 무제한 곱연산하지 않는다.

## 6. 숙련도와 전문화

직업별 `mastery_xp`는 장기 누적값이며 일반 최종 레벨 하드캡을 두지 않는다. 표시레벨 예시는 `다음 레벨 XP = round(250 * level^1.35)`로 계산한다. 단계는 견습 → 숙련 → 프로 → 전문가 → 엑스퍼트 → 마스터 → 레거시로 묶어 표현할 수 있다.

전문화는 콘텐츠 선택을 넓히되 계정을 영구 잠그지 않는다. 재전문화 비용 예시는 `1,000 + 500 × 해금 전문노드 수` WLD이며 `HARD_SINK`다. 직접 WLD 배율을 구매하는 기능은 아니다.

## 7. 소비처

| 소비처 | 가격 예시 | 반복 | 분류 | 가치 |
|---|---:|---|---|---|
| 기본 자격심사 | 750 WLD | 직업별 | HARD_SINK | 작업군 해금 |
| 전문 자격시험 | 5,000 WLD | 전문화별 | HARD_SINK | 칭호/고급과제 |
| 마스터 포트폴리오 심사 | 25,000 WLD | 프레스티지 주기 | HARD_SINK | 기록/명예 |
| 재전문화 | 공식 | 반복 | HARD_SINK | 선택변경 |
| 유니폼 색상변경 | 500 WLD | 반복 | HARD_SINK | 외형 |
| 직업배지 각인 | 1,500 WLD | 반복 | HARD_SINK | 프로필 전시 |
| 작업공간 테마 | 4,000 WLD | 반복 | HARD_SINK | 공간 외형 |
| 커리어 아카이브 권 | 50,000 WLD | 반복 | HARD_SINK | 영구 기록 |
| 레거시 홀 윙 | `100,000×1.45^n` | 기본 무제한 | HARD_SINK | 전시공간 |
| 도시 직업 후원 | 250,000+ WLD | 반복 | HARD_SINK | 공개 명예기록 |

검증된 숙련요건은 돈으로 우회할 수 없다.

## 8. 경제 분류

시스템 작업보상은 `FAUCET`, 미래 유저 의뢰 원금은 `TRANSFER`, 플랫폼 의뢰수수료·자격·재전문화·꾸미기·아카이브 비용은 `HARD_SINK`, 재료 변환은 `CONVERTER`, 예약 보증금은 정산 전 `HOLD`로 구분한다.

## 9. 악용방지

불가능한 완료시간, 동일 결과 반복, 연계계정 의뢰순환, 변경된 payload의 idempotency 재사용, 비정상 burst, 단일 템플릿 집중, 클라이언트 타이머/점수 조작을 탐지한다. 보호조치는 상태전이 거부 → 중복 canonical 반환 → 영향 보상만 보류/감액 → 필요 시 특정 작업/계정 `REVIEW_HOLD` 순으로 적용하고 무관한 영구자산은 자동 몰수하지 않는다.

## 10. 연계

사업: 직업 숙련은 운영 선택지·분석UI를 열 수 있지만 무위험 수익배율은 금지한다.

제작/거래소: 직업 레시피 산출품은 기존 제작/거래소 원장 규칙을 따른다.

클럽: 동일 작업 반복은 일일 참여금지 대신 기여가중치 감소를 사용할 수 있다.

도시: Civic 작업은 비화폐 프로젝트 진행도를 줄 수 있고 WLD 기부는 별도 hard sink다.

WDX: Analyst 작업은 거래횟수/수익보다 저널·분산·복기를 보상한다.

## 11. 시즌

Season 1: 서로 다른 직업군 3개 경험, 기본 자격심사 1개, 커리어 저널, 비파워 직업 소비처 1회, 주간 수입/지출 복기.

Season 2: 제조/물류 작업, 사업 공급망 지원, 클럽 생산 캠페인, 전문화 1개, 물류 분석/리플레이.

시즌 종료 후 숙련도·자격·프레스티지·저널·코스메틱은 유지하고 시즌 전용 작업진척/랭킹만 아카이브·리셋한다.

## 12. UX

`/earn`은 추천 작업, 직업카드/현재랭크/다음해금, 작업브라우저, 진행중 작업, 숙련/전문화 지도, 자격심사, 커리어 아카이브, 반복계수 포함 실제 정산 설명을 제공한다. `loading`, `empty`, `prerequisite locked`, `protection throttled`, `review hold`, `idempotent replay`, `rejected`, `completed-unsettled`, `settled` 상태가 필요하다.

## 13. 데이터 모델

권장 테이블: `profession_definitions`, `job_templates`, `job_assignment_instances`, `profession_progress`, `profession_certifications`, `job_settlements`.

중요 제약: `job_settlements.assignment_instance_id UNIQUE`, 원장 `transaction_id UNIQUE`, `idempotency_key UNIQUE(user_id,idempotency_key)`, `(user_id,profession_code)` 숙련도 유일성.

## 14. API

P0: `GET /api/jobs/catalog`, `POST /api/jobs/{templateId}/accept`, `GET /api/jobs/assignments/{id}`, `POST .../submit`, `POST .../complete`, `GET /api/professions`, `GET /api/professions/{code}/progress`, 자격구매, 재전문화 API.

가치변경 API는 idempotency key가 필수이며 정책버전·canonical 상태·정확한 WLD/숙련도 정산결과를 반환한다.

## 15. 원장 transaction type

`FAUCET_JOB_REWARD`, `SINK_PROFESSION_CERTIFICATION`, `SINK_PROFESSION_RESPEC`, `SINK_PROFESSION_COSMETIC`, `SINK_PROFESSION_ARCHIVE`, `SINK_PROFESSION_PRESTIGE_SPACE`, 향후 `TRANSFER_JOB_COMMISSION`, `SINK_JOB_COMMISSION_FEE`.

## 16. 분석/관리자

발행량, 사용자/코호트별 일수익, P50/P90/P99 수익, 작업 템플릿 집중도, 직업 다양성, 반복계수 분포, 검증실패/보류율, 소비처별 소각량, job faucet 대비 sink 비율, P50/P90/P95/P99 유동자산, 상위 1%/10% 자산집중, 고자산 명예소비율을 본다.

관리자는 템플릿 활성화, 기본보상/XP, 난이도·품질계수, 한계보상곡선, 검증방식, 자격요건/가격, 소비처, 시즌태그, 보호임계값을 버전관리·미리보기·예약할 수 있다. 과거 정산은 정책변경으로 재작성하지 않는다.

## 17. 완료 조건

P0 완료에는 서버 권위 상태머신, 중복지급 방지, 일반 작업횟수 무제한, 반복계수 서버계산/표시, 시즌비리셋 숙련도, 5개 이상 완성 직업군, 자격/4종 이상 소비처, faucet/sink/transfer 대사, 감사가능 review-hold, 경제분석, 영문/한국어 UX parity, exact-SHA 격리 Test 검증이 필요하다.

이번 변경은 문서-only다. 실제 구현은 별도 개발 브랜치, forward-only migration, CI, exact-SHA 격리 Test 검증 후 Production으로 승격해야 한다.