# 모바일 홈 사람 중심 재설계 — v2026.09.19.273

- 버전: v2026.09.19.273
- 브랜치: feat/mobile-home-human-redesign-v2026.09.19.273
- 기준 SHA: 2cc746cb1474377458d591bc991eb745fe6eb39f

## 이유

운영 모바일 캡처에서 v271이 사용자 관점에서 사실상 거의 바뀌지 않은 것으로 확인됐다. route-family 기준선만 추가됐고 실제 큰 카드/glow/pill 구조는 남아 있었다.

## 변경

- 큰 rounded/glow 모바일 hero card 제거
- 잔액 영역을 평면 rule 기반 header로 재구성
- 오늘의 동선을 card가 아닌 선형 navigation list로 변경
- pill 형태 secondary shortcut 제거
- 공지와 안전 안내를 평면 구조로 변경
- 떠 있는 둥근 하단 navigation을 화면 폭 전체 flat tab bar로 변경
- route 동작, 번역, 접근성 label, touch size 유지

## 검증

- contract build PASS
- frontend typecheck PASS
- frontend 83 files / 660 tests PASS
- lint 오류 0, 기존 image warning 11개
- Next.js production build PASS
- git diff --check PASS

Test 배포와 실제 screenshot QA 후에만 Production 승격한다.
