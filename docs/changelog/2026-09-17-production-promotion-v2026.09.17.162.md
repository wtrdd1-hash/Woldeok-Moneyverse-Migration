# Production Exact-SHA Promotion — v2026.09.17.162

Date: 2026-09-17
Korean: [2026-09-17-production-promotion-v2026.09.17.162.ko.md](2026-09-17-production-promotion-v2026.09.17.162.ko.md)

## Changed
- Promoted application SHA `18c7a1324013099e47b2d6e22c5108c4d378139c` through isolated Test, production-ready and GitOps Production gates.
- Applied and recorded `203-work-reset-convergence.sql` after a Production database backup.
- Converged the public host systemd runtime to the same exact SHA as GitOps Production manifests.
- Documented the temporary dual-runtime rule: GitOps is release authority, while public Nginx currently reaches host systemd services and must be exact-SHA mirrored.

## Verified
- Application main, Test, Production and GitOps desired Production SHA all match `18c7a1324013099e47b2d6e22c5108c4d378139c`.
- Production release workflow `35113806254` and GitOps reconcile `35117875121` succeeded.
- Core public pages, robots/sitemap/ads, catalog/database path and status returned healthy results; Production noindex count was zero.
- Economy AI and automatic economy switches remained enabled; backend/frontend/AI services remained active with no severe log matches in the validation window.
