# A1657 — 회원 은행 잔액 CSV 조회 (한국어 보조 기록)

## 작업 전
- 기준 main `d12c948ac454b0762cfb7fb0cddf83703a775172`; AGENTS/README/영문·국문 통합기획서/QA v1344 확인. 데이터 디스크 97%, 금융 원장 대비 잔액 차이 18,000 WLD로 운영 배포 금지.

## 작업 중
- 별도 브랜치·worktree에서 로그인 회원의 은행 잔액 스냅샷 JSON, CSV 다운로드 및 Android app-api를 연결. 기존 `bank_get_my_standing(actor)`만 읽으며 원장·마이그레이션·DB 권한을 변경하지 않음.
- RED 테스트 후 GREEN: Backend 집중 3건, Frontend CSV·Android·다운로드 32건 통과.

## 종료 및 배포 판정
- Backend 전체 1,939 PASS/440 SKIP, Frontend 1,878 PASS, DB 45 PASS/3 SKIP. Typecheck/Lint/API 계약 통과, 보안 High 이상 0. Bot 11 PASS(로컬 의존성 설치 후 재시험).
- 최초 빌드는 Google Font 다운로드 해석 문제로 실패; 실제 글꼴 파일을 임시 캐시한 재빌드에서 정적 페이지 609개와 번들 생성 완료. GitHub CI Runtime·Build PASS.
- 격리 합성 PostgreSQL 17.11 검증 통과(운영 권한 검증 아님). 공식 Test SHA가 후보와 다르고 금융 무결성·권한·백업 복구 게이트 미충족.
- Draft PR #1719, 복구 참조 352개 보존, 삭제 브랜치 0개. main 병합·Test/Production 배포·운영 DB/원장 변경·롤백 0건. **PARTIAL / BLOCKED, Production RELEASE HOLD.**
