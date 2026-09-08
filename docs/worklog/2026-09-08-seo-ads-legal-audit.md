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

The test deploy failed only at the host SSH step because the configured GitHub Actions deploy key is not accepted by the current host. The repository also contains conflicting deployment documentation: `AGENTS.md` says the old Docker `wdmv` test stack was retired on 2026-09-07, while `docs/RELEASING.md` and `deploy.yml` still attempt to deploy that retired stack.

The live Kubernetes ingress currently routes `test.easy-scraping.com` to the production `wdmvp` frontend. Consequently the test hostname returns the production sitemap and production crawler policy. This is not an acceptable test gate for SEO work. Production has not been changed by this task.

## Current remediation

Use the already-built `<sha>-test` image in an isolated Kubernetes canary for the public SEO/ad/legal surfaces, with indexing and ads disabled and login/mutation paths unavailable. Keep `main` and the production deployment unchanged until that canary is verified. The stale deployment-path discrepancy must remain recorded until the repository workflow is aligned with the Kubernetes host.

## Production completion — 2026-09-09

- PR #121 merged the validated test branch into `main` at `a077e88454aa06b34557c7bdc11a4e5edaa4f33f`.
- Production workflow run `34280512568` passed ref enforcement, CI verification, and image build. Its legacy SSH ship step still failed because the configured deploy key is rejected by the host.
- To avoid altering database state, only the frontend image was rolled. No database migration or backend image change was required for this task.
- The frontend was rebuilt from the exact `main` commit with production SEO and AdSense build arguments, imported into the host containerd runtime, and rolled through Kubernetes `wdmvp-frontend`.
- The production deployment now references `ghcr.io/wtrdd1-hash/wdmv/frontend:a077e88454aa06b34557c7bdc11a4e5edaa4f33f-production` with one ready replica.
- Flux GitOps was temporarily suspended only during the controlled rollout, then the infrastructure source was updated to commit `4b183b74261abf28f34c3468bcd6b05e16323994` and Flux was resumed. `apps` reports that revision as applied.
- Public checks returned HTTP 200 for `/`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, `/privacy`, and `/shop`.
- `robots.txt` advertises `https://easy-scraping.com/sitemap.xml`; `ads.txt` contains the expected Google publisher record; sitemap URLs use the production origin; `/shop` contains no `SPONSORED ADVERTISEMENT` marker.

## Residual operational issue

The repository deployment workflow still contains an SSH transport path that is not authenticated against the current host. This does not affect the currently running production revision, but it should be repaired before relying on GitHub Actions for the next automated host rollout.
