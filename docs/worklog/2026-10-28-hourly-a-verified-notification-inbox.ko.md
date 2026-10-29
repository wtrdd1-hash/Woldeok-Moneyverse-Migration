# A1425 회원 알림함 실제 데이터 연결 — 작업일지
- 기준 main: a28bed9aa40ff74d492824ae12892a7d52132fdd. Debian 13.6 미니PC 연결 및 서비스 정상 확인. 영어 기획서 원본·한국어 보조 기획서·AGENTS·README·QA v1342·열린 PR 확인.
- 실제 변경: 6개 가상 알림(가짜 1,840 WLD 포함) 제거. 인증된 회원의 실제 DB 알림 조회·분류·더보기·읽음 확인·실패 재시도·서버 읽음 영수증 구현. Backend 분류·오프셋 검증, DB 회원별 조건/동률 정렬, Next BFF, Android app-api 비공개 캐시 보호. 신규 DB 마이그레이션/금융 원장 변경 없음.
- RED→GREEN 집중 테스트: Backend 2 PASS, Frontend/Android 36 PASS. 전체 Backend 1,929 PASS / 440 SKIP, Frontend 1,873 PASS / 1 FAIL(기존 블로그 테스트), DB 패키지 45 PASS / 3 SKIP, Bot 11 PASS. 전체 Lint 오류 0, Typecheck PASS, app-api 180 PASS, 격리 PostgreSQL 17 합성 데이터 160건 PASS. 전체 프로젝트 테스트 TIMEOUT. 기본 빌드 FAIL, Webpack 빌드 컴파일 후 시간 초과. 보안 감사 High 이상 0.
- 보안·릴리스 보류: 알림 테이블 기존 직접 접근 권한, DDL 출처, 5개 마이그레이션 체크섬 불일치, 공식 Test 릴리스 경로, 인증 E2E, 백업 복원, GitOps 승인 미확인. 다른 작업자 및 복구 참조 352개 보존. main 병합/운영 배포/DB 쓰기/브랜치 삭제/롤백 없음. Draft PR만 등록.
