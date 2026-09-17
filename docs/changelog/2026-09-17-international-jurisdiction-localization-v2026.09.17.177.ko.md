# v2026.09.17.177 — 국제 국가정책·다국어·카지노·수익화 기획

> 날짜: 2026-09-17
> 브랜치: `docs/international-jurisdiction-localization-v2026.09.17.177`
> 기준 `main`: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
> 런타임 영향: 없음(문서 전용)

## GitHub용 변경내역

- `국가 × 주/지역 × 채널 × 연령 × 기능` 국제 정책 구조 추가.
- 사이트/앱 locale을 영어·한국어·일본어·독일어·프랑스어·스페인어·브라질 포르투갈어로 확대하고 자연번역 review gate 정의.
- Google 국제 SEO: 언어별 URL, self-canonical, 상호 hreflang, x-default, locale sitemap, IP/언어 강제 redirect 금지.
- Web/Google Play/App Store 국가별 결제경로를 정책 데이터로 분리.
- KR/US/GB/EEA/AU/JP/BR 초기 규제 기본값과 기타국가 fail-closed 정의.
- 카지노 직접수익 0, 실결제 도입 전 CSP/유료출처 격리 원칙 추가.

## 검증

영문/한국어 의미동기화, index link, 기존 EN/KO 한정 문구 제거, `git diff --check`를 PR 전에 확인한다.

## PR/CI 증거

- 초기 commit: `af2f359f33a0a73da6b9d5a14d622fc20466058f`
- PR: #413
- GitHub Actions CI: run `35173516232` 전체 PASS
- 상태: docs-only, runtime Test/Production 승격 N/A, PR merge 대기
