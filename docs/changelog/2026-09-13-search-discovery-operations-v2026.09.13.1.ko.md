# 검색 노출 운영 v2026.09.13.1 변경 기록

기준일: 2026-09-13
유형: 문서-only 기획 갱신
브랜치/PR: 없음. 현재 문서 운영 규칙에 따라 최신 `main`에 직접 반영
테스트 서버 배포: 문서-only이므로 불필요
실제 서비스 검증: 불가. 외부에서 `https://easy-scraping.com` 확인 시 530 반환

## 변경 이유

기존 수익화·규정 준수·SEO 명세는 정책 수준은 충분했지만, 실제 구현을 위한 라우트 색인 상태, canonical/hreflang, 사이트맵 분할, JavaScript 렌더링, pagination/infinite scroll/faceted navigation, 검색 운영 대시보드, 배포 검증 계약이 더 필요했다.

## 변경사항

- 영문 canonical `SEARCH_DISCOVERY_OPERATIONS_SPEC.md` 추가
- 한국어 대응본 동시 추가
- `INDEXABLE_PUBLIC`, `PUBLIC_NOINDEX`, `AUTH_REQUIRED`, `OPERATOR_ONLY`, `TEST_ONLY` 라우트 상태 정의
- HTML·내부링크·사이트맵 간 canonical 일관성 요구사항 추가
- EN/KO self-canonical + 상호 hreflang 규칙 추가
- 사이트맵 index 구조와 private/Test URL 제외 규칙 추가
- robots.txt, noindex, 인증의 역할 구분
- Next.js/JavaScript 렌더링 acceptance criteria 추가
- crawl 가능한 pagination과 infinite-scroll fallback 요구사항 추가
- 독립 검색가치가 없는 faceted/filter 조합 기본 noindex 정책 추가
- 구조화 데이터 정책 및 FAQ rich-result 의존 금지 명시
- Google/Naver 운영 대시보드 지표와 런타임 배포 게이트 추가

## 2026-09-13 조사 자료

직접 채택:

- Google Search Central 사이트맵 문서(2026-07 갱신)
- Google canonical 문서(2026-07 갱신)
- Google Core Web Vitals 최신 가이드(2025-12 기준)
- 네이버 서치어드바이저 사이트맵·선호 URL/canonical·JavaScript/리소스/링크·구조화 데이터 가이드
- 네이버 2026-07 FAQ 구조화 데이터 검색 노출 종료 공지

참고만 함:

- 구조화 데이터 markup은 특수 검색노출을 보장하지 않으며 검색엔진 정책에 따라 달라질 수 있음

## 법규 / 수익 / SEO 영향

- 법규·개인정보: 계정·보안·운영자·Test 페이지의 우발적 색인 위험을 줄임. 신규 개인정보 처리나 법적 약속은 없음.
- 수익: 공개 콘텐츠 광고의 duplicate indexing 및 Core Web Vitals 악화를 방지하도록 함. 광고 스크립트는 페이지 경험보다 우선하지 않음.
- SEO: Google + Naver, EN/KO, canonical/hreflang, sitemap, crawl control을 실제 운영 가능한 형태로 구체화.

## 다음 우선순위

1. 자체 회원가입/로그인 보안 P0 구현은 별도 런타임 브랜치와 Test 환경에서 진행
2. 서비스가 복구되면 Runtime Product Reality Audit에서 실제 robots/sitemap/canonical/hreflang/HTTP 상태 확인
3. 검색 route registry를 machine-readable runtime config와 자동 SEO smoke check로 전환
4. 임의 하드캡 없이 소비처 확대와 30/90/180일 경제 시뮬레이션 기획 지속
