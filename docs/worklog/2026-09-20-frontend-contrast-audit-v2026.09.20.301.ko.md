# 프론트엔드 색상·대비 감사 — v2026.09.20.301

날짜: 2026-09-20  
브랜치: `feat/frontend-contrast-v2026.09.20.301`  
기준: `0b973824d85379119813f9b9f53cd7cdd4ddeb93`

## 내부 구현 기록

v297 재구축 기반에서 이전 다크 전용 표현에 가려져 있던 테마 경계 결함이 드러났습니다. 이번 회차는 또 다른 꾸미기 레이어를 추가하는 대신 프론트 전체 색상 사용을 감사합니다.

### 원인

- `:root`와 `.dark`가 하나의 밝은 palette를 공유하면서 `dark:` utility는 계속 동작했습니다.
- 라이트 3차 text token이 일반 텍스트 AA를 통과하지 못했습니다.
- 여러 전역 surface가 밝은 색으로 hard-code 되어 있었습니다.
- 라우트 컴포넌트에 light card 위 dark 전용 300/400 글자색이 남아 있었습니다.
- 임의 point color가 primary surface를 너무 밝게 만들어 흰 글자의 가독성을 떨어뜨릴 수 있었습니다.

### 구현

- 라이트/다크 semantic palette를 분리했습니다.
- 전역 hard-coded surface를 theme-aware token으로 교체했습니다.
- 홈 상태 panel, 상점 희귀도/상태, 작업/직업 상태, 인벤토리, 사업체 수치, 관리자 상태 색상을 수정했습니다.
- WCAG 대비를 계산하는 자동 회귀 테스트를 추가했습니다.
- 라이트 테마 사용자 point primary 밝기를 제한했습니다.

### 현재 검증

- Frontend Vitest: 92/92 파일, 688/688 테스트.
- Contract build + frontend TypeScript: 통과.
- 측정한 라이트 일반 텍스트 최저 대비: 4.90:1.
- 검증한 다크 foreground 최저 대비: 6.14:1.
