import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { transactionLabel } from './wallet.service';

const MIGRATIONS = join(__dirname, '..', '..', '..', 'packages', 'database', 'migrations');

/**
 * Every `ledger_transactions.type` any migration posts.
 *
 * `economy_post_transaction`'s second argument is the type, and it is always a
 * literal at the call site -- 024 is the one exception and composes
 * `'VIRTUAL_STOCK_' || upper(side)`, whose two results are listed by hand
 * because no regular expression can read them out of a concatenation.
 */
function postedTypes(): ReadonlySet<string> {
  const found = new Set(['VIRTUAL_STOCK_BUY', 'VIRTUAL_STOCK_SELL']);
  for (const file of readdirSync(MIGRATIONS).filter((name) => name.endsWith('.sql'))) {
    const sql = readFileSync(join(MIGRATIONS, file), 'utf8');
    for (const match of sql.matchAll(
      /economy_post_transaction\s*\(\s*[^,]+,\s*'([A-Z][A-Z0-9_]*)'/g,
    )) {
      const type = match[1];
      // A trailing underscore means the literal was the left half of a
      // concatenation -- 024's `'VIRTUAL_STOCK_' || upper(side)` -- and the
      // whole type is one of the two listed above, never the prefix itself.
      if (type !== undefined && !type.endsWith('_')) found.add(type);
    }
  }
  return found;
}

/**
 * The bug this file exists for.
 *
 * `TRANSACTION_LABELS` already carried a comment saying an unlabelled type
 * "reads as '경제 활동' in the ledger, which is the one line a member checks
 * when they want to know where their money went" -- and three types were added
 * after it was written without a label: `VIRTUAL_DICE_GAME` (100),
 * `EARLY_EVENT_REWARD` (103) and `SHOP_MAINTENANCE` (104). Every test passed,
 * because nothing compared the two lists.
 */
describe('the ledger labels a member reads', () => {
  const types = postedTypes();

  it('finds the transaction types the migrations post', () => {
    expect(types.size).toBeGreaterThan(10);
    expect(types.has('WORK_TASK_REWARD')).toBe(true);
  });

  it.each([...types].sort())('names %s in Korean rather than 경제 활동', (type) => {
    expect(transactionLabel(type)).not.toBe('경제 활동');
  });

  it('still falls back for a type no migration posts', () => {
    expect(transactionLabel('SOMETHING_NOBODY_WRITES')).toBe('경제 활동');
  });
});
