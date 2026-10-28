# v2026.10.28.1417 — 블로그 전용 운영 무중단 승격

상태: STARTED. 사용자 "블로그 기능만 빨리승격", "해결하고 승격" 지시.
## 작업 전
- 메인/통합마스터, v1405 국가별 2시간 자동 발행 정책, AGENTS, docs/RELEASING, v1415.7~v1416 영한 기록 재확인.
- 운영 금융 게이트는 실제로 BLOCKED이며 이를 통과로 기입하지 않음. 금융/회원 서버와 운영 포인터 유지, 블로그 URL만 별도 Test 검증된 서비스로 부분 승격하는 독립 경로.
- 코드 기능 SHA 4688e84be0f831a3f6e5e16040b3764dff6d78bf, CI #3971 PASS, 공식 Test 정상. main 9ff388ab608af99b9ccc806c35ebac5c14bd15e9; 기능 소스 코드는 기존 Test와 동등, 별도 release 브랜치에서 기록.
- 구형 JSON 13건은 파일 변경금지/비공개 백업 보존. 자동 미검수 게시 실패는 인공지능 125초 timeout이므로 원문 검증 게시 전까지 자동 기능을 성공으로 표시하지 않음.
- 288~290 블로그 전용 SQL을 먼저 의존성 검증하고 운영 기존 DB의 기존 금융 원장 데이터·권한은 변경하지 않는 범위로만 실행. 운영 Nginx/DB 사전 백업, 단계별 상태 기록, 장애 시 블로그 경로 롤백.

## 중간 기록
대기.

## 종료 기록
대기.

## 중간 기록 — v1417.2~v1417.4
- 블로그 SQL 288/289/290만 독립 검토: blog_verified_articles, blog_verified_audit 및 검증 발행/관리 함수 추가. 기존 앱 DB 역할과 관리자 역할 함수가 운영 DB에 존재함을 확인. 운영 DB 원본 약 1,292MB.
- 변경 전 운영 PostgreSQL 전체 백업 0600: /srv/moneyverse-data/ops/private/blog-v1417/prod-pre-blog-sql-20261028.dump, 104,699,865바이트, SHA256 dcfd1cd598652be70c735b22eb641fa9cb622199d8fcb5e8d5b533d30bfb9072. 금융/회원 민감 백업이므로 외부 공개 금지.
- 운영 DB에 블로그 288~290 세 파일만 적용 및 schema_migrations 체크섬 기록. 금융 변경 SQL 269~287 미적용. 새 블로그 테이블에서 moneyverse_app의 INSERT/UPDATE/DELETE 권한 없음. 금융 사전/사후 읽기 전용 검증 수치 동일: 사용자 현금 계정 18개 합계 18,000 WLD 차이 및 기존 금융 3개 테이블 직접 쓰기 권한. 금융 잔액/역할 변경 없음.
- CI/Test 검증된 소스 SHA 4688e84be0f831a3f6e5e16040b3764dff6d78bf 그대로 불변 운영 블로그 릴리스 /srv/moneyverse-data/releases/prod-v2026.10.28.1417-blogonly-4688e84be0f8 배치. 전체 운영 production-current 포인터 무변경.
- 독립 systemd 백엔드 3481, 프론트 3482 실행. 초기 백엔드는 원래 .env PORT=3000 우선 적용으로 EADDRINUSE, 후행 /etc/moneyverse/blog-v1417-backend-final.env 적용 후 해결. 백엔드 상태/버전/게시 API 200, 관리자 미인증 401. 경제·블로그 AI 자동 스케줄러 모두 OFF. 블로그 프론트는 미검수 AI 광고 방지로 ADS_ENABLED=false, SEO_INDEXING_ENABLED=true.
- 운영 Nginx 변경 전 0600 원본 /srv/moneyverse-data/ops/private/blog-v1417/nginx-before-blog-only-20261028.conf 백업. 블로그/4국가 URL, 관리자 블로그, 검증형 API, 사이트맵 및 신구 Next 정적파일만 새 포트로 전환. 다른 홈페이지·금융·회원·일반 API는 기존 3354/3000 유지. 구형 무검증 글 생성 POST 503 그대로. nginx -t 통과 및 무중단 reload.

## 종료 기록 — v1417.5
- 공개 운영 한국·미국·일본·중국 블로그, 기존 글 상세, 관리자, 게시 JSON, 검증형 API, 사이트맵 모두 HTTP 200, v1417 릴리스 헤더 확인. 관리자 미인증 401, 구형 무검증 발행 POST 503.
- 기존 홈페이지/지갑/국고 정상 HTTP 200, 은행 로그인 리디렉션 307. 서비스는 기존·블로그 분리 인스턴스 모두 active.
- 공개 브라우저 모바일 320/375/768/1024px: HTTP200, H1 하나, 가로 넘침 0, JS 오류 0, Next 정적파일 오류 0. 기존 홈페이지·지갑·예전 글 상세 및 EN/JA/ZH 브라우저 QA 정상.
- 예전 JSON 공개 13건 보존 및 파일 변경 금지 유지. 신규 검증 DB 게시 글 0건. 로컬 AI 원고 생성 125초 시간초과로 2시간 자동게시 OFF; 자동 생성 성공이라고 주장하지 않음. 인증 관리자 글 수정/삭제 실계정 E2E 미검증, 예전 JSON 게시물 수동 변경은 파일 잠금으로 제한되는 것이 알려진 결함.
- 이번은 블로그 전용 운영 실제 승격으로 전체 금융·회원 앱 승격이 아님. 금융 사전검사 BLOCKED 수치는 변경 없음.
- 롤백: 운영 Nginx 원본을 복원하고 nginx -t 후 reload, 새 블로그 두 서비스만 중단/비활성. 기존 데이터 보존을 위해 추가 블로그 SQL 및 감사 영수증 무단 DROP 금지. 전체 운영 DB 백업은 별도 승인된 사고 복구에만 사용.

## v1417.6 — 운영 관리자 페이지 SEO 개인정보 안전 보완
- 운영 관리자 /admin/blog는 HTML 메타 noindex와 달리 HTTP 응답 헤더가 index,follow였던 불일치 발견. 익명 브라우저에서 관리자 본문 노출은 확인되지 않았고, 기존 글을 대상으로 한 익명 DELETE는 403으로 거부되어 실제 글 변경 없음.
- 현 v1417 Nginx 설정을 0600 /srv/moneyverse-data/ops/private/blog-v1417/nginx-before-admin-noindex-hotfix.conf 에 백업. 운영 블록의 /admin/blog, /admin/blog/*, /api/admin/blog/*, /api/v1/admin/blog-verified* 4개 라우트에만 상위 색인 헤더 숨김과 noindex,nofollow 추가. 최초 스크립트는 Test 서버 블록이 먼저 검색되어 변경 없이 중단, 운영 블록만 대상으로 다시 적용. nginx -t 통과 및 무중단 reload.
- 최종 공개 관리자 HTTP 200 및 v1417/noindex,nofollow 헤더 확인. 공개 블로그는 index,follow 유지, 기존/신규 서비스 모두 active, 게시글/금융 DB 변경 없음.
