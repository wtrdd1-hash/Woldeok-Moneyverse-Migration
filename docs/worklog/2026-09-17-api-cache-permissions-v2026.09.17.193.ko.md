# 내부 작업 기록 — v2026.09.17.193 API 캐시 런타임 권한

- 날짜: 2026-09-17
- 브랜치: `fix/frontend-api-cache-permissions-v2026.09.17.193`
- 정확한 기준: `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`
- 범위: Production Next.js 서버 캐시 쓰기 권한과 API 기반 화면 최신성. backend/DB 변경 없음.

## 재현

- Production backend `/health`는 HTTP 200이고 공개 Next BFF endpoint도 정상 JSON을 반환한다.
- 공개 `/api/v1/*`를 NestJS로 직접 라우팅하지 않는 것은 의도된 경계이며 문서화된 예외만 공개한다.
- Production frontend 로그에서 `.next/cache/fetch-cache` 갱신 중 `EACCES`가 반복된다.
- Production `.next/cache`는 `root:root`인데 `moneyverse-frontend.service`는 `debian` 사용자로 실행된다.
- Test `.next/cache`는 이미 `debian:debian`이고 같은 오류가 없다.

## 수정 계약

- immutable application tree 전체가 아니라 `.next/cache`만 runtime 사용자 소유로 맞추는 host-mirror helper를 추가한다.
- 설정된 release root 밖의 경로는 거부한다.
- 릴리스 준비 완료 전에 실제 runtime 사용자로 쓰기 검증을 수행한다.
- Test에서 먼저 실행·검증한 뒤 backend 재시작/DB 변경 없이 Production에 적용한다.
- EN/KO 배포 절차와 release/update 증거를 함께 기록한다.

## Test 증거

- helper 회귀 테스트: PASS. release root 밖 경로 거부까지 확인.
- Test cache 준비: PASS. `.next/cache`와 `fetch-cache`는 `debian:debian` 유지.
- Test backend 직접 `/health`: HTTP 200. 공개 Test `/health`, `/api/viewer`: HTTP 200.
- 재검증 요청 후 Test `/status`, `/announcements`, `/shop`: HTTP 200.
- 검증 구간에 새 Test frontend `EACCES`/prerender-cache 오류와 새 Test backend 치명/DB 오류 없음.
- 작업 중간 재확인에서 `main`이 `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`로 전진했고 v194가 v193을 이 병렬 frontend API/cache 작업에 예약한다고 명시했다. 따라서 commit 전 최신 main 위로 다시 맞췄다.
