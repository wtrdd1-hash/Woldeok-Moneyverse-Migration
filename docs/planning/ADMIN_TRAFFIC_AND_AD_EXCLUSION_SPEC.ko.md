# 관리자 계정·IP 트래픽 및 광고 통계 제외 사양서 (Admin Traffic & Ad Exclusion Spec)

## 1. 개요 및 목적
- **요구사항**: "관리자 계정 트래픽은 제외하고 통계 내줘. 광고도 그렇고 접속도 그렇고 관리자 계정 접속 IP는 통계에서 제외할 것"
- **목적**:
  1. 관리자(슈퍼어드민 및 운영자) 계정 및 관리자가 접속한 IP에서 유입되는 트래픽(페이지뷰, 클릭, 체류시간, 세션 등)을 일반 유저 텔레메트리/통계 지표(HAU, DAU, WAU, MAU, 코호트 등)에서 완전 격리하여 **순수 일반 유저 데이터의 신뢰성 및 정확성 확보**.
  2. Google AdSense 광고 정책을 준수하고 관리자 본인의 페이지 뷰/클릭으로 인한 통계 왜곡 및 부정 트래픽 리스크를 방지하기 위해 **관리자 계정 접속 시 모든 광고 렌더링 및 AdSense 스크립트 실행 완전 차단**.
  3. 백엔드 및 데이터베이스 레벨(`packages/database/migrations/248-exclude-admin-traffic-and-ips.sql`)에서 관리자 계정 및 관리자 접속 IP를 필터링하는 쿼리 격리 구축.

---

## 2. 3계층 아키텍처 및 세부 변경점

### 1) 광고(AdSense & Sponsor Rails) 관리자 배제 레이어
- **`frontend/src/components/adsense-ad.tsx`**:
  - `useViewer()` 훅 및 `isAdministrator(viewer)` 유틸리티를 바인딩하여, 관리자 계정(`admin`, `superadmin`) 세션인 경우 `useEffect` 내의 `(window.adsbygoogle).push({})` 스크립트 실행을 즉시 중단하고 JSX에서 `null`을 반환.
  - 이를 통해 모든 AdSense 슬롯(홈페이지, 본문 인아티클, 멀티플렉스)에서 관리자 대상 광고 노출 및 트래픽 로드가 원천 차단됨.
- **`frontend/src/components/desktop-sticky-ad-rails.tsx`**:
  - 관리자 접속 시 160x600 좌/우측 데스크톱 스티키 스폰서 레일 렌더링 완전 숨김 처리(`null`).

### 2) 사용자 활동 트래커 (`ActivityTracker`) & 이벤트 수집 API 레이어
- **`frontend/src/components/activity-tracker.tsx`**:
  - 관리자 세션 감지 시(`isAdmin = true`), 인메모리 큐 비우기 및 로컬 스토리지 재시도 큐(`mv_activity_retry_v1`)를 즉시 삭제.
  - 라우트 변경(`page_view`), 버튼 클릭(`button_click`), 페이지 언로드/체류시간(`page_dwell`) 리스너에서 관리자 활동 기록을 조기 리턴하여 일반 유저 활동 로그(`user_activity_logs`)로의 저장을 원천 차단.
- **`frontend/src/app/api/activity/events/route.ts`**:
  - 서버 사이드 라우트 핸들러에서 `viewerOrUnknown()`을 조회하여 관리자 세션 쿠키가 포함된 경우 백엔드로 이벤트를 전달하지 않고 `{ recorded: 0, excluded: true }`로 즉시 스킵.

### 3) 백엔드 및 데이터베이스 통계 쿼리 레이어
- **`packages/database/migrations/248-exclude-admin-traffic-and-ips.sql`**:
  - `admin_activity_traffic_dashboard` 함수 고도화:
    - `public.user_roles`에 등록된 관리자 계정 `user_id`를 집계에서 제외.
    - `public.audit_logs.client_ip`에 기록된 관리자 콘솔 및 보안 인증 사용 IP(`client_ip`)를 `page_views` 집계에서 완전 제외.
    - 제외된 관리자 계정 수와 관리자 IP 수를 `excludedAdminStats` 메타데이터로 함께 반환.
- **`backend/src/admin/admin.repository.ts`**:
  - `AdminUserRow` 및 `users()` 메서드에서 `public.user_roles` 및 `activity_user_access_summaries`를 병렬 참조하여 각 사용자 행에 `is_admin: boolean` 플래그를 정식 매핑하여 프론트엔드로 전달.

### 4) 관리자 관제탑 및 분석실 시각화 레이어
- **`frontend/src/app/admin/components/admin-comprehensive-telemetry-matrix.tsx`**:
  - `excludeAdmin` 상태(기본값: `true`) 및 `effectiveUsers` 필터링 파이프라인 탑재.
  - HAU, DAU, WAU, MAU, 신규 유저수, 활동 고착도, 가상 통화량(M0/M1/M2), 5분위 자산 계층 분배율 전 지표에서 관리자 계정 자동 제외.
  - 상단 헤더에 `[관리자 트래픽 제외됨 (N명)]` 토글 버튼을 제공하여 클릭 한 번으로 포함/제외 전환 가능.
- **`frontend/src/app/admin/analytics/analytics-client-view.tsx`**:
  - 4대 60fps 차트(코호트 바 차트, M0/M1/M2 도넛 차트, 5분위 자산 분배율 차트)에 관리자 제외 필터 동시 적용.
  - CSV 리포트 내보내기 시 `Admin Traffic Excluded: YES`, `Excluded Admin Accounts Count: N` 메타데이터 및 청정 유저 수치 기록.

---

## 3. 검증 결과
- **단위 테스트**:
  - `src/components/adsense-ad.test.tsx`: 2 tests 100% Pass.
  - `src/app/admin/components/admin-comprehensive-telemetry-matrix.test.tsx`: 5 tests 100% Pass.
  - `src/app/admin/analytics/analytics-client-view.test.tsx`: 3 tests 100% Pass.
  - `src/app/admin/components/admin-telemetry-metrics-table.test.tsx`: 1 test 100% Pass.
- **정적 타입 검사**:
  - `npm --prefix frontend run typecheck`: exit code 0 (`tsc --noEmit` 에러 0건).
  - `npm --prefix backend run typecheck`: exit code 0 (`tsc -p tsconfig.json --noEmit` 에러 0건).
