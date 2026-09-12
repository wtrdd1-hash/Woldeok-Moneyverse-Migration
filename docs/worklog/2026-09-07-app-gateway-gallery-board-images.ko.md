# 앱 게이트웨이, 갤러리 상세, 게시판 이미지 업로드

[English](2026-09-07-app-gateway-gallery-board-images.md) | **한국어** | [문서 색인](../INDEX.ko.md)

날짜: 2026-09-07  
브랜치: `fix/app-gateway-20260907`

## 요청 작업
- [x] 관련 없는 로컬 변경을 건드리지 않고 현재 `origin/main`에서 전용 브랜치/worktree 생성
- [x] 네이티브 클라이언트에 `INTERNAL_API_TOKEN`을 노출하지 않는 앱용 Gateway/BFF 경계 추가
- [x] 공개 갤러리 카드에서 전용 상세 페이지로 이동 가능하게 변경
- [x] 로그인 회원이 게시판 글에 이미지 첨부 가능하게 구현
- [x] 글 상세 페이지에 게시판 이미지 렌더링
- [x] 새 접근 경계와 UI 동작에 대한 회귀 테스트 추가
- [ ] CI에서 typecheck/tests/build 및 DB 마이그레이션 검증
- [ ] Test 배포/검증 후 검증된 리비전을 Production에 배포

## 진행 기록

### 진행 중
앱 Gateway 경로가 `/app-api/v1/...` 아래에 존재하며 명시적으로 허용된 회원용 API 그룹만 전달합니다. 관리자/Discord 통합 경로는 allowlist에 없습니다. 갤러리 카드는 `/gallery/[photoId]`로 연결됩니다. 게시판 글에는 필수 대체 텍스트와 함께 최대 4MB PNG/JPEG/WebP 이미지 1개를 첨부할 수 있으며 기존 검증된 비공개 이미지 저장소를 사용합니다. 마이그레이션 173은 게시판 이미지 메타데이터와 `SECURITY DEFINER` 공개 여부 검사를 추가하고 `/media/board/[key]`는 로그인한 사용자가 DB 검사를 통과한 뒤에만 바이트를 전달합니다.

### 현재까지 검증
- App Gateway allowlist 단위 테스트: 4/4 통과
- 게시판 서비스 단위 테스트: 9/9 통과 — 비공개 게시판 이미지 경로와 잘못된 키 거부 포함
- 프론트엔드 Gateway/media 대상 테스트: 9/9 통과 — 인증된 게시판 이미지 릴레이 포함
- Node 24 워크스페이스 typecheck: 통과
- ESLint: 오류 0, 기존/신규 `<img>` 최적화 경고 11개 남음
- 전체 로컬 워크스페이스 테스트: contract 23/23, DB 마이그레이션 동등성 6/6, backend 818 통과. 격리 컨테이너에 `DATABASE_URL`이 없어 DB 기반 테스트 343개는 건너뜀. frontend 523/523 통과
- Production 빌드: contract/database/backend/frontend 모두 성공, Next가 `/gallery/[photoId]`, `/media/board/[key]`, `/app-api/v1/[...path]` 생성
- 마이그레이션 173은 검증 완료로 판단하기 전에 CI/PostgreSQL 실행이 추가로 필요함
