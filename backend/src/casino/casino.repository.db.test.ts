import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { CasinoInputError, CasinoRepository } from './casino.repository';

/**
 * The repository's own SQL, executed.
 *
 * `casino.db.test.ts` at the root of src covers what migrations 042 and 060
 * decide -- the coin's fairness, the distribution trial, the activation gate --
 * and `member-profile.db.test.ts` covers what 080 decides about a member's
 * self-exclusion. Neither runs a line of this module's SQL, and the mistakes
 * that live in that SQL are invisible to every other kind of test: a mistyped
 * OUT parameter name yields `undefined` with no type error, and a dropped
 * `::text` yields a rounded number with no error at all.
 *
 * So these go through `CasinoRepository` rather than through raw queries. The
 * connection is `moneyverse_app`, the role the API runs as, which is also what
 * makes the last block here meaningful: every refusal has to come from a
 * function deciding, never from the role having lost a grant.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

/** A well-formed uuid that is nobody. The read functions answer for it anyway. */
const NOBODY = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the casino repository against a real database', () => {
  let pool: Pool;
  let casino: CasinoRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    casino = new CasinoRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('the switch every route consults', () => {
    // 059 seeds the casino disabled and 060's trigger will not let it leave
    // that state without a passing million-play trial, so a state read back
    // here that is not one of the four is schema drift, not a passing test.
    it('reads the casino switch back as one of the four states 059 allows', async () => {
      const state = await casino.switchState();
      expect(['enabled', 'paused', 'safe_mode', 'disabled']).toContain(state);
    });
  });

  describe('the terms a member is shown before staking', () => {
    it('answers with exactly the columns 060 declares', async () => {
      const terms = await casino.terms(NOBODY);
      expect(Object.keys(terms).sort()).toEqual(
        [
          'daily_loss_limit',
          'daily_loss_used',
          'daily_stake_limit',
          'daily_stake_used',
          'enabled',
          'house_edge_ppm',
          'max_stake',
          'min_stake',
          'payout_multiplier_ppm',
          'remaining_loss',
          'remaining_stake',
          'win_probability_ppm',
          'worst_case_loss',
        ].sort(),
      );
    });

    /**
     * The cast that has to be in the SELECT. Every one of these is a bigint,
     * and a bigint that reaches JavaScript as a number is a balance that
     * rounds -- silently, and only for the members with the most of it.
     */
    it('keeps every amount a string and every probability a number', async () => {
      const terms = await casino.terms(NOBODY);
      for (const [name, value] of Object.entries({
        min_stake: terms.min_stake,
        max_stake: terms.max_stake,
        daily_stake_limit: terms.daily_stake_limit,
        daily_loss_limit: terms.daily_loss_limit,
        daily_stake_used: terms.daily_stake_used,
        daily_loss_used: terms.daily_loss_used,
        remaining_stake: terms.remaining_stake,
        remaining_loss: terms.remaining_loss,
        worst_case_loss: terms.worst_case_loss,
      })) {
        expect(typeof value, `${name} must stay a string`).toBe('string');
        expect(() => BigInt(value), `${name} must be a canonical integer`).not.toThrow();
      }
      for (const [name, value] of Object.entries({
        win_probability_ppm: terms.win_probability_ppm,
        payout_multiplier_ppm: terms.payout_multiplier_ppm,
        house_edge_ppm: terms.house_edge_ppm,
      })) {
        expect(typeof value, `${name} is an integer column, not an amount`).toBe('number');
      }
      expect(typeof terms.enabled).toBe('boolean');
    });

    // The four constraints 060 puts on public.casino_policy, read back through
    // the function rather than off the table. A policy that violated any of
    // them would advertise a stake the game then refuses.
    it('reports a policy that leaves room for the bet it advertises', async () => {
      const terms = await casino.terms(NOBODY);
      expect(BigInt(terms.max_stake) >= BigInt(terms.min_stake)).toBe(true);
      expect(BigInt(terms.daily_stake_limit) >= BigInt(terms.max_stake)).toBe(true);
      expect(BigInt(terms.daily_loss_limit) >= BigInt(terms.max_stake)).toBe(true);
      expect(BigInt(terms.daily_loss_limit) < BigInt(terms.daily_stake_limit)).toBe(true);
    });

    /**
     * The controller gates on `switchState()` while the terms carry the
     * function's own reading of the same switch. Two round trips, so they can
     * legitimately disagree if an operator moves the switch between them --
     * but not here, and if they ever disagree at rest one of the two is asking
     * the wrong question.
     */
    it('agrees with the switch the routes are gated on', async () => {
      const [terms, state] = await Promise.all([casino.terms(NOBODY), casino.switchState()]);
      expect(terms.enabled).toBe(state === 'enabled');
    });

    it('refuses an actor that is not a uuid before it reaches the database', async () => {
      await expect(casino.terms('not-a-uuid')).rejects.toBeInstanceOf(CasinoInputError);
    });
  });

  describe('the fairness disclosure', () => {
    it('answers with exactly the columns the two functions declare', async () => {
      const fairness = await casino.fairness();
      expect(Object.keys(fairness).sort()).toEqual(
        [
          'created_at',
          'expected_win_probability_ppm',
          'heads',
          'observed_win_probability_ppm',
          'tolerance_sigma',
          'trial_id',
          'trials',
          'win_probability_ppm',
          'z_score',
        ].sort(),
      );
      expect(fairness.win_probability_ppm, 'one half, in parts per million').toBe(500_000);
    });

    /**
     * A trial either qualifies or none does, and this file cannot know which:
     * `casino.db.test.ts` records a real million-draw trial and commits it, and
     * nothing orders the two files. What must hold either way is that the trial
     * columns move together -- a half-populated row would mean the LATERAL
     * matched something it should not have.
     */
    it('carries the trial whole or not at all', async () => {
      const fairness = await casino.fairness();
      const columns = [
        fairness.trial_id,
        fairness.trials,
        fairness.heads,
        fairness.expected_win_probability_ppm,
        fairness.observed_win_probability_ppm,
        fairness.z_score,
        fairness.tolerance_sigma,
        fairness.created_at,
      ];
      const present = columns.filter((value) => value !== null).length;
      expect([0, columns.length]).toContain(present);
      if (fairness.trials !== null) {
        expect(typeof fairness.trials, 'a trial count is a bigint').toBe('string');
        expect(BigInt(fairness.trials) >= 1_000_000n, 'only a qualifying trial').toBe(true);
      }
    });
  });

  describe('the game, with the casino closed', () => {
    // Local validation, which never reaches SQL. The database is the authority
    // on all three; this is what turns a malformed argument into a sentence
    // about the field instead of one about a function.
    it('refuses a face that is not on the coin', async () => {
      await expect(casino.play(randomUUID(), NOBODY, 'edge', 100)).rejects.toBeInstanceOf(
        CasinoInputError,
      );
    });

    it('refuses a stake that is not a whole number above zero', async () => {
      for (const stake of [0, -1, 1.5, '100', Number.MAX_SAFE_INTEGER + 2]) {
        await expect(
          casino.play(randomUUID(), NOBODY, 'heads', stake),
          `stake ${String(stake)} was accepted`,
        ).rejects.toBeInstanceOf(CasinoInputError);
      }
    });

    /**
     * The refusal the controller has to be able to recognise. 060 raises 55000
     * for a closed casino and the repository must not translate, wrap or
     * swallow it -- the controller reads the SQLSTATE, then consults the
     * switch to tell "the casino is shut" apart from the other things 55000
     * means here.
     *
     * Skipped while the casino is open, because then this play would be a real
     * bet against a member who does not exist.
     */
    it('lets a closed casino reach the caller as 55000', async () => {
      if ((await casino.switchState()) === 'enabled') return;
      const error = await rejectionOf(() => casino.play(randomUUID(), NOBODY, 'heads', 100));
      expect(code(error)).toBe('55000');
    });
  });

  describe('the self-limit a member sets on themselves', () => {
    it('refuses a negative limit before it reaches the database', async () => {
      await expect(casino.setSelfLimit(NOBODY, -1, 0, null)).rejects.toBeInstanceOf(
        CasinoInputError,
      );
      await expect(casino.setSelfLimit(NOBODY, 0, -1, null)).rejects.toBeInstanceOf(
        CasinoInputError,
      );
    });

    it('refuses a lock moment that is not a timestamp', async () => {
      await expect(casino.setSelfLimit(NOBODY, 100, 50, 'next tuesday')).rejects.toBeInstanceOf(
        CasinoInputError,
      );
    });

    /**
     * A lock already in the past would be no lock at all. 080 checks it before
     * it checks the member, so this reaches 22023 rather than 28000 -- which
     * is also what proves the moment arrived as a timestamptz and not as text
     * the function never parsed.
     */
    it('refuses a lock moment already behind us', async () => {
      const error = await rejectionOf(() =>
        casino.setSelfLimit(NOBODY, 100, 50, '2020-01-01T00:00:00Z'),
      );
      expect(code(error)).toBe('22023');
    });

    // Parameter order, proved. The actor comes first for this write because it
    // has no idempotency key, and a member who is not active cannot set a
    // limit at all.
    it('refuses an actor who is not an active member', async () => {
      const error = await rejectionOf(() => casino.setSelfLimit(NOBODY, 100, 50, null));
      expect(code(error)).toBe('28000');
    });
  });

  /**
   * Every refusal above has to be a function deciding, never the role having
   * lost a grant. Both arrive as an error and only one of them means the
   * deployment is broken -- and `member_set_casino_self_limit` is reached from
   * the application role nowhere else in these tests.
   */
  it('is refused by the functions themselves, never by a missing grant', async () => {
    const attempts = [
      () => casino.switchState(),
      () => casino.terms(NOBODY),
      () => casino.fairness(),
      () => casino.play(randomUUID(), NOBODY, 'heads', 100),
      () => casino.setSelfLimit(NOBODY, 100, 50, null),
    ];
    for (const attempt of attempts) {
      const error = await rejectionOf(attempt);
      expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
    }
  });

  /**
   * The one shape this module's SQL adds that the application role cannot
   * arrange for itself: no qualifying trial on record, which is the state
   * every deployment is in until the casino is first opened.
   *
   * A `LEFT JOIN LATERAL` is what makes that answer one row instead of none.
   * Without it the route answers 200 with an empty body, and a screen cannot
   * tell that apart from "the coin has no odds".
   *
   * The DELETE is the reason this block needs the schema owner and a
   * transaction that is thrown away: the trials table is append-only for
   * everyone, its owner included, so the absence has to be built rather than
   * found. `casino.db.test.ts` does the same for the same reason, and both are
   * the only places a DELETE against that table appears.
   */
  describe.skipIf(!MIGRATOR_DATABASE_URL)('with no qualifying trial on record', () => {
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

    it('still discloses the odds, on one row, with the trial null', async () => {
      await rolledBack(async (client) => {
        await client.query(
          `ALTER TABLE public.casino_coin_distribution_trials
             DISABLE TRIGGER casino_coin_distribution_trials_immutable`,
        );
        await client.query('DELETE FROM public.casino_coin_distribution_trials');

        // A PoolClient satisfies Queryable structurally, which is what lets the
        // repository run inside this transaction rather than beside it.
        const inTransaction = new CasinoRepository(client);
        const fairness = await inTransaction.fairness();
        expect(fairness.win_probability_ppm).toBe(500_000);
        expect(fairness.trial_id, 'no trial qualifies here').toBeNull();
        expect(fairness.trials).toBeNull();
        expect(fairness.created_at).toBeNull();
      });
    });
  });
});
