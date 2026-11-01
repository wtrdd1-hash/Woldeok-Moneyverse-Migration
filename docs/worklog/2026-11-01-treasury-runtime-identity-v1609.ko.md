# v2026.11.01.1609 — 운영 배포 버전 검증기 복구
## 시작 — 2026-11-01 KST
- 새 `origin/main` `95877554097b595d8dcfa28b60ecb65e50bf0c2d` 확인 (v1607 국고 수정 main 병합, 전체 CI #5133 성공). 타 작업자 main을 건드리지 않는 `fix/treasury-runtime-identity-v1609` 격리 브랜치.
- 정확한 SHA 무중단 운영 배포 버전 검증기 실행 시 `systemdProcessDirectory is not defined`로 실제 버전 비교 이전에 예외 발생. `collectSnapshot`에서 정의되지 않은 함수 사용, `systemdProcessEvidence`는 존재함. 검증기를 건너뛸 사유가 아님.
- 운영 공개 실행 SHA `353c6d...`, 새 main `958775...` 불일치. 공식 Test는 `bc8cd8...`이고 국고 복제본과 다른 샘플 데이터. 병합 main 정확한 SHA의 **비활성** Test/Prod 릴리스 산출물 2개는 생성됨. 포인터·Nginx 무변경. 과거 국고 552건과 배당 744건 출처 감사 차단 상태로 실제 배당은 지급 불가.
- 범위: 검증기 소스 수정, 차단 조건 유지, 테스트·실제 읽기 전용 사전검사, 별도 PR, 완료·차단 여부 기록. 운영 서비스 및 DB 상태 변경 금지.
## 중간 — 소스 및 호스트 직접 검증
- 미정의 참조 제거 후 `activeServiceLookup(releasePath, evidenceFor=systemdProcessEvidence)`를 구현하고 실제 `evidenceFor(service).cwd` 사용. 결정론적 회귀 테스트 포함 `verify-host-runtime-identity.test.mjs` 20개 PASS/실패 0.
- 실제 Test 대상 main SHA `958775...` 사전검사에서 기존 Test bc8cd8의 SHA 불일치 6건 보고. ReferenceError 없음. 운영 사전검사에서는 `production-current`의 기존 `prod-v2026.11.01.0102-f13bbce...`에 `.moneyverse-release.json` 부재로 정상 차단. 실제 구버전 실행 폴더 `prod-v2026.10.31.2255-353c6d...`도 매니페스트 없음. 가짜 매니페스트·포인터 조작 없음.
- main SHA 정확한 비활성 Test/Prod 산출물 `test-v2026.11.01.1607-95877554097b`, `prod-v2026.11.01.1607-95877554097b` 존재. 운영 데이터 복제 HTTP 0 WLD 일치 확인, 과거 금전 출처 감사 계속 차단.
## 종료 — 소스 수정 검증 완료, 운영 승격 보류
- 읽기 전용 배포 검증기 소스·문서만 변경. 운영 DB, Nginx, 서비스, 공식 Test/Prod 포인터, 회원 세션·자금 무변경.
- 다음 필수: 공식 Test 전체 버전·인증 유지, 가짜 리라벨 아닌 검증된 매니페스트/프로세스 복구, 무중단 운영 적용 및 공개 버전/원장 재검증. 실제 배당은 정식 원장 출처를 가진 원자적 지급 증빙 별도 필요.
