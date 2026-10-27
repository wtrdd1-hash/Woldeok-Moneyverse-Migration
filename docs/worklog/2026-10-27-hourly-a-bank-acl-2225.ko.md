# 개발 A — 가상은행 신용정보·대출 권한 보호 (2026-10-27 22:25 KST)

**개발 후보 / Draft / HOLD — 미병합·미배포.** 기준 main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`. 영문 통합기획서 SHA256 `506c291f...`, 국문 `630a8293...` 확인. AGENTS·README·영문/국문 기획서·QA v1325·이전 A 작업일지·PR/브랜치/CI 검토.

- 최신 main의 별도 `auto/hourly-a-bank-acl-20261027-2225` worktree 사용. 미병합 #1564의 마이그레이션 280→282 수정과 #1580의 은행 응답 캐시 보호를 안전하게 재적용. 다른 개발자의 브랜치·고유 변경은 보존.
- 신규 **미적용** 283 마이그레이션으로 `bank_my_credit_facts(p_actor)` SECURITY DEFINER 함수를 만들고, 은행 대출·상환 테이블에 대한 앱 계정 및 PUBLIC 직접 권한을 철회. Backend 신용정보 조회는 기존 직접 테이블 조회 대신 제한된 함수 사용. 적용된 마이그레이션·금융 원장·멱등성·금액 문자열 정밀도 불변.
- Backend 대출·은행 현황·신용등급 및 Android app-api의 은행 응답은 `private, no-store`. 은행 화면에 한국어·영어 개인정보 안내 추가. 인증/인가·동적 렌더링·검색 비노출 유지.
- RED→GREEN 회귀테스트, 격리 PostgreSQL 17 전체 마이그레이션 283까지 적용, 앱 역할 대출 테이블 SELECT/UPDATE 거부·함수 EXECUTE 허용, 합성 회원의 신용정보 확인 후 ROLLBACK 및 컨테이너 삭제. **운영 연결 DB 쓰기 0건.**
- 초기 검증: 계약 38 PASS, DB 22 PASS/3 SKIP, Backend 1,546 PASS/415 SKIP, Frontend 1,492 PASS, 타입·린트·빌드·Android API·Bot 8 PASS. 전체 보안 감사 Critical 2/High 8 및 Bot Critical 1/High 5 **FAIL**. 최종 SHA/CI 증거는 PR에 별도 기록.
- 실제 운영 연결 DB는 268까지 적용되어 있고 대출 테이블의 앱 직접 권한이 아직 남아 있음. #993의 광범위한 권한 문제는 이번 두 테이블 수정만으로 해결되지 않음. 공식 Test·Production SHA가 후보와 다르고 정확 SHA E2E·보안·백업 복원·GitOps 미충족.
- **Production RELEASE HOLD.** main 병합·Test/Production 배포·운영 DB 변경·금융 거래·기능 활성화·롤백·브랜치 삭제 0건. 배포 전에는 후보 브랜치를 보존하고, 배포 후 DB 권한 변경이 필요할 때는 기존 SQL 수정이 아닌 검토된 순방향 보정 마이그레이션만 사용.
