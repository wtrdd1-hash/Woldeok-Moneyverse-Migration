# 2026-09-14 — 복귀 허용→라이프사이클 성장 v2026.09.14.66

## 요약

Moneyverse가 실제 복귀 이유를 만든 뒤에만 notification/return permission을 얻도록 하는 소비자 성장 명세를 추가했다.

이번 공백은 알림 인프라가 아니다. 저장소에는 이미 구현 중심 알림 거버넌스 문서가 있다. 부족했던 것은 첫 가치 → 사용자가 고른 미래 스레드 → 맥락형 permission → 의미 변화 → 정확한 맥락 복귀 → 의미 행동 → D7/D30으로 이어지는 소비자 루프였다.

## 추가

- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md`
- v2026.09.14.66 영/한 changelog와 worklog.

## 소비자 기획 변경

- 핵심 약속을 “내가 고른 것에 정말 돌아올 가치가 생겼을 때만 알려주세요”로 정의했다.
- optional notification permission을 첫 화면/onboarding이 아니라 durable authored choice 뒤로 이동했다.
- 복귀 가치 우선순위를 사용자가 요청한 연속성 → 의미 있는 개인 진행 → 넓은 제품 업데이트 → 상업 프로모션으로 정의했다.
- 강제 daily reminder 없이 D1/D3/D7/D14/D30 복귀 메시지 원칙을 정의했다.
- 메시지 구조를 recognize → explain → bound → continue로 정의했다.
- generic home보다 exact-context return을 성장 목표로 두었다.
- outbound interruption보다 in-app/on-surface continuity를 우선했다.
- product continuity와 commercial messaging/sponsored inventory를 분리했다.
- permission quality, return quality, business quality, trust/safety KPI를 추가했다.
- permission timing, category-specific opt-in, 의미 변화 comeback copy, exact-context destination, weekly recap vs generic daily reminder의 5개 실험을 추가했다.

## 보안·악용·개인정보

High:
- notification 사칭/phishing/ATO;
- lock screen/shared device의 private-state leakage;
- marketing을 service/benefit communication처럼 위장하는 문제.

Medium:
- notification fatigue/coercive retention;
- bot/multi-account notification-reward farming;
- analytics overcollection.

기존 authentication/session/RBAC/admin/ledger/privacy 경계는 약화하지 않는다.

## 최신 research note

조사일: 2026-09-14.

직접채택/참고:
- Android Developers notification runtime permission, 2026-09-01 갱신: 기능 맥락에서 permission 요청, 책임 있는 사용.
- Discord Mobile Notifications Settings 101, 2026-07-31 갱신: 앱 내부와 OS 알림 통제의 사용자 선택.
- Apple Human Interface Guidelines/User Notifications: 시기적절한 고가치 정보, marketing 명시 동의, time-sensitive interruption 남용 금지.
- KISA 불법스팸 안내서 제7차 개정, 2026-03-04: 명확한 광고동의 표현과 낮은 마찰의 앱푸시 수신거부.
- KISA 정부 사칭 피싱 경고, 2026-05-19: 신뢰 브랜드 사칭과 credential theft 위험.
- FTC CAN-SPAM baseline: 상업 이메일의 정확한 발신/제목과 작동하는 opt-out.

외부 re-engagement vendor의 uplift 수치는 Moneyverse 예측에 사용하지 않았다.

## Runtime reality audit

2026-09-14 runtime verification 가능.

관찰:
- homepage는 WLD/보상이 game-only임을 명확히 표시한다.
- wallet/game/exchange/shop/quest shortcut이 여전히 강하게 보인다.
- sponsored placement가 여러 곳 존재한다.
- 월간소식/운영소식은 사실상 비어 있다.
- public lobby는 조용하게 보일 수 있다.
- 시작 가이드는 finance/wealth 중심 서사를 유지한다.

현재 public runtime에는 `선택한 스레드 follow → 유용한 알림 하나 opt-in → exact-thread 복귀` 소비자 루프가 가시적으로 없다. 이번 회차는 이를 growth hypothesis로만 기록하고 runtime copy/behavior는 수정하지 않는다.

## 배포 상태

문서-only. 런타임, DB, API, 인증, scheduler, 인프라, 보안코드, Test/Production configuration 변경 없음.
