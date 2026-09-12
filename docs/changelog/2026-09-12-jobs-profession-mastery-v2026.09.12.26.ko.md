# 작업·직업 숙련도 — v2026.09.12.26

기준일: 2026-09-12

## 추가

- `JOBS_PROFESSION_MASTERY_SPEC.md`와 한국어 대응본을 추가했다.
- 작업을 보상 버튼이 아니라 검증 과제 → 정산 → 숙련 → 전문화 루프로 재설계했다.
- 일반 작업 횟수, 직업 전환, 장기 숙련도에 기본 무제한 정책을 적용했다.
- 임의 일일 하드캡 대신 동일 템플릿 반복 시 한계 WLD 보상 감소 구조를 추가했다.
- 초기 직업군 9종, 지속 숙련도와 프레스티지 구조를 추가했다.
- 자격심사·재전문화·꾸미기·작업공간·아카이브·명예공간 WLD 소비처를 추가했다.
- `FAUCET`, `HARD_SINK`, `TRANSFER`, `CONVERTER`, `HOLD` 경제분류를 명시했다.
- 원자적·멱등 정산, 악용탐지, review-hold, 서버권위 상태머신을 정의했다.
- 사업·제작·클럽·도시 프로젝트·WDX 학습·Season 1/2 연계를 추가했다.
- DB/API/원장 transaction type/분석/관리자 config/P0 완료조건을 정의했다.

## 외부 자료

- TradingView Bar Replay/Replay Trading: 과거 데이터 학습을 실시간 거래와 분리하고 가상 초기자본·수수료를 설정할 수 있는 구조.
- TradingView demo/Paper Trading: 실제 금융노출과 분리된 가상자금 연습·경쟁 환경.
- Microsoft PlayFab Store/Catalog: 지속 상품정의와 운영 가격/config 분리 패턴.

## 검증

문서-only 변경이다. 런타임/API/DB/배포 동작은 변경하지 않았으며 이번 문서 개정 자체에는 Test 배포가 필요하지 않다. 실제 구현은 별도 개발 브랜치와 exact-SHA 격리 Test 검증 후 Production으로 승격해야 한다.