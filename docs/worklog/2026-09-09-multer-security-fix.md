# Multer 2.3.0 security update — 2026-09-09

## Status checklist

- [x] Confirm the affected dependency is present in the production dependency graph.
- [x] Check whether the application currently invokes Multer multipart interceptors.
- [x] Require patched `multer >=2.3.0` through the root pnpm override.
- [x] Regenerate the frozen lockfile and confirm Multer resolves to 2.3.0.
- [x] Run frozen install, lint, typecheck, backend tests, production dependency audit, and PostgreSQL-backed GitHub CI.
- [x] Synchronize the documentation branch with current `main`.
- [x] Confirm the Multer 2.3.0 override and lockfile already reached `main` through merged PR #130 after successful CI.
- [ ] Merge this documentation correction after its current-main CI succeeds.
- [ ] Deploy the updated runtime only through the authoritative production path after #126 is resolved.

## Finding

New upstream advisories classify multiple crafted multipart requests as High-severity denial-of-service issues in Multer versions before 2.3.0. The repository's NestJS platform dependency resolved Multer 2.2.0, causing the production dependency audit to fail.

A reachability review corrected the initial assessment: the current photo and board upload routes do **not** use NestJS Multer interceptors. `backend/src/main.ts` mounts `express.raw()` with explicit 4 MiB/8 MiB limits for those image endpoints, and code search found no `FileInterceptor`, `FilesInterceptor`, `AnyFilesInterceptor`, `FileFieldsInterceptor`, `UploadedFile`, or `UploadedFiles` use. The vulnerable package is therefore present in the runtime dependency graph but no currently identified application route invokes its multipart parser.

The upgrade remains appropriate because a known-vulnerable runtime dependency should not remain pinned, the production audit must stay clean, and a future multipart endpoint must not silently reactivate a vulnerable parser.

## Remediation

- Added a root pnpm override requiring `multer >=2.3.0`.
- Regenerated the frozen lockfile; the resolved Multer version changed from `2.2.0` to `2.3.0`.
- No application API, schema, migration, economic rule, or production data was changed.

## Validation results

- `pnpm install --frozen-lockfile`: passed.
- `pnpm lint`: passed with 0 errors and 11 pre-existing image-optimization warnings.
- `pnpm typecheck`: passed.
- backend Vitest: 58 files passed, 44 DB-backed files skipped locally; 822 tests passed, 345 skipped.
- `pnpm audit --prod --audit-level=high`: passed after the override.
- GitHub Actions CI run 34290115514: passed, including the PostgreSQL-backed gate on the earlier branch head.
- Reachability review: current binary upload endpoints use `express.raw()` size limits; no Multer interceptor/decorator usage was found.

## Deployment state

The dependency correction is present in Git `main` because PR #130 merged a branch that already contained the Multer override commit. It is **not confirmed deployed** to the live runtime. Production remains on mixed older application images while Flux reconciliation is unhealthy; #126 tracks restoration of the authoritative Kubernetes/GitOps deployment contract. Do not mark the dependency correction production-complete until the exact patched image is rolled out and smoke-checked.

## Rollback

Reverting restores the vulnerable dependency graph and should be used only for compatibility diagnosis. If 2.3.0 causes an integration regression, replace it with another patched solution rather than leaving a known-vulnerable Multer version exposed in the production dependency set.

## 한국어 요약

Multer 2.2.0은 새로운 High 등급 DoS 권고의 영향 버전이어서 2.3.0으로 올리는 조치는 유지합니다. 다만 현재 월덕 머니버스의 이미지 업로드는 Multer 인터셉터가 아니라 `express.raw()`와 4/8 MiB 제한을 사용하며, 저장소에서 Multer 인터셉터/업로드 데코레이터 사용도 확인되지 않았습니다. 따라서 현재 직접 노출된 취약 경로로 표현하지 않고, 취약 런타임 의존성 제거·의존성 감사 복구·향후 오용 방지 조치로 기록합니다. 운영 배포는 #126의 Kubernetes/배포 경로 불일치가 해결된 뒤 수행합니다.

## References

- GHSA-wc9g-mqfw-jrwm / CVE-2026-77078 — affected `<2.3.0`, patched `2.3.0`.
- GHSA-535w-7cp7-47q4 / CVE-2026-82333 — affected `<2.3.0`, patched `2.3.0`; recommends a minimal `fieldArrayIndexLimit` when Multer is actually used.
- GHSA-qvfw-j98x-7q72 / CVE-2026-77063 — async `fileFilter` file-size-limit race, also patched in `2.3.0`.

## Merge provenance correction

The package/lockfile change reached `main` indirectly through PR #130 (`feat: product expansion P0 watchlist`), whose head already included commit `1944e425` (`security: require patched multer release`). This documentation PR therefore no longer carries a runtime dependency diff; its purpose is to preserve an accurate reachability, validation, and deployment record.
