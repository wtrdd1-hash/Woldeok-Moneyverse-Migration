import { generateKeyPairSync, sign as signPayload } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createDiscordInteractionHandler } from './interactions';
import type { DiscordCommandAuditEntry } from './interactions';

const GUILD_ID = '111111111111111111';
const ROLE_ID = '222222222222222222';
const MEMBER_ID = '333333333333333333';
const RECIPIENT_ID = '444444444444444444';
const INTERACTION_ID = '555555555555555555';
const MEMBER_UUID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const RECIPIENT_UUID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
// The last 32 bytes of an Ed25519 SPKI DER encoding are the raw key, which is
// the hexadecimal form Discord publishes in the developer portal.
const PUBLIC_KEY_HEX = publicKey
  .export({ format: 'der', type: 'spki' })
  .subarray(-32)
  .toString('hex');

function signedRequest(payload: unknown): { headers: Record<string, string>; rawBody: Buffer } {
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signPayload(
    null,
    Buffer.concat([Buffer.from(timestamp, 'utf8'), rawBody]),
    privateKey,
  ).toString('hex');
  return {
    headers: { 'x-signature-ed25519': signature, 'x-signature-timestamp': timestamp },
    rawBody,
  };
}

function command(name: string, options?: unknown[]) {
  return {
    type: 2,
    id: INTERACTION_ID,
    guild_id: GUILD_ID,
    member: { user: { id: MEMBER_ID }, roles: [ROLE_ID] },
    data: options ? { type: 1, name, options } : { type: 1, name },
  };
}

const OVERVIEW = {
  balances: {
    currency: 'WLD',
    cash: { availableAmount: '1000' },
    bank: { availableAmount: '500' },
    totalAvailableAmount: '1500',
  },
  recentTransactions: [{ label: '@everyone 에게 지급', netAmount: '100' }],
};

function handlerWith(
  overrides: {
    overview?: () => Promise<unknown>;
    transfer?: () => Promise<unknown>;
    record?: (entry: DiscordCommandAuditEntry) => Promise<unknown>;
    knownRecipient?: boolean;
  } = {},
) {
  const audited: DiscordCommandAuditEntry[] = [];
  const auditErrors: unknown[] = [];
  const handler = createDiscordInteractionHandler({
    publicKey: PUBLIC_KEY_HEX,
    policy: { guilds: { [GUILD_ID]: { requiredRoleIds: [ROLE_ID], roleMode: 'any' } } },
    identityRepository: {
      async userIdForDiscordUser(discordUserId: string) {
        if (discordUserId === MEMBER_ID) return MEMBER_UUID;
        if (discordUserId === RECIPIENT_ID && overrides.knownRecipient !== false)
          return RECIPIENT_UUID;
        return null;
      },
    },
    walletService: {
      overview: overrides.overview ?? (async () => OVERVIEW),
      claimDaily: async () => ({ amount: '100', replayed: false }),
      transfer: overrides.transfer ?? (async () => ({ receiptId: 'ok' })),
    },
    rateLimiter: { consume: async () => true },
    commandAuditor: {
      record: async (entry: DiscordCommandAuditEntry) => {
        audited.push(entry);
        return overrides.record ? overrides.record(entry) : undefined;
      },
    },
    onAuditError: (error) => auditErrors.push(error),
  });
  return { handler, audited, auditErrors };
}

function content(response: { body: unknown }): string {
  const data = (response.body as { data?: { content?: string } }).data;
  return data?.content ?? '';
}

function allowedMentions(response: { body: unknown }): unknown {
  const data = (response.body as { data?: { allowed_mentions?: unknown } }).data;
  return data?.allowed_mentions;
}

/**
 * The interaction handler had no test at all: 946 lines of signature
 * verification and authorization that nothing exercised. These cover what this
 * change adds — an audit row for every command, and a reply that cannot ping —
 * plus the two refusals those must not weaken.
 */
describe('the Discord interaction handler', () => {
  it('refuses to be built without an auditor to record commands', () => {
    expect(() =>
      createDiscordInteractionHandler({
        publicKey: PUBLIC_KEY_HEX,
        policy: { guilds: { [GUILD_ID]: { requiredRoleIds: [ROLE_ID], roleMode: 'any' } } },
        identityRepository: { async userIdForDiscordUser() { return MEMBER_UUID; } },
        walletService: {
          overview: async () => OVERVIEW,
          claimDaily: async () => ({}),
          transfer: async () => ({}),
        },
        rateLimiter: { consume: async () => true },
      }),
    ).toThrow('command auditor');
  });

  it('answers a balance command and records it as completed', async () => {
    const { handler, audited } = handlerWith();
    const response = await handler.handle(signedRequest(command('balance')));

    expect(response.status).toBe(200);
    expect(content(response)).toContain('1,500');
    expect(audited).toHaveLength(1);
    expect(audited[0]).toMatchObject({
      actorUserId: MEMBER_UUID,
      command: 'balance',
      guildId: GUILD_ID,
      targetUserId: null,
      outcome: 'completed',
    });
    // Every command carries an idempotency key, including the read-only ones:
    // it is the identity of the interaction, which is what the audit row wants
    // as its request id.
    expect(audited[0]?.idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5/);
  });

  it('records the recipient of a transfer as the target', async () => {
    const { handler, audited } = handlerWith();
    const response = await handler.handle(
      signedRequest(
        command('send', [
          { name: 'recipient', type: 6, value: RECIPIENT_ID },
          { name: 'amount', type: 4, value: 250 },
        ]),
      ),
    );

    expect(content(response)).toContain('250 WLD');
    expect(audited[0]).toMatchObject({
      command: 'send',
      targetUserId: RECIPIENT_UUID,
      outcome: 'completed',
    });
  });

  it('records a refusal the member caused as rejected, not as completed', async () => {
    const { handler, audited } = handlerWith({ knownRecipient: false });
    const response = await handler.handle(
      signedRequest(
        command('send', [
          { name: 'recipient', type: 6, value: RECIPIENT_ID },
          { name: 'amount', type: 4, value: 250 },
        ]),
      ),
    );

    expect(content(response)).toBe('송금을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    expect(audited[0]).toMatchObject({ outcome: 'rejected', targetUserId: null });
  });

  it('records a wallet failure as failed and tells Discord nothing about it', async () => {
    const { handler, audited } = handlerWith({
      transfer: async () => {
        throw Object.assign(new Error('22023: insufficient balance'), { code: '22023' });
      },
    });
    const response = await handler.handle(
      signedRequest(
        command('send', [
          { name: 'recipient', type: 6, value: RECIPIENT_ID },
          { name: 'amount', type: 4, value: 250 },
        ]),
      ),
    );

    expect(content(response)).toBe('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    expect(content(response)).not.toContain('22023');
    // The recipient survives the failure: a transfer that threw is exactly the
    // row an investigation wants the target on.
    expect(audited[0]).toMatchObject({
      command: 'send',
      outcome: 'failed',
      targetUserId: RECIPIENT_UUID,
    });
  });

  /**
   * The money moved before the audit write was attempted. Failing the command
   * now would tell the member their transfer did not happen when it did, so
   * the write is reported and the reply stands.
   */
  it('does not fail a command because its audit row could not be written', async () => {
    const { handler, auditErrors } = handlerWith({
      record: async () => {
        throw new Error('audit chain locked');
      },
    });
    const response = await handler.handle(signedRequest(command('daily')));

    expect(content(response)).toContain('출석 보상');
    expect(auditErrors).toHaveLength(1);
  });

  it('never lets a mention out of a reply, whoever wrote the text', async () => {
    const { handler } = handlerWith();
    const response = await handler.handle(signedRequest(command('history')));

    expect(content(response)).not.toContain('@everyone');
    expect(content(response)).toContain('에게 지급');
    expect(allowedMentions(response)).toMatchObject({ parse: [], users: [], roles: [] });
  });

  it('refuses a member without the required role, and audits nothing', async () => {
    const { handler, audited } = handlerWith();
    const payload = {
      ...command('balance'),
      member: { user: { id: MEMBER_ID }, roles: ['999999999999999999'] },
    };
    const response = await handler.handle(signedRequest(payload));

    expect(content(response)).toBe('이 명령어를 사용할 권한이 없습니다.');
    // Nothing was executed, and there is no verified actor to attribute a row
    // to: the refusal happens before the identity lookup.
    expect(audited).toHaveLength(0);
  });

  it('refuses a body whose signature does not cover it', async () => {
    const { handler, audited } = handlerWith();
    const request = signedRequest(command('balance'));
    const response = await handler.handle({
      headers: request.headers,
      rawBody: Buffer.from(JSON.stringify(command('daily')), 'utf8'),
    });

    expect(response.status).toBe(401);
    expect(audited).toHaveLength(0);
  });
});
