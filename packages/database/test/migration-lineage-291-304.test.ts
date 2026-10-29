import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrations = join(__dirname, '..', 'migrations');
const applied: Record<string, string> = {
  '291-ledger-first-citizen-dividend.sql': 'de7d40b747c2187b42a00ca523ecec1edeb849a61d54e834ebef65c3c29aa513',
  '292-ledger-postings-transaction-fk-index.sql': '6b6d587eba8e99b342196f0478885fcab4ba9d8fd6a0d280dfebd348e79982c5',
  '293-exact-money-chunk-codec.sql': '56066f8dc7bf2b2e84a80f99e4a5c34062f6f3b6a14951b86c78887244daede6',
  '294-ledger-discrepancy-case-registry.sql': '102a95b2907c71005ee1b66f7ead331fc332df0d2c72c1ce19eef840a413aa8f',
};
const pending = [
  '295-chat-media-ownership.sql',
  '296-npc-order-replay-integrity.sql',
  '297-owner-pending-photo-withdrawal.sql',
  '298-verified-blog-visibility-boundary.sql',
  '299-restore-admin-bank-read-execute.sql',
  '300-admin-swf-scoped-read.sql',
  '301-central-bank-durable-policy-and-audit.sql',
  '302-support-exact-message-receipt.sql',
  '303-verified-help-publication-identity.sql',
  '304-verified-help-category-counts.sql',
];

describe('applied and pending migration lineage', () => {
  it('retains the four applied 291–294 filenames and exact bytes', () => {
    for (const [filename, expected] of Object.entries(applied)) {
      const actual = createHash('sha256').update(readFileSync(join(migrations, filename))).digest('hex');
      expect(actual, `${filename} is already applied and immutable`).toBe(expected);
    }
  });

  it('assigns one unique, contiguous number to each previously colliding pending migration', () => {
    const actual = readdirSync(migrations)
      .filter((name) => /^\d{3}-.*\.sql$/.test(name))
      .filter((name) => Number(name.slice(0, 3)) >= 295 && Number(name.slice(0, 3)) <= 304)
      .sort();
    expect(actual).toEqual(pending);
  });
});
