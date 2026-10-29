import { createPublicKey, verify } from 'node:crypto';

export type StorageSeverity = 'NORMAL' | 'WARN' | 'CRITICAL' | 'EMERGENCY';
export interface VerifiedStorageMount {
  readonly mountAlias: 'ROOT' | 'DATA';
  readonly totalBytes: string;
  readonly usedBytes: string;
  readonly availableBytes: string;
  readonly usedPercent: number;
  readonly inodeAvailable: string;
  readonly severity: StorageSeverity;
}
export interface VerifiedStorageSnapshot {
  readonly status: 'VERIFIED';
  readonly sourceKind: 'HOST_SIGNED';
  readonly observedAt: string;
  readonly freshness: 'FRESH';
  readonly mounts: readonly [VerifiedStorageMount, VerifiedStorageMount];
}

interface VerificationOptions {
  readonly publicKey: string;
  readonly bootId: string;
  readonly mountNamespace: string;
  readonly now: number;
  readonly minimumSequence?: bigint;
  readonly lastSignature?: string;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid storage evidence');
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): void {
  if (Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) {
    throw new Error('unexpected storage evidence fields');
  }
}

function natural(value: unknown, name: string): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,19})$/.test(value)) {
    throw new Error(`invalid ${name}`);
  }
  return BigInt(value);
}

function verifyMount(value: unknown, expectedAlias: 'ROOT' | 'DATA'): VerifiedStorageMount {
  const row = record(value);
  exactKeys(row, ['mountAlias', 'blocks', 'bfree', 'bavail', 'bsize', 'files', 'ffree']);
  if (row.mountAlias !== expectedAlias) throw new Error('unexpected mount alias');
  const blocks = natural(row.blocks, 'blocks');
  const bfree = natural(row.bfree, 'bfree');
  const bavail = natural(row.bavail, 'bavail');
  const bsize = natural(row.bsize, 'bsize');
  const files = natural(row.files, 'files');
  const ffree = natural(row.ffree, 'ffree');
  if (blocks === 0n || bsize === 0n || bsize > 1_048_576n || bfree > blocks || bavail > bfree || ffree > files) {
    throw new Error('inconsistent storage evidence');
  }
  const used = blocks - bfree;
  const availableBytes = bavail * bsize;
  const denominator = used + bavail;
  const usedPercent = denominator === 0n ? 100 : Number((used * 100n + denominator - 1n) / denominator);
  const severity: StorageSeverity = usedPercent >= 95 || availableBytes < 5n * 1024n ** 3n || ffree === 0n
    ? 'EMERGENCY' : usedPercent >= 90 ? 'CRITICAL' : usedPercent >= 80 ? 'WARN' : 'NORMAL';
  return {
    mountAlias: expectedAlias,
    totalBytes: (blocks * bsize).toString(),
    usedBytes: (used * bsize).toString(),
    availableBytes: availableBytes.toString(),
    usedPercent,
    inodeAvailable: ffree.toString(),
    severity,
  };
}

/** The verifier holds only a pinned public key; private signing material stays host-only. */
export function verifyStorageEvidence(document: unknown, options: VerificationOptions): VerifiedStorageSnapshot {
  if (typeof options.publicKey !== 'string' || options.publicKey.length < 100 || options.publicKey.length > 4096) {
    throw new Error('storage public key unavailable');
  }
  const envelope = record(document);
  exactKeys(envelope, ['payload', 'signature']);
  if (typeof envelope.signature !== 'string' || !/^[0-9a-f]{128}$/.test(envelope.signature)) {
    throw new Error('invalid storage signature');
  }
  const payload = record(envelope.payload);
  const serialized = JSON.stringify(payload);
  if (serialized.length > 8192) throw new Error('oversized storage evidence');
  let trusted = false;
  try {
    trusted = verify(null, Buffer.from(serialized), createPublicKey(options.publicKey), Buffer.from(envelope.signature, 'hex'));
  } catch {
    throw new Error('invalid storage public key');
  }
  if (!trusted) {
    throw new Error('untrusted storage evidence');
  }
  exactKeys(payload, ['schemaVersion', 'sourceKind', 'bootId', 'mountNamespace', 'observedAt', 'sequence', 'mounts']);
  if (payload.schemaVersion !== 1 || payload.sourceKind !== 'HOST_SIGNED' ||
      payload.bootId !== options.bootId || payload.mountNamespace !== options.mountNamespace) {
    throw new Error('unverified host identity');
  }
  const sequence = natural(payload.sequence, 'sequence');
  if (sequence === 0n || (options.minimumSequence !== undefined && sequence < options.minimumSequence) ||
      (options.minimumSequence !== undefined && sequence === options.minimumSequence &&
       options.lastSignature !== undefined && envelope.signature !== options.lastSignature)) {
    throw new Error('replayed storage sequence');
  }
  const timestamp = payload.observedAt;
  if (typeof timestamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp)) {
    throw new Error('invalid storage timestamp');
  }
  const observedAt = Date.parse(timestamp);
  if (!Number.isFinite(observedAt) || observedAt > options.now + 5_000 || options.now - observedAt > 120_000) {
    throw new Error('stale or future storage evidence');
  }
  if (!Array.isArray(payload.mounts) || payload.mounts.length !== 2) throw new Error('missing storage mounts');
  return {
    status: 'VERIFIED', sourceKind: 'HOST_SIGNED', observedAt: timestamp, freshness: 'FRESH',
    mounts: [verifyMount(payload.mounts[0], 'ROOT'), verifyMount(payload.mounts[1], 'DATA')],
  };
}
