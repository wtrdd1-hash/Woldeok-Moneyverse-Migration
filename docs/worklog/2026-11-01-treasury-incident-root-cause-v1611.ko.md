# v2026.11.01.1611 — 국고 초기화 후 미복구 반복 장애 원인 조사 (진행기록)
## 시작 — 2026-11-01 14:53 KST
- 사용자가 운영 화면 6장을 제시하고 10회 이상 반복한 복구 지시와 초기화 문제의 실제 원인, 이전 작업의 잘못을 분석·기록하고 해결하라고 요청함.
- 작업 전 원격 `origin/main=9052076301bf1975422731ab50a8b7770dbbe951`, 기존 작업자 `/home/debian/Woldeok-Moneyverse-Migration`의 로컬 `implementation_plan.md` 수정 보존; 독립 브랜치 `fix/treasury-incident-postmortem-v1611` 구성. 최신 메인과 통합 `DOCS_INDEX.md`, `AGENTS.md`, `docs/RELEASING.md`, v1552/v1553/v1603/v1607/v1609 기록, 현재 운영/공식 Test 실행버전과 국고 원장 실측함.
- 배포 실측: 공개 운영 `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, 공개 Test `bc8cd8a6c654af0336f550643f23049a58ee1d16`인데 최신 main은 `905207...`. Nginx의 구 4164/4165 서비스는 `prod-v2026.10.31.2255-353c6d5d6ddb`를 실행하고, `production-current`는 다른 `prod-v2026.11.01.0102-f13bbce273ff`를 가리킴. 코드 병합은 운영 적용이 아님.
- 2026-10-31 13:53:31 UTC 운영 DB 회계기 초기화 SQL 314가 이미 실행: 구 금고 합계 220,923,528 WLD 기록으로 보관, 현재 금고 0, 정식 국고 0, 구 국고 이벤트 552 미연결, 구 배당 744 중 738 NULL·6 무효 참조. 기존 정식 거래 891, 분개 1829, 계정 잔액 40건이 존재. 단순 초기화는 과거 출처/발행 증명과 행정 상태·배당 지급을 인증하지 않음.
- 중요 금지: 백업 검증 전 추가 초기화 금지, 기록 또는 회원잔액 삭제 금지, 금고 220,923,528을 실자금으로 무증빙 복구하지 말 것, 503/인증 우회 금지, 운영 SHA 불일치 상태를 완료로 보고 금지.
- 단계: [x] 최신 main·통합 문서·운영 상태 실측; [ ] 이전 작업 전과정의 인과관계/근본 원인 기록; [ ] 회계기·자료보관·원장/미연결 증명 검증; [ ] 미배포 UI를 실제 배포에서 검증할 공식 Test 경로 조사; [ ] 재발 방지 테스트·문서·GitHub PR; [ ] 실운영 승격 가능성/차단 이유 및 완료 재조회.
## 중간 — 2026-11-01 14:59~15:02 KST (실증)
- 116,104,277 bytes 이전 백업과 회계기 `full_backup_sha256` 동일: e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7. 이전 금고 JSON 상세: MAIN 186070444, EMERGENCY 34832520, WELFARE 20564, INFRA/RESERVE 0. 현재 금고 5개 합계 0, 정식 국고 0, fiscal 보호 트리거 3개 활성.
- 운영 DB `schema_migrations`: `314-treasury-fiscal-epoch-reset.sql` applied_at 2026-10-31 13:53:31.769Z. 문서 '운영 미초기화' 기록은 그 이전 시점 상태이며 현재 운영 사실이 아님.
- 운영 앱계정 인증 환경으로 기존 `scripts/release/audit-treasury-provenance.mjs` 실제 읽기 전용 실행: 종료코드 2 `BLOCKED_LEGACY_TREASURY_PROVENANCE`. 구 국고 552 미연결, 시간/액수 근접 후보 없음 551/우연 1, 공기업 배당 744 중 738 NULL/6 dangling/0 valid, 정식 거래 891/분개 1829.
- 운영 공개 `/api/treasury/overview` HTTP 503. 조폐국·중앙은행 발행 및 공기업 배당은 독립 금융 증빙 부재로 차단, SOE 상태변경은 DB 승인자·감사 영수증 미구현 503. 새 국고 코드 `main`은 현재 회계기 0 대사를 좁게 인증하나 live 웹은 옛 SHA 353c6d를 제공.
- 실제 public/version·systemd 프로세스·production-current 비교와 검증 증빙 매트릭스 `scripts/release/verify-treasury-postreset-completion.mjs` 구현. `node --test ...` 6 PASS, 실제 운영 실행 `NOT_RECOVERED`/종료 코드2, 운영/Test 버전·프로세스 포인터 불일치 및 독립 금융 영수증/인증/복원 게이트 누락을 구체적으로 출력. DB 쓰기 없음.
- EN/KO 사고 RCA `docs/incidents/2026-11-01-treasury-postreset-recovery-failure-v1611(.ko).md` 및 내부/GitHub 업데이트 영한 작성. `DOCS_INDEX.md` 정본 링크와 업데이트 로그 수정.

## 종료 — 소스·증빙 원인 조사 및 재발방지 후보 완료 / 실제 운영 복구 미완료
- 브랜치 `fix/treasury-incident-postmortem-v1611`, 기준 최신 `origin/main=9052076301bf1975422731ab50a8b7770dbbe951`, 기존 다른 작업자 수정 보존. CI 및 PR 별도 확인 필요.
- 신규 금융 초기화·발행·배당/회계 데이터 수정·운영 서비스 변경을 진행하지 않음. 구 금고 복원은 출처 없이 수행할 수 없으며 현재 원장/회원보호가 우선임.
- 남은 기능 인수: 정확한 SHA 공식 Test에서 인증/5회 UI E2E 및 복원/리허설→무중단 Production 실행/공개 SHA 확인; 이전 원장/공기업 배당 독립 원천영수증; 공기업 상태변경 SECDEF 감사 DB 함수; Mint/중앙은행 발권 및 SWF 지급 개별 원장 검증. 실제 완료라고 보고할 수 없음.
