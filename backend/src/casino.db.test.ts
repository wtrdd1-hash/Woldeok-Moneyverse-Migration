import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { databaseUrl, isMissingGrant, rejectionOf } from './testing/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DATABASE_URL = databaseUrl();
// Opening the casino is a write to a table moneyverse_app cannot reach, so the
// trigger that refuses it can only be exercised by the role that owns the
// schema. CI supplies that connection; a run without it skips those tests
// rather than reporting a gate nobody checked.
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';
const OPEN_THE_CASINO =
  "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'casino'";

// A million draws, which is the bar spec 14.3 sets before the game may open at
// all. The trial runs inside PostgreSQL in one statement, so this is a couple
// of seconds of server CPU rather than a million round trips.
const TRIAL_SIZE = 1_000_000;

/**
 * Rows from the functions in 060-casino-coin-fairness.sql. bigint columns
 * arrive as strings, as they do everywhere else in this codebase, and so does
 * numeric.
 */
interface TrialRow {
  readonly trial_id: string;
  readonly trials: string;
  readonly heads: string;
  readonly expected_win_probability_ppm: number;
  readonly observed_win_probability_ppm: number;
  readonly z_score: string;
  readonly tolerance_sigma: string;
  readonly passed: boolean;
  readonly replayed: boolean;
}

interface TermsRow {
  readonly enabled: boolean;
  readonly min_stake: string;
  readonly max_stake: string;
  readonly daily_stake_limit: string;
  readonly daily_loss_limit: string;
  readonly daily_stake_used: string;
  readonly daily_loss_used: string;
  readonly remaining_stake: string;
  readonly remaining_loss: string;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly house_edge_ppm: number;
  readonly worst_case_loss: string;
}

/** A missing row is a failure of the function, not something to assert around. */
function firstRow<T>(rows: readonly T[], what: string): T {
  const row = rows[0];
  if (row === undefined) throw new Error(`${what} returned no row`);
  return row;
}

/**
 * The casino has no controller, service, repository or route -- 060 keeps it
 * that way on purpose, because spec 18.6 leaves the game closed for the MVP --
 * so these talk to the functions through the pool rather than through a
 * service, unlike the other *.db.test.ts files here.
 *
 * They connect as moneyverse_app, the role the application uses, which is also
 * why nothing below creates a member: that role cannot write `users` and
 * cannot flip the feature switch. What the application's own privileges can
 * reach is exactly what is asserted.
 *
 * The switch itself belongs to 059, not to this migration: the registry, its
 * four states and the casino's seed row are asserted in
 * admin/controls.db.test.ts. What is asserted here is what 060 does with it --
 * the game's gate, and the trial the casino may not be opened without.
 */
describe.skipIf(!DATABASE_URL)('casino coin fairness against a real database', () => {
  let pool: Pool;
  let trial: TrialRow;
  let terms: TermsRow;
  const trialKey = randomUUID();

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    const trialResult = await pool.query<TrialRow>(
      'SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)',
      [trialKey, TRIAL_SIZE],
    );
    trial = firstRow(trialResult.rows, 'casino_run_coin_distribution_trial');
    const termsResult = await pool.query<TermsRow>(
      'SELECT * FROM public.casino_coin_terms($1::uuid)',
      [UNKNOWN],
    );
    terms = firstRow(termsResult.rows, 'casino_coin_terms');
  }, 180_000);

  afterAll(async () => {
    await pool.end();
  });

  describe('the byte that decides the face', () => {
    /**
     * The whole defect in one assertion. 042 read `< 48`, so bytes 48..127
     * showed tails; every one of them is heads now, and 48 -- the old
     * threshold -- is the value that changes hands.
     */
    it('maps the low half of the byte range to heads and the high half to tails', async () => {
      const { rows } = await pool.query<{ byte_value: number; outcome: string }>(
        `SELECT face AS byte_value, public.casino_coin_outcome_for_byte(face) AS outcome
           FROM unnest(ARRAY[0, 47, 48, 126, 127, 128, 129, 200, 255]) AS face`,
      );
      const faces = new Map(rows.map((row) => [row.byte_value, row.outcome] as const));
      for (const byte of [0, 47, 48, 126, 127]) {
        expect(faces.get(byte), `byte ${byte} should be heads`).toBe('heads');
      }
      for (const byte of [128, 129, 200, 255]) {
        expect(faces.get(byte), `byte ${byte} should be tails`).toBe('tails');
      }
    });

    it('splits the 256 byte values exactly in half', async () => {
      const { rows } = await pool.query<{ heads: string; tails: string }>(
        `SELECT count(*) FILTER (WHERE public.casino_coin_outcome_for_byte(face) = 'heads') AS heads,
                count(*) FILTER (WHERE public.casino_coin_outcome_for_byte(face) = 'tails') AS tails
           FROM generate_series(0, 255) AS face`,
      );
      const split = firstRow(rows, 'the byte split');
      expect(split.heads, 'byte values showing heads').toBe('128');
      expect(split.tails, 'byte values showing tails').toBe('128');
    });

    it('refuses a value that is not a byte', async () => {
      await expect(
        pool.query('SELECT public.casino_coin_outcome_for_byte($1::integer)', [256]),
      ).rejects.toMatchObject({ code: '22023' });
      await expect(
        pool.query('SELECT public.casino_coin_outcome_for_byte($1::integer)', [-1]),
      ).rejects.toMatchObject({ code: '22023' });
    });

    // The number the screen shows is counted off the mapping above rather than
    // written down beside it. Biasing the coin moves this with it -- which is
    // the point, because then the disclosure stays true and this is what fails.
    it('derives the disclosed probability from that same mapping', async () => {
      const { rows } = await pool.query<{ ppm: number }>(
        'SELECT public.casino_coin_win_probability_ppm() AS ppm',
      );
      expect(firstRow(rows, 'the disclosed probability').ppm, 'win probability in ppm').toBe(
        500_000,
      );
    });
  });

  describe('the distribution trial spec 14.3 requires', () => {
    it('draws the full million', () => {
      expect(trial.trials).toBe(String(TRIAL_SIZE));
      expect(trial.replayed).toBe(false);
    });

    /**
     * The real statistical assertion. Under a fair coin the heads count is
     * Binomial(n, 1/2), so (heads - n/2) / sqrt(n/4) is standard normal and
     * five sigma is a false-failure rate near one run in 1.7 million. 042's
     * coin sits 625 sigma below the mean, so this is the assertion that would
     * have caught it.
     *
     * Number() on the counts is safe and is not a money value: they are draw
     * tallies bounded by the trial size, far inside Number.MAX_SAFE_INTEGER.
     */
    it('lands inside a five-sigma binomial interval around one half', () => {
      const trials = Number(trial.trials);
      const heads = Number(trial.heads);
      const z = (heads - trials * 0.5) / Math.sqrt(trials * 0.25);
      expect(Math.abs(z), `observed ${heads} heads in ${trials} draws`).toBeLessThanOrEqual(5);
      expect(
        Math.abs(Number(trial.z_score)),
        'the z-score the function recorded',
      ).toBeLessThanOrEqual(5);
      expect(trial.passed, 'the trial recorded itself as passing').toBe(true);
    });

    /**
     * A different claim from the interval above: not "close enough to fair"
     * but "nowhere near the bias that shipped". At a million draws 18.75% is
     * about 187,500 heads while the five-sigma band is 500,000 +/- 2,500, so
     * this can only fail if the old mapping came back.
     */
    it('is nowhere near the 18.75 percent heads share migration 042 produced', () => {
      const share = Number(trial.heads) / Number(trial.trials);
      expect(share, 'an unbiased coin').toBeGreaterThan(0.49);
      expect(share, 'an unbiased coin').toBeLessThan(0.51);
    });

    it('records the probability it expected alongside the one it observed', () => {
      expect(trial.expected_win_probability_ppm).toBe(500_000);
      expect(Math.abs(trial.observed_win_probability_ppm - 500_000)).toBeLessThanOrEqual(5_000);
      expect(Number(trial.tolerance_sigma)).toBe(5);
    });

    // The idempotency contract from 045, on the one function here a caller can
    // actually reach: the same key returns the original receipt rather than
    // drawing a second million.
    it('returns the original trial for a replayed key', async () => {
      const { rows } = await pool.query<TrialRow>(
        'SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)',
        [trialKey, TRIAL_SIZE],
      );
      const replay = firstRow(rows, 'the replayed trial');
      expect(replay.replayed, 'a repeated key must replay').toBe(true);
      expect(replay.trial_id).toBe(trial.trial_id);
      expect(replay.heads, 'a replay must not redraw').toBe(trial.heads);
      expect(replay.z_score).toBe(trial.z_score);
    });

    it('refuses a key that was used for a differently sized trial', async () => {
      await expect(
        pool.query('SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)', [
          trialKey,
          TRIAL_SIZE / 2,
        ]),
      ).rejects.toMatchObject({ code: '23505' });
    });

    it('refuses a trial too small to mean anything and one too large to bound', async () => {
      await expect(
        pool.query('SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)', [
          randomUUID(),
          999,
        ]),
      ).rejects.toMatchObject({ code: '22023' });
      await expect(
        pool.query('SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)', [
          randomUUID(),
          2_000_001,
        ]),
      ).rejects.toMatchObject({ code: '22023' });
    });

    // The row the feature switch's `distribution_trial` precondition has to
    // cite. A trial nobody can read back is not evidence of anything.
    it('offers the latest qualifying trial as the evidence the switch needs', async () => {
      const { rows } = await pool.query<{ trial_id: string; trials: string }>(
        'SELECT * FROM public.casino_latest_qualifying_distribution_trial()',
      );
      const latest = firstRow(rows, 'the latest qualifying trial');
      expect(Number(latest.trials)).toBeGreaterThanOrEqual(1_000_000);
    });
  });

  describe('disclosure before the stake, not after', () => {
    it('states the odds, the payout and the edge', () => {
      expect(terms.win_probability_ppm, 'one half, in ppm').toBe(500_000);
      // 099 priced the game as a sink: the coin stays exactly fair and the
      // payout carries the edge. This assertion was `2_000_000` and `0` --
      // even money, which returned every WLD the game took.
      expect(terms.payout_multiplier_ppm, '1.9x').toBe(1_900_000);
      // 0.5 x 1.9 = 0.95, so five percent of every stake is retired. This is
      // the arithmetic the distribution trial above is the evidence for.
      expect(terms.house_edge_ppm, 'expected loss per unit staked').toBe(50_000);
    });

    it('carries every limit as a canonical integer string', () => {
      for (const [name, value] of Object.entries({
        min_stake: terms.min_stake,
        max_stake: terms.max_stake,
        daily_stake_limit: terms.daily_stake_limit,
        daily_loss_limit: terms.daily_loss_limit,
        worst_case_loss: terms.worst_case_loss,
      })) {
        expect(typeof value, `${name} must stay a string`).toBe('string');
      }
      expect(terms.min_stake).toBe('10');
      expect(terms.max_stake).toBe('500');
      expect(terms.daily_stake_limit).toBe('3000');
      expect(terms.daily_loss_limit).toBe('1500');
    });

    // A member who has played nothing has spent neither allowance, and the
    // most they can lose today is the smaller of the two.
    it('reports full headroom and the worst case for a member with no plays today', () => {
      expect(terms.daily_stake_used).toBe('0');
      expect(terms.daily_loss_used).toBe('0');
      expect(terms.remaining_stake).toBe('3000');
      expect(terms.remaining_loss).toBe('1500');
      expect(terms.worst_case_loss, 'the lesser of the two allowances').toBe('1500');
    });

    it('tells the screen the game is closed', () => {
      expect(terms.enabled, 'spec 18.6 keeps the casino closed for the MVP').toBe(false);
    });
  });

  describe('the feature switch', () => {
    /**
     * 059 answers 'enabled' for a feature nobody registered -- a switch is a
     * way to take a feature away, and one nobody has taken away is on. That
     * default is exactly why this assertion is worth making from the casino's
     * side too: 'disabled' can only come from a row, so reading it back proves
     * the casino is registered and not merely unknown to the registry.
     */
    it('finds the casino registered, and registered disabled', async () => {
      const { rows } = await pool.query<{ state: string }>(
        'SELECT public.feature_switch_state($1::text) AS state',
        ['casino'],
      );
      expect(firstRow(rows, 'the casino switch').state).toBe('disabled');
    });
  });

  /**
   * The gate 060 adds to 059's registry: the casino row may not leave
   * 'disabled' while no passing trial of at least a million plays exists.
   *
   * Every test here runs inside a transaction that is rolled back whatever
   * happens. Nothing may leave the casino open behind it, and nothing may
   * leave a distribution trial deleted.
   */
  describe.skipIf(!MIGRATOR_DATABASE_URL)('the activation gate', () => {
    let migrator: Pool;

    /**
     * Migration 100 made the gate ask once per game, so opening the casino now
     * needs a qualifying trial for the two dice games as well as for the coin.
     * Recorded here rather than in the outer `beforeAll` because this is the
     * only block that opens the casino, and the two trials are a few seconds of
     * server CPU that the rest of the file has no use for.
     */
    beforeAll(async () => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
      for (const game of ['dice_parity', 'dice_number']) {
        await pool.query(
          'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
          [randomUUID(), game, TRIAL_SIZE],
        );
      }
    }, 300_000);

    afterAll(async () => {
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>) => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    /**
     * The trials table is append-only for everyone, its owner included, so the
     * absence this asserts against has to be built rather than found: the
     * immutability trigger comes off for the length of a transaction that is
     * thrown away. That is the only reason a DELETE appears in this file, and
     * the reason it appears nowhere outside one.
     */
    const withNoQualifyingTrial = async (client: PoolClient) => {
      await client.query(
        `ALTER TABLE public.casino_coin_distribution_trials
           DISABLE TRIGGER casino_coin_distribution_trials_immutable`,
      );
      await client.query('DELETE FROM public.casino_coin_distribution_trials');
    };

    it('refuses to open the casino while no qualifying trial exists', async () => {
      await rolledBack(async (client) => {
        await withNoQualifyingTrial(client);
        await expect(
          client.query(OPEN_THE_CASINO),
          'the casino opened with no distribution trial on record',
        ).rejects.toMatchObject({ code: '55000' });
      });
    });

    // The trial run in beforeAll is the evidence, so the same statement that
    // was refused above goes through here. A gate that refuses everything
    // would pass the test above and still be broken.
    it('lets the casino open once a qualifying trial is on record', async () => {
      await rolledBack(async (client) => {
        const opened = await client.query(OPEN_THE_CASINO);
        expect(opened.rowCount, 'the recorded trial should have opened the way').toBe(1);
      });
    });

    // A safety valve that can jam shut is not a safety valve. Closing the
    // casino is never the thing the evidence is for, so it is never refused --
    // not even with every trial gone.
    it('never stands in the way of closing the casino', async () => {
      await rolledBack(async (client) => {
        await client.query(OPEN_THE_CASINO);
        await withNoQualifyingTrial(client);
        const closed = await client.query(
          `UPDATE public.feature_switches SET state = 'disabled' WHERE feature_key = 'casino'`,
        );
        expect(closed.rowCount, 'the casino could not be closed').toBe(1);
      });
    });

    // Scoped to the casino row. The other two stage-3 features have their own
    // preconditions and none of them is a coin.
    it('leaves the other stage-3 switches alone', async () => {
      await rolledBack(async (client) => {
        await withNoQualifyingTrial(client);
        const moved = await client.query(
          `UPDATE public.feature_switches SET state = 'safe_mode'
             WHERE feature_key = 'stock_corporate_action'`,
        );
        expect(moved.rowCount, 'the casino trial gated an unrelated feature').toBe(1);
      });
    });
  });

  describe('the game itself', () => {
    const play = (choice: string, stake: number, key: string = randomUUID()) =>
      pool.query('SELECT * FROM public.casino_play_coin($1::uuid, $2::uuid, $3::text, $4::bigint)', [
        key,
        UNKNOWN,
        choice,
        stake,
      ]);

    it('refuses a face that is not on the coin', async () => {
      await expect(play('edge', 100)).rejects.toMatchObject({ code: '22023' });
    });

    // The stake bounds come from public.casino_policy now rather than from the
    // function body, and they are checked before anything else happens.
    it('refuses a stake under the policy minimum', async () => {
      await expect(play('heads', 9)).rejects.toMatchObject({ code: '22023' });
    });

    it('refuses a stake over the policy maximum', async () => {
      await expect(play('heads', 10_001)).rejects.toMatchObject({ code: '22023' });
    });

    /**
     * The switch gates the game before it looks at the member, the wallet or
     * the ledger, so a well-formed play is refused with 55000 and nothing
     * moves. That is what "the casino is closed" means in practice, and it is
     * also why the paths past this point -- the daily caps, a real toss, a
     * replayed play receipt -- are not exercised here: reaching them needs
     * both a member row and an open switch, and moneyverse_app can create
     * neither.
     */
    it('refuses a well-formed play while the switch is off', async () => {
      await expect(play('heads', 100)).rejects.toMatchObject({ code: '55000' });
    });

    it('refuses a malformed idempotency key', async () => {
      await expect(play('heads', 100, 'not-a-uuid')).rejects.toThrow();
    });
  });

  describe('the role stays where 042 and 060 put it', () => {
    it('cannot read any of the casino tables directly', async () => {
      for (const table of [
        'virtual_casino_coin_plays',
        'casino_policy',
        'casino_coin_distribution_trials',
        'feature_switches',
      ]) {
        await expect(
          pool.query(`SELECT 1 FROM public.${table} LIMIT 1`),
          `${table} became readable`,
        ).rejects.toMatchObject({ code: '42501' });
      }
    });

    // Opening the casino is a migrator's act with the evidence in hand, not
    // something the application can do to itself.
    it('cannot flip the feature switch', async () => {
      await expect(
        pool.query("UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = $1", [
          'casino',
        ]),
      ).rejects.toMatchObject({ code: '42501' });
    });

    it('cannot rewrite a recorded distribution trial', async () => {
      await expect(
        pool.query('DELETE FROM public.casino_coin_distribution_trials'),
      ).rejects.toMatchObject({ code: '42501' });
    });

    // Every refusal above must come from a function's own check, not from the
    // role having lost a grant -- both arrive as an error and only one of them
    // means the deployment is broken.
    it('is refused by the functions themselves, never by a missing grant', async () => {
      const attempts = [
        () =>
          pool.query(
            'SELECT * FROM public.casino_play_coin($1::uuid, $2::uuid, $3::text, $4::bigint)',
            [randomUUID(), UNKNOWN, 'heads', 100],
          ),
        () => pool.query('SELECT * FROM public.casino_coin_terms($1::uuid)', [UNKNOWN]),
        () => pool.query('SELECT public.casino_coin_outcome_for_byte($1::integer)', [300]),
        () =>
          pool.query(
            'SELECT * FROM public.casino_run_coin_distribution_trial($1::uuid, $2::bigint)',
            [randomUUID(), 1],
          ),
      ];
      for (const attempt of attempts) {
        const error = await rejectionOf(attempt);
        expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
      }
    });
  });
});
