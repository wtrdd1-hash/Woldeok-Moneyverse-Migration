# v2026.10.31.1551 — 국부펀드 운영승격 재검증 (검증 전용)

## 시작 — 2026-10-31 KST
사용자가 재승격 및 전체 관련 기능 해결을 지시함. 최신 origin/main SHA 6cd731c068fb25097c5b717a93c285bf8d31edcc는 이미 승격된 앱 SHA bc8cd8a6c654af0336f550643f23049a58ee1d16 위에 문서 변경만 추가된 상태. 작업 전 AGENTS·DOCS_INDEX·DOCUMENTATION_POLICY·PROJECT_PLAN·INTEGRATED_PLANNING_MASTER·ADMIN_TREASURY_MANAGEMENT_SPEC·RELEASING·v1550 EN/KO 릴리스 기록 확인. 이미 정상 무중단 승격된 버전을 재절체하거나 적용한 DB 마이그레이션을 다시 수행하지 않음. Production/Test 실행 버전·실제 Nginx 경로·HTTP 보안·DB 체크섬·백업·국고 원장 검증. 운영 실제 사용자/금융 데이터 변경 없음.
## 중간 — 확인 중
## 종료 — 확인 중

## 중간 — 실제 운영 읽기 전용 재검증, 2026-10-31 KST
- 운영/Test 공개 API와 프론트 빌드 ID 모두 정확히 bc8cd8a6c654af0336f550643f23049a58ee1d16. GitHub main 6cd731c0은 문서 추가 커밋일 뿐 새 실행 바이너리가 아님.
- 운영 불변 릴리스에서 권한 있는 관리자용 verify-host-runtime-identity 스크립트를 prod/test 각각 재실행, 양쪽 모두 ok=true, failures=[]; 실제 실행 프로세스·환경변수 빌드·불변 매니페스트·프론트 산출물·공개 ID 일치.
- Nginx 운영 경로는 새 v1550 서비스 4164/4165로 연결. 두 서비스 active/enabled, 실제 작업 경로 새 prod-v2026.10.31.1550-bc8cd8a6c654. 기존 3564/3565는 공개 운영 트래픽이 아니라 이전 불변 릴리스의 롤백 대비용이며 장애나 미승격 근거가 아님.
- 실제 운영 /, /status, /admin/treasury, /blog, /robots.txt, /sitemap.xml, /ads.txt, /api/version, /frontend-version, /health 모두 200. 비로그인 SWF 조회 401, 악성 출처/출처 없는 PUT 403, 정상 출처지만 로그인 없는 PUT 401. 보안상 올바른 차단, 운영 실사용자 정책 변경 시도 없음.
- 실제 운영 서비스 DB 계정 moneyverse_app으로 승인관리자 전용 SWF 조회 실행, 설정 1·자산 4·최근 이벤트 20 확인. 미승인 ID·원본 테이블 직접 조회 SQLSTATE 42501 거부. 정책 변경 함수만 EXECUTE 가능, 원본 설정 UPDATE·자산 SELECT 금지. 적용된 마이그레이션 313 SHA-256 ec89b35acea4703b0a2f51fd4669cbe4cce5f4e46807d8e57994d82996d6d1a6와 원본 일치. 운영 사전 백업 체크섬, nginx -t 통과, 신규 운영 서비스 오류 수준 로그 0건.
- 이전 v1550 격리 Test에서 로그인 관리자 SWF 백/프론트 조회·저장 200, CSRF·타 출처 403, 관리자 패널 정상 표시 확인. 실제 운영 사용자로 로그인하여 정책 변경하지는 않음.
- 금융 차단 미해결: 과거 국고 장부 552건 전부 ledger_transaction_id 연결 없음, 정식 원장 거래 891·분개 1829. 레거시 FEE_RECIRCULATION 502건, MARKET_STIMULUS 26건 등 원인 거래별 독립 증빙 부족. 날짜·금액으로 추측해 연결하거나 억지 분개로 균형 맞추기 금지. 공개 국고 HTTP 503 PUBLIC_TREASURY_RECONCILIATION_PENDING는 금융 안전 차단이며 지급 완료 뜻이 아님. 추가 DB/금액/원장/운영 라우팅 변경 없음.
