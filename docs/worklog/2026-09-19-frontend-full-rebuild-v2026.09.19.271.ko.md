# 전 페이지 프론트엔드 재설계 기준선 — v2026.09.19.271

- 버전: v2026.09.19.271
- 날짜: 2026-09-19
- 브랜치: feat/frontend-full-rebuild-v2026.09.19.271
- 기준 main: 73369111f32ca5f360ab7a8615e3e2d52200c1b2
- 범위: 현재 70개 프론트엔드 route의 페이지 단위 재설계 기준선

## 목표

v260처럼 공통 shell/theme만 바꾸고 전면 재설계 완료로 처리하지 않도록 바꾼다. 현재 모든 page route를 직접 추적하고 화면 목적별 family를 부여해 이후 페이지별 수동 디자인과 screenshot QA가 강제되도록 한다.

## 작업 순서별 버전

1. v2026.09.19.271-01 — 통합 기획서 재확인 및 v260과 사용자 요구 범위 대조.
2. v2026.09.19.271-02 — 인간 제작/실제 출시 제품 UI 1,000개 이상 코퍼스 규모 검증 및 채택/배제 패턴 문서화.
3. v2026.09.19.271-03 — 70개 page route inventory와 페이지별 identity 적용.
4. v2026.09.19.271-04 — finance/member/community/gameplay/admin/utility 화면군 분리.
5. v2026.09.19.271-05 — AI 템플릿처럼 보이는 UI를 명시적 검수 실패 조건으로 추가.
6. v2026.09.19.271-06 — contract build, typecheck, 전체 frontend test, lint, production build 수행.
7. v2026.09.19.271-07 — isolated Test에서 전 페이지 screenshot/visual QA와 수동 페이지별 보정 필요.

## 현재 구현

- 현재 70개 page 파일 전부 직접 추적.
- 한 종류 dashboard template 대신 화면군마다 밀도, radius, 숫자 표현, 레이아웃 동작을 분리.
- 금융/관리자는 tabular numeric과 조밀한 운영 화면 구조를 우선.
- 회원/인증은 읽기 폭을 제한.
- 커뮤니티는 editorial reading measure를 유지.
- 게임 화면은 장식용 card elevation을 기본값으로 사용하지 않음.
- bento 반복, 네온/보라 glow, 전 화면 glass card, 의미 없는 KPI 4개, 동일 radius/spacing, 장식 아이콘 타일, 가짜 AI insight를 검수 차단 조건으로 기획서에 명시.

## 레퍼런스 코퍼스

docs/design/FRONTEND_REFERENCE_CORPUS_v271.md 참고. 2026-09-19 공개 기준 Mobbin 1,428 apps / 621,500+ screens / 323,900 flows, SiteInspire 1,000개 이상 복수 카테고리, Gummble 1,500+ apps/sites / 300,000+ screens / 21,000+ flows, SaaSFrame dashboard 집중 부분집합을 확인했다.

## 검증

- contract build PASS
- frontend TypeScript PASS
- frontend 82 files / 658 tests PASS
- lint 오류 0, 기존 image warning 11개
- Next.js 16.3.4 production build PASS
- git diff --check PASS
- isolated Test screenshot/visual QA PENDING
- Test 검증 전 Production 승격 차단

## 중요한 제한

이번 커밋은 전 페이지 재설계 작업을 실제 page 단위로 전환하는 기준선이다. 70개 화면 모두의 최종 수동 디자인이 끝났다는 의미는 아니다. 완료 판정에는 Test의 페이지별 screenshot 검수와 route별 추가 보정이 필요하다.
