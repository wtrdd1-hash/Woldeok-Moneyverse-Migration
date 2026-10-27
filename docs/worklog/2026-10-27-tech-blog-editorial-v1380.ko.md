# v2026.10.27.1380 — 개발 블로그 품질 사고 및 편집 설계 작업기록

**작업 전 / 기획 전용**: 이용자가 지적한 TECH 게시글의 복리 계산기, 금융기관 출처, 짧고 무관한 본문을 재현 가능한 소스 근거와 연결한다. 코드·운영 사이트·공개글·DB·발행 스위치·테스트 서버는 변경하지 않는다.

- [x] 원격 main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` 재조회 후 독립 `docs/blog-tech-editorial-v1380-20261027` 브랜치·워크트리 생성. 타 개발자/Gemini 작업 보존.
- [x] 통합 마스터(영·한), AGENTS, 문서 인덱스, AI 블로그 v975/v1107/v1108 우선 확인.
- [x] `blog-post-client.tsx`: Markdown 블록 2 이후 **카테고리와 무관하게** 복리 위젯 삽입. `blog-data.ts`: TECH에도 복리 계산기 경로, 범용 금융시장/투자 문구·출처, 증거 없는 '실측' 수치 삽입, 조회수 난수, 읽기시간 상수 6.
- [x] **작업 중**: 개발기사·금융기사 별도 편집 정책, 출처 검증, 본문 깊이, 새 게시물 게이트 및 기존 글 개선안 작성.
- [x] **중간 확인**: 최신 main 및 타 개발자 v1102 블로그 발행 차단 작업 재확인·중복 방지.
- [ ] **작업 종료**: 문서 상호 링크·검증·전용 브랜치 GitHub 업로드·이슈/초안 PR 기록.

**범위 제한:** 운영 글 자동비공개 금지(v1108) 유지. 임의의 글 삭제·비공개·출처 위조 금지. 기존 게시물 문제는 관리자 수동 정정 대기열로 분리하며 실환경 조치는 하지 않는다.

## Midpoint evidence / 중간확인
Re-fetched origin/main after drafting: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c (unchanged). v1102 candidate separately returns 503 EDITORIAL_REVIEW_REQUIRED whereas main legacy generator still bypasses its own editorial helper; planned P0 keeps gate ownership with v1102. Documentation is not a publisher fix.
