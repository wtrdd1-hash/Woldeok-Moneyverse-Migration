import * as crypto from 'node:crypto';

const MEMORY_KIB = 19 * 1024;
const PASSES = 2;
const PARALLELISM = 1;
const TAG_LENGTH = 32;
const SALT_LENGTH = 16;
const VERSION = 19;

type Argon2Parameters = {
  readonly message: string | Buffer;
  readonly nonce: Buffer;
  readonly parallelism: number;
  readonly tagLength: number;
  readonly memory: number;
  readonly passes: number;
};

type Argon2Callback = (error: Error | null, derivedKey: Buffer) => void;
type Argon2Fn = (
  algorithm: 'argon2id',
  parameters: Argon2Parameters,
  callback: Argon2Callback,
) => void;

const argon2 = (crypto as unknown as { readonly argon2: Argon2Fn }).argon2;

function derive(password: string, salt: Buffer, memory: number, passes: number, parallelism: number) {
  return new Promise<Buffer>((resolve, reject) => {
    argon2(
      'argon2id',
      {
        message: password,
        nonce: salt,
        parallelism,
        tagLength: TAG_LENGTH,
        memory,
        passes,
      },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export function normalizePassword(password: string): string {
  return password.normalize('NFC');
}

export async function hashPassword(password: string): Promise<string> {
  const normalized = normalizePassword(password);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = await derive(normalized, salt, MEMORY_KIB, PASSES, PARALLELISM);
  return `$argon2id$v=${VERSION}$m=${MEMORY_KIB},t=${PASSES},p=${PARALLELISM}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, verifier: string): Promise<boolean> {
  const match = /^\$argon2id\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/.exec(
    verifier,
  );
  if (!match) return false;
  const [, versionRaw, memoryRaw, passesRaw, parallelismRaw, saltRaw, hashRaw] = match;
  if (Number(versionRaw) !== VERSION) return false;
  const memory = Number(memoryRaw);
  const passes = Number(passesRaw);
  const parallelism = Number(parallelismRaw);
  if (
    !Number.isInteger(memory) ||
    !Number.isInteger(passes) ||
    !Number.isInteger(parallelism) ||
    memory < MEMORY_KIB ||
    passes < PASSES ||
    parallelism < 1 ||
    memory > 1024 * 1024 ||
    passes > 10 ||
    parallelism > 16
  ) {
    return false;
  }

  const salt = Buffer.from(saltRaw!, 'base64url');
  const expected = Buffer.from(hashRaw!, 'base64url');
  if (salt.length < 8 || expected.length !== TAG_LENGTH) return false;
  const actual = await derive(normalizePassword(password), salt, memory, passes, parallelism);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export async function spendDummyPasswordWork(password: string): Promise<void> {
  await hashPassword(password);
}
