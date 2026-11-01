# v2026.11.02.1620 — 국고 운영 공개 승격 작업기록 (KO)

## 시작 — 2026-11-02 03:58 KST의 실제 상태
사용자 운영 화면에서 금고 0 WLD이지만 대사 ‘미검증’, 누적 원장·오차 미검증. 공개 운영 백엔드 SHA `353c6d5d...`, 프론트 버전 시각 문자열 `1793450413898`, 국고 API 503. 반면 공식 Test와 GitHub 통합 `main`은 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`. 운영 릴리스 심볼릭 링크만 앞서 있었고 실제 Nginx는 4164/4165 구 서비스로 연결. 원인은 **배포 라우팅 불일치**, 금전 데이터 삭제 필요 없음.

## 중간 — 04:01 KST 운영 카나리 복구
새 v1619 백엔드 4184/프론트 4185 기동 확인. 두 서비스가 삭제된 오래된 release-local `.env` 파일을 참조해 재시작 시 장애 위험이 있었음. 실제 기존 운영 credential과 일치하는 유효한 파일을 root:debian 0640의 안정적 `/etc/moneyverse/prod-v1619-{backend,frontend}-stable.env`로 복사하여 **신규 v1619 유닛만** 수정. 실제 재시작 후 active, 재시작 횟수 0, 신규 치명적 로그 0, 백/프론트 SHA 동일, 국고 200/RECONCILED/현재 0 WLD. 기존 v1550 운영 서비스 유지. 회원 잔액·원장·세션 초기화 없음.

## 종료 — 04:02~04:04 KST 공개 운영 승격 및 검증
- 변경 전 Nginx 설정과 SHA256을 `/srv/moneyverse-data/backups/treasury-core-v1618-20261102/nginx-prod-before-v1619-final-20261102-040215.conf`에 백업. **운영 서버 블록에서만** 백엔드 6개 라우팅 4164→4184, 프론트 15개 4165→4185. Test/MCP 설정 유지. `nginx -t` 통과 후 중단 없는 reload.
- 운영 외부 API 백엔드·프론트 모두 최종 main SHA `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` 일치. 공개 국고 `/api/treasury/overview` = **HTTP 200, RECONCILED, verified:true**, 현재 금고/비축/가용 각각 0 WLD. `production-current`는 불변 v1619 세대로 원자적 전환.
- 실제 systemd 프로세스/환경/Next 빌드/릴리스 매니페스트/공개 응답 `verify-host-runtime-identity --channel prod` = **ok:true, failures:[]**. 공개 `/`, `/admin/treasury`, `/status`, `/health`, `/api/version`, `/frontend-version`, 국고 API 모두 200. 인증 없는 관리자 API는 401. 신규 운영 치명적 로그 없음.
- 운영 DB 실제 `moneyverse_app` 읽기 전용 대사: 금고 5개, 정식 국고 계정 1개, 금고/원장 잔액 0/0, 신규 부적합 출처 0, 과거 국고 552·배당 744 기록/기존 백업 SHA 일치. 원장 891거래/1829전표, 과거 연금 지급238건, 인증 세션1897건 보존, 신규 적립 증빙 영수증 0건. 금융 readiness 검사는 다른 릴리스 게이트 진행 가능, 원장 불일치 0; 기존 운영자 승인 DML 경고는 유지.
- **구 국민연금 지급·조폐국/중앙은행 발행·과거 552/744의 개별 결제 출처는 증명 완료가 아님**. 익명 신규 적립 연금 API는 503 보호 유지. 실제 사용자 로그인 브라우저의 관리자 DOM을 직접 조회하지는 못했으며, 공개 코드와 독립 원장 검증까지 확인한 상태.
- 기존 v1550 서비스 및 Nginx 백업으로 롤백 가능. 금융 데이터 초기화·가상 금전 생성 없음. 코드 PR #2392는 이미 main 통합; 본 기록은 운영 승격 증거임.
