# Changelog — v2026.10.15.652 (documentation-only audit)

- New **confirmed live P0**: automated monetary policy SQL source table absent, synthetic 500000/480000 fallback used in **318** events, linked to **169 APPROVED** policy orders; real wallet impact undetermined. Urgent authorized containment and posting reconciliation recommended.
- New structural **finance mutation on GET**: secret-auction listing triggers settlement, even in unmerged v639/PR #844.
- Reconfirmed app role 237 writable tables, 11 publicly executable SECURITY DEFINER funcs, 24 direct backend balance writes, six live 404s, candle 503 misclassification, 266 applied migrations up to 268, active prod-v600 and Test source drift, admin/DAO/IndexNow/SEO gaps.
- Audited 1,976 source/config files (~380,834 lines); baseline frontend 1,206/backend nonDB 1,185 PASS, contract 179, bot basic 4, supplemental syntax FAIL, lint 1,089 warnings.
- v650 docs-only main update reconciled mid-audit, removed historical DOCS_INDEX conflict; Android main signing-hardening v1.3.5 advanced.
- No source/runtime feature code, production database, deployment, service, or funds changed. Detailed paired findings and worklogs. Status BLOCKED.
