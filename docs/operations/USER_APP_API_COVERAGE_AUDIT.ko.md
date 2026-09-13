# 사용자 앱 API 범위 감사

> 버전: v2026.09.13.43
> 날짜: 2026-09-13
> 상태: 구현 감사
> 영어 원문: [USER_APP_API_COVERAGE_AUDIT.md](USER_APP_API_COVERAGE_AUDIT.md)

## 결론

일반 사용자 기능은 구현 시 `모바일 앱 -> /app-api/v1/* BFF -> NestJS /api/v1/* -> PostgreSQL` 구조로 앱에서도 사용할 수 있어야 한다.

현재 구현된 일반 사용자 기능은 **대부분 앱 API로 연결되어 있으며 갤러리 이미지 업로드도 포함된다.** 다만 장기 기획 전체가 API 100% 완료된 상태는 아니다.

## 현재 확인된 API 그룹

`account`, `activity`, `auth`, `bank`, `banking`, `board`, `businesses`, `casino`, `content`, `early-game`, `engagement`, `media`, `photos`, `privacy`, `profile`, `progression`, `rewards`, `seasons`, `shop`, `stocks`, `wallet`, `work`

BFF는 `GET`, `POST`, `PUT`, `PATCH`, `DELETE`와 세션 쿠키, CSRF, Content-Type, 바이너리 요청 본문을 전달한다.

현재 API화 확인 범위는 인증/계정, 계정 보안 세션 관리, 프로필, 지갑/송금/보상, 직업/진행도/초기게임, 은행, 상점, 주식, 사업, 시즌, 카지노, 게시판/이미지, 공지/상태/갤러리, 활동 기록, 현재 구현된 개인정보 요청 기능이다.

### 갤러리 업로드

갤러리 업로드 API는 존재한다.

1. `POST /app-api/v1/photos/uploads` 이미지 바이트 업로드
2. `storageKey` 수신
3. `POST /app-api/v1/photos` 갤러리 심사 등록

따라서 앱에서도 갤러리 이미지 업로드가 가능하도록 API 경로가 준비되어 있다.

## 아직 미완성/계획인 사용자 API

다음은 현재 API 100% 완료로 계산하지 않는다.

1. **비밀번호 찾기/재설정/변경, 로그인 이메일 변경** — 인증 보안 기획에는 있으나 전체 수명주기 API는 아직 미완성이다.
2. **통합 알림 센터/푸시 설정** — 모바일 기획에는 있으나 일반 사용자용 완성된 전용 알림 API는 확인되지 않았다.
3. **전역 검색** — 기획상 조건부 기능이며 통합 전역 검색 API는 현재 확인되지 않았다.
4. **일반 사용자 MFA/패스키(WebAuthn)** — 향후 인증 확장 기능이다.

단일 홈 `/dashboard` 집계 API가 없는 것은 누락으로 보지 않는다. 기존 기능 API를 병렬 호출해 홈을 구성할 수 있다.

## 의도적 제외

`/api/v1/admin/*`, `/api/v1/integrations/discord/*`, `/health`, scheduler/worker 내부 기능, DB 직접 접근은 일반 사용자 앱 API에서 제외한다. 이는 보안 경계다.

## v2026.09.13.43 적용 기준

- 새 일반 사용자 기능은 같은 작업에서 `/app-api/v1/*` 계약을 만든다.
- 모바일 기능은 웹 전용 Server Action만 있으면 완료로 보지 않는다.
- 새 사용자 백엔드 루트는 앱 게이트웨이 허용 목록에 추가하거나 기존 그룹 아래 앱용 별칭을 제공한다.
- 이미지/파일 기능은 BFF를 통한 바이너리 업로드까지 검증한다.
- API 문서와 모바일 UI API 바인딩 문서를 구현과 함께 갱신한다.
- 미완성 기능은 `planned`/`partial`로 기록하고 완료로 표시하지 않는다.

## 최종 상태

- 현재 구현 일반 사용자 기능: **API 범위 대부분 완료**
- 향후 기획 기능: **API 100% 완료 아님**
- 필수 정책: **모든 일반 사용자 기능은 구현 시 앱 API로 접근 가능해야 함**

이번 버전은 문서 감사만 수행했으며 런타임 코드, DB, 배포 설정은 변경하지 않았다.
