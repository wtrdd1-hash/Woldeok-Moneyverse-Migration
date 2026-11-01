# 개발 A — 검증된 종목 의견 필터, 2026-11-02 03:25 KST

## 시작 전
- AGENTS.md, README.md, 영문 원본 PROJECT_PLAN.md·한국어 PROJECT_PLAN.ko.md, 통합기획서, 이전 QA·A 기록, PR·CI 확인.
- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 독립 브랜치 `auto/hourly-a-20261102-0325-board-stance`. 시작 원격 추적 브랜치 173개, 열린 PR 156개, 중간 확인 충돌 29개. 다른 개발자의 미통합 커밋 보존.

## 개발 중
- 최근 공개 글 최대 50건의 종목 의견(상승·중립·하락·의견 미표시)을 Nest/SQL/Next/Android에 연결. 기존 SECURITY DEFINER 함수 재사용, 신규 마이그레이션·권한 확대·WLD 쓰기 없음.
- TDD 실패 재현 후 수정. 중복·비정상 검색 조건 거부, 적용 증명 `appliedStance`, 웹 접근성·검색엔진 색인 방지, Android의 증명 없는 HTTP 200 차단. 기본 GET 폼의 빈 제목 입력 처리 보완.
- 개발 PostgreSQL 읽기 전용: 함수 실행 허용, 실제 최근 공개 글 1건/종목 연결 0건, 양성 다건 검증 불가. 합성 읽기 전용 SQL에서 의견 필터 분리 확인. 앱 역할의 account_balances UPDATE 및 user_items DELETE 권한 문제(P0) 잔존. 운영 DB 권한 미확인.
- 작업 중 main 재확인 결과 변경 없음. 다른 브랜치 삭제·수정, DB 쓰기, Test/Production 배포 없음.

## 종료 및 보류
- 최종 테스트·SHA는 QA·릴리스 기록과 Draft PR에 기록. 공식 Test 정확 SHA 인증 E2E, 독립 복원, 운영 실행 코드 출처, P0 권한 및 GitOps 게이트 완료 전 병합·배포 금지. 롤백은 후보 코드 미승격 유지/추가 기능 되돌리기이며 금융 원장·DB 롤백 없음.
