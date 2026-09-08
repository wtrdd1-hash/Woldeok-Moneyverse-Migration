# 2026-09-08 공개 게시판 / 검색 노출 개선 작업 기록

## 목적

운영 메뉴의 권한 기반 숨김은 정상 동작이므로 유지한다. 이번 변경은 다음 두 문제만 다룬다.

1. 게시판은 현재 로그인 및 최신 정책 동의가 있어야 목록, 글, 댓글, 첨부 이미지까지 읽을 수 있다.
2. 검색 노출 기본 코드는 존재하지만 Production 이미지 빌드에 `SEARCH_CONSOLE_VERIFICATION` 값이 전달되지 않아 Google Search Console HTML meta 인증값이 실제 이미지에 포함되지 않을 수 있다.

## 구현

### 게시판 공개 열람

- 기존 회원 전용 `/api/v1/board/posts` 쓰기/읽기 API는 그대로 유지한다.
- 새 `/api/v1/board/public/posts` GET 전용 경로를 추가한다.
- 비회원 또는 최신 정책 동의가 없는 세션은 공개 경로로 자동 폴백한다.
- 글 작성, 수정, 삭제, 댓글 작성/삭제, 이미지 업로드는 기존 회원 + 동의 + CSRF 경계를 그대로 사용한다.
- 공개 글의 첨부 이미지만 `/api/v1/board/public/images/:key`에서 읽을 수 있다.
- 삭제 글, 삭제 댓글, 연결되지 않은 이미지 저장 키는 공개되지 않는다.

### PostgreSQL 보안 경계

Migration 175는 다음 전용 read model만 추가한다.

- `member_board_public_list(integer)`
- `member_board_public_get(uuid)`
- `member_board_public_comment_list(uuid, integer)`
- `member_board_public_image_visible(text)`

모두 `SECURITY DEFINER`이며 `moneyverse_migrator` 소유다. `moneyverse_app`에는 함수 `EXECUTE`만 부여하고 `member_board_posts`와 `member_board_comments`의 직접 테이블 권한은 다시 `REVOKE`한다. 기존 회원 전용 쓰기 함수는 수정하지 않는다.

### 검색 / Search Console

- `/board`는 canonical과 공개 설명을 제공한다.
- `/board/[postId]`는 공개 글 제목/본문 요약으로 개별 metadata, canonical, OpenGraph article 정보를 생성하고 `index, follow`한다.
- Production은 기존 `robots.txt` + `sitemap.xml` 허용 정책을 유지하고 test는 전체 크롤링 차단을 유지한다.
- `frontend/Dockerfile`에 공개 빌드 인자 `SEARCH_CONSOLE_VERIFICATION`을 연결했다.
- Deploy workflow는 Production GitHub environment의 `vars.SEARCH_CONSOLE_VERIFICATION`만 Production 프런트 이미지에 전달하며 test에는 빈 값만 전달한다.
- `seo-routes.test.ts`가 test 전체 차단, production sitemap origin, `/board` 포함, private 영역 제외를 고정한다.

## 외부 검색 관찰

2026-09-08 공개 웹 검색 기준으로 `월덕 머니버스`/`Woldeok Moneyverse`와 `easy-scraping.com`을 함께 찾는 결과는 매우 약하다. 반대로 최근 제3자 문서에는 같은 도메인의 과거 개발/클라우드 콘텐츠를 출처로 인용하는 흔적이 남아 있다. 따라서 새 서비스의 기술적 크롤링 허용만으로는 충분하지 않고, Search Console 소유권 확인·sitemap 제출·과거 URL 인덱스 정리·실제 공개 콘텐츠 누적을 같이 확인해야 한다.

## 사용자 관점에서 아직 빈 느낌을 줄 수 있는 부분

- 공개 홈의 운영 소식이 비어 있으면 서비스가 멈춘 것처럼 보일 수 있다.
- 실시간 로비는 접속자가 없을 때 빈 화면 비중이 커 보일 수 있다.
- 권한 기반 메뉴 숨김은 의도된 보안/제품 정책이므로 공개 기능 수를 늘리기 위해 해제하지 않는다.
- 공개 게시판 열람은 가입 전에도 실제 커뮤니티 활동을 확인할 수 있게 하므로 이 빈 느낌을 줄이는 첫 개선이다.
- 다음 우선순위는 운영 소식/변경 기록을 실제 공개 데이터로 꾸준히 노출하고, 공개 갤러리/가이드와 게시판 사이의 내부 링크를 강화하는 것이다.

## 검증 게이트

- [ ] PR CI: secret guard, lint, typecheck, build, migration 175 실제 PostgreSQL 적용, DB/application/frontend tests
- [ ] test 서버에 현재 stacked branch 배포
- [ ] 비로그인: `/board` 목록, 글 본문, 댓글, 첨부 이미지 열람 가능
- [ ] 비로그인: 글/댓글 작성 API는 여전히 거부됨
- [ ] 정책 미동의 로그인 세션: 읽기 가능, 작성 불가
- [ ] 정상 회원: 작성/수정/삭제/댓글/업로드 기존 기능 정상
- [ ] 권한 없는 사용자에게 제한 메뉴는 계속 숨김
- [ ] test `robots.txt` 전체 차단 및 빈 sitemap 확인
- [ ] Production 배포 전 GitHub production environment에 `SEARCH_CONSOLE_VERIFICATION` 값 존재 여부 확인
- [ ] Production 배포 후 `robots.txt`, `sitemap.xml`, board canonical/meta, Google verification meta 확인
- [ ] Search Console에서 sitemap 재제출/URL 검사 및 과거 도메인 URL 상태 점검

## 현재 상태

PR #117의 CI는 성공했다. 그러나 2026-09-08 현재 배포 호스트 `weoldog`가 원격 도구에서 offline으로 확인되어 실제 test 서버 배포/검증을 수행하지 못했다. 프로젝트 규칙에 따라 이 상태에서는 #117도 이 변경도 `main`에 병합하지 않는다. 호스트 접근이 복구되면 test 검증 후 정확히 검증한 커밋 계열만 main/Production으로 승격한다.

## 2026-09-08 재검증 / 리뷰 보완

PR #118 최신 브랜치를 다시 점검하면서 초기 자동 리뷰의 미해결 항목을 확인했다.

- [x] P1: 게시판 이미지 업로드를 `member_board_image_uploads` 소유권 레지스트리에 등록하고, 글 발행 시 같은 회원이 게시판 용도로 업로드한 키만 허용하도록 migration 176 추가
- [x] P2: Deploy `build` job을 선택한 GitHub environment에 연결하여 Production `SEARCH_CONSOLE_VERIFICATION` 변수가 실제 frontend image build에 주입되도록 수정
- [x] P2: `/board` 목록은 서버 렌더 중 세션을 읽지 않고 `publicApi` + 60초 ISR로 공개 HTML을 생성하며, 글쓰기 UI는 `/api/viewer`를 사용하는 client hydration으로 분리. 글 상세 metadata/공개 본문도 공개 read model을 우선 사용
- [x] 수정 후 lint/typecheck/test 재실행: lint 0 errors (기존 img warnings 11), typecheck pass, backend 822 passed/345 DB-local skipped, frontend 531 passed
- [ ] GitHub branch push 후 CI 확인
- [ ] test 환경 실제 배포 및 signed-out/read-only 회귀 검증
- [ ] 모든 게이트 통과 후에만 main/Production 승격
