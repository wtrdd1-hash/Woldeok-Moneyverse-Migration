# 모바일 홈 사람 중심 재설계 — v2026.09.19.273

- 버전: v2026.09.19.273
- 브랜치: feat/mobile-home-human-redesign-v2026.09.19.273
- 기준 SHA: 2cc746cb1474377458d591bc991eb745fe6eb39f

## 이유

운영 모바일 캡처에서 v271이 사용자 관점에서 사실상 거의 바뀌지 않은 것으로 확인됐다. route-family 기준선만 추가됐고 실제 큰 카드/glow/pill 구조는 남아 있었다.

## 상태 체크리스트

- [x] v273-01 통합 기획서 재확인 및 운영 캡처 불일치 확인.
- [x] v273-02 승인된 제품 문구를 유지하면서 큰 rounded/glow 모바일 hero card 제거.
- [x] v273-03 잔액 영역을 평면 rule 기반 header로 재구성.
- [x] v273-04 오늘의 동선을 선형 navigation list로 변경.
- [x] v273-05 pill 형태 secondary shortcut 제거 및 공지/안내 평면화.
- [x] v273-06 떠 있는 둥근 하단 navigation을 full-width flat tab bar로 변경.
- [x] v273-07 route 동작, 번역, 접근성 label, 주요 44px 이상 touch target 유지.
- [x] v273-08 contract build, typecheck, 전체 frontend test, lint, production build, diff-check 수행.
- [ ] v273-09 exact SHA를 isolated Test에 배포하고 실제 렌더링/screenshot 검수.
- [ ] v273-10 Test visual/runtime QA 통과 후에만 Production 승격.

## 검증

- contract build PASS
- frontend typecheck PASS
- frontend 83 files / 660 tests PASS
- lint 오류 0, 기존 image warning 11개
- Next.js production build PASS
- git diff --check PASS

Test 배포와 실제 screenshot QA 후에만 Production 승격한다.
