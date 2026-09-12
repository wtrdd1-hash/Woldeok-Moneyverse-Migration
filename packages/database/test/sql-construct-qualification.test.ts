import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const MIGRATIONS = join(__dirname, '..', 'migrations');

/**
 * PostgreSQL resolves SQL constructs such as COALESCE/NULLIF/EXTRACT through
 * grammar, not as schema-qualified pg_catalog functions. A qualified spelling
 * can compile into a runtime failure that migration application alone misses
 * until the affected branch executes.
 */
describe('migration SQL construct qualification', () => {
  it('rejects schema-qualified SQL constructs in new migrations', () => {
    const immutableLegacy = new Set([
      '018-economy-reconciliation-health.sql',
      '030-discord-outbox-delivery-lease.sql',
      '040-virtual-stock-corporate-actions.sql',
      '041-virtual-bank-auto-interest.sql',
      '178-business-settlement-v2-idempotency.sql',
    ]);
    const pattern = /pg_catalog\.(?:coalesce|greatest|least|nullif|extract)\s*\(/i;
    const offenders = readdirSync(MIGRATIONS)
      .filter((name) => name.endsWith('.sql') && !immutableLegacy.has(name))
      .filter((name) => pattern.test(readFileSync(join(MIGRATIONS, name), 'utf8')))
      .sort();

    expect(offenders, 'SQL constructs must not be schema-qualified').toEqual([]);
  });
});
