---
name: spring-runtime-observability
description: Prepare, audit or troubleshoot Spring Boot Actuator, Micrometer, JVM memory, systemd/Nginx health checks, isolated Test rollout and zero-downtime production cutover. Trigger for Spring deployment, SLO performance, service readiness or rollback planning.
---
# Spring runtime, observability and deployment

## Source of truth
- Read `docs/RELEASING.md`, `docs/INFRASTRUCTURE.md`, exact runtime baseline and actual mini-PC service state. If AGENTS.md describes a conflicting historical deployment model, use verified runtime evidence and log the discrepancy.
- Read-only inspect CPU, RAM, swap, disk, systemd, process path, listening ports, reverse proxy configuration and current deployed SHA before choosing JVM heap/pools.

## Observability
- Separate liveness and readiness; use Spring Boot Actuator and Micrometer with authenticated/private metrics. Do not expose env, heap dump, config properties or sensitive diagnostics to the public.
- Set and measure p50/p95/p99 latency, DB pool saturation, error rates, GC pauses, RSS, CPU, startup time, scheduler lag and file descriptors against a verified legacy baseline.
- Set bounded thread pools, Hikari connections, payload size and timeouts; load test with realistic memory pressure before proposing a production JVM.

## Safe promotion
- Build immutable exact-SHA artifacts, run official Test with backend/frontend/edge identity and authenticated E2E, independent backup restore, finance/security gates, staged traffic switching and rollback rehearsal.
- Never assume docs-only installation is a production candidate. Stop on unknown running binary provenance, missing Test, ledger divergence or failed rollback. Publish observed evidence, not aspirational SLOs.
