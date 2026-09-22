# 배포 지침서

이 문서는 월덕 머니버스의 공식 배포 절차 한국어 번역본입니다. 영문 정본은 `RELEASING.md`입니다.

## 운영 구조

| 환경 | 공개 주소 | 네임스페이스 | 실행 정본 |
| --- | --- | --- | --- |
| Production | `https://easy-scraping.com` | `wdmvp` | `wtrdd1-hash/kuber-infrastructure` |
| 격리 테스트 | `https://test.easy-scraping.com` | `wdmv-test` | `wtrdd1-hash/kuber-infrastructure`의 독립 Flux Kustomization |

호스트는 Kubernetes/containerd를 사용하고 Flux가 Git 선언을 반영합니다. Docker Compose는 Production 배포 제어면이 아닙니다. 테스트 namespace는 공용 Production `apps` Kustomization과 독립적으로 reconciliation되어 테스트 장애가 Production reconciliation을 막지 않습니다.

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

CI는 PostgreSQL을 띄워 번호 migration을 적용하고 DB 연동 테스트, Prisma schema 변조 방지, Production dependency 보안 감사를 수행합니다. DB 테스트가 skip된 것은 통과로 보지 않습니다.

## 2. exact-SHA 테스트 이미지 생성

Runtime 후보를 `auto/hourly-*` 또는 `test-candidate/*` 브랜치로 push합니다. `.github/workflows/test-candidate.yml`은 전체 CI를 먼저 실행한 후에만 다음 불변 이미지를 생성합니다.

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-test
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-test
```

외부 GitHub Action은 immutable commit SHA로 고정하고 SBOM/provenance를 생성합니다. frontend는 테스트 origin을 사용하며 검색 색인과 광고를 끕니다. 이 workflow는 Kubernetes 환경을 직접 수정하지 않습니다.

정확한 이미지는 격리된 `wdmv-test`에만 배포합니다. backend image, frontend image, migration source, candidate label이 같은 commit이어야 하며 migration/data integrity, health, 사용자 flow, authorization/security, responsive/accessibility, SEO/noindex, 필요한 direct-play QA를 검증합니다. 오래된 staging SHA는 PASS가 아닙니다.

## 3. Production 이미지 생성

정확한 후보가 staging을 통과한 뒤 최신 `main`에 안전하게 통합하고 필요한 검증을 다시 수행한 다음 그 정확한 main SHA에서 Production 이미지를 생성합니다.

```bash
gh workflow run deploy.yml -f enable_ads=true
gh run watch
```

파일명은 과거 호환 때문에 `deploy.yml`이지만 workflow 이름은 **Build Production Release**입니다. 이 workflow는 Production cluster를 직접 변경하지 않습니다. 전체 CI를 다시 실행하고 exact-SHA backend/frontend 이미지를 만들어 GHCR에 push하며 SBOM/provenance와 GitOps 승격 대상을 출력합니다.

릴리스 식별자는 `latest-production`이 아니라 불변 SHA 태그입니다.

## 4. GitOps Production 승격

`wtrdd1-hash/kuber-infrastructure`에서 새 브랜치와 PR을 만들고 다음 파일의 이미지 SHA를 바꿉니다.

```text
apps/wdmvp/backend.yaml
apps/wdmvp/frontend.yaml
```

정상 배포에서 `kubectl set image`로 Production을 직접 바꾸지 않습니다. Git 선언이 정본이어야 합니다.

Production GitOps PR 병합 전에는 exact candidate의 CI/staging 성공, exact main SHA Production image 존재, 이전 image SHA 기록, 복구 경로, migration checksum 정합성을 확인합니다.

## 5. Flux 및 롤아웃 확인

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

의도한 Flux revision이 Ready이고 변경된 workload rollout이 끝났으며 실제 image가 의도한 SHA-qualified Production image와 일치하기 전에는 배포 성공으로 보고하지 않습니다.

## 6. 필수 무중단·세션·캐시 최신화 게이트

모든 프론트엔드/백엔드 런타임 변경은 의도적인 공개 중단 없이 승격합니다. host mirror 또는 cluster rollout은 새 인스턴스가 healthy가 될 때까지 기존 인스턴스를 유지하고 readiness/rolling 절차로 트래픽을 전환합니다. 대체 인스턴스가 준비되기 전에 유일한 정상 Production 프로세스를 먼저 중지하면 안 됩니다.

회원 로그인 상태는 프론트엔드/백엔드 rollout과 재시작을 지나도 유지되어야 합니다. Production backend는 동일한 Production PostgreSQL 세션 저장소와 쿠키 서명/암호화 계약을 계속 사용해야 하며, 배포 과정에서 활성 회원 세션을 revoke/truncate/recreate/rotate/re-key 하면 안 됩니다. Test에서는 재시작 전에 만들어진 회원 세션이 재시작 뒤에도 새 로그인 세션 발급 없이 그대로 승인되는지 증명합니다.

프론트엔드는 사용자가 수동으로 브라우저 캐시를 지우지 않아도 최신 애플리케이션 shell을 강제로 받도록 구성합니다. HTML/document와 버전에 민감한 bootstrap 응답은 재검증/no-cache 의미를 사용하고, content-hash가 붙은 Next.js 정적 자산만 장기 캐시합니다. 승격 뒤 공개 document/version endpoint가 의도한 SHA를 식별하는지, 새 요청이 중간 캐시에서 이전 application shell을 받지 않는지 확인합니다.

host systemd mirror에서는 `ops/systemd/prepare-frontend-runtime-cache.sh`로 `frontend/.next/cache`만 준비합니다. 캐시 초기화를 이유로 회원 세션 행을 삭제하면 안 됩니다. backend/frontend 재시작·rollout은 readiness, 로그인 세션 연속성, 버전 최신성, 공개 smoke가 모두 통과한 뒤에만 완료로 판단합니다.

## 6. 공개 스모크체크

최소 확인 대상은 `/`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`입니다. 광고가 켜져 있으면 `ads.txt`와 승인된 AdSense 설정을 확인하고 검색 노출이 켜져 있으면 `robots.txt`와 sitemap의 Production origin을 확인합니다.

## 7. 데이터·복구 게이트

Production DB는 PostgreSQL이며 원장이 잔액의 정본입니다. Production migration은 불변·checksum 방식입니다.

데이터를 바꾸는 릴리스는 검증된 별도 매체 복구 경로가 건강하지 않으면 진행하지 않습니다. 2026-09-09 복구 감사에서는 별도 백업 SSD 문제 때문에 같은 호스트의 임시 PostgreSQL dump만 만들었으며 이것은 별도 매체 백업의 대체가 아닙니다. 현재 복구 상태는 이슈 #139를 기준으로 확인합니다.

## 8. 롤백

애플리케이션/설정 장애는 GitOps에서 이전에 검증된 SHA로 되돌린 뒤 Flux가 반영하도록 합니다. 애플리케이션 rollback 때문에 Production PVC, DB, 원장, 감사 데이터를 삭제하지 않습니다. 데이터 복구가 필요한 경우에는 검증된 복구 절차를 사용합니다.

## 참고

- `docs/architecture/deployment-flow.md`
- `docs/BACKUP.md`
- `AGENTS.md`
- Kubernetes Deployment 문서
- Kubernetes Service Account 문서
- Flux 문서

### 완료된 작업만 자동 main 통합

개발 브랜치에 열린 PR이 없거나 PR이 Draft이거나 WIP/hold/do-not-merge 계열 차단 표시가 있으면 **작업 중**으로 취급하여 자동 병합·충돌조정·삭제를 하지 않는다. 자동 통합은 `main` 대상의 열린 non-Draft PR, 차단 표시 없음, 정확한 현재 HEAD의 `Build Test Candidate` 성공, mergeable 상태를 모두 만족해야 한다. 후보 검증이 반복 실패해도 브랜치/PR을 삭제하지 않고 수정 대상으로 보존하며, 수정 및 재검증 후 자동 통합한다.

[executed on device: debian13 (d2f8c9a2-2e5a-4e57-a99d-1a9389e70b4c)]