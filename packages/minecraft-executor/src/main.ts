import { Pool } from 'pg';
import { PostgresMinecraftApprovedOperationExecutorRepository } from '@moneyverse/minecraft-core';
import { MinecraftApprovedOperationExecutor } from '@moneyverse/minecraft-core';
import { MinecraftHostAgentClient } from '@moneyverse/minecraft-core';
import { loadConfig } from './config';
import { createRoleScopedExecutorPool } from './database';
import { MinecraftApprovedOperationWorker } from './worker';

function auditLog(event: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify(event)}\n`);
}

async function main(): Promise<void> {
  const config = loadConfig();
  const rawPool = new Pool({
    connectionString: config.databaseUrl,
    max: 1,
    idleTimeoutMillis: 10_000,
    application_name: 'woldeok-minecraft-executor',
  });
  // node-postgres emits an ErrorEvent for an idle-client failure. Handling it
  // here prevents Node's default unhandled-event output from exposing a DB
  // hostname or transport detail in a centralised log.
  rawPool.on('error', () => {
    auditLog({ event: 'minecraft_executor_database_pool_error', at: new Date().toISOString() });
  });
  const roleScopedPool = createRoleScopedExecutorPool(rawPool);
  const repository = new PostgresMinecraftApprovedOperationExecutorRepository(roleScopedPool);
  const executor = new MinecraftApprovedOperationExecutor({
    repository,
    leaseSeconds: config.leaseSeconds,
  });
  const hostAgent = new MinecraftHostAgentClient({
    endpoint: config.agentEndpoint,
    token: config.agentToken,
    timeoutMs: config.agentTimeoutMs,
    maxResponseBytes: config.agentMaxResponseBytes,
  });
  const worker = new MinecraftApprovedOperationWorker({ executor, hostAgent, auditLog });
  const abortController = new AbortController();
  let shutdownTimer: NodeJS.Timeout | null = null;
  let stopping = false;

  function shutdown(signal: NodeJS.Signals): void {
    if (stopping) return;
    stopping = true;
    auditLog({ event: 'minecraft_executor_shutdown_requested', signal, at: new Date().toISOString() });
    abortController.abort();
    shutdownTimer = setTimeout(() => {
      // Do not print a caught error here: host-agent and PostgreSQL failures
      // can carry topology or credential-adjacent details.
      process.stderr.write('Minecraft executor did not stop before its deadline\n');
      process.exit(1);
    }, 70_000);
    shutdownTimer.unref?.();
  }

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  auditLog({
    event: 'minecraft_executor_started',
    at: new Date().toISOString(),
    leaseSeconds: config.leaseSeconds,
    pollIntervalMs: config.pollIntervalMs,
  });

  try {
    await worker.runUntilStopped({
      pollIntervalMs: config.pollIntervalMs,
      signal: abortController.signal,
    });
  } finally {
    if (shutdownTimer) clearTimeout(shutdownTimer);
    await rawPool.end();
  }
}

process.once('uncaughtException', () => {
  process.stderr.write('Minecraft executor encountered an unrecoverable error\n');
  process.exit(1);
});
process.once('unhandledRejection', () => {
  process.stderr.write('Minecraft executor encountered an unrecoverable rejection\n');
  process.exit(1);
});

main().catch(() => {
  // Deliberately opaque: stdout/stderr is often centralised, and error objects
  // can include connection strings, host details, or upstream response text.
  process.stderr.write('Minecraft executor failed to start or run\n');
  process.exitCode = 1;
});
