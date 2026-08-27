import { describe, expect, it } from 'vitest';
import { createFixedWindowLimiter } from './rate-limiter';
import { MAX_MESSAGE_LENGTH, sanitizeMessage } from './lobby';

/** A C0 sample written as escapes: a literal one here is what CI greps for. */
const CONTROL_SAMPLE = '\u0000\u001f';

describe('fixed window limiter', () => {
  it('allows up to the limit inside one window', () => {
    const limiter = createFixedWindowLimiter({ now: () => 0, windowMs: 1000 });
    expect([1, 2, 3].map(() => limiter.allow('a', 3))).toEqual([true, true, true]);
    expect(limiter.allow('a', 3)).toBe(false);
  });

  it('starts a fresh window once the previous one has elapsed', () => {
    let clock = 0;
    const limiter = createFixedWindowLimiter({ now: () => clock, windowMs: 1000 });
    expect(limiter.allow('a', 1)).toBe(true);
    expect(limiter.allow('a', 1)).toBe(false);
    clock = 1000;
    expect(limiter.allow('a', 1)).toBe(true);
  });

  it('counts each key separately', () => {
    const limiter = createFixedWindowLimiter({ now: () => 0 });
    expect(limiter.allow('a', 1)).toBe(true);
    expect(limiter.allow('b', 1)).toBe(true);
  });

  // The table is what an attacker would grow to exhaust memory, so a full
  // table refuses rather than expanding.
  it('refuses a new key when the table is full of live windows', () => {
    const limiter = createFixedWindowLimiter({ now: () => 0, maxEntries: 2 });
    expect(limiter.allow('a', 10)).toBe(true);
    expect(limiter.allow('b', 10)).toBe(true);
    expect(limiter.allow('c', 10)).toBe(false);
  });

  it('reclaims expired windows before refusing a new key', () => {
    let clock = 0;
    const limiter = createFixedWindowLimiter({ now: () => clock, windowMs: 1000, maxEntries: 2 });
    expect(limiter.allow('a', 10)).toBe(true);
    expect(limiter.allow('b', 10)).toBe(true);
    clock = 1000;
    expect(limiter.allow('c', 10)).toBe(true);
  });

  it('rejects a nonsensical table size rather than accepting it', () => {
    expect(() => createFixedWindowLimiter({ maxEntries: 0 })).toThrow(TypeError);
  });
});

describe('lobby message sanitiser', () => {
  it('keeps ordinary text unchanged', () => {
    expect(sanitizeMessage('안녕하세요')).toBe('안녕하세요');
  });

  it('removes angle brackets so a message can never read as markup', () => {
    expect(sanitizeMessage('<script>x</script>')).toBe('scriptx/script');
  });

  // A message that could carry a newline or an escape could forge line
  // structure in anything that later reads the relayed text.
  it('removes C0 control characters', () => {
    expect(sanitizeMessage(`a${CONTROL_SAMPLE}b`)).toBe('ab');
  });

  it('bounds the length', () => {
    expect(sanitizeMessage('가'.repeat(500))).toHaveLength(MAX_MESSAGE_LENGTH);
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeMessage('  hi  ')).toBe('hi');
  });

  it('turns a non-string into the empty string rather than "undefined"', () => {
    expect(sanitizeMessage(undefined)).toBe('');
    expect(sanitizeMessage(null)).toBe('');
  });
});
