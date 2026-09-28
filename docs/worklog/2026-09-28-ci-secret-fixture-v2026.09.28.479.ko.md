# CI 비밀값 유사 테스트 픽스처 복구 작업로그 — v2026.09.28.479

[English canonical](2026-09-28-ci-secret-fixture-v2026.09.28.479.md) | **한국어**

- 상태: 진행 중
- 범위: backend/src/seo/seo.service.test.ts의 비밀값 유사 테스트 픽스처로 인한 CI policy 실패.
- 기준 origin/main: b6af50519fa460f26199899c441f2b4918eefe28.
- 브랜치: fix/v479-ci-secret-fixture.
- Runtime/Test/Production: 런타임 동작 변경은 계획하지 않으며 테스트 픽스처 표현만 변경할 수 있다.

## 작업 전

- PR #745 CI 근거에서 scripts/check-secrets.sh가 backend/src/seo/seo.service.test.ts의 PEM private-key delimiter를 탐지함을 확인했다.
- 소스 확인 결과 SeoService.saveGscCredentials는 client_email을 검증하고 raw JSON을 저장하며 이 테스트는 암호학적으로 유효한 private key를 요구하지 않는다.
- TDD 계획: scripts/check-secrets.sh 실패를 RED로 재현 → 비밀값 유사 테스트 값만 명시적 비밀 아님 placeholder로 교체 → scanner와 집중 SEO 테스트 재실행 → 비런타임 변경에 필요한 저장소 검증 수행.

## 검증 체크포인트

- 작업 중간 origin/main은 `b6af50519fa460f26199899c441f2b4918eefe28`로 동일했다.
- RED: `scripts/check-secrets.sh`가 SEO test fixture에서 정확히 실패했다.
- GREEN: 가짜 PEM 형태 값만 `TEST_PRIVATE_KEY_PLACEHOLDER`로 교체 후 동일 scanner PASS.
- Backend Vitest 111 test files / 1,023 tests PASS; DB 환경 의존 suite는 기존대로 skip됐다.
- 루트 `pnpm test`는 기존 mobile API 생성 계약 drift에서 중단됐다. 생성 diff 3개는 원복했고 이 fix에 포함하지 않는다.
- 상태: PR 준비 완료. 최종 통합은 GitHub CI/보호 규칙을 따른다.
