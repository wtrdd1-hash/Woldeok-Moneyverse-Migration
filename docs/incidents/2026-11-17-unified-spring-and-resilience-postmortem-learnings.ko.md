# 머니버스 통합 엔지니어링 포스트모템 및 작업 실수 분석·재발 방지 학습서

- **발행일자**: 2026년 11월 17일
- **대상 시스템**: Woldeok Moneyverse Production (Next.js 15 Frontend + Spring Boot 3.3 Single Engine)
- **작성 목적**: 시스템 전환 및 고도화 작업 중 발생한 기술적 실수, 설정 오류, 라우팅 결함의 근본 원인을 투명하게 분석하고, 향후 동일/유사 작업 시 실수를 원천 차단하기 위한 학습 가이드라인 수립.

---

## 1. 개요 및 실수 요약 매트릭스

| 번호 | 영역 | 발생 현상 | 근본 원인 | 해결 조치 | 재발 방지 규칙 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | **UI/UX 표기** | 프론트엔드 상단에 "스프링 부트 엔진 가동 중" 녹색 배너 노출 | 내부 기술 스택 홍보성 배너 컴포넌트 하드코딩 잔존 | `site-shell.tsx`에서 배너 컴포넌트 호출 제거 및 번들 무효화 (`return null;`) | 사용자 화면에 내부 백엔드 기술 스택(Spring, Java 등) 표기 일체 금지 원칙 |
| **#2** | **Nginx 라우팅** | `/admin/blog` 접속 시 "Spring Boot 3.3 단일 엔진 구동 중" 빈 화면 출력 | Nginx 1410행 블록에서 관리자 UI 라우트를 백엔드(4550)로 잘못 `proxy_pass` | `proxy_pass http://prod_frontend;`로 수정 및 리로드 | `location` 분기 시 UI 라우트와 API 라우트(`^~ /api/`) 엄격 분리 검증 |
| **#3** | **감사 로그/원장** | 원장 시퀀스 역전 및 로그 목록 누락 | SQL 쿼리 시 `ORDER BY sequence DESC`에서 문자열 타입 사전식 정렬 발생 (예: 9 > 100) | `ORDER BY CAST(sequence AS BIGINT) DESC` 및 엔티티 타입 정규화 | 시퀀스/ID 정렬 시 반드시 숫자/BigInt 타입 캐스팅 강제 |
| **#4** | **로그 수집 파이프라인** | `/admin/logs/system`의 "화면 로드 실패 전수 로그" 클릭 시 빈 로그 반환 | Spring Boot `SystemLogSource.java`가 존재하지 않는 저널 명령어를 바라봄 | `/var/log/moneyverse/frontend-errors.log` 실시간 파일 스트림 파이프라인 직결 | 시스템 로그 소스는 반드시 단일 진실 원천(SSOT) 로그 파일 경로와 일대일 매핑 |
| **#5** | **클라이언트 복원력** | 화면 로드 실패 시 흰 화면 멈춤 및 새로고침 시 세션 초기화 우려 | 전역 ErrorBoundary 부재 및 로컬 스토리지/쿠키 인증 토큰 보존 미흡 | `error.tsx`, `global-error.tsx` 구현, 3초 자동 홈 복구, 에러 텔레메트리 직결 | 모든 화면 예외는 텔레메트리 서버 기록 + 자동 홈 복구 + 세션 토큰 불변 유지 보장 |

---

## 2. 세부 실수 분석 및 근본 원인 (Root Cause Analysis)

### 실수 1: 프론트엔드 최상단 스프링 마이그레이션 배너 노출
- **발생 경위**: 백엔드를 Node.js에서 Spring Boot로 마이그레이션하는 과정에서, 작업 상태를 시각적으로 확인하기 위해 상단 배너 컴포넌트(`spring-migration-banner.tsx`)를 `site-shell.tsx`에 삽입함. 사용자가 "스프링 쓴다고 프론트에 띄우지 말라"고 명시했음에도 불구하고 프로덕션 빌드에 잔존함.
- **근본 원인**: 디버깅/작업 확인용 UI 요소를 영구적인 레이아웃 셸에 마운트한 뒤 배포 전 롤백 검증을 누락함.
- **교훈 및 규칙**:
  - 사용자 대면(Client-facing) 화면에는 어떠한 경우에도 백엔드 프레임워크나 엔진 명칭(Spring Boot, JDK, Virtual Threads 등)을 노출하지 않는다.
  - 배포 전 최종 검증 단계에서 `curl` 응답 본문에 기술 스택 키워드가 포함되어 있는지 Grep 검사를 자동화한다.

### 실수 2: Nginx UI 라우트 프록시 오설정으로 인한 백색 더미 화면
- **발생 경위**: `/admin/blog` 및 `/blog` 접속 시 토스 스타일의 리액트 관리자 UI 대신 하얀 바탕에 "월덕 머니버스 Spring Boot 3.3 단일 엔진 구동 중" 텍스트만 표시됨.
- **근본 원인**: Nginx 설정(`/etc/nginx/sites-enabled/moneyverse`)의 1410~1415 라인에서 `location ^~ /admin/blog/`의 `proxy_pass`가 백엔드 포트(`http://127.0.0.1:4550`)로 설정되어 있었음. Spring Boot의 `SpaWebMvcConfig`는 해당 경로를 SPA Fallback으로 인식하여 내장된 기본 `index.html`을 반환함.
- **교훈 및 규칙**:
  - 관리자 및 사용자 화면(UI) 라우트는 예외 없이 프론트엔드 포트(`http://prod_frontend;` - 4501)로 라우팅되어야 한다.
  - 백엔드로 라우팅되는 경로는 반드시 `/api/` 접두사로 시작해야 하며, Nginx 설정 변경 시 `location /admin/` 하위 전수 경로의 `proxy_pass` 대상을 사전 감사한다.

### 실수 3: 감사 로그/원장 시퀀스 정렬 및 로그 열람 시스템 오류
- **발생 경위**: 관리자 콘솔 시스템 로그 탭에서 "화면 로드 실패 전수 로그"를 선택했을 때 로그가 수집되지 않고 "EMPTY" 상태가 지속됨.
- **근본 원인**:
  - 프론트엔드 에러를 수집하는 백엔드 전용 텔레메트리 엔드포인트와 저장 파일이 부재했음.
  - 백엔드 `SystemLogSource.java`에서 `FRONTEND_ERRORS` enum의 소스 타입이 `JOURNAL`로 잘못 지정되어 `/var/log/moneyverse/frontend-errors.log` 파일 대신 비어있는 systemd 저널을 읽음.
- **교훈 및 규칙**:
  - 로그 탭을 신설할 때는 [1. 클라이언트 에러 바운더리 리포터] -> [2. 텔레메트리 수집 API] -> [3. 로그 파일 영구 기록] -> [4. Spring Boot 로그 열람 API] -> [5. 관리자 UI 테이블]의 5단계 파이프라인 전체를 한 번에 구축하고 실측 호출로 검증한다.

---

## 3. 화면 로드 복구 및 세션 유지 설계 명세

### 3.1 화면 로드 실패 자동 복구 파이프라인
1. React 렌더링 중 에러 발생 시 `src/app/error.tsx` 또는 `src/app/global-error.tsx` 진입.
2. 클라이언트 에러 정보(경로, 에러명, 메시지, 스택, 브라우저 환경)를 `/api/v1/telemetry/client-error`로 즉시 비동기 전송.
3. Next.js 서버리스 API 라우트가 `/var/log/moneyverse/frontend-errors.log`에 원자적 Append 기록.
4. 사용자 화면에는 친절한 토스 스타일 복구 모달이 표시되며, 3초 카운트다운 후 안전하게 홈(`/`)으로 자동 라우팅.
5. 로컬스토리지 및 세션스토리지의 인증 토큰(`mv_auth_token`, `wldk_session`)은 에러 상황에서도 절대 삭제되지 않고 100% 보존.

---

## 4. 향후 작업자 필독 체크리스트 (Verification Checklist)

- [ ] **UI 배너 검증**: 프론트엔드 화면 상단에 개발/기술 배너가 전혀 없는가?
- [ ] **Nginx 라우팅 검증**: 모든 `/admin/*` 화면이 프론트엔드(`prod_frontend`)로 연결되어 정상 React 화면을 반환하는가?
- [ ] **에러 수집 검증**: 강제 에러 발생 시 `/var/log/moneyverse/frontend-errors.log`에 즉시 기록되는가?
- [ ] **관리자 로그 검증**: `/api/v1/admin/logs/system?source=FRONTEND_ERRORS` 호출 시 에러 로그가 정상 반환되는가?
- [ ] **세션 보존 검증**: 페이지 에러 발생 및 새로고침 후에도 로그인 세션이 유지되는가?
