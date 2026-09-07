import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { slotReelsForFace } from './slots-game';
import { themedOutcome } from './theme-games';

describe('casino themed games stay faithful to the server result', () => {
  it('shows 777 only for the server face that actually wins the slot theme', () => {
    expect(slotReelsForFace(6)).toEqual(['7️⃣', '7️⃣', '7️⃣']);
    for (const face of [1, 2, 3, 4, 5]) {
      expect(slotReelsForFace(face)).not.toEqual(['7️⃣', '7️⃣', '7️⃣']);
    }
  });

  it('translates the same server face into each theme without inventing another RNG', () => {
    expect(themedOutcome('wheel', 3)).toBe('황금색');
    expect(themedOutcome('wheel', 4)).toBe('푸른색');
    expect(themedOutcome('treasure', 5)).toBe('5번 상자');
    expect(themedOutcome('gems', 2)).toBe('2번 보석');
  });

  it('prices every themed interface from server terms rather than hard-coded multipliers', () => {
    const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    const slots = readFileSync(join(__dirname, 'slots-game.tsx'), 'utf8');
    const hilo = readFileSync(join(__dirname, 'hilo-game.tsx'), 'utf8');

    expect(page).toContain('payoutMultiplier={multiplierFromPpm(numberGame.payout_multiplier_ppm)}');
    expect(page).toContain('payoutMultiplier={multiplierFromPpm(parityGame.payout_multiplier_ppm)}');
    expect(page).toContain('remainingStake={numberHeadroom}');
    expect(page).toContain('remainingStake={parityHeadroom}');
    expect(slots).not.toContain('5.7배로 정산');
    expect(hilo).not.toContain('1.9배로 정산');
  });

  it('uses a dedicated casino history endpoint rather than filtering the wallet feed', () => {
    const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    expect(page).toContain("/api/v1/casino/history");
    expect(page).not.toContain('/api/v1/wallet?recent=');
    expect(page).not.toContain('CASINO_TRANSACTION_TYPES');
  });
});
