# 개발 B 작업 기록 — v2026.09.23.401

기준 SHA: `7b705e1d37e97ccd05ba12042c3fd8d582e396d0`

열린 business/chat/photo 작업과 겹치지 않는 P1 replay-safety 부채를 선택했습니다. 게시판 HTTP DTO는 이미 호출자 소유 UUID 멱등성 키를 요구하지만 `BoardService`는 키가 없을 때 새 UUID를 생성하고 있어 내부 재시도나 향후 다른 transport가 별도 mutation으로 바뀔 수 있었습니다.

구현:
- 게시글 생성/수정과 댓글 생성의 `randomUUID()` fallback 제거;
- 기존 호출자 소유 키와 repository/DB 동작 유지;
- 세 쓰기 경로 모두 키 누락 시 거부되는 회귀 테스트 추가.

검증:
- 게시판 service 집중 Vitest 12/12 PASS;
- contract build PASS;
- contract build 후 backend TypeScript `--noEmit` PASS;
- backend build PASS;
- 변경 파일 ESLint PASS;
- `git diff --check` PASS.

SQL 변경이 없고 이 exact SHA에서 전체 DB gate를 실행하지 않았으므로 real PostgreSQL 통과를 주장하지 않습니다. 병합 및 Production 승격은 required GitHub/GitOps check와 exact-SHA isolated 검증 이후로 유지합니다.
