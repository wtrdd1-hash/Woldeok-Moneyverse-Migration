# Backend B v770 — 인증 거부 응답의 개인정보 보호

2026-11-03 KST. 시작·중간 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. QA v1480/v1481, 기획 v1682, 열린 PR/CI 확인. 기존 프론트엔드 #2563, AuthModule #2568과 중복되지 않는 공통 예외 필터 범위.

NestJS 전역 `ProblemFilter`가 HTTP 401/403 문제 응답에 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`를 강제하여 이전의 허용적인 헤더를 덮어씁니다. 404, 상태 코드·본문, 권한 판정, API/DB/원장 계약은 변경하지 않았습니다. Nginx의 공개 응답 헤더까지 고쳤다는 의미는 아닙니다.

수정 전 2개 실패(RED), 수정 후 단위 14개 및 실제 NestJS HTTP 3개 통과. 전체 Backend 최종 2,989 PASS / 2 FAIL / 518 SKIP(기존 프로필 HTTP 200 예상→401 두 건). Backend 타입 검사·수정 파일 lint·빌드 통과, Frontend 2,947 PASS 및 타입 검사 통과, Database 72 PASS / 5 SKIP. 실제 PostgreSQL·공식 Test exact-SHA·E2E·전체 릴리스 게이트 미완료.

루트 디스크 96%로 위험하며 Production 다국어 500, DB 광범위 권한, 마이그레이션 불일치가 남아 있습니다. Draft PR만 생성하고 병합·배포 금지. 다른 작업자 브랜치/DB/예약은 변경하지 않았습니다.
