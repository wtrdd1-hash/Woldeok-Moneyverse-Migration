# v2026.09.14.91 — 웹 자체 계정 로그인 작업 내역

## 작업 범위

기존 자체 이메일/비밀번호 인증 기능을 별도 인증/세션 체계를 만들지 않고 공개 웹 로그인 화면에서 사용할 수 있게 한다.

## 작업 순서별 버전

- `v2026.09.14.91.1` — 작업 전 점검: 현재 로그인 UI, 자체 인증 컨트롤러, 인증/보안 기획서, 쿠키 릴레이, 내부 API 경계, 승격 워크플로를 확인했다.
- `v2026.09.14.91.2` — 인증 액션: 로그인 전 세션 생성/재사용, CSRF 전달, 자체 계정 자격 증명 로그인, API 발급 쿠키 릴레이를 Next.js 서버 액션에 추가했다.
- `v2026.09.14.91.3` — 로그인 UX: 이메일/비밀번호 입력, 자체 로그인 버튼, 일반화된 자격 증명 오류를 추가하고 Discord/Google 로그인은 유지했다.
- `v2026.09.14.91.4` — 작업 중간 기획 재확인 및 문서화: 자체 이메일/비밀번호가 기존 인증 코어와 서버 관리 세션을 재사용해야 한다는 인증 우선순위 명세를 다시 확인했다. 영문/한국어 변경내역과 PR 정보를 추가했다.
- `v2026.09.14.91.5` — 배포 게이트: 정확한 브랜치 HEAD의 CI / Build Test Candidate 성공 후에만 `main` 통합 가능하며, 통합 뒤에는 기존 격리 Test exact-SHA 및 Production GitOps 게이트를 그대로 적용한다.

## 변경 파일

- `frontend/src/app/login/actions.ts`
- `frontend/src/app/login/login-providers-view.tsx`
- `frontend/src/app/login/page.tsx`
- `docs/changelog/2026-09-14-web-local-login-v2026.09.14.91.md`
- `docs/changelog/2026-09-14-web-local-login-v2026.09.14.91.ko.md`

## 보안 / 호환성 확인

- 새로운 클라이언트측 API 자격 증명 또는 토큰 저장을 추가하지 않았다.
- 브라우저에는 계속 `INTERNAL_API_TOKEN`을 전달하지 않는다.
- 존재하지 않는 이메일과 잘못된 비밀번호는 하나의 일반 자격 증명 오류로 표시한다.
- 기존 자체 인증 백엔드, 서버측 세션 회전, CSRF 검사, 쿠키 정책, Argon2id 검증, rate limit을 그대로 재사용한다.
- OAuth 제공자 흐름은 변경하지 않았다.

## 개발 환경 메모

배포 전 지정된 원격 개발 장비 연결 상태를 확인했으나 당시 Remote Desktop Commander에 등록된 장비가 모두 오프라인이었다. 따라서 지정 미니PC 환경에서의 직접 대화형 검증은 수행할 수 없으며, 게이트를 우회하지 않고 저장소 CI/Test 승격 체인을 실행 가능한 배포 기준으로 사용한다.

## 브랜치 / PR

- 브랜치: `feat/web-local-login-v2026.09.14.91`
- PR: `#309`
- 승격 규칙: exact-head 후보 성공 -> `main` 통합 -> main 후보 -> 격리 Test exact-SHA/백엔드 검사 -> Production GitOps 승격.
