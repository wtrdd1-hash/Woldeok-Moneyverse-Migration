# Moneyverse 경제 AI 런타임

> 버전: v2026.09.16.141
> 영문 기준 문서: [ECONOMY_AI_RUNTIME.md](ECONOMY_AI_RUNTIME.md)

## 호스트 저장소
- `/dev/sda`: 32GB 시스템/앱 디스크. 모델 weight 저장 금지.
- `/dev/sdb1`: 100GB 데이터 디스크, `/srv/moneyverse-data`에 마운트.
- AI root: `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs}`.

## 위원회 구조
`macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity` 6분야에 각각 A/B 두 좌석을 둔다. 각 좌석이 독립 판단 후 같은 분야 상대의 결과를 반박한다. 최종 12개 좌석 증거와 위원회 집계결과를 저장한다. 기존 classical policy engine은 fallback이자 권위 실행 lane이다.

## 모델 설정
공통 fallback은 `ECONOMY_AI_API_BASE_URL`, `ECONOMY_AI_MODEL_A`, `ECONOMY_AI_MODEL_B`, 선택적 `ECONOMY_AI_API_KEY`를 사용한다. `ECONOMY_AI_MAX_CONCURRENCY`로 동시 호출 수를 제한한다(기본 2, 로컬 단일모델은 1 권장). 분야별 override는 `ECONOMY_AI_<DOMAIN>_<A|B>_{API_BASE_URL,API_KEY,MODEL}` 형식이다. 가능하면 A/B에 서로 다른 모델 계열/checkpoint/adapter를 사용한다.

## 자원 원칙
원격 inference이면 현재 메모리로 충분하다. 로컬 inference는 12개 모델을 동시에 올리지 않고 residency/concurrency를 제한한다. 현재 약 13GiB RAM에서는 소형 양자화 모델 1개씩 실행하는 구성이 적절하다. 7~8B Q4 모델 두 개를 backend/DB와 함께 병렬 상주시킬 계획이면 최소 32GiB RAM을 권장한다. 데이터 디스크 여유가 약 85GB이므로 현재 디스크 증설은 필요하지 않다.
