#!/usr/bin/env bash
set -euo pipefail

: "${EXPECTED_INFRA_SHA:?EXPECTED_INFRA_SHA is required}"
RESTART_CONTROLLERS="${RESTART_CONTROLLERS:-false}"

if kubectl get nodes >/dev/null 2>&1; then
  kc() { kubectl "$@"; }
elif [ -x /run/current-system/sw/bin/kubectl ] && /run/current-system/sw/bin/kubectl get nodes >/dev/null 2>&1; then
  kc() { /run/current-system/sw/bin/kubectl "$@"; }
else
  echo 'No authorized kubectl path can access the cluster.' >&2
  exit 2
fi

echo '--- cluster ---'
kc get nodes -o wide

# Production remains frozen until isolated Test has exact-SHA evidence.
if kc -n flux-system get kustomization apps >/dev/null 2>&1; then
  kc -n flux-system patch kustomization apps --type=merge -p '{"spec":{"suspend":true}}'
fi

kc -n flux-system patch gitrepository flux-system --type=merge \
  -p '{"spec":{"url":"https://github.com/wtrdd1-hash/kuber-infrastructure","ref":{"branch":"main"},"interval":"1m0s"}}'

reconcile() {
  local stamp
  stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  kc -n flux-system annotate gitrepository flux-system reconcile.fluxcd.io/requestedAt="$stamp" --overwrite
  kc -n flux-system annotate kustomization flux-system reconcile.fluxcd.io/requestedAt="$stamp" --overwrite || true
}

converged() {
  local revision
  revision="$(kc -n flux-system get gitrepository flux-system -o jsonpath='{.status.artifact.revision}' 2>/dev/null || true)"
  [[ "$revision" == *"$EXPECTED_INFRA_SHA"* ]]
}

reconcile
for _ in $(seq 1 18); do
  converged && break
  sleep 10
done

if ! converged && [[ "$RESTART_CONTROLLERS" == 'true' ]]; then
  kc -n flux-system rollout restart deployment/source-controller deployment/kustomize-controller
  kc -n flux-system rollout status deployment/source-controller --timeout=120s
  kc -n flux-system rollout status deployment/kustomize-controller --timeout=120s
  reconcile
  for _ in $(seq 1 18); do
    converged && break
    sleep 10
  done
fi

converged || exit 3

# Root reconciliation can reapply the apps Kustomization, so freeze it again.
if kc -n flux-system get kustomization apps >/dev/null 2>&1; then
  kc -n flux-system patch kustomization apps --type=merge -p '{"spec":{"suspend":true}}'
fi
stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
kc -n flux-system annotate kustomization wdmv-test reconcile.fluxcd.io/requestedAt="$stamp" --overwrite
sleep 20

echo '--- source ---'
kc -n flux-system get gitrepository flux-system -o jsonpath='{.spec.url}{"\n"}{.status.artifact.revision}{"\n"}'
echo '--- kustomizations ---'
kc -n flux-system get kustomizations
echo '--- test workloads ---'
kc -n wdmv-test get deploy,statefulset,pods -o wide
