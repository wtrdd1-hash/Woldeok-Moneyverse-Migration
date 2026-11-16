# v2026.11.17.3 — Spring 전체 웹 전환 운영 승격 요청 점검

## 작업 전 (2026-11-17 06:50 KST)
- 사용자 운영 승격 요청에 따라 이전 후보 SHA `e1b2799f3fc2f0914988d5f6f0e8bd23ef09483b` Draft PR #3213, 최신 main `2c1ea4cd7734e67f6047c68eb4ec884940ac7a09` 확인.
- AGENTS, 통합 기획, 프로젝트 계획, RELEASING, G0~G6, 기존 QA 문서 및 실 서버 릴리스 조건 우선 적용. Gemini 병렬 작업과 기존 운영 서비스 보호.

## 중간 확인 (2026-11-17 06:50 KST)
- 기존 화면 178개 정식 전환 0개, Next API/BFF 124개 이전 0개, 새 미리보기 2개뿐. 후보는 main 미병합 Draft.
- 이전 후보 전체 Java 테스트 111개 중 110 통과, 1 실패: `/api/engagement/dopamine/status`의 두 컨트롤러 중복 매핑. Spring 기본 전체 허용/CSRF 비활성 등 QA PR #3207 P0 문제 잔존.
- 공식 Test `test-main-backend`, `test-main-frontend`는 현재 active이나 Test와 운영의 `/spring-web`은 404로 후보 미실행. 운영 기존 `/`, `/status`는 200. Test `/` 한 차례 타임아웃. Test 백엔드 버전 `v2026.11.14-spring`, 프론트 버전 `cfc178ab55d95fd4f1e34a62f2d3cf17b932c12a`(후보 SHA 아님).
- 릴리스 공식 SHA 검증 스크립트는 `/etc/moneyverse/test-backend.env` 읽기 권한 오류 EACCES로 완료되지 못함. 통과라고 주장할 수 없음.
- 로그인 없이 읽기 GET: 운영 `/api/v1/admin/me` 401, `/api/v1/admin/security` 401, **운영 `/api/v1/admin/treasury/overview` 200**. 테스트 같은 3경로는 모두 401. 운영/테스트 관리자 금융 접근 통제 차이는 P0 점검 필요. HTTP 200만으로 비밀 노출 단정 금지. 금전 변경 HTTP 호출은 수행하지 않음.

## 작업 종료 (2026-11-17 KST)
- **운영 승격 보류 / RELEASE HOLD.** 병합 전 후보, 정식 URL 기능 미전환, 전체 테스트 실패, 공식 Test 후보 SHA 미증명, P0 인증/금융/원장 결함, 로그인/OTP/백업/무중단 동등성 미검증.
- 운영/main/Nginx/systemd/기존 Next/DB/WLD 변경 및 배포 없음. 조회·증거·버전별 EN/KO 문서 기록만 실행.
- 향후 필수: G0 보안·금융 보수 및 실 DB 기반 음성 테스트, 중복 매핑 수정, G2~G6 178화면/124 API 완전 이관, 격리 Test 정확 SHA·계정 세션/OTP·금전 QA/복원·롤백 검증 후 무중단 승격.
