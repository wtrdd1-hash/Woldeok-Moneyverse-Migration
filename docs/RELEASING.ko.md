# 배포 지침서

이 문서는 월덕 머니버스의 공식 배포 절차 한국어 번역본입니다. 영문 정본은 `RELEASING.md`입니다.

## 운영 구조

| 환경 | 공개 주소 | 네임스페이스 | 실행 정본 |
| --- | --- | --- | --- |
| 테스트 | `https://test.easy-scraping.com` | `wdmv-test` | `wtrdd1-hash/kuber-infrastructure` |
| 운영 | `https://easy-scraping.com` | `wdmvp` | `wtrdd1-hash/kuber-infrastructure` |

운영 호스트는 Kubernetes/containerd를 사용하고 Flux가 Git 선언을 반영합니다. Docker Compose는 더 이상 운영 배포 제어면이 아닙니다.

## 1. 개발 및 CI 게이트

배포 후보의 정확한 커밋에서 다음 검증이 모두 통과해야 합니다.

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
scripts/check-control-bytes.sh
scripts/check-secrets.sh
pnpm audit --prod --audit-level=high
```

CI는 PostgreSQL을 띄워 번호가 붙은 마이그레이션을 적용하고 DB 연동 테스트, Prisma 스키마 변조 방지, 운영 의존성 보안 감사를 추가로 수행합니다. DB 테스트가 건너뛴 것은 통과로 보고하지 않습니다.

## 2. 격리 테스트 게이트

`wdmv-test`는 실제로 분리된 GitOps 테스트 환경입니다. frontend, backend, PostgreSQL, secrets, registry credential, routing, readiness check가 운영과 분리되어 있습니다.

운영 후보는 다음을 만족해야 합니다.

- 정확한 애플리케이션 Git SHA의 `-test` 이미지 사용
- 테스트 DB 마이그레이션 성공
- frontend/backend/DB 모두 Ready
- `https://test.easy-scraping.com/` 및 `/status` 스모크체크 성공
- 테스트의 검색노출/광고 정책이 운영과 분리
- 운영 DB, secret, Discord token, 쓰기 경로를 실수로 공유하지 않음

## 3. 운영 이미지 생성

애플리케이션 저장소 `main`에서 실행합니다.

```bash
gh workflow run deploy.yml -f enable_ads=true
gh run watch
```

파일명은 과거 호환 때문에 `deploy.yml`이지만 워크플로 이름은 **Build Production Release**입니다. 이 워크플로는 운영 클러스터를 직접 변경하지 않습니다.

1. `main` 여부 확인
2. 전체 CI 재실행
3. 정확한 SHA의 backend/frontend 운영 이미지 빌드
4. GHCR push
5. SBOM/provenance 생성
6. GitOps에서 바꿔야 할 정확한 이미지 경로 출력

릴리스 식별자는 `latest-production`이 아니라 불변 SHA 태그입니다.

## 4. GitOps 운영 승격

`wtrdd1-hash/kuber-infrastructure`에서 새 브랜치와 PR을 만들고 다음 파일의 이미지 SHA를 바꿉니다.

```text
apps/minipc/wdmvp/backend.yaml
apps/minipc/wdmvp/frontend.yaml
```

정상 배포에서 `kubectl set image`로 운영을 직접 바꾸지 않습니다. Git 선언이 항상 정본이어야 합니다.

운영 GitOps PR 병합 전에는 정확한 후보의 CI/격리 테스트 성공, 운영 이미지 존재, 이전 이미지 SHA 기록, 복구 경로, 마이그레이션 체크섬 정합성을 확인합니다.

## 5. Flux 및 롤아웃 확인

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

변경된 Deployment가 롤아웃을 완료하고 실제 실행 이미지가 의도한 SHA인지 확인하기 전에는 배포 성공으로 보고하지 않습니다.

## 6. 공개 스모크체크

최소 확인 대상은 `/`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`입니다. 광고가 켜져 있으면 `ads.txt`와 승인된 AdSense 설정을 확인하고, 검색 노출이 켜져 있으면 `robots.txt`와 sitemap의 운영 origin을 확인합니다.

## 7. 데이터·복구 게이트

운영 DB는 PostgreSQL이며 원장이 잔액의 정본입니다. 운영 마이그레이션은 불변·체크섬 방식입니다.

데이터를 바꾸는 릴리스는 검증된 별도 매체 복구 경로가 건강하지 않으면 진행하지 않습니다. 2026-09-09 복구 감사에서는 별도 백업 SSD 문제 때문에 같은 호스트의 임시 PostgreSQL dump만 만들었으며, 이것은 별도 매체 백업의 대체가 아닙니다. 현재 복구 상태는 이슈 #139를 기준으로 확인합니다.

## 8. 롤백

애플리케이션/설정 장애는 GitOps에서 이전에 검증된 SHA로 되돌린 뒤 Flux가 반영하도록 합니다. 애플리케이션 롤백 때문에 운영 PVC, DB, 원장, 감사 데이터를 삭제하지 않습니다. 데이터 복구가 필요한 경우에는 검증된 복구 절차를 사용합니다.

## 참고

- `docs/architecture/deployment-flow.md`
- `docs/BACKUP.md`
- `AGENTS.md`
- Kubernetes Deployment 문서
- Flux 문서
