# 개발 A — 로그인 기기 범위 필터 (2026-10-31)

## 작업 전
Debian 13.6 미니PC와 서비스 연결 확인. 기준 main `761a55a094fb9dd383d213e817305e68c79fa23c`. AGENTS, README, 영문/국문 통합기획서, QA v1404, 열린 PR·CI·브랜치 및 다른 개발 예약을 검토. 독립 worktree/브랜치만 사용.

## 작업 중
회원 계정의 로그인 기기 목록에서 **다른 기기만 보기**를 구현. 기존 PostgreSQL 소유자 범위 함수와 NestJS 인증·인가를 유지하며 Next.js 웹, Android app-api까지 연결. 중복/잘못된 scope, 위조·누락된 성공 응답을 차단. 수정 전 실패 테스트 Backend 3, Frontend/Android 6을 확인하고 수정 후 대상 테스트를 통과. 신규 마이그레이션·금융 원장·권한 변경 없음.

## 작업 후 / 검증
코드 SHA `5dd606145fa9e2a6015d035b12a63b1633f40d5d`, Draft PR #2090. Backend 전체 2,781 PASS/501 SKIP, Frontend 전체 2,779 PASS, 전체 Lint 오류 0/경고 1,049, Typecheck 및 양측 Build PASS, 모바일 계약 184 엔드포인트 PASS, 보안 11 PASS, DB 단위 62 PASS/4 SKIP, 접근성 11 PASS. 격리 PostgreSQL 17.11의 실제 조회 함수 검증 7건 및 전체 마이그레이션 311개 적용 성공.

개발 DB 앱 역할이 253개 공개 스키마 테이블 중 211개에 UPDATE/DELETE 권한을 가진 것으로 확인되어 최소 권한 P0 이슈 #993에 보고. 클린 DB의 권한 분포와 차이가 있으며 운영 DB 권한은 확인되지 않음. 공식 Test는 후보 SHA가 아니고 국고 API가 HTTP 200을 반환하여 정확 SHA 인증 E2E 불가. 운영 실행 출처도 검증되지 않아 이슈 #1984에 기록.

**결론: 기능 및 로컬 테스트 통과, 공식 Test·백업 복원·릴리스 게이트 차단, Production HOLD.** main 병합·Test/운영 배포·서비스 재시작·운영 DB 변경·브랜치 삭제·롤백 없음. 전체 미통합 브랜치 보존. QA·Release 증거는 미니PC 보고서 폴더에 보관.
