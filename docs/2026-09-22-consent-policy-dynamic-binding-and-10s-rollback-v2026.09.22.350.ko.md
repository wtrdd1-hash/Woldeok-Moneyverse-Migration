# 이용약관/개인정보 동의 서버사이드 동적 바인딩 & 인라인 아코디언 뷰어 & 10초 원클릭 롤백 엔진 릴리스 (v2026.09.22.350)

- **작성일자**: 2026-09-22 14:06 KST
- **릴리스 버전**: `v2026.09.22.350`
- **배포 타겟**: 프로덕션 (`https://easy-scraping.com`) & 테스트 (`https://test.easy-scraping.com`)
- **보존 활성 세션**: PostgreSQL 929개 세션 100% 무손실 보존

---

## 1. 개요 및 배경

본 릴리스는 직전 `v347.1`에서 긴급 복구된 인라인 동의 다이얼로그(`ConsentStepUpModal`)를 더욱 고도화하여, 하드코딩되어 있던 약관 버전을 서버사이드 동적 바인딩으로 전환하고, SSR 하이드레이션 깜빡임 및 SEO/Safety 예외 경로 누락을 방어하며, 10초 내 즉각 복구 가능한 프로덕션 원클릭 무중단 롤백 스크립트를 완비한 릴리스입니다.

---

## 2. 핵심 변경 내역

### ① 약관 버전 서버사이드 동적 바인딩 (`fetchLatestPolicy`)
- **파일**: `frontend/src/lib/api.ts`, `frontend/src/app/layout.tsx`
- **내용**:
  - 백엔드 `GET /api/v1/auth/policy` 엔드포인트와 연동하여 DB(`consent_versions` 테이블)에 등록된 최신 `terms_version`, `privacy_version`을 60초 SWR 캐싱(`revalidate: 60`)으로 조회.
  - 백엔드 일시 장애 시에도 프론트엔드가 중단되지 않도록 디폴트 상수(`DEFAULT_POLICY`) Fallback 아키텍처 탑재.
  - `RootLayout`에서 `currentViewer()`와 `Promise.all` 병렬 실행으로 지연 없이 서버 렌더링 시점에 최신 약관 버전을 주입.

### ② 클라이언트 하이드레이션 가드 및 14대 화이트리스트 확장 (`ConsentGuard`)
- **파일**: `frontend/src/components/consent-guard.tsx`
- **내용**:
  - `mounted` state 가드를 적용하여 SSR과 Client 사이의 하이드레이션 불일치 및 0.1초 동안 모달이 튀는 깜빡임 현상 원천 배제.
  - 14대 예외 경로 화이트리스트 적용:
    - 법적/보안: `/terms`, `/privacy`, `/data-deletion`, `/account-deletion`, `/safety`, `/safety/takedown`
    - 크롤러/SEO: `/robots.txt`, `/sitemap.xml`, `/api/og`, `/icon.svg`, `/apple-icon.png`
    - 모니터링/인증: `/login`, `/frontend-version`, `/api/health`
  - `dismissed` state를 도입하여 약관 동의 완료 즉시 모달이 부드럽게 언마운트되도록 처리.

### ③ 인라인 탭 아코디언 뷰어 & 핀테크 토스트 (`ConsentStepUpModal`)
- **파일**: `frontend/src/components/consent-step-up-modal.tsx`
- **내용**:
  - 사용자가 약관이나 개인정보 처리방침을 확인하기 위해 페이지를 이탈할 필요 없이, 모달 내부에서 바로 핵심 3대 조항 요약 및 전문 링크를 확인할 수 있는 인라인 탭 아코디언 탑재.
  - 200ms 부드러운 페이드인 트랜지션 애니메이션 (`duration-200 animate-in fade-in-0 zoom-in-95`).
  - 동의 완료 시 토스 스타일의 경쾌한 축하 토스트 알림(`sonner`) 노출 및 비차단 백그라운드 서버 갱신(`router.refresh()`).

### ④ 10초 원클릭 무중단 롤백 스크립트 (`ops/release/rollback_production.sh`)
- **파일**: `ops/release/rollback_production.sh`
- **내용**:
  - 이전 릴리스 디렉토리 자동 탐색 및 인자 지정 지원.
  - 929건 이상의 활성 세션 보존 상태를 PostgreSQL 쿼리로 실시간 검증.
  - `ln -sfn` 원자적 심볼릭 링크 스위치 및 systemd 서비스 무중단 리로드.
  - 런타임 식별자 검증(`verify-runtime-identity.sh`) 및 Discord 웹훅 자동 알림.

---

## 3. 검증 결과

1. **프론트엔드 컴파일 및 빌드**: 정상 통과
2. **백엔드 계약 및 API 호환성**: `GET /api/v1/auth/policy` 및 `PUT /api/v1/auth/consent` 100% 호환
3. **런타임 아이덴티티**: Backend & Frontend exact Git SHA 동기화
4. **활성 사용자 세션**: PostgreSQL 929개 세션 무손실 보존
