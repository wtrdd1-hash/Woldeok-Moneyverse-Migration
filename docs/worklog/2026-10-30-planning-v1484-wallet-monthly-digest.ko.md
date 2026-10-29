# Moneyverse 기획 v1484 — F675-177 지갑 월별 활동 요약
**2026-10-30 02:05 KST | 기능 추가 | 초안 / 배포 보류**

**회차:** 이전 기능 보완 v1482 → 현재 기능 추가 v1484 → 다음 기능 보완 v1486(잠정). **근거:** miniPC Debian 13.6, main `62c6cd038951d65c94b709302bdaec6e75b080b6` 시작·중간 재조회, QA v1377 FAILED/P0. [GitHub 이슈 #1925](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1925). v1480/#1916 및 v1482/#1920 미병합. 스킬 커넥터 목록은 비었으며 miniPC 설치 using-superpowers·brainstorming·writing-plans·using-git-worktrees·verification을 읽고 문서 전용 작업에 적용.

## 소스 근거와 기획
- `frontend/src/app/wallet/activity/page.tsx`는 전체/7일/30일 50건씩, `backend/src/wallet/wallet.controller.ts`는 본인 기간+커서, `wallet.repository.ts`는 본인 USER_CASH/BANK 거래별 부호 집계, `frontend/src/app/wallet/export-ledger-csv.tsx`는 최근 행 CSV. 월별 요약 경로는 확인되지 않았으며 #1915 저장 필터, #1876 개인정보 내보내기, A/B/C/QA와 변경 분리.
- 회원 CTA, 한국시간 최근 1~12개월, `asOf`, 당월 PARTIAL, 정상 빈 기록과 장애 구분, 건수·정확한 WLD 순증감/현금/은행, 잔액·소득·세금 증명 금지. Nest 읽기 전용 REPEATABLE READ·거래별 선집계·신규 테이블/앱 직접 DML 없음, Next/Android 검증, no-store/noindex, 320px/WCAG AA, 관리자 집계, KPI 가설, 기능 OFF. 영문/국문 기존 통합·프로젝트 기획서에 상세 명세.

## 위험 게이트·개발 인계
- P0 REPO1484-01 과거 참조 462개, SEC1484-02 고객문의/감사 ACL·체크섬 5건, FIN1484-03 MINT 18,000 WLD·국고 552건·SWF·Test 공개 합성 200, REL1484-04 프론트/엣지 SHA·lint/app-api·정확 SHA Test·외부 복원·디스크 86%/89%. P1 MONTH1484-05 MONTH1484-06 MONTH1484-07 MONTH1484-08 MONTH1484-09 MONTH1484-10.
- 격리 PG 합성 거래 10,001건/타인·위조 100건/경계 100건/비정상·시간 초과 50건 **계획만 수립, 미실행**. 외부 독립 신규 검증 승인 **0건**, 누적 **UNKNOWN/10,000건** BLOCKED/IN PROGRESS. 운영승격 BLOCKED. 런타임·SQL·DB·금융 원장·Test·Production 변경 없음.

## 검증·발행
- P0/P1 10개 식별자 영문·국문 통합/프로젝트 기획서 확인, git diff --check, 문서 전용 경로와 릴리스 분류 검증. GitHub Draft PR만 작성하고 병합하지 않음. 내부 시작·중간·완료 기록은 `/srv/moneyverse-data/build-workspaces/planning-v1484-records/`.
