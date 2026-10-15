import { act } from 'react';
import { describe, expect, it } from 'vitest';

/** The Debian production host exports NODE_ENV=production globally.
 * React production exports no act(), so a test command must explicitly
 * override it to make the full UI regression suite deterministic. */
describe('frontend test runtime', () => {
  it('loads the React act testing API even when shell NODE_ENV is production', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(typeof act).toBe('function');
  });
});
