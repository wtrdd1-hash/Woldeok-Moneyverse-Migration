# v2026.11.01.1613 — 공기업 상태 변경 복구
## 시작 — 2026-11-01 KST
- 사용자 실제 복구 지시. 최신 origin/main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` 기반 별도 GitHub 브랜치 `fix/treasury-soe-governance-v1613`, PR #2341 및 미니PC 격리 작업.
- 정본 DOCS_INDEX, AGENTS(SECURITY DEFINER), 최신 초안 기획, RELEASING, 사고 RCA v1611과 운영/DB를 재확인. 회원 잔액 보호. 공개 운영 SHA `353c6d...`, 공식 Test `bc8cd8...`. 과거 국고 552/배당 744 원장 미인증.
- 공기업 상태 설정(비금전)과 실제 배당·발권·중앙은행·SWF 결제를 분리. 기존 회계기 재초기화 및 과거 220,923,528 WLD 임의 복원 금지.
## 중간 — 소스와 실제 격리 DB 검증
- 새 전방 SQL 318: `soe_governance_receipts` 불변 영수증 및 `admin_soe_update_status` SECURITY DEFINER 함수. 실제 승인 관리자 역할·사유·상태·비율·멱등키를 DB에서 검증하고 기업 상태 변경과 영수증 기록을 원자적으로 실행. 앱 계정 직접 상태 UPDATE·영수증 INSERT 회수.
- Nest PUT 실제 세션 사용자 ID, 일회용 CsrfGuard; 직접 테이블 DML 없음, 영수증 위조/누락 차단. Next BFF 출처 검증·서버 일회용 CSRF, 관리자 화면 상태/사유 입력 및 확인된 영수증만 성공. 공기업 365,000,000 WLD는 실제 국고가 아닌 등록 모형 자산으로 표기 변경.
- 실제 운영 데이터 격리 복제 PostgreSQL `wdmv_v1553_fiscal_reset`에 SQL 318 적용 성공. 앱 계정 직접 UPDATE 거부, 무권한 사용자 거부, 승인 관리자 원자적 영수증 통과, 동일 요청 재전송 멱등, 정식 거래 891/분개 1829/기존 배당 744 불변. 트랜잭션 ROLLBACK으로 기업 상태와 영수증 복원. **운영 DB 변경 없음.**
- 로컬 공기업 백엔드 42 PASS/3 조건부 SKIP, 프론트 13 PASS, 백/프론트 타입 검사 통과(추가 CSRF 패치 이전 시행); 전체 CI 확인 중. GitHub Draft PR #2341, 공식 Test·운영 배포 미실행.
## 종료 — CI/공식 Test/운영 검증 대기
