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
