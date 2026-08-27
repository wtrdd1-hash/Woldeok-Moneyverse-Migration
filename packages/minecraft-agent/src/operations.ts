import { spawn as nodeSpawn } from 'node:child_process';
import type { MinecraftAgentConfig } from './config';

export const OPERATIONS = Object.freeze(['status', 'start', 'stop', 'restart', 'logs'] as const);
export type MinecraftOperationName = (typeof OPERATIONS)[number];

const SUDO = '/usr/bin/sudo';
const SYSTEMCTL = '/usr/bin/systemctl';
const JOURNALCTL = '/usr/bin/journalctl';
const MAX_COMMAND_OUTPUT_BYTES = 128 * 1024;

export class OperationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode = 502) {
    super(message);
    this.name = 'OperationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

interface BoundedOutputState {
  bytes: number;
  overflow: boolean;
  timedOut: boolean;
}

function appendBounded(chunks: Buffer[], chunk: Buffer | string, state: BoundedOutputState, limit: number): void {
  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  const remaining = Math.max(0, limit - state.bytes);
  if (remaining > 0) {
    chunks.push(buffer.subarray(0, remaining));
  }
  state.bytes += buffer.length;
  if (state.bytes > limit) state.overflow = true;
}

export interface CommandInvocation {
  readonly file: string;
  readonly args: readonly string[];
  readonly timeoutMs: number;
  readonly maxOutputBytes?: number;
}

export interface CommandResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly timedOut: boolean;
  readonly overflow: boolean;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * The minimal shape this module needs from a spawned child process. Real
 * `child_process.spawn(..., { stdio: ['ignore', 'pipe', 'pipe'] })` results
 * satisfy this structurally; tests substitute a plain EventEmitter-based
 * double that implements only this surface.
 */
interface SpawnedProcessLike {
  readonly stdout: { on(event: 'data', listener: (chunk: Buffer | string) => void): void };
  readonly stderr: { on(event: 'data', listener: (chunk: Buffer | string) => void): void };
  killed: boolean;
  kill(signal?: NodeJS.Signals | number): boolean;
  once(event: 'error', listener: (error: Error) => void): unknown;
  once(event: 'close', listener: (code: number | null, signal: NodeJS.Signals | null) => void): unknown;
}

type SpawnImpl = (file: string, args: readonly string[], options: {
  readonly shell: false;
  readonly windowsHide: true;
  readonly stdio: readonly ['ignore', 'pipe', 'pipe'];
}) => SpawnedProcessLike;

export interface ProcessRunner {
  run(invocation: CommandInvocation): Promise<CommandResult>;
}

/**
 * Runs a prebuilt process without a shell. It intentionally accepts a file and
 * argv separately so no command string can ever be evaluated by a shell.
 */
export function createProcessRunner({ spawnImpl = nodeSpawn as unknown as SpawnImpl }: { spawnImpl?: SpawnImpl } = {}): ProcessRunner {
  return {
    run({ file, args, timeoutMs, maxOutputBytes = MAX_COMMAND_OUTPUT_BYTES }: CommandInvocation): Promise<CommandResult> {
      return new Promise((resolve, reject) => {
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        const state: BoundedOutputState = { bytes: 0, overflow: false, timedOut: false };
        let child: SpawnedProcessLike | undefined;
        let settled = false;
        let killTimer: NodeJS.Timeout | undefined;
        let timeout: NodeJS.Timeout;

        const finish = <T,>(callback: (value: T) => void, value: T): void => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          clearTimeout(killTimer);
          callback(value);
        };

        const terminate = (): void => {
          if (!child || child.killed) return;
          child.kill('SIGTERM');
          killTimer = setTimeout(() => child?.kill('SIGKILL'), 1000);
          killTimer.unref?.();
        };

        try {
          child = spawnImpl(file, args, {
            shell: false,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe']
          });
        } catch (error) {
          finish(reject, error);
          return;
        }

        timeout = setTimeout(() => {
          state.timedOut = true;
          terminate();
        }, timeoutMs);
        timeout.unref?.();

        child.stdout.on('data', (chunk) => {
          appendBounded(stdout, chunk, state, maxOutputBytes);
          if (state.overflow) terminate();
        });
        child.stderr.on('data', (chunk) => {
          appendBounded(stderr, chunk, state, maxOutputBytes);
          if (state.overflow) terminate();
        });
        child.once('error', (error) => finish(reject, error));
        child.once('close', (exitCode, signal) => finish(resolve, {
          exitCode,
          signal,
          timedOut: state.timedOut,
          overflow: state.overflow,
          stdout: Buffer.concat(stdout).toString('utf8').trimEnd(),
          stderr: Buffer.concat(stderr).toString('utf8').trimEnd()
        }));
      });
    }
  };
}

/** Returns a fixed command for one of the five supported operations. */
export function buildOperationInvocation(config: MinecraftAgentConfig, operation: string): CommandInvocation {
  if (!OPERATIONS.includes(operation as MinecraftOperationName)) {
    throw new OperationError('invalid_operation', 'Unsupported Minecraft operation', 404);
  }

  const prefix = [SUDO, '--non-interactive'] as const;
  if (operation === 'status') {
    return {
      file: prefix[0],
      args: [
        prefix[1], SYSTEMCTL, 'show', '--no-pager',
        '--property=LoadState', '--property=ActiveState', '--property=SubState',
        '--property=MainPID', '--property=ActiveEnterTimestamp', config.service
      ],
      timeoutMs: config.commandTimeoutMs
    };
  }
  if (operation === 'logs') {
    return {
      file: prefix[0],
      args: [
        prefix[1], JOURNALCTL, '--no-pager', '--output=short-iso', '-n',
        String(config.logLines), '-u', config.service
      ],
      timeoutMs: config.logTimeoutMs
    };
  }
  return {
    file: prefix[0],
    args: [prefix[1], SYSTEMCTL, operation, config.service],
    timeoutMs: config.commandTimeoutMs
  };
}

interface SystemdProperties {
  LoadState?: string;
  ActiveState?: string;
  SubState?: string;
  MainPID?: string;
  ActiveEnterTimestamp?: string;
}

const SYSTEMD_PROPERTY_KEYS = ['LoadState', 'ActiveState', 'SubState', 'MainPID', 'ActiveEnterTimestamp'] as const;

function parseSystemdProperties(stdout: string): SystemdProperties {
  const properties: SystemdProperties = {};
  for (const line of stdout.split('\n')) {
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1);
    const propertyKey = SYSTEMD_PROPERTY_KEYS.find((candidate) => candidate === key);
    if (propertyKey !== undefined) {
      properties[propertyKey] = value;
    }
  }
  return properties;
}

export interface MinecraftOperationResultBase {
  readonly service: string;
  readonly completedAt: string;
}

export type MinecraftOperationResult =
  | (MinecraftOperationResultBase & { readonly state: SystemdProperties })
  | (MinecraftOperationResultBase & { readonly logs: string })
  | (MinecraftOperationResultBase & { readonly accepted: true });

export class MinecraftOperations {
  readonly config: MinecraftAgentConfig;
  readonly runner: ProcessRunner;

  constructor(config: MinecraftAgentConfig, { runner = createProcessRunner() }: { runner?: ProcessRunner } = {}) {
    this.config = config;
    this.runner = runner;
  }

  async execute(operation: string): Promise<MinecraftOperationResult> {
    const invocation = buildOperationInvocation(this.config, operation);
    let completed: CommandResult;
    try {
      completed = await this.runner.run(invocation);
    } catch {
      throw new OperationError('command_unavailable', 'The host control command could not be started');
    }

    if (completed.overflow) {
      throw new OperationError('command_output_limit', 'The host command produced too much output');
    }
    if (completed.timedOut) {
      throw new OperationError('command_timeout', 'The host command timed out', 504);
    }
    if (completed.exitCode !== 0) {
      throw new OperationError('command_failed', 'The host operation was not accepted');
    }

    const base: MinecraftOperationResultBase = {
      service: this.config.service,
      completedAt: new Date().toISOString()
    };
    if (operation === 'status') {
      return { ...base, state: parseSystemdProperties(completed.stdout) };
    }
    if (operation === 'logs') {
      return { ...base, logs: completed.stdout };
    }
    return { ...base, accepted: true };
  }
}
