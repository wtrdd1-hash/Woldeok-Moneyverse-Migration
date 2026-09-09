# Deployment Flow

Production is Kubernetes/Flux GitOps. The application repository builds and validates immutable images; the GitOps repository declares what runs.

```mermaid
flowchart TD
    M[Application main commit] --> CI[CI: secrets / lint / typecheck / build / DB migrations / tests / dependency audit]
    CI --> TI[Build exact-SHA test images]
    TI --> TG[GitOps test manifests]
    TG --> TR[Test namespace rollout]
    TR --> TV[Test readiness + smoke checks]
    TV --> PI[Build exact-SHA production images]
    PI --> GP[Reviewed GitOps production PR]
    GP --> FX[Flux reconciliation]
    FX --> KR[Kubernetes rollout status]
    KR --> SM[Public smoke checks]
    SM --> DA[Data-integrity + backup/recovery checks]
```

## Source of truth

- Application source: `wtrdd1-hash/Woldeok-Moneyverse-Migration`.
- Runtime declarations: `wtrdd1-hash/kuber-infrastructure`.
- Production namespace: `wdmvp`.
- Isolated test namespace: `wdmv-test`.
- Flux reconciliation, not Docker Compose, is the authoritative production mutation path.

The application repository's `deploy.yml` builds immutable production artifacts only. It must not SSH to the host and run `docker compose`; the current NixOS production host uses Kubernetes/containerd and does not provide Docker as the release control plane.

## Immutable image identity

Backend and frontend images use the application Git SHA plus environment suffix, for example:

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-production
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-production
```

The GitOps manifests must reference the exact SHA-qualified images being promoted. Mutable `latest-*` tags are not release identity.

## Test gate

The isolated `wdmv-test` stack has its own frontend, backend, PostgreSQL database, application secrets, registry credentials, routing, and readiness probes. A production candidate must not be described as tested merely because CI passed; the exact candidate image must also become Ready in the isolated test stack and pass the intended public smoke checks before production promotion.

## Production promotion

1. Confirm the candidate is the current application `main` SHA and CI is green.
2. Confirm the exact candidate has passed the isolated test rollout/readiness/smoke gate.
3. Build immutable production images from that exact SHA.
4. Open a reviewed PR in `kuber-infrastructure` updating `apps/minipc/wdmvp/backend.yaml` and `frontend.yaml`.
5. Merge only when data-changing prerequisites are satisfied. Schema-changing or destructive changes remain blocked when verified separate-media recovery is unavailable.
6. Wait for Flux reconciliation.
7. Require Kubernetes rollout completion for the changed Deployments. Kubernetes documents `kubectl rollout status` as the rollout completion check; a zero exit status means the rollout completed.
8. Verify `/`, `/status`, `/robots.txt`, `/sitemap.xml`, and `/ads.txt` as applicable.
9. Re-run the production aggregate data-integrity audit and confirm backup/recovery state when the release can affect data.

## Migration safety

Migrations remain numbered, immutable, and checksummed. Historical checksum drift must stop promotion. A release containing a migration is not eligible for production while the required recovery gate is unhealthy.

## Rollback model

- Application/image failure: revert the GitOps manifest to the previously verified SHA-qualified image and let Flux reconcile it.
- Configuration failure: revert the GitOps commit/PR that introduced the configuration.
- Migration/data failure: prefer a forward fix; restore only from a verified backup when explicitly required.

Do not use `kubectl set image` as the normal release path because it creates drift from Git. Do not delete production PVCs or databases as part of rollback.

## References

- Kubernetes Deployment rollout/status semantics: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Flux GitOps documentation: https://fluxcd.io/flux/
