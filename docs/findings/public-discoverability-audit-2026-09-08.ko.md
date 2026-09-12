# 공개 검색 노출 감사 — 2026-09-08

[English](public-discoverability-audit-2026-09-08.md) | **한국어** | [문서 색인](../INDEX.ko.md)

## 이미 갖춰진 강한 기준
- Production과 Test는 서로 다른 검색 색인 모드를 사용합니다.
- `robots.ts`는 Production 크롤링을 허용하고 비공개/인증/API 영역은 차단합니다.
- `sitemap.ts`는 기준 Production 주소를 게시하고 주요 공개 기능 경로를 포함합니다.
- 루트 메타데이터에는 한국어 제목/설명, OpenGraph/Twitter 필드, Google 확인 지원, WebSite/Organization JSON-LD가 있습니다.
- 보호 기능 메뉴는 권한 기반 상태를 유지해야 하며 공개 사이트를 더 크게 보이게 하려고 권한을 약화하면 안 됩니다.

## 확인된 부족 사항
1. **게시판 상세 콘텐츠가 검색되지 않음.** `/board`는 sitemap에 있었지만 목록/상세 모두 회원 세션을 요구하고 상세 페이지가 `noindex`를 내보내 자연스럽게 갱신되는 커뮤니티 콘텐츠를 검색 엔진과 신규 방문자가 볼 수 없었습니다.
2. **Search Console 메타 확인값이 이미지 빌드에 연결되지 않음.** `layout.tsx`는 `SEARCH_CONSOLE_VERIFICATION`을 읽지만 프론트엔드 Docker 빌드와 Deploy 워크플로가 값을 전달하지 않아 운영 환경 변수에 값이 있어도 생성 메타데이터에서 빠질 수 있었습니다.
3. **현재 브랜드 검색 노출이 약함.** 감사 당시 도메인과 `월덕 머니버스` 또는 `Woldeok Moneyverse`를 조합한 공개 검색에서 현재 사이트가 명확히 노출되지 않았습니다.
4. **도메인의 과거 콘텐츠 흔적이 웹에 남아 있음.** 최근 크롤링된 제3자 페이지가 `easy-scraping.com`을 무관한 클라우드/백엔드 개발 자료 출처로 인용하고 있습니다. Search Console에서는 새 sitemap 제출뿐 아니라 과거 색인 URL도 점검해야 합니다.
5. **공개 홈이 조용해 보일 수 있음.** 비어 있는 운영 뉴스와 활동 없는 실시간 로비는 저트래픽의 정상 서비스도 비활성처럼 보이게 할 수 있습니다. 이는 콘텐츠/참여 문제이며 권한을 약화할 이유가 아닙니다.

## 이 스택의 개선 사항
- 쓰기는 회원/동의/CSRF 보호를 유지하면서 게시판 목록/글/댓글/이미지의 공개 읽기 경로 제공
- 글별 색인 가능한 메타데이터와 canonical URL
- Search Console 확인 토큰을 Production 이미지 빌드에만 연결
- Production/Test robots/sitemap 경계에 CI 검증 추가

## 배포 후 후속 작업
- Production에 `SEARCH_CONSOLE_VERIFICATION`이 설정됐는지 확인하거나 Search Console DNS 도메인 속성 확인을 사용합니다.
- `https://easy-scraping.com/sitemap.xml`을 제출하고 `/`, `/board`, 대표 `/board/<id>` URL을 점검합니다.
- Search Console의 Pages/Indexing에서 도메인의 과거 콘텐츠 URL을 확인하고 의미상 맞는 경우에만 404/410 또는 리디렉션을 사용합니다.
- 실제 운영 공지/변경 기록을 정기적으로 게시하고 홈에서 연결합니다.
- 공개 갤러리, 가이드, 공지, 게시판을 서로 연결해 로그인 없이도 검색 엔진과 신규 방문자가 충분한 콘텐츠를 발견할 수 있게 합니다.
