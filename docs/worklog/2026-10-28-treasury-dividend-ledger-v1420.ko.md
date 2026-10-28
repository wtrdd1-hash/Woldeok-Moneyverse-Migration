# v2026.10.28.1420 — 국고 시민배당 복식원장 재발 방지

## 작업 시작
- 사용자 지시: 기존 DB 변경 권한은 허용, 권한 이외의 금융 오류 해결 우선. 별도 브랜치에서 최신  `main` 및 통합 문서와 v1416 증적 재점검.
- 시작 main: `9ff388ab608af99b9ccc806c35ebac5c14bd15e9`. 별도 Worktree `fix/treasury-dividend-ledger-v20261028-1420`.
- 기존 감사 확인: 2026-10-28 14:25:56 KST 18명에 각 1,000 WLD 배당. 총 18,000 WLD가 USER_CASH 잔액에 반영됐지만 canonical ledger_postings에는 미반영. 240 함수는 잔액 직접 수정, 금고 차감, 국고 감사내역 기록. 정식 국고 TREASURY 계정 잔액은 0 WLD, 금고 표시 잔액과 다름.

## 수정
- 불변 순방향 `291-ledger-first-citizen-dividend.sql` 추가: 4-인자(운영자, 1인액, 감사사유, 멱등 요청키 UUID) 함수. 복식원장 `economy_post_transaction`으로 국고 계정 1개 credit, 수혜자 계정 각 debit 생성. 모든 account_balances 조정은 정식 primitive만 수행, 동일 DB 트랜잭션에서 금고 잔액·국고감사·수혜자 스냅샷·지급영수증 영속 기록. 30% 비축금과 정식 국고 계정 실잔액 동시 검사.
- 기존 3-인자 배당 함수는 명시적 실패(55000)로 대체해 중복·미분개 배당을 차단. 승인된 일반 테이블 app-role 권한은 변경하지 않음.
- 백엔드 DTO→service→repository와 관리자 프론트 Server Action→대화상자 전체에 요청키 전달, 불명확한 응답 후 같은 UUID를 재사용하고 입력 변경 시 새 키 생성.
- 과거 18,000 WLD는 이미 지급했으므로 **재지급 없음**. 계정별 지급증거가 확인되지 않은 임의 복구분개도 생성하지 않음. 역사적 정합성 인증, 국고 TREASURY 계정의 진정한 개시 재원 증빙 및 대사 영수증이 있어야 운영 금융 처리 재개 가능.

## 검증 상태
- TDD 신규 테스트 RED→GREEN. 백엔드 집중 3파일 53 테스트 PASS, DB 정적계약 1 PASS, eslint 오류0. 백엔드/프론트 타입검사 PASS(계약 먼저 빌드).
- 운영/공식 Test DB에 데이터 쓰기 없음. 미니PC에 운영과 격리된 빈 전용 PostgreSQL 컨테이너를 생성했으나 호스트 `psql` 없고 원격 전체 마이그레이션 실행이 차단되어 실제 통합 결과는 **미검증**. Disposable GitHub CI 환경의 실제 SQL E2E fixture는 별도 `GITHUB_ACTIONS`와 포트 5432 식별을 확인할 때만 실행하며 모든 합성 행을 ROLLBACK함.
- 공식 Test SHA, DB 전체 마이그레이션 291 적용, 수혜자 운영 인증 E2E, 부여권한별 함수 호출, 오래된 18건 대사, 공급원천 인증, 백업 복원, Production 승격은 **미완료**. 통합 CI 결과 별도 기록해야 함.
