# 접근성·반응형 상호작용·UI 상태 v2026.09.13.11

기준일: 2026-09-13
유형: 문서-only 제품 기획 갱신
브랜치: `docs/accessibility-responsive-interaction-v2026.09.13.11`
Test 배포 필요: 없음
실서비스 검증: 불가

## 변경 이유

Moneyverse에는 일부 component와 기능 문서에 접근성 패턴이 있었지만, 키보드 조작, focus, 접근 가능한 인증, 반응형 변환, 실시간 알림, 차트 대안, UI 상태, reduced motion, 핵심 흐름 QA, 릴리스 차단 기준을 전체 제품에 강제하는 기준 문서가 없었다.

Account Security Center, billing, stock/community 런타임 작업으로 중요 상호작용 화면이 늘어나면서 이 공통 계약의 우선순위가 높아졌다.

## 추가 사항

- 영문 canonical `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`.
- 한국어 대응본.
- 적용 가능한 범위에서 WCAG 2.2 AA 내부 제품 목표.
- 공통 keyboard/focus/modal 계약.
- 접근 가능한 인증과 입력 오류 처리.
- pointer/touch/drag 대체조작.
- 금융·시장 화면의 색상 외 상태표시.
- chart/table 접근 가능한 대안.
- live-region 과다알림 방지.
- reduced-motion 및 anti-FOMO 상호작용 원칙.
- desktop/tablet/mobile 변환 규칙.
- default/loading/empty/error/offline/maintenance/permission/success/stale 필수 상태.
- 자동·수동 접근성 QA와 feature acceptance criteria.
- 장애 여부 추론/수익화 금지 analytics 원칙.
- 수익·SEO·접근성 간 운영 기준.
- P0/P1/P2 구현 우선순위.

## 현재 구현 증거

저장소에는 이미 `aria-live` 상태 알림과 loading semantics 등 일부 접근성 구현이 확인된다. 따라서 현재 제품 전체를 미구현으로 간주하지 않고, 흩어진 구현을 제품 전체 공통 계약으로 확장하는 문서다.

## 2026-09-13 외부 조사

### 직접 채택
- W3C WAI `Understanding WCAG 2.2` — 2026-02-11 업데이트, 공식 표준 가이드.
- W3C WAI `What's New in WCAG 2.2` — focus not obscured, dragging 대안, target size, redundant entry, accessible authentication에 채택.
- W3C ARIA Authoring Practices modal dialog pattern — focus containment/return과 keyboard 동작에 채택.

### 참고/법률 맥락
- 미국 DOJ ADA Title II 웹·앱 규칙 fact sheet와 2026 IFR — 주·지방정부 대상 공식 자료이므로 Moneyverse 민간서비스에 자동 적용한다고 보지 않는다. 대상 공공기관과 제공관계가 생기면 `legal review required`.
- Accessibility Korea — 자동 진단 운영 참고자료이며 완전 준수 증거로 사용하지 않는다.

## 정책 영향

- 일반 플레이 hard cap 추가 없음.
- faucet/hard sink/transfer 경제 분류 변경 없음.
- 접근성을 유료 기능으로 판매하거나 실험에서 제거할 수 없음.
- WLD/WDX는 계속 virtual/simulated/game-only.
- 개인정보·계정·관리자 페이지는 인증+`noindex` 유지.

## Runtime 상태

이번 회차에서 `easy-scraping.com`을 외부 검사기로 가져오지 못했다. 따라서 실제 keyboard·responsive·assistive-technology 동작은 `runtime verification unavailable`이며, 문서 요구사항을 이미 구현된 것처럼 표시하지 않는다.

## 다음 우선순위

1. 활성 Account Security Center 및 런타임 PR을 최신 main과 정합화하고 isolated Test에서 검증;
2. 자체 이메일 회원가입/로그인 P0 보안 구현;
3. 이 접근성 명세를 공통 component 및 핵심 흐름 자동/수동 QA 계약으로 구현;
4. 정상 서비스 endpoint가 확보되는 즉시 Runtime Product Reality Audit 수행.