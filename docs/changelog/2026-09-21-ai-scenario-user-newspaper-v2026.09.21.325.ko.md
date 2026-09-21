# 변경 내역 — v2026.09.21.325 AI 시나리오 사용자 신문

- 날짜: 2026-09-21
- 유형: 기획/문서 전용
- 권위 문서: `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.ko.md`
- 영문 문서: `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.md`

## 변경
- 기존 `v2026.09.19.261` AI 주식 시나리오 자동생성·게시 기획이 실제 통합기획서에 존재함을 재확인.
- `backend/src/admin/ai-news.service.ts`, scheduler 및 `AI_NEWS_AUTO_*` 경로에서 실제 자동생성 구현 존재를 확인.
- 일반 유저가 AI 시나리오를 신문 형태로 읽는 홈/기사/아카이브 기획 추가.
- bounded auto-publish 안전경계, AI 표시, game-only 표시, 정정/철회, provenance/audit, SEO·접근성·QA 계약 추가.
- Reuters Institute 2026, Google Search Central, 한국 AI 투명성/개인정보 공식 자료를 레퍼런스로 반영.

## 영향
문서 전용 변경이다. 런타임 코드, DB, 배포 설정은 변경하지 않는다. 구현 시 별도 개발 브랜치와 Test exact-SHA 검증 및 무중단 Production 승격 절차가 필요하다.
