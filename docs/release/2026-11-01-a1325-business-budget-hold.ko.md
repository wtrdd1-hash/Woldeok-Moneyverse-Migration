# Release HOLD — A1325 사업체 카탈로그 인수 비용 검색 (2026-11-01)

**배포 판정: HOLD.** PR #2320은 Draft 및 `hold` 상태다. main 병합, 공식 Test 배포, Production 승격, DB 수정 및 서비스 재시작을 수행하지 않았다. 코드는 `auto/hourly-a-20261101-1325-business-budget` 독립 브랜치에만 존재한다.

회원 검색은 읽기 전용이며 원장·금융 멱등성·스키마·권한을 변경하지 않는다. 정확 HEAD의 전체 CI PASS, 공식 Test Backend/Frontend 동일 SHA, 로그인·동의·회원 흐름 E2E, Android API 계약, 실제 PostgreSQL 소유자·권한 거부 검증, 보안·접근성·SEO, 독립 백업 복원·롤백, 원장 정합성 및 systemd/Nginx 실행 출처가 검증되기 전에는 운영에 반영하지 않는다.

**차단 사유:** 개발 DB `moneyverse_app`에 광범위한 직접 DML/조회 권한이 남아 있다(#993). 공식 Test 공개 SHA `bc8cd8a6...`, Production Backend 공개 SHA `353c6d5d...`는 후보와 다르다. 운영 Frontend 실행 파일 출처와 독립 백업 복원도 이번 회차에서 입증하지 않았다. 개발 C의 PR #2257 및 #2318과 파일이 겹치므로 고유 변경을 보존한다. 초기 CI의 Next PageProps 오류는 수정했으나 최종 SHA 재검증이 필요하며, 호스트 워커 EPIPE로 중단된 전체 테스트는 PASS가 아니다.

**롤백:** 실제 배포를 하지 않았으므로 롤백도 없다. 향후 승인 시 이전 불변 systemd 릴리스를 보존하고, Test 정확 SHA 및 기존 로그인 세션 유지, 독립 릴리스 게이트를 통과한 경우에만 무중단 전환한다. 미충족 시 기존 운영 상태를 유지한다. GitOps/Flux는 복구·목표 아키텍처이며 현재 Debian systemd 운영 증거를 대체하지 않는다.

**증거:** `docs/qa/2026-11-01-a1325-business-budget.ko.md`, `/srv/moneyverse-data/tasks/mv-a-20261101-1325-business-budget/`.
