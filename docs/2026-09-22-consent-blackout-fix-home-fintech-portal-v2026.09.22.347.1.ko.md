# 릴리즈 내역서 v2026.09.22.347.1 — 이용약관 동의 화면 블랙아웃(본문 증발) 긴급 복구 및 메인 포털(/) 핀테크 전면 리빌드

- **작업 일시**: 2026-09-22 12:50:00 KST
- **적용 브랜치**: `main`
- **프로덕션 릴리스 경로**: `/srv/moneyverse-data/releases/prod-854d777-v347`
- **Exact Git SHA**: `854d777d204b66164ac5043e9bd9be3a7bee4498`
- **데이터베이스 활성 세션**: 927개 (100% 무손실 유지)

---

## 1. 긴급 결함 진단 및 원인
- **현상**: 접속 시 우측 하단에 `서비스 이용을 위해 이용약관 및 개인정보처리방침 동의가 필요합니다.` 토스트만 발생하고, 메인 홈 화면 본문이 완전히 검게 증발하는 블랙아웃 버그 발생.
- **원인**: `ConsentGuard` 컴포넌트(`consent-guard.tsx`)에서 세션의 `consentCurrent === false` 감지 시 `router.replace('/login?error=consent_required')`로 클라이언트 라우팅을 강제 중단·전환하여 메인 화면 리액트 트리가 언마운트되는 경합 발생.

---

## 2. 해결 조치 및 구현 명세
1. **토스형 원터치 인라인 이용 동의 다이얼로그 (`ConsentStepUpModal`) 신설**:
   - 강제 리다이렉트(`router.replace`) 배제, 현재 페이지 중앙 인라인 모달 마운트.
   - 필수 3종 체크([필수] 만 14세 이상 확인, [필수] 서비스 이용약관 동의, [필수] 개인정보 수집 및 이용 동의) 및 WLD 가상화폐 고지 배너 제공.
   - [모두 동의하고 머니버스 시작하기] 원클릭 시 백엔드 `PUT /api/v1/auth/consent` (세션 기반 `auth_grant_current_user_consent` RPC) 원자적 연동.
2. **`ConsentGuard` 전면 개편**:
   - `router.replace` 완전 제거, 미동의 세션 접속 시 `ConsentStepUpModal` 인라인 오버레이로 화면 블랙아웃 원천 차단.
3. **메인 홈 화면(`/`) 전면 핀테크 리빌드**:
   - `anti-ai-frontend-craftsmanship` & `fintech-responsive-layout-engine` 적용.
   - 실시간 순자산 헤어로 (`WalletGlance` 연동).
   - 2열 비대칭 핀테크 라이브 콘솔: 실시간 주식 핫 종목 3종(WDG, FNAK, CHIMU) 및 직업 업무 스테이션(진행률 바, 8대 직업 배정).
   - 4대 기둥 18개 전 도메인 서비스 디렉터리(금융&투자, 경제&활동, 플레이&시즌, 커뮤니티&공간).
   - 320px~1440px 클리핑 제로 반응형 레이아웃 완결.

---

## 3. 검증 결과
- `verify-runtime-identity.sh`: Backend & Frontend exact SHA `854d777` 100% 일치.
- 전 엔드포인트 200 OK (`/`, `/login`, `/stocks`, `/casino`, `/developer`, `/admin` 등).
- PostgreSQL 927개 세션 100% 무손실 보존.
