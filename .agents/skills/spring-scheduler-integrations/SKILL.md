---
name: spring-scheduler-integrations
description: Migrate NestJS/Node cron jobs, Telegram and Discord bots, webhooks, Socket.IO and outbox/background workers to Spring Scheduling or approved integrations without duplicate execution. Trigger for Spring jobs, event handlers, bots, realtime or cross-process worker ownership.
---
# Scheduler, outbox and realtime ownership

## Inventory
- Enumerate existing Nest schedulers, host timers, Discord/Telegram/Minecraft handlers, outbox consumers, retry queues and Socket.IO event names; capture exact currently active owner and source code.
- Produce job table: trigger, current owner, next owner, schedule/timezone, lease key, retries, idempotency, event schema, operational alarm and rollback.

## Migration safety
- For every state-changing job, fence old execution before new execution starts. A second scheduled `@Scheduled` bean is not a safe cutover. Use database-backed lease/advisory locking with crash recovery and a bounded lease only after project approval.
- Preserve deduplication, receipt/outbox transaction boundaries and event sequence; never allow read-only shadow to ACK, send, mint, pay or publish.
- Maintain raw webhook signature validation, Discord/Telegram rate limits, socket handshake/session and Android client compatibility. Avoid unverified event protocol replacements.

## Acceptance
- Prove exactly one active executor under dual-instance, restart, timeout, crash and replay tests; record duplicate count and rollback to legacy owner. For bots, verify signed integration fixtures and live official Test only under approved safe credentials. No parallel production workers without an explicit cutover gate.
