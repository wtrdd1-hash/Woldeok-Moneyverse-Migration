# Infrastructure Stall Resilience Specification

> Version: v2026.09.25.437
> Status: PLANNING
> Start baseline: `origin/main=4a4549f644972af972c47fb8f56bd9500766aa61`
> Korean counterpart: [INFRASTRUCTURE_STALL_RESILIENCE_SPEC.ko.md](INFRASTRUCTURE_STALL_RESILIENCE_SPEC.ko.md)

## 1. Incident-derived threat model
The 2026-09-25 incident showed a PostgreSQL process blocked in uninterruptible `D` state with `kvm_async_pf_task_wait_schedule`, growing from 120 seconds to 1,087 seconds. The guest later rebooted without a clean shutdown; system journal, the Moneyverse data filesystem journal and PostgreSQL WAL required recovery. Hypervisor/host stalls are therefore a first-class availability and data-continuity risk distinct from application crashes.

## 2. Resource isolation
Production requires a guaranteed RAM floor and host reserve unavailable to opportunistic workloads. Ballooning/overcommit must have a lower bound derived from observed peak working set plus safety margin. Monitor host/guest available memory, memory PSI, swap-in/out, major faults, QEMU RSS, CPU steal/scheduling delay and storage latency. Local AI inference, CI/build, browser QA, backup and Test workloads require cgroup/container/systemd limits or scheduling when they can contend with Production.

## 3. Health authority and detection
A valid health decision combines: external HTTPS public probe; Nginx/edge upstream health; backend liveness/readiness; a bounded lightweight PostgreSQL transaction/read; guest heartbeat and QEMU guest-agent state; and hypervisor QEMU state plus host memory/CPU/storage signals. Trigger infrastructure incidents on repeated/long-lived `kvm_async_pf`, hung task/D-state, lost guest heartbeat, QEMU pause/reset, host OOM, extreme memory PSI, abnormal scheduling delay or sustained storage latency. A successful local `/health` does not suppress a host-level alarm.

## 4. Automated response
Use an out-of-guest watchdog with state `healthy -> suspect -> degraded -> evidence_capture -> controlled_recovery -> verify -> healthy|escalated`. Configure duration thresholds, cooldowns and maximum attempts; unbounded reboot/restart loops are prohibited. Recover the smallest safe domain first: application instance, dependency, VM, then host/failover. VM restart requires VM-level evidence, not one HTTP failure. Preserve journal/kernel/QEMU/DB evidence before disruptive action when possible. Multi-node failover requires fencing; single-host deployment must not claim HA.

## 5. PostgreSQL and data continuity
Keep PostgreSQL durability compatible with WAL crash recovery and do not disable `fsync` durability for availability. Required startup order is data filesystem mount/recovery -> PostgreSQL accepting transactions -> migration/schema compatibility -> backend ready -> frontend ready -> edge traffic. During filesystem/WAL recovery, dependents use exponential backoff rather than restart churn. Maintain encrypted backups and restore drills with RPO/RTO evidence. After unclean shutdown, verify recovery completion, migration state, critical ledger invariants, session-store health and representative authenticated flows.

## 6. Observability and retention
Correlate Proxmox/QEMU task logs, host kernel journal, OOM/PSI, disk latency/errors, VM kernel/systemd journal, Docker, PostgreSQL, backend, frontend and Nginx with synchronized timestamps and release identity. Retain pre-crash windows and remediation actions.

## 7. Test and acceptance matrix
Test must exercise memory pressure without crossing the guaranteed floor, controlled guest pause/stall and heartbeat loss, PostgreSQL abrupt termination/WAL recovery, safe filesystem-recovery simulation, host/guest health disagreement, and watchdog cooldown/maximum-attempt behavior. Acceptance requires zero ledger corruption, deterministic dependency recovery, no restart storm, external alert evidence, host-level evidence retention, and session continuity when durable session authority remains valid.

## 8. Release/operations blocker
Block Production promotion or infrastructure change when the VM has no guaranteed memory floor, host-level telemetry is unavailable, external watchdog ownership/path is undefined, backup restore evidence is stale, or recovery ordering has not been tested.

## 9. Scope truth
This version is a planning/documentation contract derived from observed incident evidence. It does not claim Proxmox host controls, watchdog automation, fault injection, or Production mitigations are already implemented.
