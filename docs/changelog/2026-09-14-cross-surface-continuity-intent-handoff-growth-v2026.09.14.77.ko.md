# 변경기록 — v2026.09.14.77 크로스 서피스 연속성·의도 인계 성장

기준일: 2026-09-14
변경 유형: 문서-only
런타임/코드 변경: 없음

## 추가
- `CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md`와 한국어 대응본 추가.
- 공개 웹, 로그인 웹/네이티브 앱, Discord/커뮤니티 사이에서 사용자의 목적이 끊기는 문제를 핵심 성장 공백으로 정의.
- `qualified entry → authored intent → optional safe handoff → destination intent recognition → meaningful action → D1/D7 continuity → D30 unified history` funnel 추가.
- 모든 surface에 동일 기능을 복제하지 않고 surface별 역할을 정의.
- cross-surface activation/retention/acquisition/SEO/monetization/trust KPI 추가.
- contextual handoff, optional linking, install pressure, 통합 continuation history, handoff 수익화 위치를 검증하는 5개 실험 추가.

## 보안·개인정보·악용 guardrail
- 기존 OAuth/session/RBAC/admin/ledger/privacy/community 경계를 유지.
- 악성 deep-link/invite, account-link hijacking, private-state leakage, referral/install/link farming을 HIGH 위험으로 기록.
- raw handoff/install/link 행동에는 의미 있는 WLD/WDX 보상을 지급하지 않는 원칙 유지.
- public-safe data, private-by-default continuation, cross-surface analytics 최소화를 요구.
- verified platform/app links는 향후 구현 QA trigger로만 기록하고 이번 회차 코드변경은 수행하지 않음.

## 최신 레퍼런스
Xbox cross-device continuity, Discord GDC 2026/Social Layer, Android App Links 보안 가이드, KISA 2026-05-19 피싱 경고, 개인정보위 2026-07-27 행태정보 제재, FTC 2026 구독 집행을 직접채택/참고 근거로 기록.

## Runtime reality
Production 공개 웹은 검증했다. native app 실제 UX와 Discord→web/app end-to-end contextual handoff는 독립적으로 검증하지 못했으므로 cross-surface intent continuity는 미검증 성장 가설로 기록했다.

## 반영 상태
- 문서-only.
- 최종 최신 `main` 재확인 후 별도 PR 없이 fast-forward 직접 반영 예정.
- 런타임·DB·API·인증·migration·scheduler·인프라·보안코드 수정 없음.