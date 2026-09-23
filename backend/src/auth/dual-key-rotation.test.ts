import { describe, expect, it } from 'vitest';
import { DualKeyRotationService, SEVEN_DAYS_MS } from './dual-key-rotation';

describe('DualKeyRotationService (G406-07)', () => {
  const currentKey = 'super-secret-current-2026-key-32b-length!!';
  const previousKey = 'older-legacy-key-used-for-rotation-prior!';
  const baseTime = 1774400000000; // arbitrary fixed epoch

  const service = new DualKeyRotationService({
    currentKey,
    previousKey,
    rotationTimestamp: baseTime,
    gracePeriodMs: SEVEN_DAYS_MS,
  });

  it('signs and verifies tokens using CURRENT_KEY with needsReissue=false', () => {
    const payload = 'session_usr_12345';
    const token = service.signToken(payload, currentKey, baseTime + 1000);

    const result = service.verifyToken(token, { now: baseTime + 1000 });
    expect(result.valid).toBe(true);
    expect(result.payload).toBe(payload);
    expect(result.keyType).toBe('current');
    expect(result.needsReissue).toBe(false);
  });

  it('accepts tokens signed with PREVIOUS_KEY within the 7-day grace period with needsReissue=true', () => {
    const payload = 'session_usr_legacy_user';
    const token = service.signToken(payload, previousKey, baseTime - 5000);

    // Day 3 of grace period (within 7 days)
    const day3Time = baseTime + 3 * 24 * 60 * 60 * 1000;
    const result = service.verifyToken(token, { now: day3Time });

    expect(result.valid).toBe(true);
    expect(result.payload).toBe(payload);
    expect(result.keyType).toBe('previous');
    expect(result.needsReissue).toBe(true);
  });

  it('rejects tokens signed with PREVIOUS_KEY after the 7-day grace period has passed', () => {
    const payload = 'session_usr_expired_legacy';
    const token = service.signToken(payload, previousKey, baseTime - 5000);

    // Day 8 (7 days + 1 second)
    const day8Time = baseTime + SEVEN_DAYS_MS + 1000;
    const result = service.verifyToken(token, { now: day8Time });

    expect(result.valid).toBe(false);
    expect(result.keyType).toBe('previous');
    expect(result.needsReissue).toBe(false);
    expect(result.reason).toContain('Grace period expired');
  });

  it('rejects tampered tokens or tokens signed with an unauthorized key', () => {
    const payload = 'session_usr_hacker';
    const foreignKey = 'some-malicious-attacker-forged-key!';
    const token = service.signToken(payload, foreignKey, baseTime);

    const result = service.verifyToken(token, { now: baseTime });
    expect(result.valid).toBe(false);
    expect(result.keyType).toBe('invalid');
    expect(result.reason).toContain('Signature mismatch');

    // Tampered payload
    const validToken = service.signToken('legit_user', currentKey, baseTime);
    const tampered = validToken.replace('legit_user', 'admin_user');
    const tamperedResult = service.verifyToken(tampered, { now: baseTime });
    expect(tamperedResult.valid).toBe(false);
  });

  it('transparently rotates a PREVIOUS_KEY token to CURRENT_KEY without dropping session', () => {
    const payload = 'session_usr_rotate_target';
    const legacyToken = service.signToken(payload, previousKey, baseTime);

    // Rotate at day 2
    const rotateTime = baseTime + 2 * 24 * 60 * 60 * 1000;
    const rotateResult = service.rotateToken(legacyToken, { now: rotateTime });

    expect(rotateResult.rotated).toBe(true);
    expect(rotateResult.token).not.toBe(legacyToken);

    // The newly issued token should verify against CURRENT_KEY
    const verifyNew = service.verifyToken(rotateResult.token, { now: rotateTime });
    expect(verifyNew.valid).toBe(true);
    expect(verifyNew.payload).toBe(payload);
    expect(verifyNew.keyType).toBe('current');
    expect(verifyNew.needsReissue).toBe(false);
  });

  it('simulates batch migration of 1,071 active user sessions with 100% continuity', () => {
    const sessionCount = 1071;
    const legacyTokens: string[] = [];

    for (let i = 0; i < sessionCount; i++) {
      legacyTokens.push(service.signToken(`active_user_sess_${i}`, previousKey, baseTime));
    }

    let successCount = 0;
    const migrationTime = baseTime + 1 * 24 * 60 * 60 * 1000; // Day 1 of deployment

    for (const token of legacyTokens) {
      const rotation = service.rotateToken(token, { now: migrationTime });
      if (rotation.rotated) {
        const check = service.verifyToken(rotation.token, { now: migrationTime });
        if (check.valid && check.keyType === 'current') {
          successCount++;
        }
      }
    }

    expect(successCount).toBe(sessionCount);
  });
});
