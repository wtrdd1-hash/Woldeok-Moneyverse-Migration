# 제품 기획 작업기록 — v2026.09.12.17

기준일: 2026-09-12
범위: 은행·금융 서비스
브랜치: `docs/banking-financial-services-v2026.09.12.17`
런타임/배포 영향: 없음(문서만 변경)

## 검토 자료

- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/PRODUCT_DESIGN_SPEC.md`
- `docs/planning/SEASON_SYSTEM_SPEC.md`
- `docs/planning/DEFAULT_LIMIT_POLICY.md`
- `docs/planning/ECONOMY_SINKS_SPEC.md`
- `docs/features/banking.md`
- 최신 marketplace/crafting 기획 PR
- 최신 TradingView Paper Trading / Bar Replay 문서
- 최신 Microsoft PlayFab Economy store/inventory 문서

## 발견사항

기존 은행 기능문서는 이자정산·대출·가상채권·정수 안전 WLD 표현 등 핵심 무결성 규칙은 이미 갖고 있었다. 부족한 부분은 원장 기반이 아니라 장기간 반복해서 사용할 수 있는 은행 서비스 포트폴리오였다.

주요 미완성 영역:

- unlimited 기본정책 기반 저축목표와 비경쟁형 유료 꾸미기;
- 은행 faucet/transfer/sink 경제분류;
- 임의 대출횟수 제한 없는 총 익스포저 정책;
- 연체·곤란상태·구조조정 회복경로;
- 설명 가능한 게임 내부 신용평판;
- 가상채권 수수료/만기 계약;
- 보고서·아카이브·금고 반복 소비처;
- 지급재원이 명확한 게임용 사업보호 서비스;
- 고자산 은행 명예 소비처;
- 시즌 연결;
- DB/API/관리자/분석/어뷰징 테스트 계약.

## 외부 설계 검토

TradingView는 Paper Trading과 Bar Replay를 실제 자금위험에서 계속 분리하고 있어 Moneyverse도 금융학습/리플레이를 메인 WLD와 분리하고 거래횟수보다 복기와 위험관리 중심으로 설계하는 방향을 유지했다.

Microsoft PlayFab Economy는 카탈로그의 지속 정체성과 상점 가격/config를 분리하고 서버측 인벤토리 거래를 제공하므로 Moneyverse도 서비스 정체성과 운영가격/정책버전을 분리하는 방향을 유지했다.

## 변경사항

영문 기준 및 한국어 대응 은행·금융 서비스 명세를 추가했다.

- 저축 포켓/목표;
- 예치이자 재원모드;
- 가상대출·총 익스포저 규칙;
- 상환·연체·구조조정;
- 게임 내부 신용평판;
- 가상채권;
- 금융보고서·아카이브;
- 금고/전시 소비처;
- Business Protection Contract;
- 고자산 prestige sink;
- 시장학습·시즌 연결;
- 원장 transaction type;
- DB/API/관리자/분석 요구사항;
- 어뷰징·무결성 테스트;
- 출시 우선순위와 완료조건.

## 동시변경 재확인

작업 중간 재확인 결과:

- `main`은 `5944f7a28504b5a8a9d5da165c4bf1141d4105d5` 유지.
- PR #173 head는 `6f5d186b77cc77badd8713b952a7f2910c5c10cb` 유지.
- 은행 범위와 충돌하는 동시 제품기획 변경 없음.

이번 브랜치는 최신 marketplace/crafting 기획을 포함하기 위해 PR #173 head에서 시작했고, 은행 변경만 별도로 검토할 수 있는 stacked planning PR 구조를 사용한다.

## 검증

- 영문/한국어 기획 대응 검토.
- 런타임/API/DB 코드 변경 없음.
- 문서-only이므로 테스트서버 배포 불필요.

실제 구현은 반드시 별도 개발 브랜치에서 진행하고 필요한 forward-only migration, CI, 정확한 후보 SHA의 격리 Test 배포, 백엔드/API/DB/원장 검증 후 Production으로 승격한다.

## 다음 기획 우선순위

1. P0 은행 서비스 전체 seed catalog와 관리자 config 스키마.
2. 자산코호트별 이자·대출발행·서비스 sink·고자산 소비 경제시뮬레이션.
3. Season 1 금융 퀘스트/보상 전체표.
4. 사업보호 이벤트 분류와 지급예산 시뮬레이션.
5. 과거 기획서의 count cap 중 `DEFAULT_LIMIT_POLICY.md`와 충돌하는 항목 정리.
