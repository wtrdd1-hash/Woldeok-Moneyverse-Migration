# 제품 기획 작업 로그 — v2026.09.13.4

## 시작 상태

- 최신 `main`과 Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec을 다시 읽었다.
- 작업 시작 main SHA: `7f2e59b0faf627376f9dd8066be2bf0642e31981`.
- 열린 PR도 확인했다. PR #189에는 읽기 전용 Economy Scenario Lab 런타임이 있고, PR #196~#198은 런타임 통합/보안/관리자 편집 안전 작업으로 이번 문서-only 기획과 직접 충돌하지 않는다.
- 작업 중간에 `main`을 다시 확인했으며 SHA 변화가 없었다.

## 선택한 공백

`ECONOMY_SINKS_SPEC.md`는 30/90/180일 경제 시뮬레이션 모델과 동적 소비처 조정 playbook을 미완성 작업으로 직접 지정한다. 현재 Scenario Lab은 최근 aggregate flow에서 M2를 예측하지만 코호트 행동, 자산분포, 시나리오 가정, 가격탄력성, 실험 메타데이터, 운영 가드레일, 롤백까지 포함한 구현급 기획계약은 없었다.

## 완료 작업

- 영문 canonical `ECONOMY_SIMULATION_TUNING_SPEC.md` 추가.
- 한국어 대응본 동시 추가.
- transfer volume을 burn으로 오인하지 않도록 경제 회계 분류 정의.
- 필수 macro/distribution 지표, 30/90/180 시나리오, 모델 단계, 경제 상태 밴드 정의.
- unlimited-by-default 정책과 맞는 자발적 소비처 우선 조정순서 정의.
- config 변경폭 가드레일, 코호트 실험, 향후 DB/API/read model, UI 상태, 접근성, analytics, 악용 데이터 처리 정의.
- 자동 정책 쓰기를 허용하지 않는다고 명시.

## 최신 외부 조사

### Microsoft PlayFab Economy V2 — 공식 문서 — 채택
2026년 최신 문서에서 멱등성 inventory/economy 작업, transaction history, 고동시성 구조, 명시적 플랫폼 제한을 확인했다. 멱등성·이력/reconciliation과 시스템 보호한도를 일반 플레이 제한과 분리하는 근거로 사용했다.

### Unity Remote Config / Game Overrides — 공식 문서 — 채택
환경별 설정, 타깃팅, 예약 override, 구성 hash, A/B 가능한 변경을 확인했다. 경제 config를 하드코딩하지 않고 버전화·가역화·측정하는 LiveOps 근거로 사용했다.

### Unity Economy 서비스 가용성 — 공식 문서 — 참고만 함
Unity 공식 문서에는 2026-09-08부터 신규 Unity Economy 프로젝트 가입이 중단되고 기존 설정 프로젝트는 계속 지원된다고 명시되어 있다. Moneyverse는 이 서비스에 의존하지 않는다.

## 실제 서비스 검증

`https://easy-scraping.com` 외부 fetch가 HTTP 530을 반환했다. Runtime Product Reality Audit은 계속 `runtime verification unavailable`이다. Production/Test 기능을 추정하지 않았다.

## 버전과 브랜치

- 버전: `v2026.09.13.4`
- 브랜치: `docs/economy-simulation-tuning-v2026.09.13.4`
- 문서-only: 예
- 테스트서버 배포: 이번 문서 변경에는 불필요
- 런타임 변경: 없음

## 런타임 구현 규칙

향후 policy-write/config 구현은 별도 개발 브랜치 -> isolated Test exact-SHA/config -> backend/DB/API/UI 검증 -> Production 순서를 따라야 한다. 이번 문서는 자동 tuning을 허용하지 않는다.

## 수익 / 법규 / SEO

- 수익화는 비-P2W를 유지하고 광고·스폰서 비용과 경제결과를 직접 연결하지 않는다.
- WLD/WDX는 virtual/simulated/game-only 유지. 현금성 또는 규제 금융 성격 변화는 별도 법률검토가 필요하다.
- 관리자 시나리오 화면은 인증/noindex를 유지하며 신규 공개 SEO 페이지를 만들지 않는다.

## 다음 우선순위

1. 읽기 전용 Economy Scenario Lab 런타임 후보 검증 및 통합.
2. 동적조정 자동화 전에 권위있는 economy metric snapshot 및 sink/cohort read model 구축.
3. P0 자체 인증/보안 구현과 exact-SHA 보안 QA 계속.
4. 서비스 접근 복구 즉시 Runtime Product Reality Audit 수행.
5. 임의 사용자 하드캡 없이 핵심 제품 공백 계속 해소.
