# Multer 2.3.0 security update — 2026-09-09

## Status checklist

- [x] Confirm the vulnerable dependency is reachable in production upload paths.
- [x] Require patched `multer >=2.3.0` through the root pnpm override.
- [x] Regenerate the frozen lockfile and confirm Multer resolves to 2.3.0.
- [x] Run frozen install, lint, typecheck, backend tests, and production dependency audit.
- [x] Run GitHub CI with the PostgreSQL-backed test job.
- [ ] Merge to `main` after branch synchronization and review findings are resolved.
- [ ] Deploy through the authoritative production deployment path after the deployment-path drift tracked in #126 is resolved.

## Finding

The production dependency audit began failing after new upstream advisories were published for `multer`. `@nestjs/platform-express@11.2.3` resolved `multer@2.2.0`, while the advisories classify crafted multipart requests as High-severity denial-of-service issues and identify `2.3.0` as the patched release.

The affected code is reachable in this service because profile and administrator photo upload endpoints use NestJS multipart handling before the application's image magic-byte/dimension validation runs.

## Remediation

- Added a root pnpm override requiring `multer >=2.3.0`.
- Regenerated the frozen lockfile; the resolved Multer version changed from `2.2.0` to `2.3.0`.
- No application API, schema, migration, economic rule, or production data was changed.

## Validation results

- `pnpm install --frozen-lockfile`: passed.
- `pnpm lint`: passed with 0 errors and 11 pre-existing image-optimization warnings.
- `pnpm typecheck`: passed.
- backend Vitest: 58 files passed, 44 DB-backed files skipped locally; 822 tests passed, 345 skipped.
- `pnpm audit --prod --audit-level=high`: passed with no known vulnerabilities after the override.
- GitHub Actions CI run 34290115514: completed successfully, including the repository's PostgreSQL-backed gate.

## Deployment state

Not deployed. The production runtime and the repository deployment workflow are currently inconsistent: production is recorded as Kubernetes/Flux while the workflow still assumes a Docker Compose/SSH rollout. Issue #126 tracks restoration of an authoritative deployment path. This dependency fix must not be described as production-complete until that path is repaired and a post-deploy smoke check succeeds.

## Rollback

Revert this dependency change to restore the previous lockfile only for compatibility diagnosis. Because the previous Multer release has known remotely triggerable availability vulnerabilities, do not keep that rollback in production; replace it with another patched integration before service exposure.

## 한국어 요약

프로필·관리자 사진 업로드 경로에서 NestJS multipart 처리기가 애플리케이션 자체 이미지 검증보다 먼저 실행되므로 Multer 취약점은 실제 서비스 요청 경로에 도달합니다. 루트 pnpm override와 lockfile을 통해 Multer 2.3.0을 강제했고, frozen install·lint·typecheck·backend test·production audit·GitHub PostgreSQL CI를 통과했습니다. 다만 현재 운영 Kubernetes/Flux와 저장소의 Docker Compose/SSH 배포 워크플로가 불일치하므로 #126 해결 전에는 운영 배포 완료로 표시하지 않습니다.

## References

- GHSA-wc9g-mqfw-jrwm / CVE-2026-77078
- GHSA-535w-7cp7-47q4 / CVE-2026-82333
- GHSA-qfvm-cv95-jqjf
