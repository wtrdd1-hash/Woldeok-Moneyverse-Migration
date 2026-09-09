# 커뮤니티 게시판 광고 배치 — 2026-09-09

## 목표

기존 검토된 AdSense 광고를 공개 커뮤니티 게시판에도 추가하되, 개별 사용자 게시글·댓글 상세 화면이나 민감한 경제/게임 화면까지 광고 범위를 넓히지 않습니다.

## 구현

- `/board` 게시글 목록 섹션 아래에 `PublicAdvertisement` 1개를 추가했습니다.
- `/board/[postId]`는 게시글 본문, 업로드 이미지, 댓글, 작성자 제어, 댓글 입력 폼까지 모두 광고 없이 유지했습니다.
- 기존의 실패 폐쇄형 `ADS_ENABLED` / publisher / slot 설정과 no-fill 자동 접기 동작을 그대로 재사용했습니다.
- 기획서, SEO/광고 운영 점검 문서, 개인정보처리방침의 광고 허용 범위를 실제 런타임 배치와 일치시켰습니다.
- 게시판 목록에는 정확히 1개 광고, 개별 게시글·댓글 상세에는 광고 0개를 보장하는 회귀 테스트를 추가했습니다.

## 정책 경계

Google은 사용자 제작 콘텐츠가 있는 페이지에서도 광고 정책 준수 책임이 게시자에게 있다고 안내합니다. 따라서 이번 변경은 개별 UGC 상세 페이지를 수익화하지 않고, 게시판 목록의 콘텐츠 아래에 단일 슬롯만 두며 글쓰기 제어 영역과 분리합니다.

참고:
- https://support.google.com/adsense/answer/1355699?hl=ko
- https://support.google.com/adsense/answer/23921?hl=ko
- https://support.google.com/publisherpolicies/answer/11035030?hl=ko

## 테스트 서버 배포 전 검증 완료

- 게시판 광고/AdSense/CSP 대상 테스트: 12/12 통과.
- 프론트엔드 TypeScript 검사: 통과.
- 저장소 ESLint: 오류 0건, 기존 이미지 호출부의 `@next/next/no-img-element` 경고 11건.
- 저장소 `pnpm test`: 통과(contract 23, database 6, backend 822, frontend 535; 격리 PostgreSQL 하네스가 없는 DB-gated backend 테스트는 기존처럼 skip).
- 저장소 `pnpm build`: 통과, Next.js 운영 빌드 포함.

## 테스트 서버 검증

- 작업 브랜치에 최신 `origin/main`(`3e7c8a2`)을 충돌 없이 병합했고 통합 HEAD는 `9921411`입니다.
- 통합 HEAD에서 저장소 lint·테스트·운영 빌드를 다시 실행해 통과했습니다. 기존 이미지 관련 경고 11건 외 lint 오류는 0건입니다.
- 정확한 `9921411` 커밋을 운영 DB/API와 분리된 `wdmv-test` Kubernetes 검증 스택에서 빌드·실행했습니다. 게시판 API는 테스트 전용 mock을 사용했습니다.
- `/board`: HTTP 200, 테스트 게시글 정상 렌더, 승인된 AdSense loader와 슬롯 `2118692561` 존재, CSP에 AdSense origin 허용 확인.
- `/board/11111111-1111-4111-8111-111111111111`: HTTP 200, 게시글·댓글 정상 렌더, AdSense loader 없음, 광고 슬롯 없음.
- 테스트 응답은 `X-Robots-Tag: noindex, nofollow`를 유지했고 `test.easy-scraping.com` Host-header Traefik 경로도 HTTP 200을 확인했습니다.

## 배포 상태

- 작업 브랜치: `fix/board-ad-20260909`.
- 임시 전용 테스트 서버 검증: 통합 커밋 `9921411` 기준 통과.
- `main` 병합: 최종 GitHub CI 대기.
- 운영 배포: GitOps 운영 이미지 워크플로가 `main`의 불변 SHA만 빌드하므로 `main` 통합 후 진행 대기.
