# Multer 2.3.0 security update — 2026-09-09

## Status checklist

- [x] Confirm the affected dependency is present in the production dependency graph.
- [x] Check whether the application currently invokes Multer multipart interceptors.
- [x] Require patched `multer >=2.3.0` through the root pnpm override.
- [x] Regenerate the frozen lockfile and confirm Multer resolves to 2.3.0.
- [x] Run frozen install, lint, typecheck, backend tests, production dependency audit, and PostgreSQL-backed GitHub CI.
- [x] Confirm the Multer 2.3.0 override and lockfile reached `main` through merged PR #130.
- [x] Confirm the containing application revision `ffcdc5b0d2878639639ca48747f09ed8532da4d7` was rolled out through Flux/Kubernetes.
- [x] Confirm production frontend/backend are Ready on the `ffcdc5b0...-production` images and public smoke endpoints return HTTP 200.

## Finding

Upstream advisories classify multiple crafted multipart requests as High-severity denial-of-service issues in Multer versions before 2.3.0. The repository previously resolved Multer 2.2.0 through the NestJS platform dependency.

A reachability review corrected the initial assessment: the current photo and board upload routes do **not** use NestJS Multer interceptors. `backend/src/main.ts` mounts `express.raw()` with explicit 4 MiB/8 MiB limits for those image endpoints, and repository search found no `FileInterceptor`, `FilesInterceptor`, `AnyFilesInterceptor`, `FileFieldsInterceptor`, `UploadedFile`, or `UploadedFiles` use. The vulnerable package was therefore present in the runtime dependency graph but no currently identified application route invoked its multipart parser.

The upgrade remains appropriate because known-vulnerable runtime dependencies should not remain pinned, production dependency auditing must stay clean, and future multipart endpoints must not silently reactivate a vulnerable parser.

## Remediation

- Added a root pnpm override requiring `multer >=2.3.0`.
- Regenerated the frozen lockfile; the resolved Multer version changed from 2.2.0 to 2.3.0.
- No application API, schema, migration, economic rule, or production data was changed by the dependency correction.

## Validation results

- `pnpm install --frozen-lockfile`: passed on the remediation branch.
- `pnpm lint`: passed with zero errors and pre-existing image-optimization warnings only.
- `pnpm typecheck`: passed.
- backend Vitest: passed for the runnable local set; DB-backed tests were separately exercised by GitHub CI.
- `pnpm audit --prod --audit-level=high`: passed after the override.
- GitHub Actions CI for the containing branch passed, including the PostgreSQL-backed gate.
- Reachability review: current binary upload endpoints use `express.raw()` size limits; no Multer interceptor/decorator use was found.

## Deployment state

The dependency correction reached `main` indirectly through PR #130 (`feat: product expansion P0 watchlist`), whose head contained commit `1944e425` (`security: require patched multer release`). The resulting merge commit is `ffcdc5b0d2878639639ca48747f09ed8532da4d7`.

On 2026-09-09 KST the authorized mini PC was re-checked. Flux `gitrepository/flux-system` and all Kustomizations were `Ready=True` at infrastructure revision `983f2c56`. Production `wdmvp-backend` and `wdmvp-frontend` were both Ready and running:

- `ghcr.io/wtrdd1-hash/wdmv/backend:ffcdc5b0d2878639639ca48747f09ed8532da4d7-production`
- `ghcr.io/wtrdd1-hash/wdmv/frontend:ffcdc5b0d2878639639ca48747f09ed8532da4d7-production`

Public smoke checks for `/`, `/status`, `/robots.txt`, and `/sitemap.xml` returned HTTP 200. Therefore the patched dependency is now confirmed deployed in the production application revision.

The separate release-engineering issue #126 remains open because the repository's Docker Compose/SSH `deploy.yml` still does not represent the authoritative Kubernetes/Flux production contract, the residual `wdmv-test` namespace is broken, and backup verification is not yet an explicit observable Kubernetes deployment gate.

## Rollback

Reverting the dependency override would restore a known-vulnerable dependency and is not an acceptable steady-state rollback. If Multer 2.3.0 causes an integration regression, replace it with another patched solution or remove the unused dependency path rather than pinning a vulnerable version.

## 한국어 요약

Multer 2.2.0은 High 등급 DoS 권고의 영향 버전이어서 2.3.0으로 올린 조치는 유지합니다. 다만 현재 월덕 머니버스의 이미지 업로드는 Multer 인터셉터가 아니라 `express.raw()`와 4/8 MiB 제한을 사용하고, 저장소에서도 Multer 인터셉터/업로드 데코레이터 사용이 확인되지 않았습니다. 따라서 현재 직접 노출된 취약 경로라고 표현하지 않고, 취약 런타임 의존성 제거·의존성 감사 복구·향후 오용 방지 조치로 기록합니다.

2026-09-09 재점검에서 Flux 전체가 `Ready=True`였고 운영 frontend/backend가 `ffcdc5b0...-production` 이미지로 실행 중이며 주요 공개 URL이 HTTP 200을 반환했습니다. 따라서 Multer 2.3.0 수정은 운영 반영까지 확인됐습니다. 다만 #126의 배포 계약 정리와 고장 난 테스트 namespace 문제는 별도 미해결 항목입니다.

## References

- GHSA-wc9g-mqfw-jrwm / CVE-2026-77078 — affected `<2.3.0`, patched `2.3.0`.
- GHSA-535w-7cp7-47q4 / CVE-2026-82333 — affected `<2.3.0`, patched `2.3.0`.
- GHSA-qvfw-j98x-7q72 / CVE-2026-77063 — async `fileFilter` file-size-limit race, also patched in `2.3.0`.
