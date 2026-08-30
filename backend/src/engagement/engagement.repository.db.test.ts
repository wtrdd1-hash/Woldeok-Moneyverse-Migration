import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { EngagementInputError, EngagementRepository } from './engagement.repository';

/**
 * The repository's own SQL, executed.
 *
 * `engagement.db.test.ts` at the root of src covers what migrations 081 and
 * 082 decide -- a quest that completes, a title that lands, a work signal
 * nobody has to report -- and does it with raw statements. It never runs a
 * line of this module's SQL, and the mistakes that live in that SQL are
 * invisible to every other kind of test: a mistyped OUT parameter name yields
 * `undefined` with no type error, and a bound copied out of a migration goes
 * stale with no error at all.
 *
 * So these go through `EngagementRepository`. The outer connection is
 * `moneyverse_app`, the role the API runs as, which is what makes the
 * missing-grant block meaningful: every refusal has to come from a function
 * deciding, never from the role having lost a grant.
 *
 * Nothing here covers the NPC order, which no other test reaches at all: it
 * is the one function in 082 that writes through a second function, and the
 * affinity and the quest it advances have to move together or not at all.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

/** A well-formed uuid that is nobody. Every function here refuses it. */
const NOBODY = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the engagement repository against a real database', () => {
  let pool: Pool;
  let engagement: EngagementRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    engagement = new EngagementRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * Refused before a statement is sent. None of these reaches the database,
   * which is also what makes them safe to run against a shared one.
   */
  describe('what never reaches the database', () => {
    it('refuses an actor that is not a uuid', async () => {
      await expect(engagement.dashboard('me')).rejects.toBeInstanceOf(EngagementInputError);
    });

    it('refuses a goal code that is not the shape 081 allows', async () => {
      for (const bad of ['AB', 'Ab_cd', 'x'.repeat(65), 'first wage', '']) {
        const error = await rejectionOf(() =>
          engagement.recordProgress(randomUUID(), NOBODY, bad, 1),
        );
        expect(error, bad).toBeInstanceOf(EngagementInputError);
      }
    });

    it('refuses an npc code that is not the shape 081 allows', async () => {
      await expect(
        engagement.recordNpcOrder(randomUUID(), NOBODY, 'Market Keeper'),
      ).rejects.toBeInstanceOf(EngagementInputError);
    });

    it('refuses an amount outside the bounds 082 enforces', async () => {
      for (const bad of [0, -1, 1001, 1.5, '1']) {
        const error = await rejectionOf(() =>
          engagement.recordProgress(randomUUID(), NOBODY, 'first_wage', bad),
        );
        expect(error, String(bad)).toBeInstanceOf(EngagementInputError);
      }
    });

    it('refuses a notification preference that is not a boolean', async () => {
      await expect(engagement.setPreferences(NOBODY, 'yes')).rejects.toBeInstanceOf(
        EngagementInputError,
      );
    });
  });

  /**
   * Every one of these raises before it writes anything, which is what makes
   * them safe against a database the rest of the suite shares.
   */
  describe('a caller who is not an active member', () => {
    it('is refused the summary', async () => {
      const error = await rejectionOf(() => engagement.dashboard(NOBODY));
      expect(code(error)).toBe('28000');
    });

    it('is refused a progress record', async () => {
      const error = await rejectionOf(() =>
        engagement.recordProgress(randomUUID(), NOBODY, 'first_wage', 1),
      );
      expect(code(error)).toBe('28000');
    });

    it('is refused an npc order', async () => {
      const error = await rejectionOf(() =>
        engagement.recordNpcOrder(randomUUID(), NOBODY, 'market_keeper'),
      );
      expect(code(error)).toBe('28000');
    });

    it('is refused a preference', async () => {
      const error = await rejectionOf(() => engagement.setPreferences(NOBODY, false));
      expect(code(error)).toBe('28000');
    });
  });

  /**
   * Every refusal above has to be a function deciding, never the role having
   * lost a grant. Both arrive as an error and only one of them means the
   * deployment is broken.
   */
  it('is refused by the functions themselves, never by a missing grant', async () => {
    const attempts = [
      () => engagement.dashboard(NOBODY),
      () => engagement.recordProgress(randomUUID(), NOBODY, 'first_wage', 1),
      () => engagement.recordNpcOrder(randomUUID(), NOBODY, 'market_keeper'),
      () => engagement.setPreferences(NOBODY, false),
    ];
    for (const attempt of attempts) {
      const error = await rejectionOf(attempt);
      expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
    }
  });

  /**
   * Everything that writes. The schema owner's connection is what can create
   * a member to write for, and every case runs inside a transaction that is
   * thrown away: a committed quest completion hands a title to a member every
   * later test in the run can see.
   */
  describe.skipIf(!MIGRATOR_DATABASE_URL)('for a member who is really there', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    const member = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      return id;
    };

    // A PoolClient satisfies Queryable structurally, which is what lets the
    // repository run inside the transaction rather than beside it.
    const repositoryIn = (client: PoolClient): EngagementRepository =>
      new EngagementRepository(client);

    /**
     * A refusal, taken inside a savepoint.
     *
     * A statement that raises marks the whole transaction aborted, and every
     * later statement answers 25P02 until something rolls back -- so a case
     * that asserts a refusal and then reads the rows would fail on the
     * reading rather than on what it came to check.
     */
    const refusalOf = async (
      client: PoolClient,
      attempt: () => Promise<unknown>,
    ): Promise<unknown> => {
      await client.query('SAVEPOINT probe');
      const error = await rejectionOf(attempt);
      await client.query(
        error === null ? 'RELEASE SAVEPOINT probe' : 'ROLLBACK TO SAVEPOINT probe',
      );
      return error;
    };

    it('answers the summary with exactly the columns 082 declares, on one row', async () => {
      await rolledBack(async (client) => {
        const board = await repositoryIn(client).dashboard(await member(client));
        expect(Object.keys(board).sort()).toEqual([
          'next_unlock',
          'notifications_enabled',
          'today_tasks',
          'weekly_goals',
        ]);
      });
    });

    /**
     * A member who has done nothing has goals standing at zero rather than no
     * goals, and no next unlock at all: `user_progression` has no row for
     * them yet. Null is the answer the screen has to render, and an object of
     * nulls would render an empty "next unlock" card forever.
     */
    it('starts a new member at zero, notified, with no next unlock', async () => {
      await rolledBack(async (client) => {
        const board = await repositoryIn(client).dashboard(await member(client));
        expect(Array.isArray(board.today_tasks)).toBe(true);
        expect(Array.isArray(board.weekly_goals)).toBe(true);
        for (const goal of [...board.today_tasks, ...board.weekly_goals]) {
          expect(goal.progress, goal.code).toBe(0);
          expect(typeof goal.title, goal.code).toBe('string');
        }
        expect(board.next_unlock).toBeNull();
        expect(board.notifications_enabled).toBe(true);
      });
    });

    it('records progress and reports the goal complete when its requirement is met', async () => {
      await rolledBack(async (client) => {
        const recorded = await repositoryIn(client).recordProgress(
          randomUUID(),
          await member(client),
          'first_wage',
          1,
        );
        expect(Object.keys(recorded).sort()).toEqual(['code', 'completed', 'progress', 'replayed']);
        expect(recorded.code).toBe('first_wage');
        expect(recorded.progress).toBe(1);
        expect(recorded.completed).toBe(true);
        expect(recorded.replayed).toBe(false);
      });
    });

    /**
     * The key is the identity of the command, not the code sent alongside it.
     * A retry that names a different goal has to answer with the goal the
     * first call recorded -- which is why the row is returned as the database
     * produced it rather than merged with the request.
     */
    it('answers a retry from the stored receipt, not from the repeated argument', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        const key = randomUUID();
        await repository.recordProgress(key, actor, 'first_wage', 1);
        const replay = await repository.recordProgress(key, actor, 'wise_spending', 1);
        expect(replay.replayed).toBe(true);
        expect(replay.code).toBe('first_wage');
        expect(replay.progress).toBe(1);
      });
    });

    it('refuses a receipt that belongs to somebody else', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const owner = await member(client);
        const stranger = await member(client);
        const key = randomUUID();
        await repository.recordProgress(key, owner, 'first_wage', 1);
        const error = await refusalOf(client, () =>
          repository.recordProgress(key, stranger, 'first_wage', 1),
        );
        expect(code(error)).toBe('28000');
      });
    });

    it('refuses a goal the catalogue does not carry', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        const error = await refusalOf(client, () =>
          repository.recordProgress(randomUUID(), actor, 'no_such_goal', 1),
        );
        expect(code(error)).toBe('22023');
      });
    });

    /**
     * The bound this module mirrors, checked against the function that owns
     * it. The repository refuses 1001 before it sends anything, so the only
     * way to know the two still agree is to send it around the repository. If
     * 082's ceiling ever moves, this fails, and the constant beside the
     * assertion helper is what has to change.
     */
    it('agrees with 082 about the largest amount it will record', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const error = await refusalOf(client, () =>
          client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1001)', [
            randomUUID(),
            actor,
            'first_wage',
          ]),
        );
        expect(code(error)).toBe('22023');

        const { rows } = await client.query<{ progress: number }>(
          `SELECT recorded.progress
           FROM public.engagement_record_progress($1, $2, $3, 1000) AS recorded`,
          [randomUUID(), actor, 'first_wage'],
        );
        expect(rows[0]?.progress).toBe(1000);
      });
    });

    it('takes an npc order and moves the affinity and the neighbour quest together', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        const placed = await repository.recordNpcOrder(randomUUID(), actor, 'market_keeper');
        expect(Object.keys(placed).sort()).toEqual(['affinity', 'npc_code', 'replayed']);
        expect(placed.npc_code).toBe('market_keeper');
        expect(placed.affinity).toBe(1);
        expect(placed.replayed).toBe(false);

        const board = await repository.dashboard(actor);
        const neighbour = board.today_tasks.find((goal) => goal.code === 'neighbour_help');
        expect(neighbour?.progress, 'the order advanced the quest it belongs to').toBe(1);
      });
    });

    it('counts a retried order once and a second order twice', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        const key = randomUUID();
        await repository.recordNpcOrder(key, actor, 'market_keeper');

        const replay = await repository.recordNpcOrder(key, actor, 'market_keeper');
        expect(replay.replayed).toBe(true);
        expect(replay.affinity).toBe(1);

        const second = await repository.recordNpcOrder(randomUUID(), actor, 'market_keeper');
        expect(second.replayed).toBe(false);
        expect(second.affinity).toBe(2);
      });
    });

    it('keeps affinity with one npc separate from affinity with another', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        await repository.recordNpcOrder(randomUUID(), actor, 'market_keeper');
        const courier = await repository.recordNpcOrder(randomUUID(), actor, 'courier');
        expect(courier.affinity).toBe(1);
      });
    });

    it('refuses an npc the directory does not carry', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        const error = await refusalOf(client, () =>
          repository.recordNpcOrder(randomUUID(), actor, 'nobody_here'),
        );
        expect(code(error)).toBe('22023');
      });
    });

    /**
     * `engagement_record_npc_order` shares the receipt table with
     * `engagement_record_progress` but, unlike it, does not check who the
     * receipt belongs to before answering a replay. What has to hold either
     * way is that a stranger holding somebody else's key cannot move that
     * member's affinity and is not told what it stands at -- so this asserts
     * the property rather than today's status code, and stays true if 082 is
     * later tightened to raise 28000 here as its sibling does.
     */
    it('does not let a stranger move or read an affinity with a borrowed key', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const owner = await member(client);
        const stranger = await member(client);
        const key = randomUUID();
        await repository.recordNpcOrder(key, owner, 'market_keeper');

        await client.query('SAVEPOINT borrowed');
        const attempt = await repository
          .recordNpcOrder(key, stranger, 'market_keeper')
          .then((row) => ({ row, error: null as unknown }))
          .catch((error: unknown) => ({ row: null, error }));
        await client.query(
          attempt.error === null ? 'RELEASE SAVEPOINT borrowed' : 'ROLLBACK TO SAVEPOINT borrowed',
        );

        if (attempt.error === null) {
          expect(attempt.row?.affinity, 'the owner’s affinity was disclosed').toBeNull();
        } else {
          expect(code(attempt.error)).toBe('28000');
        }

        const { rows } = await client.query<{ affinity: number }>(
          `SELECT relationship.affinity FROM public.npc_relationships AS relationship
           JOIN public.npc_profiles AS npc ON npc.id = relationship.npc_id
           WHERE relationship.user_id = $1 AND npc.code = 'market_keeper'`,
          [owner],
        );
        expect(rows[0]?.affinity, 'the owner’s affinity moved').toBe(1);
      });
    });

    it('stores a notification preference and reads it back through the summary', async () => {
      await rolledBack(async (client) => {
        const repository = repositoryIn(client);
        const actor = await member(client);
        expect(await repository.setPreferences(actor, false)).toBe(false);
        expect((await repository.dashboard(actor)).notifications_enabled).toBe(false);
        expect(await repository.setPreferences(actor, true)).toBe(true);
        expect((await repository.dashboard(actor)).notifications_enabled).toBe(true);
      });
    });
  });
});
