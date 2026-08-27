import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl, isMissingGrant, rejectionOf } from './testing/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgresBoardRepository } from './board/board.repository';
import { BoardService } from './board/board.service';
import { PostgresEconomyReconciliationRepository } from './economy/reconciliation.repository';
import { EconomyReconciliationService } from './economy/reconciliation.service';
import { PostgresPrivacyRequestRepository } from './privacy/privacy.repository';
import { PrivacyRequestService } from './privacy/privacy.service';

const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

describe.skipIf(!DATABASE_URL)('board, privacy and reconciliation against a real database', () => {
  let pool: Pool;
  let board: BoardService;
  let privacy: PrivacyRequestService;
  let reconciliation: EconomyReconciliationService;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 3 });
    board = new BoardService(new PostgresBoardRepository(pool));
    privacy = new PrivacyRequestService(new PostgresPrivacyRequestRepository(pool));
    reconciliation = new EconomyReconciliationService({
      repository: new PostgresEconomyReconciliationRepository(pool),
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  // member_board_list raises 28000 for an actor with no active account: the
  // board is members-only and the function decides that, not the route.
  it('refuses the board listing to an account that does not exist', async () => {
    await expect(board.list(UNKNOWN)).rejects.toMatchObject({ code: '28000' });
  });

  it('refuses to create a post for a user that does not exist', async () => {
    await expect(
      board.create(UNKNOWN, { title: 'probe', body: 'probe', idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  it('reports nothing deleted for a post that does not exist', async () => {
    const outcome = await board.remove(UNKNOWN, randomUUID(), randomUUID()).then(
      (value) => value,
      () => 'threw' as const,
    );
    expect(outcome === false || outcome === 'threw').toBe(true);
  });

  it('refuses the privacy request list to an account that does not exist', async () => {
    await expect(privacy.myRequests(UNKNOWN)).rejects.toThrow('active account required');
  });

  it('refuses a privacy request for an account that does not exist', async () => {
    await expect(
      privacy.createRequest(UNKNOWN, { requestType: 'access', idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  it('rejects an unsupported request type before querying', async () => {
    await expect(
      privacy.createRequest(UNKNOWN, { requestType: 'nonsense', idempotencyKey: randomUUID() }),
    ).rejects.toThrow(/supported privacy request type/);
  });

  // The read model is administrator-gated inside the function, so an unknown
  // actor is refused there rather than by the application. It raises 42501 to
  // say so -- the same SQLSTATE PostgreSQL uses for a missing grant, which is
  // why isMissingGrant() below reads the message rather than the code.
  it('refuses the reconciliation read model to a caller with no role', async () => {
    await expect(reconciliation.latestHealth(UNKNOWN)).rejects.toThrow(
      'active approver role required for reconciliation health',
    );
  });

  it('is refused by the functions themselves, never by a missing grant', async () => {
    const attempts: readonly (() => Promise<unknown>)[] = [
      () => board.list(UNKNOWN),
      () => privacy.myRequests(UNKNOWN),
      () => reconciliation.latestHealth(UNKNOWN),
    ];
    for (const attempt of attempts) {
      const error = await rejectionOf(attempt);
      expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
    }
  });
});
