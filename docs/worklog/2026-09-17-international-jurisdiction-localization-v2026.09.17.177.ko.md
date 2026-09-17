# 작업일지 — v2026.09.17.177 국제 국가정책/다국어 조사

## 범위

조사·기획 전용. 애플리케이션/DB/Test/Production 변경 없음.

## 작업 이력

- 브랜치: `docs/international-jurisdiction-localization-v2026.09.17.177`
- 기준 main: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
- 대체된 로컬 시도: `docs/casino-legal-safety-v2026.09.17.176` / `faa047fdb637df74b4327ef45c9585be1c15d8c5` (미푸시·미병합, main v176 선반영으로 대체)
- 사용자 추가요청 후 재확인 main: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
- 수정 전 카지노·수익화·결제·미성년자·검색 기존 명세를 먼저 대조.
- Google Search Central, 한국 법령/GRAC/스토어, PIPC/공정위, EU Commission/DSA/GDPR 소비자자료, UK Gambling Commission, Washington 법령/미 제9연방항소법원, FTC COPPA, 호주 Classification, 일본 FSA, Apple/Google Play 정책 등 권위자료 우선 조사.
- 단순 원문 개수는 품질지표로 사용하지 않고 중복/SEO/2차 자료를 출시규칙 근거로 승격하지 않음.

## 결정

1. locale과 jurisdiction 분리.
2. fail-closed 국제 기능정책 엔진.
3. review-versioned 자연번역 자산과 locale 확대.
4. 언어별 URL/hreflang/x-default, 자동 locale redirect 금지.
5. 비-P2W·카지노 독립 상품만 유료화.
6. 현금 유료화+카지노 공존 전 CSP 또는 동등 provenance 격리.

## 검증/상태

- `git diff --check`와 상대 Markdown 링크 검사를 수행한다.
- 저장소 환경에는 Prettier 실행파일이 없어 `pnpm exec prettier --check`는 실행 불가(`Command "prettier" not found`)였다.
- 문서 전용이므로 Test/Production 승격 대상 아님. v176 backup/DR P0는 계속 OPEN이다.

## PR/CI 증거

- 초기 commit: `af2f359f33a0a73da6b9d5a14d622fc20466058f`
- PR: #413
- GitHub Actions CI: run `35173516232` 전체 PASS
- 상태: docs-only, runtime Test/Production 승격 N/A, PR merge 대기
