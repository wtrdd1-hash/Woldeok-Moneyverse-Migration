# 제품 기획 작업기록 — v2026.09.12.25

기준일: 2026-09-12
브랜치: `docs/business-operations-supply-chain-v2026.09.12.25`
범위: 문서-only 사업 운영·공급망 기획

## 시작 상태

- 최신 `main`의 Living Project Plan을 읽었다.
- Detailed Product Design의 사업체 구간, Economy Sinks의 사업 소비처, `docs/features/businesses.md`를 검토했다.
- 현재 고정 일일매출 사업 데이터와 legacy `daily_limit` 필드를 이해하기 위해 기존 jobs/business migration seed도 확인했다.
- 활성 런타임 PR을 덮어쓰지 않도록 현재 열린 PR을 확인했다.

## 선택한 기획 공백

사업체 기획은 거래소·은행·클럽·커뮤니티 등 최근 명세에 비해 구현 깊이가 낮았다. 기존 문서는 스타터 사업체와 일일 손익식은 있었지만 조달, 재고예약, 운영run, 배송상태, 지점네트워크, 유지보수, 소비처 분류, API/DB 계약, 기본 무제한 정책을 충분히 정의하지 않았다.

## 조사 자료

- Microsoft Learn PlayFab Economy V2 Stores: 카탈로그 정체성과 Store별 가격분리.
- Microsoft Learn PlayFab Inventory/idempotent transaction: 재시도 안전한 쓰기행동.
- EVE Online 2026년 8월 Monthly Economic Report, 2026-09-09 공개: 경제활동·가격지표·raw data 관측.
- TradingView Demo/Paper Trading/Bar Replay: 실제 금융노출과 분리된 시뮬레이션 학습.

## 변경

- 영문 기준 + 한국어 대응 사업 운영·공급망 명세 추가.
- 사업체 생명주기, 조달, 재고, 창고확장, 수요식, 운영run, 원자적 정산 정의.
- 지점/배송 상태머신, 유지보수/복귀, 광고, 계약, 전문화, 명예, 게임 내부 보호서비스 정의.
- 가격/곡선, 반복성, 사용자 가치, P2W 경계, 원장유형을 포함한 소비처 표 추가.
- 일반 사업 성장에 `null = unlimited`를 적용하고 실제 희소성/보안/시스템안전/시장무결성 보호만 예외로 유지.
- Season 1/2 연동과 D-14/D-7/D-3/D-1 전환안내 추가.
- DB 엔티티, API, 오류코드, 관리자 config, 경제지표, 분석, 악용방지, 구현단계, 완료조건 추가.

## 발견한 구현 정합성 문제

적용된 과거 마이그레이션에는 작업 `daily_limit` seed와 고정 일일매출/운영비 사업체 데이터가 있다. 적용된 마이그레이션은 수정하지 않는다. 이번 기획은 불일치만 기록하며 런타임을 변경하지 않는다. 실제 전환은 새 forward migration/policy version으로 별도 구현하고 Test를 통과해야 한다.

## 작업 중 저장소 재확인

PR 생성 직전에 `main`을 다시 확인한다. 브랜치 생성 뒤 `main`이 변경됐다면 최신 head와 비교해 이번 기획파일과 충돌하는 변경이 있는지 확인한 뒤 마무리한다.

## 검증

문서-only다. 코드, 스키마, 마이그레이션, API 동작, 배포 manifest를 변경하지 않았다. 이번 개정 자체에는 테스트서버 배포가 필요하지 않다.

## 다음 우선순위

1. 사업용 원재료/산출품 SKU·레시피 50개 이상 구체화.
2. 사업주 화면별 UX와 loading/empty/error/review 상태 정의.
3. 관리자 Business Policy 콘솔과 정책버전 미리보기 정의.
4. 자산구간/업종별 사업 경제 시나리오 시뮬레이션 기획.
5. legacy `daily_limit`와 고정 정산을 forward-only 구현계획으로 정합화.
6. Season 2의 작업장/창고 레시피·물류퀘스트·클럽 공동생산 목표 상세화.