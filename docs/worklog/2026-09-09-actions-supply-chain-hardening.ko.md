# 2026-09-09 — GitHub Actions 공급망 보안 강화

## 발견 사항

심각도: **중간(Medium)**.

CI 워크플로가 `actions/checkout@v7`, `pnpm/action-setup@v6`, `actions/setup-node@v7`처럼 변경 가능한 메이저 버전 태그를 사용하고 있었고, 워크플로 수준의 `GITHUB_TOKEN` 권한도 명시적으로 최소화하지 않았다. GitHub 보안 가이드는 외부 Actions를 전체 커밋 SHA로 고정하고 필요한 최소 토큰 권한만 명시할 것을 권장한다.

이는 애플리케이션 런타임 취약점이 아니라 CI/CD 공급망 위험이다. 태그가 이동되거나 액션 저장소가 침해될 경우 CI에서 실행되는 코드가 바뀔 수 있다. 현재 CI 작업에는 저장소 읽기 권한만 필요하다.

## 결정

현재 검토된 상위 메이저 릴리스는 유지하되, 해당 태그가 가리키는 정확한 커밋 SHA로 고정하고 워크플로 기본 권한을 `contents: read`로 제한한다. 각 SHA 옆에는 사람이 확인하기 쉽도록 원래 메이저 버전을 주석으로 남긴다.

이번 변경은 제품 Living Spec이나 런타임 아키텍처를 변경하지 않으며, 기존 CI/CD 최소권한 및 공급망 보안 요구사항을 더 엄격하게 구현하는 것이다.

## 변경 내용

- `.github/workflows/ci.yml`
  - 워크플로 수준 `permissions: contents: read` 추가
  - `actions/checkout` v7 → `3d3c42e5aac5ba805825da76410c181273ba90b1`
  - `pnpm/action-setup` v6 → 검증된 커밋 `0977fd99725f1db4007ccb2928dbb4e90d06cc86`
  - `actions/setup-node` v7 → `820762786026740c76f36085b0efc47a31fe5020`

## 검증

- 수정 전 각 GitHub 공식 저장소에서 태그 대상 커밋을 직접 확인했다.
- 이 브랜치를 만들기 전 `main`의 `567dbaab0b4a609986c2cf343530ac1b81398c4f` CI가 성공한 것을 확인했다.
- 이번 워크플로 전용 변경의 사전 운영 검증 게이트는 브랜치 CI다. 현재 Moneyverse 전용 테스트 서버는 존재하지 않으므로 테스트 서버 통과로 기록하지 않는다.
- DB 마이그레이션, 운영 데이터 변경, 시크릿 변경, Kubernetes 워크로드 변경은 포함하지 않는다.

## 운영 / 롤백

CI 전용 변경이므로 운영 서비스 배포는 필요하지 않다. 고정한 액션 리비전에서 예상치 못한 문제가 발생하면 일반적인 Git revert로 되돌릴 수 있다.

## 남은 작업

- 브랜치 CI가 성공한 뒤 같은 보안 강화 흐름에서 `deploy.yml`의 이미지 빌드 Actions(`docker/setup-buildx-action`, `docker/login-action`, `docker/build-push-action`)도 전체 SHA 고정 적용을 검토한다.
- GitHub App이 관리자 수준 정보를 제공할 수 있는 범위에서 Actions 정책과 branch/ruleset 강제 상태를 추가 검토한다.
