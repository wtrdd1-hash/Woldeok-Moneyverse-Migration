# SEO, advertising, and legal-disclosure audit — 2026-09-08

## Scope

Improve crawler discoverability and AdSense safety without indexing test surfaces or placing ads next to transactional/gameplay flows. Align the privacy disclosure with the actual ad placement and document residual compliance checks.

## Checklist

- [x] Read project deployment and SEO guidance.
- [x] Audit robots, sitemap, metadata, structured data, ads.txt, ad placements, and privacy disclosure.
- [x] Make SEO and AdSense activation fail closed unless explicitly enabled.
- [x] Remove the shop purchase-flow ad and align privacy disclosure with the remaining public-content placements.
- [x] Add regression tests and deployment endpoint smoke checks.
- [x] Run frontend tests, lint, and production build locally.
- [x] Push the task branch and merge it into `test` via PR #120.
- [x] Verify the changed frontend image via production rolling canary on the Kubernetes host after CI/build validation.
- [x] Merge the verified change to `main` via PR #121 (`a077e884`).
- [x] Deploy the verified production frontend image and confirm public SEO/ad endpoints.

## Validation completed

- Frontend: 51 test files, 532 tests passed after building `@moneyverse/contract`.
- ESLint: 0 errors; existing `<img>` optimization warnings remain.
- Next.js production build: passed.
- GitHub Actions test deploy run `34213083792`: ref, CI verification, and image build succeeded.

## Deployment discrepancy found

At the time of the original test attempt, the test deploy failed at the host SSH step because the configured GitHub Actions deploy key was not accepted by the current host. During that investigation, repository deployment guidance was also found to be in transition after retirement of the old Docker `wdmv` test stack.

That retired-test-target discrepancy is now historical: the current `deploy.yml` no longer offers the old test target and its deployment target is production `wdmvp`. The remaining active discrepancy is different and more important: the repository workflow still performs an SSH + Docker Compose rollout, while the observed production runtime is Kubernetes/containerd managed through Flux/GitOps. See issue #126 for the current remediation contract.

The live Kubernetes ingress observed during the SEO task routed `test.easy-scraping.com` to the production `wdmvp` frontend. Consequently that hostname was not an acceptable isolated test gate for SEO work.

## Current remediation

The SEO/ad/legal change was verified through an isolated Kubernetes canary before production completion. For subsequent releases, do not treat the retired `wdmv` test target or a production-routed test hostname as a test-server pass. The supported pre-production and production deployment contract must be reconciled with the Kubernetes/Flux runtime described in issue #126.

## Production completion — 2026-09-09

- PR #121 merged the validated test branch into `main` at `a077e88454aa06b34557c7bdc11a4e5edaa4f33f`.
- Production workflow run `34280512568` passed ref enforcement, CI verification, and image build. Its legacy SSH ship step still failed because the configured deploy key is rejected by the host.
- To avoid altering database state, only the frontend image was rolled. No database migration or backend image change was required for this task.
- The frontend was rebuilt from the exact `main` commit with production SEO and AdSense build arguments, imported into the host containerd runtime, and rolled through Kubernetes `wdmvp-frontend`.
- The production deployment referenced `ghcr.io/wtrdd1-hash/wdmv/frontend:a077e88454aa06b34557c7bdc11a4e5edaa4f33f-production` with one ready replica at the completion checkpoint.
- Flux GitOps was temporarily suspended only during the controlled rollout, then the infrastructure source was updated to commit `4b183b74261abf28f34c3468bcd6b05e16323994` and Flux was resumed. `apps` reported that revision as applied at the checkpoint.
- Public checks returned HTTP 200 for `/`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, `/privacy`, and `/shop` at the completion checkpoint.
- `robots.txt` advertised `https://easy-scraping.com/sitemap.xml`; `ads.txt` contained the expected Google publisher record; sitemap URLs used the production origin; `/shop` contained no `SPONSORED ADVERTISEMENT` marker.

## Residual operational issue

The repository deployment workflow is not yet the authoritative Kubernetes/Flux rollout path used by the production host. This is tracked as issue #126 and must be resolved before relying on GitHub Actions as the complete production deployment gate.
