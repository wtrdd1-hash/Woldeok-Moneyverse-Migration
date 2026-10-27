# v2026.10.28.1403 — TECH 블로그 관련성·근거 정정 작업기록

**작업 전:** 이용자가 신고한 기술 글에 복리 계산기·금융기관 출처·공통 금융 본문이 나타나는 문제. v1380 상세기획(문서 PR #1592), 이슈 #1591, 통합 영·한 기획, AGENTS, v975/v1107/v1108, 릴리스 지침·실 코드를 확인하고 독립 브랜치에서 개발 시작. 작업 시작 시 메인 SHA `656a8994`; v1102 구형 발행 차단은 병합 완료 상태.

**작업 중:** 글 두 종류의 별도 기술 원고와 검증 사례를 작성. TECH에서 복리 계산기, 금융 추천 카드, 배너를 조건적으로 비활성화. 기술 누락 템플릿과 미지원 국가판 차단. 합성 조회수 표시 및 생성 제거. 메인 SHA `004be593`에서 v254 공통 블로그 본문 확장을 확인하고 금융 글 변경은 보존하면서 TECH 분기만 별도 적용.

**테스트:** 집중 블로그 20 PASS; 프론트 전체 328 파일/1,686 테스트 PASS; 타입·린트 통과; 공통 계약 패키지 및 Next.js 운영 빌드 성공. 독립 작업공간의 심볼릭 링크로 Turbopack 실패 후 독립 pnpm 설치, 계약 패키지 미빌드 오류 복구. 다른 개발자 환경 변경 없음.

**작업 종료 상태(예정):** 코드 브랜치 GitHub 푸시·PR 생성, CI 및 정식 Test·무중단 운영 승격 게이트 점검. 아직 직접적인 게시글 본문 교체·DB쓰기·운영 승격 수행하지 않음. 24시간 검토 경과 자동 비공개 금지.

## 작업 종료 기록 — 2026-10-28 KST (코드 개발 완료 / 배포 차단)

- **확정 소스 SHA:** \`b96ec0156f78757466be796f1025318e2d012806\`. 격리 브랜치 \`fix/blog-tech-relevance-v1403-20261028\`, [개발 PR #1602](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1602), [기능 이슈 #1591](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1591).
- 마지막 최신 메인 재확인 \`4f5efd1f48615f0112701feec25a9b0fc67d9719\`. 다른 개발자의 블로그 코드/통합 문서 추가 변경 없음. 이전 v254 블로그 확장 원고는 보존.
- **로컬 결과:** 최종 소스에서 프론트 328파일/1,686테스트 PASS, 집중 블로그 20 PASS, TypeScript·변경 린트·계약 패키지·Next.js 빌드·diff check PASS.
- **GitHub CI 실패:** [실행 #3796](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/40531608937)에서 린트·타입·빌드·격리 DB 마이그레이션 적용 통과 후 마이그레이션 **번호 283 중복** 때문에 테스트 단계 실패. 메인에 \`283-bank-loan-privacy-boundary.sql\`, \`283-space-finance-ledger-boundary-hold.sql\` 두 파일이 존재. 블로그 PR은 마이그레이션 변경하지 않음. 로컬 동일 재현 5 PASS/1 FAIL. [차단 이슈 #1605](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1605)에 등록. 기존 적용 SQL 개명·체크섬 수정·테스트 비활성화 금지.
- **공식 Test 미검증:** Test 백엔드/프론트 systemd 가동 및 공개 HTTP 4경로 200이지만 v1403 정확 SHA 실행 증거 아님. Test 릴리스 신원검사 종료코드 1: \`/srv/moneyverse-data/releases/test-current\` 링크 대상 부재. 정확 SHA Test 승격·인증된 관리자/회원 E2E, 백엔드/API/DB 검증 미실시.
- **운영 차단:** 읽기 전용 금융 준비 검사 종료코드 2, \`BLOCKED\`. 앱 역할이 \`account_balances\`, \`accounts\`, \`system_treasury_vaults\` 직접 DML 가능. 승인된 순방향 권한/원장 정합성 해결 전 운영 강행 불가.
- 기존 공개 기술 글의 **원문은 수정·철회하지 않음**. TECH UI의 무관한 계산기 제거는 실제 배포 후 적용 예정이며 구형 본문은 관리자 수동 검증·정정 승인 필요. v1108 시간 초과 자동 비공개 금지 유지. 운영 DB/계정/서비스/배포 포인터 변경 없음.
- **작업 상태:** 코드 후보 완료 / GitHub PR 초안 / CI 실패 / 공식 Test 차단 / 운영 승격 차단. 후속 이슈 해결과 공식 Test 승인 후 무중단 승격 필요.
