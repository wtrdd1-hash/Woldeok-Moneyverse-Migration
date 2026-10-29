import { existsSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { verifyStorageEvidence, type VerifiedStorageSnapshot } from './storage-headroom';

const DEFAULT_PUBLIC_KEY_FILE = '/etc/moneyverse/storage-evidence-ed25519-public.pem';
let lastSequence: bigint | undefined;
let lastSignature: string | undefined;

const DEFAULT_EVIDENCE_FILE = '/run/moneyverse/storage-evidence.json';

/** The endpoint is unavailable until an independently provisioned host collector signs evidence. */
export function readVerifiedStorageSnapshot(): VerifiedStorageSnapshot {
  if (existsSync('/.dockerenv') || readFileSync('/proc/1/comm', 'utf8').trim() !== 'systemd') {
    throw new Error('unverified host namespace');
  }
  const keyFile = process.env.MONEYVERSE_STORAGE_PUBLIC_KEY_FILE || DEFAULT_PUBLIC_KEY_FILE;
  const evidenceFile = process.env.MONEYVERSE_STORAGE_EVIDENCE_FILE || DEFAULT_EVIDENCE_FILE;
  const keyInfo = statSync(keyFile);
  const evidenceInfo = statSync(evidenceFile);
  if (!keyInfo.isFile() || keyInfo.size < 100 || keyInfo.size > 4096 ||
      !evidenceInfo.isFile() || evidenceInfo.size > 8192 || evidenceInfo.size < 1) {
    throw new Error('storage evidence not provisioned securely');
  }
  const publicKey = readFileSync(keyFile, 'utf8');
  const document: unknown = JSON.parse(readFileSync(evidenceFile, 'utf8'));
  const snapshot = verifyStorageEvidence(document, {
    publicKey,
    bootId: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(),
    mountNamespace: readlinkSync('/proc/self/ns/mnt'),
    now: Date.now(),
    ...(lastSequence === undefined ? {} : { minimumSequence: lastSequence }),
    ...(lastSignature === undefined ? {} : { lastSignature }),
  });
  const verified = document as { payload: { sequence: string }; signature: string };
  lastSequence = BigInt(verified.payload.sequence);
  lastSignature = verified.signature;
  return snapshot;
}
