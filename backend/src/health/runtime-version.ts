import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * The release manifest, not the mutable repository checkout, is authoritative.
 * A missing immutable source identity is reported as unknown rather than guessed.
 */
export function resolveRuntimeBuildId(
  explicitBuildId = process.env.BUILD_ID,
  releaseRoot = resolve(process.cwd(), '..'),
): string {
  if (explicitBuildId && /^[A-Za-z0-9._-]{6,96}$/.test(explicitBuildId)) return explicitBuildId;
  try {
    const manifest = JSON.parse(readFileSync(join(releaseRoot, '.moneyverse-release.json'), 'utf8')) as {
      applicationSourceSha?: unknown;
    };
    if (typeof manifest.applicationSourceSha === 'string' &&
        /^[a-f0-9]{40}$/i.test(manifest.applicationSourceSha)) {
      return manifest.applicationSourceSha;
    }
  } catch {
    // Older releases may not carry a manifest. Do not invent their source SHA.
  }
  return 'unknown';
}
