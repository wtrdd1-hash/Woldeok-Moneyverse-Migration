# 제품 기획 작업기록 — v2026.09.12.11

기준일: 2026-09-12
브랜치: `docs/personal-spaces-city-projects-v2026.09.12.11`
범위: 개인 공간 + 도시 프로젝트 기획, 문서-only

## 시작 상태

최신 `main`의 Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec, Economy Sink Catalog를 다시 확인했다. 기존 Economy Sink Catalog에는 주거와 도시 프로젝트의 소비처 종류와 가격 시작점은 있었지만, 실제 상태머신·화면흐름·저장모델·API·동시성·관리자 기능·완료조건이 부족했다.

## 외부 조사

- Microsoft PlayFab Economy V2 Stores — 카탈로그 아이템 정체성과 Store별 가격/판매노출 분리
- Microsoft PlayFab Inventory Collections — 하나의 유저 identity 아래 여러 논리 인벤토리 분리
- TradingView The Leap 2026 — 별도 preset Paper Trading 경쟁 계정으로 대회 활동을 분리

## 제품 결정

- 개인 공간은 Pay-to-Win이 아닌 정체성·수집·전시 시스템으로 유지
- 공간 보유/확장은 기본 unlimited, 실제 제작된 콘텐츠 수만 콘텐츠 제약으로 처리
- 레이아웃 저장은 무료, 구매·리모델링·색상·각인·모듈에서 WLD hard sink 발생
- 도시 프로젝트는 실제 도시 변화와 명예/아카이브를 주는 자발적 hard sink
- 기여액은 기본 unlimited, 명예는 로그형/한계효용 감소 방식
- 명예는 WLD·수입·시장·대출·리그 우위로 전환 금지
- 메인 WLD와 시즌/경쟁 시뮬레이션 잔액을 개념적으로 분리

## 추가 문서

- `docs/planning/PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`
- `docs/planning/PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md`
- v2026.09.12.11 영문/한글 changelog
- 영문/한글 내부 기획 worklog
- 문서 INDEX 항목

## 작업 중간 upstream 재확인

첫 기획 문서 작성 후 `main`을 다시 확인했다. `main`은 `6c4237ccb811d37485fef2e65d390b936e188ccc`로 동일해 이 회차 중 추가 동시 기획 변경 충돌은 없었다.

## 검증

문서-only 변경이다. 런타임 코드, DB migration, API 구현, 배포상태를 변경하지 않았으므로 이번 회차에는 테스트서버 배포가 필요하지 않다.

향후 실제 구현은 별도 개발 브랜치에서 진행하고, 기존 원장/migration 불변조건을 유지하며, 정확한 후보 SHA를 Test 환경에 배포해 backend/API/DB/멱등성/동시성을 확인한 뒤 검증된 동일 revision만 Production으로 승격해야 한다.

## 다음 우선순위

1. 출시 가구·장식 50개 이상 SKU seed와 태그/가격대
2. 도시 프로젝트 관리자 wireframe·권한표
3. Season 1 도시 프로젝트 + Legacy Museum 정확한 일정/명예보상
4. 개인 공간 화면별 상세 interaction
5. 자산코호트별 sink 채택률 시뮬레이션
6. 실제 구현 전 기존 shop/ledger schema와 명세 매핑
