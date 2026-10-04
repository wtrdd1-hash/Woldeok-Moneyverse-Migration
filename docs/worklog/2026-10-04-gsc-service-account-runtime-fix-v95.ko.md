# GSC 서비스 계정 런타임 수정 — v95

**한국어 보조 문서** | [English canonical](2026-10-04-gsc-service-account-runtime-fix-v95.md)

## 작업 시작 기록
- 날짜: 2026-10-04
- 사용자 확인 증상: Google Search Console 서비스 계정 키를 등록했지만 `/admin` Search Analytics가 계속 "키 미등록 / 데모 집계 모드"로 표시됨.
- 작업 브랜치: `fix/gsc-service-account-20261004`
- 시작 `origin/main`: `12e575435dc53e7f864758f248e6acda00006070`
- 시작 브랜치 HEAD: `12e575435dc53e7f864758f248e6acda00006070`
- 런타임 기준: Debian 13, systemd + Nginx, 운영 승격 전 격리 Test 검증 필수.
- 코드 변경 전 통합 기획서, 문서 정책/카탈로그/인덱스, 현재 런타임 기준, 릴리스 가이드, 루트 구현 계획서를 재검토함.
- 조사 범위: 서비스 계정 저장/조회 경로, Search Console 자격 증명 감지, API 인증 클라이언트, 관리자 UI 상태 계약, 환경변수/시크릿 마운트, Test/Production 런타임 설정.
- 릴리스 게이트: 전용 브랜치 → 정확한 후보 테스트/빌드 → 격리 Test 백엔드/변경 플로우 검증 → 최신 `origin/main` 재확인/통합 → 동일 후보 무중단 운영 승격.
- 시크릿 원칙: 서비스 계정 private key 원문은 저장소, 문서, 로그, Git 이력에 절대 기록하지 않음.

## 작업 중간 기록
- 작업 중간 `origin/main` 재확인: `12e575435dc53e7f864758f248e6acda00006070` (작업 시작 시점과 동일). 통합 기획서 버전도 `v2026.10.04.523` 유지.
- 코드 및 운영 런타임에서 원인 확정:
  1. Next `POST /api/seo/gsc`가 입력 JSON을 로컬에서 파싱한 뒤 성공 응답만 반환하고 백엔드에는 전달하지 않았음.
  2. 백엔드는 키를 받아도 프로세스 메모리에만 저장하여 재시작 시 유실되는 구조였음.
  3. `getGscAnalytics()`는 Google API를 호출하지 않고 고정 패턴 데모 수치를 생성했음. 운영 백엔드가 `hasCredentials=false`이면서 클릭 4,671 / 노출 70,600 / CTR 6.62% / 평균순위 7.1을 반환했고 사용자 화면과 정확히 일치함.
  4. 운영/Test 환경 모두 `GSC_SERVICE_ACCOUNT_KEY`가 설정되어 있지 않아 사용자가 전에 붙여넣은 키는 현재 런타임에서 복구할 수 없음.
- 수정 진행: Google 서비스 계정 JWT OAuth 실연동, 공식 Search Console Search Analytics 호출, PostgreSQL 암호화 영속 저장(마이그레이션 247), 관리자 세션/CSRF 보호, 모든 가짜 GSC 수치 제거, 연동 실패 원인 UI 표시.
- Google 공식 규격도 중간 재검증함: 서비스 계정 JWT는 RS256 + `https://oauth2.googleapis.com/token`, Search Analytics는 `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query` 및 `webmasters.readonly` 범위를 사용.


## 작업 종료 기록
대기.
