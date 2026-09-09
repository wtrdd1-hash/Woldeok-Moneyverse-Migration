# 시간당 개발 — staging 복구 및 후보 이미지 게이트

날짜: 2026-09-09

## 선택한 개선

필수 격리 staging 경로를 복구하고 exact-SHA 후보 이미지 workflow를 추가해 이후 runtime 변경을 `main`/Production 승격 전에 실제로 검증할 수 있게 합니다.

## 인프라 차단 문제 복구

이전 `wdmv-test` bootstrap은 helper image별 shell/network utility 차이 때문에 실패했습니다. 인프라 저장소 PR #19에서 Pod ServiceAccount credential을 사용해 Kubernetes API를 Python 표준 라이브러리 HTTPS/JSON으로 호출하도록 교체했습니다. non-root/read-only 실행과 `wdmvp/ghcr-pull` 하나만 읽는 namespace 간 최소권한 RBAC는 유지했습니다.

Infrastructure GitOps validation이 통과했고 PR #19는 `2ad8cc807ddb86ae4460b610b201dfc754c3bd96`로 병합됐습니다. 격리 staging bootstrap만 변경하며 Production 애플리케이션/DB/image/PVC 자원은 변경하지 않았습니다.

## 애플리케이션 저장소 개선

당시 최신 `main`에서 만든 새 브랜치에 `.github/workflows/test-candidate.yml`을 추가했습니다.

- 이미지 push 전 재사용 전체 CI 게이트 실행
- CI 성공 후에만 `<sha>-test` backend/frontend 불변 이미지 생성
- checkout/buildx/login/build-push Action을 immutable commit SHA로 고정
- SBOM/provenance 생성
- staging frontend의 검색 색인과 광고 비활성화
- staging/Production cluster를 workflow가 직접 수정하지 않음

영문 배포 지침을 먼저 수정한 뒤 한국어 parity 문서를 동기화해 격리 staging 계약과 exact-SHA 승격 순서를 복원했습니다.

## 검증 상태

- Infrastructure `Validate GitOps`: bootstrap repair branch에서 PASS 후 병합
- Application candidate SHA `660280b390c812825b77b2ef8d4ca06402bff4c2`: Secret/control-byte guard, lint, typecheck, production build, PostgreSQL migration, 테스트, Prisma mutation guard, Production dependency audit를 포함한 재사용 CI 전체 PASS
- 같은 candidate workflow에서 backend/frontend `<sha>-test` 불변 이미지와 SBOM/provenance 생성 및 push 성공
- upstream `main`이 이동하지 않은 것을 확인한 뒤 Application PR #145를 `c7496ab65d4b012d7b51aa34d5857f596bcd1f3a`로 `main`에 병합
- 정확한 main SHA `c7496ab65d4b012d7b51aa34d5857f596bcd1f3a`의 병합 후 CI: PASS
- 복구된 staging bootstrap의 실제 cluster 검증은 여전히 필요합니다. 이번 실행 중 승인된 원격 미니PC가 연결되지 않아 running-image parity, Pod health, 실제 staging migration/user flow/direct-play QA, Flux runtime 상태, Production runtime 승격 성공을 주장하지 않습니다.

## Production 상태

이번 애플리케이션 변경은 CI/배포 도구만 변경하므로 Production runtime 배포가 필요하지 않았습니다. Production application image reference, database resource, PVC, 데이터는 변경하지 않았습니다.

## 최종 상태

Release engineering 기능은 애플리케이션 `main`에 통합됐고 staging bootstrap 복구는 infrastructure `main`에 통합됐습니다. 남은 검증은 독립 reconciliation되는 `wdmv-test`가 복구된 bootstrap으로 실제 정상화되는지 cluster에서 직접 확인하는 것입니다. 이후 runtime 후보는 여전히 이 실제 staging 게이트를 통과한 경우에만 Production으로 승격해야 합니다.
