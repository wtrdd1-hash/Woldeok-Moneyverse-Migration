# 제품 기획 작업기록 — v2026.09.12.26

기준일: 2026-09-12

## 범위

최신 Living Project Plan, Detailed Product Design, Economy Sinks와 최근 사업/시스템 기획을 검토했다. 상대적으로 가장 비어 있던 영역은 Jobs/Profession Mastery였다. 기존 문서에는 작업/보상 흐름은 있었지만 무제한 플레이 정책과 결합된 구현수준 직업경제 명세가 부족했다.

## 결정

- 작업·직업 숙련도 전용 명세 추가.
- 일반 참여 기본 무제한 유지.
- 일일 완료횟수 하드캡 대신 반복 동일작업 한계 WLD 보상 감소와 작업 다양성 사용.
- 숙련도는 시즌이 끝나도 유지.
- 초반·중간·고자산·명예 단계의 자발적 WLD 소비처 추가.
- 자격/코스메틱 구매로 검증 숙련요건을 우회하지 못하게 설계.
- Analyst/WDX 진행은 수익/거래횟수가 아니라 저널·분산·리플레이 학습 중심.
- 원장분류·멱등 정산·review hold·DB/API·분석지표 정의.

## 조사 메모

TradingView Replay Trading은 초기자본·수수료를 설정할 수 있는 별도 과거데이터 시뮬레이션이며 실시간 거래결과와 학습을 분리한다. TradingView demo 도구도 Paper Trading과 가상대회를 실제 금융노출과 분리한다. PlayFab Store/Catalog 문서는 지속 상품정의와 운영가격/config를 분리하는 참고구조다.

## 저장소 상태

Business Operations & Supply-Chain v2026.09.12.25가 통합된 main commit `3a8e95b425f8ce3add5d3ed603f7605d097ead49`에서 브랜치를 생성했다.

## 검증

문서-only 변경이다. 런타임 Test 배포는 필요하지 않다. 실제 구현은 forward-only migration, 별도 개발 브랜치, CI, exact-SHA 격리 Test 검증을 거쳐야 한다.

## 다음 우선순위

1. 50개 이상 작업 템플릿/자격/소비처 seed catalog 작성;
2. 기존 `daily_limit` migration 의미를 forward-only 정책 migration으로 정합화;
3. `/earn` 화면 UX와 관리자 Job Policy 콘솔 상세화;
4. 무제한 작업 + 한계보상 + sink coverage 경제 시뮬레이션;
5. Season 1/2 직업 미션을 canonical Season spec에 연결.