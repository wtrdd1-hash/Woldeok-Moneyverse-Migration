# 프론트엔드 재구축 기반 — v2026.09.20.297

날짜: 2026-09-20
브랜치: `feat/frontend-rebuild-v2026.09.20.297`
기준: `4dcd2ba112ae57565eed7444fe1d36512b926a3b`

## 내부 구현 기록

이번 회차는 Living Plan에서 요구한 프론트엔드 전면 재구축의 시작입니다. 기존 화면에 또 다른 테마를 덧씌우지 않고 이후 라우트 재설계가 하나의 시스템 위에서 진행되도록 공통 표현 구조부터 교체했습니다.

### 구현

- 기존의 어두운 그라데이션·글래스 중심 전역 redesign stylesheet를 절제된 밝은 제품 UI 체계로 교체했습니다.
- 전역 shell 간격과 최대 canvas 폭을 다시 구성했습니다.
- PageHeader, SectionHeader 정보 계층을 다시 만들었습니다.
- Card, Button primitive를 낮은 radius, 평면 elevation, 명확한 밀도 기준으로 다시 만들었습니다.
- 인증, API, 권한, 백엔드, 원장, DB 동작은 변경하지 않았습니다.

### 검증

- Contract package build: 통과.
- Frontend typecheck: 통과.
- Frontend Production build: 통과.
- Frontend Vitest: 90/90 파일, 681/681 테스트 통과.
- 최초 Vitest 실패는 /tmp 용량과 contract build 순서 문제였으며 환경/순서 문제로 분리한 뒤 최종 clean run에서 모두 통과했습니다.

### 남은 재구축 범위

라우트 구성은 기획 순서대로 인증/계정, 경제/작업/주식/지갑, 상점/마켓/커뮤니티/콘텐츠, 관리자/운영 순으로 계속 재구축하고 마지막에 viewport·시각 회귀 QA를 수행해야 합니다.
