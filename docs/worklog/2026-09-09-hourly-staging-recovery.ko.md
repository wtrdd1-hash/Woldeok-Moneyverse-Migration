# 시간당 개발 — staging 복구 및 후보 이미지 게이트

날짜: 2026-09-09

## 선택한 개선

필수 격리 staging 경로를 복구하고 exact-SHA 후보 이미지 workflow를 추가해 이후 runtime 변경을 `main`/Production 승격 전에 실제로 검증할 수 있게 합니다.

## 인프라 차단 문제 복구

이전 `wdmv-test` bootstrap은 helper image별 shell/network utility 차이 때문에 실패했습니다. 인프라 저장소 PR #19에서 Pod ServiceAccount credential을 사용해 Kubernetes API를 Python 표준 라이브러리 HTTPS/JSON으로 호출하도록 교체했습니다. non-root/read-only 실행과 `wdmvp/ghcr-pull` 하나만 읽는 namespace 간 최소권한 RBAC는 유지했습니다.

Infrastructure GitOps validation이 통과했고 PR #19는 `2ad8cc807ddb86ae4460b610b201dfc754c3bd96`로 병합됐습니다. 격리 staging bootstrap만 변경하며 Production 애플리케이션/DB/image/PVC 자원은 변경하지 않았습니다.

## 애플리케이션 저장소 개선

현재 `main`에서 만든 새 브랜치에 `.github/workflows/test-candidate.yml`을 추가했습니다.

- 이미지 push 전 재사용 전체 CI 게이트 실행
- CI 성공 후에만 `<sha>-test` backend/frontend 불변 이미지 생성
- checkout/buildx/login/build-push Action을 현재 immutable commit SHA로 고정
- SBOM/provenance 생성
- staging frontend의 검색 색인과 광고 비활성화
- staging/Production cluster를 workflow가 직접 수정하지 않음

영문 배포 지침을 먼저 수정한 뒤 한국어 parity 문서를 동기화해 격리 staging 계약과 exact-SHA 승격 순서를 복원했습니다.

## 검증 상태

- Infrastructure `Validate GitOps`: bootstrap repair branch에서 PASS 후 병합
- Application candidate branch: 최종 branch SHA의 GitHub CI 및 candidate-image build 통과가 필요
- 실제 cluster 검증은 여전히 필수입니다. 현재 승인된 원격 미니PC가 연결되지 않아 running image parity, Pod health, migration, user/direct-play QA, Production 승격 성공을 주장하지 않습니다.

## Production 상태

현재까지 변경 없음. Production image reference와 database resource는 수정하지 않았습니다.
