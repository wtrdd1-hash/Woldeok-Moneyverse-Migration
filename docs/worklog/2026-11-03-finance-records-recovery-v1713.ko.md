# v2026.11.03.1713 — 반복 금융 차단 관련 기록·운영 실측 감사

## START — 2026-11-03 16:33 KST
사용자는 국민연금, 국가투자공사, 국부펀드, 국고·통화 관련 경고 스크린샷을 첨부하고 과거 다수의 정상화 지시와 전 기록 확인을 요구했다.
작업은 미니PC MCP에서 수행하며 다른 진행 중 작업과 분리한다. 통합 허브 DOCS_INDEX.md 우선 확인, AGENTS.md, Treasury Core, v1611 사고보고서, v1626/1626.6 금융 초기화, v1652.2 운영 기록 및 GitHub P0 #2366/#993을 검토했다.
출발 기준 GitHub origin/main SHA 07fa93a7781c60e042c59862953bc6f05452e45a; 실제 운영 production-current 릴리스 prod-v2026.11.03.1705-07fa93a7781c 확인. 전용 브랜치 audit/finance-records-recovery-v1713-20261103.

### 확인된 진행 전 사실
- 기존 국고 552, 공기업 배당 744, 국민연금 지급 238건은 11월 3일 v1626.6에서 활성 테이블에서 제거, 총 1,546건은 해시 기반 보관. 기존 정식 원장과 회원 잔액 보존 기록.
- 현재 DB woldeok_moneyverse_dev: 정식 원장 거래 891, 분개 1,829, 금융 초기화 1회, 보관 1,546, 국고 활성 기록 0, 공기업 배당 활성 0, 국민연금 기존 지급 활성 0, 신규 국고 Core 및 연금 금융 영수증 0.
- 백엔드·프론트엔드·DB 프로세스가 실행된다는 것과 실제 금융 지급 가능은 다른 조건. 새 회계기 국고와 연금 재원 0인 현재는 일괄 지급/배당/발행 안전 차단을 제거할 수 없다.
- GitHub P0 #2366은 미해결. #993은 앱 역할 보호 테이블 직접 쓰기 권한 문제로 별도 보안 검증 대상.

## MID — 점검 진행
- [x] 기존 기록·통합 문서 우선 확인 및 전용 브랜치 생성
- [ ] 실제 DB 보관 무결성, 복식 원장, 보호 권한을 읽기 전용 재실측
- [ ] 실제 운영 SHA 및 주요 공개 URL/금융 API 보호 상태 검증
- [ ] 문서 기록과 운영 차이 정리·후속 실수정 범위 결정
- [ ] 진행 중 main 최신 SHA 재조회와 작업 충돌 확인

## END — 미완료
검증되지 않은 지급·발권·복구·운영 승격은 완료로 보고하지 않는다.

## MID — 2026-11-03 16:40 KST 실제 운영 재검증
1. 정확한 소스/서비스 검사: 운영 공개 /api/version 및 /frontend-version 모두 07fa93a7781c60e042c59862953bc6f05452e45a. sudo -n 실행으로 /etc/moneyverse 읽기 권한을 정상 확보한 후 운영 공식 verify-host-runtime-identity --channel prod --sha 07fa... = ok:true, failures:[]; treasury overview HTTP200 status RECONCILED, 보유 0 WLD.
2. 운영 PostgreSQL 계좌 42, 원장 891건, 전표 1,829. debit를 가산·credit를 감산하는 이 프로젝트의 실제 정산 수식으로 42/42 계좌 일치, 미일치 0; 891/891 거래 차변 합계와 대변 합계 일치, 불균형 0. 최초 임의 credit-plus 수식은 거꾸로 계산하여 24건 가짜 경고를 발생시켰으므로 폐기. 원장 부호 규칙은 packages/database/init/001-economy-core.sql 근거.
3. 보존 금액: USER_CASH 4,783,802 WLD + USER_BANK 57,708 WLD = 4,841,510 WLD. MINT -5,078,810 WLD, SINK +237,300 WLD, 총 계좌 합계 0. 5개 현재 국고 모형 금고 0 및 정식 TREASURY 0.
4. 11월 2일 23:14 UTC 금융 리셋 실행 1회, finance_reset_archive_entries 1,546행. 1,546/1,546행의 payload::text SHA256 전수 재계산 결과 불일치 0, 결함 해시 0. 8개 원본 테이블의 보관 개수와 finance_reset_runs.original_row_counts 일치. 기존 국고 552, 배당 744, 연금 지급 238 포함; 현재 그 세 테이블 모두 0행. 백업 원본 파일 124,890,258바이트 직접 SHA256 검산 = 67aa7851e7cf866a4fa2439c54622d8fc1a2c02430c6745f45b9b7b99fb00559 (기존 운영 기록 일치). 복구 실행 검증은 본 감사에서 수행하지 않음.
5. 새 국고 Core SECURITY DEFINER 함수의 app EXECUTE=true, 직접 국고 Core 영수증 INSERT=false, 신규 연금 영수증 UPDATE=false, 직접 원장 거래 INSERT=false. 신규 treasury_core_receipts=0, pension_funded_receipts=0, mint_certificates=0, KDIC 지급=0, 현재 국고 0. SWF 모형 포트폴리오 4건/이벤트 272건은 지급 가능한 정식 국고의 근거가 아님.
6. **P0 보안:** 실제 운영 DB account_balances에 moneyverse_app UPDATE=true. 기본 266테이블 중 애플리케이션 역할이 직접 INSERT/UPDATE/DELETE 중 한 개 이상을 가진 테이블 197개. 동일 DB와 역할은 공식 v1622 실제 운영 연결 자료에 확인됨. 즉 2026-10-23 개발 DB에서 보고된 #993 경계 문제가 여전히 중요한 운영 권한 리스크. 테이블 직접 UPDATE 수행은 하지 않았음. 과거 AGENTS의 'SELECT only' 설명과 현장 ACL 불일치.
7. #2366 현존 금융 차단: 신규 재원 없는 연금 일괄 지급, 국고 미충당 배당/지원, 예보 지급, 조폐국/중앙은행 실제 발행은 모형 정책/메모리 숫자로 정식 증명 불가능. 해당 POST를 503에서 강제 개방하거나 원장·감사영수증을 위조하지 않음. 0자금에서 원장 무결성은 정상이고, '정산/운영 가능'은 별개.
8. 익명 요청으로 POST /api/treasury/donate, /api/pension/funded/contribute, /api/pension/funded/withdraw 모두 HTTP403(CSRF/Origin 보호). 인증된 실제 금융 트랜잭션은 수행하지 않았으므로 기능성 E2E PASS라 주장하지 않음.

### 다음 수정에 필요한 정확한 업무 경계
- [ ] #993: 별도 수정 브랜치에서 현장 ACL 원인과 모든 필요한 DB 래퍼를 식별, 새 순방향 migration으로 account_balances의 비인가 직접 DML 제거하고 테스트·공식 Test·운영까지 증명
- [ ] #2366: 실제 자금이 보전되는 DB 복식 원장만으로 국민연금 정기 지급, SOE 배당, KDIC 지급을 각각 멱등/불변영수증/관리자승인 경계로 구현
- [ ] 조폐국·중앙은행: 메모리 모의발행을 실화폐 증거로 표시하지 않고 승인자 분리/발행 한도/발권 영수증/공급량 제약을 구현
- [ ] 실제 지급가능 WLD 출처가 0인 상태에서 금액 창출/기부 대리 실행은 하지 않음. 백업·유저 잔액·금융 로그 보존
- [ ] 각 모듈을 실제 인증 사용자/관리자 E2E, 격리 Postgres, 공식 Test/무중단 운영으로 개별 승인 및 증명. 현재 감사 문서는 코드·DB 변경/운영 승격을 의미하지 않음

## END — 2026-11-03 KST 감사 기록 완료
- [x] DB 원장·보관 SHA256·백업 파일 검사 완료, 정식 42계좌/891거래 일치
- [x] 실제 Production SHA 07fa93a... 및 공식 배포 신원 검사 PASS, 국고 조회 200 RECONCILED 0
- [x] 실제 DB 권한 문제 확인: account_balances UPDATE 권한, P0 #993 운영 관측 업데이트
- [x] 실제 금융 미지급·미발행 P0 #2366 운영 관측 업데이트
- [x] main 최신값 재확인, 타 개발자·Gemini 브랜치/운영 무수정
- [x] 내부용/깃허브용 EN/KO 변경 기록, changelog, 통합 문서 인덱스 작성
- [ ] 전체 기능의 실제 금융 정상화: 본 문서 작업 범위 밖, 구현·재원·독립 E2E가 필요
- [ ] 새로운 코드/금융 변경 Test->Production 승격: 이번은 문서 전용이므로 수행하지 않음
**완료 표기는 감사와 기록의 완료만 뜻함. 금융 기능 전체 정상화 완료 보고 금지.**
