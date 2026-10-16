# v2026.10.16.747 — SEO 제출 증거·정확한 UI·오류 접근성 수정

**상태:** 구현 후보. 공식 Test/운영 수용 아님. [영문](2026-10-16-seo-submission-truth-v747.md)

## 시작 START (23:50 KST)
- 최신 `origin/main=0ae25bc8985be71f713eff2581bdb17b766fc046` 기반 분리 `fix/seo-submission-truth-v2026.10.16.747` 작업트리; v744 국고·기부 동시 작업 파일 변경 안 함.
- 문서관리 정책, `PROJECT_PLAN` F675-06, 통합 마스터, v739 외부 SEO 크론 차단을 확인. 인증정보/금융/API 릴리스 수정 없음.
- 기존 관리자 화면에 `Google Indexing v3`, 즉시 색인, 500+/580+ 고정 URL, IndexNow 접수와 검색 색인 완료 혼동, 실패에 성공 색상·아이콘 사용을 재현.

## 중간 MID / 테스트 주도
- 잘못된 광고성 안내, 제출/색인 구별, 오류 알림을 검증하는 상호작용 테스트 3개를 먼저 작성. RED 3/3 실패.
- 관리자 SEO 프론트 컴포넌트/테스트만 수정: IndexNow 알림과 Google Search Console 사이트맵 제출 구별, URL 수는 실제 제출 응답 기준, 확정 색인으로 표시 금지, 근거 없는 고정 페이지 수 제거, 새로고침 때 사라지는 제출 이력 명시, `indexingConfirmed=false` 응답만 제출 접수로 판정, 실패 시 `role=alert` 및 오류 색상, 오래된 Google 링크 제거, 주 버튼 높이 44px.
- Google 공식 [Indexing API 안내](https://developers.google.com/search/apis/indexing-api/v3/using-api)는 채용/특정 생방송 동영상 페이지에 한정; [사이트맵 제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)은 발견 보조이며 크롤링·색인 보장이 아님.

## 검증 결과
- 수정 전 RED 3건 실패 기록.
- 수정 후 관련 Vitest 관리자 SEO/컴포넌트/BFF **15/15 PASS**, 프론트 TypeScript `tsc --noEmit` PASS, diff 공백 오류 0.
- 테스트 외부 IndexNow/GSC 호출 없음 (fetch mock).

## 종료 경계
- 브랜치 PR/CI 대상. 공식 Test 관리자 전 화면 5회(v530)와 금융 P0(v743) 아직 차단. Test/운영 승격, 금액·DB·스위치·자동 SEO 예약 변경 없음.
