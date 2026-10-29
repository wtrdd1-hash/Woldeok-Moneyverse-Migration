# 개발 A 2026-10-29 12:20 — 검증된 도움말의 다른 언어 검색

**판정: 기능 구현 / 로컬 게이트 통과 / Draft PR / 운영 배포 보류.** 검증된 도움말을 자동 번역하거나 미승인 콘텐츠를 공개하는 기능이 아니다.

## 시작
- Debian 13.6 미니PC와 서비스·개발 PostgreSQL 연결 확인. 기존 main 작업 폴더의 다른 개발자 금융 SQL 변경·캐시는 그대로 보존했다.
- 최신 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`, AGENTS/README, 영문 원본·국문 통합기획서, v1454 도움말 기획, v1456 릴리스 기획, QA v1364 확인.
- 시작 시 원격 브랜치 121개, 열린 Draft PR 118개. PR Head 누락·불일치·중복 0건. 비-main 고유 미통합 브랜치 119개(merge-tree 안전 후보 50, 충돌 또는 오류 69), main 조상 1개. 삭제 0개.
- 기존 PR #1825가 마이그레이션 295를 소유하므로 중복 마이그레이션을 만들지 않고 기존 승인 문서 전용 DB 함수로 구현.

## 기능
- Backend 검색 POST에 엄격한 선택적 boolean `fallbackToOtherLocale` 추가. 기본 언어 결과가 0건이고 사용자가 선택했을 때만 다른 언어의 승인·게시·유효기간 내 문서를 검색한다.
- Next.js 검색 화면에 기본 해제된 체크박스, 언어 변경에 따른 안내, 다른 언어 원문 표시, 올바른 locale 링크를 제공한다. 검색어 URL 노출·자동 번역·DB 오류를 빈 결과로 위장하는 동작을 금지한다.
- Android app-api POST 경로의 본문 전달 및 `private,no-store`·`noindex` 강제. 영문·국문 API 가이드 업데이트.
- 기존 PostgreSQL SECURITY DEFINER 함수만 사용하며 DB 마이그레이션·권한·금융 원장은 변경하지 않는다.

## 검증 및 배포
- TDD RED→GREEN, Nest HTTP/API, 프론트엔드 접근성, Android 프록시 검증. 전체 Backend 1,961 PASS/443 SKIP, Frontend 1,918 PASS, DB 46 PASS/4 SKIP, API 계약 38 PASS. Lint 오류 0건(기존 경고 1,091건), typecheck·build PASS. 보안 감사 High/Critical 0, Moderate 1.
- 전용 격리 PostgreSQL 17.11에서 002–294 마이그레이션 적용, 합성 도움말 데이터로 3개 DB 테스트 통과. 미승인·만료 문서 배제 및 앱 계정의 직접 테이블 조회 거부 확인. 실제 Test/Production DB는 수정하지 않았다.
- 공식 Test 후보 SHA 인증 E2E, 독립 백업 복원, 금융 출처, 체크섬 정합성, 도움말 외부 승인 근거는 미완료. Test/Production은 기존 `b44ffd0a...` 실행. **main 병합·운영 배포·기능 스위치 변경·금융 DB 변경 금지.** 기존 미병합 브랜치 전부 보존.
- 최종 후보 SHA/CI/브랜치 종료 수는 PR 및 미니PC 후속 보고서에 별도 기록.
