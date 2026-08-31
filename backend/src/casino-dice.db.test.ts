import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, reachLendingGrade, rejectionOf } from './testing/database';

/**
 * Migration 100, executed.
 *
 * Three claims are made here and none of them can be checked by reading the
 * SQL. That the die is uniform, which `byte % 6` is not. That the daily caps
 * are one member's rather than one game's, which they stopped being the moment
 * a second game got its own table. And that the two protective triggers reach
 * the new table, which is true only because its columns are named the way the
 * triggers read them -- a rename nothing else would notice.
 *
 * The migrator connection is required rather than optional: every one of these
 * needs a member, a funded wallet and an open casino, and `moneyverse_app` can
 * create none of the three.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

/** The bar 14.3 sets before the casino may open at all. */
const TRIAL_SIZE = 1_000_000;

const GAMES = ['dice_parity', 'dice_number'] as const;

interface TrialRow {
  readonly trial_id: string;
  readonly game: string;
  readonly trials: string;
  readonly wins: string;
  readonly face_counts: readonly string[];
  readonly rejected_bytes: string;
  readonly expected_win_probability_ppm: number;
  readonly observed_win_probability_ppm: number;
  readonly z_score: string;
  readonly chi_square: string;
  readonly tolerance_sigma: string;
  readonly tolerance_chi_square: string;
  readonly passed: boolean;
  readonly replayed: boolean;
}

interface TermsRow {
  readonly game: string;
  readonly enabled: boolean;
  readonly daily_stake_used: string;
  readonly daily_loss_used: string;
  readonly remaining_stake: string;
  readonly remaining_loss: string;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly house_edge_ppm: number;
  readonly worst_case_loss: string;
  readonly net_win_at_max: string;
}

interface PlayRow {
  readonly play_id: string;
  readonly outcome_face: number;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly worst_case_loss: string;
}

function firstRow<T>(rows: readonly T[], what: string): T {
  const row = rows[0];
  if (row === undefined) throw new Error(`${what} returned no row`);
  return row;
}

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

function message(error: unknown): string {
  return String((error as { message?: unknown } | null)?.message ?? '');
}

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)('the two dice games', () => {
  let pool: Pool;
  let migrator: Pool;
  const trials = new Map<string, TrialRow>();

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    // Committed, not rolled back: the activation gate below reads these, and
    // so does anything else that wants to open the casino on this database.
    for (const game of GAMES) {
      const { rows } = await pool.query<TrialRow>(
        'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
        [randomUUID(), game, TRIAL_SIZE],
      );
      trials.set(game, firstRow(rows, `the ${game} trial`));
    }
  }, 300_000);

  afterAll(async () => {
    await pool.end();
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

  /**
   * Runs something expected to fail and leaves the transaction usable. A
   * statement that raises aborts the transaction, so a case that asserts a
   * refusal and then asserts what is still allowed needs a savepoint.
   */
  const refused = async (client: PoolClient, attempt: () => Promise<unknown>): Promise<unknown> => {
    await client.query('SAVEPOINT expected_refusal');
    const error = await rejectionOf(attempt);
    await client.query('ROLLBACK TO SAVEPOINT expected_refusal');
    return error;
  };

  /** A funded member, with the casino open. */
  const player = async (client: PoolClient): Promise<string> => {
    await client.query(
      "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'casino'",
    );
    const id = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)
       RETURNING id`,
      [id],
    );
    const wallet = firstRow(rows, 'the new cash wallet').id;
    await client.query('INSERT INTO public.account_balances (account_id) VALUES ($1)', [wallet]);
    await client.query(
      `SELECT public.economy_post_transaction(
         $1, 'ADMIN_ADJUSTMENT', $2, NULL,
         jsonb_build_array(
           jsonb_build_object('accountId', (SELECT id FROM public.accounts WHERE system_key = 'mint'),
                              'amount', 100000, 'direction', 'credit'),
           jsonb_build_object('accountId', $3::uuid, 'amount', 100000, 'direction', 'debit')
         ), 'test.funded', '{}'::jsonb)`,
      [randomUUID(), id, wallet],
    );
    return id;
  };

  const playDice = (
    client: PoolClient,
    actor: string,
    game: string,
    choice: string,
    stake: number,
    key: string = randomUUID(),
  ) =>
    client.query<PlayRow>(
      `SELECT * FROM public.casino_play_dice($1::uuid, $2::uuid, $3::text, $4::text, $5::bigint)`,
      [key, actor, game, choice, stake],
    );

  const playCoin = (client: PoolClient, actor: string, stake: number) =>
    client.query(`SELECT public.casino_play_coin($1::uuid, $2::uuid, 'heads', $3::bigint)`, [
      randomUUID(),
      actor,
      stake,
    ]);

  const termsFor = async (client: PoolClient, actor: string): Promise<Map<string, TermsRow>> => {
    const { rows } = await client.query<TermsRow>(
      `SELECT game, enabled,
              daily_stake_used::text, daily_loss_used::text,
              remaining_stake::text, remaining_loss::text,
              win_probability_ppm, payout_multiplier_ppm, house_edge_ppm,
              worst_case_loss::text, net_win_at_max::text
       FROM public.casino_game_terms($1::uuid)`,
      [actor],
    );
    return new Map(rows.map((row) => [row.game, row] as const));
  };

  const termsRow = (rows: Map<string, TermsRow>, game: string): TermsRow => {
    const row = rows.get(game);
    if (row === undefined) throw new Error(`casino_game_terms did not report ${game}`);
    return row;
  };

  describe('the die, and the modulo bias it refuses to have', () => {
    /**
     * The whole of requirement one, in one assertion, and it needs no
     * randomness at all: `byte % 6` gives faces 1-4 forty-three byte values
     * each and faces 5-6 forty-two. Rejecting everything at or above 252 makes
     * the six counts equal, which is what the published 16.67% means.
     */
    it('gives every face exactly forty-two of the two hundred and fifty-two accepted bytes', async () => {
      const { rows } = await pool.query<{ face: number | null; drawn: string }>(
        `SELECT public.casino_dice_face_for_byte(byte_value) AS face, count(*)::text AS drawn
           FROM generate_series(0, 255) AS byte_value
          GROUP BY 1 ORDER BY 1 NULLS LAST`,
      );
      const counts = new Map(rows.map((row) => [row.face, row.drawn] as const));
      for (const face of [1, 2, 3, 4, 5, 6]) {
        expect(counts.get(face), `byte values showing ${face}`).toBe('42');
      }
      expect(counts.get(null), 'byte values rejected as 252..255').toBe('4');
    });

    it('rejects exactly the four bytes above the largest multiple of six', async () => {
      const { rows } = await pool.query<{ byte_value: number; face: number | null }>(
        `SELECT byte_value, public.casino_dice_face_for_byte(byte_value) AS face
           FROM unnest(ARRAY[0, 5, 6, 250, 251, 252, 253, 255]) AS byte_value`,
      );
      const faces = new Map(rows.map((row) => [row.byte_value, row.face] as const));
      expect(faces.get(0)).toBe(1);
      expect(faces.get(5)).toBe(6);
      expect(faces.get(6)).toBe(1);
      expect(faces.get(251), 'the last accepted byte').toBe(6);
      for (const byte of [252, 253, 255]) {
        expect(faces.get(byte), `byte ${byte} must be rejected`).toBeNull();
      }
    });

    it('refuses a value that is not a byte', async () => {
      for (const byte of [256, -1]) {
        await expect(
          pool.query('SELECT public.casino_dice_face_for_byte($1::integer)', [byte]),
        ).rejects.toMatchObject({ code: '22023' });
      }
    });

    // The roller is the only thing that turns rejection into a face, and the
    // one property that has to hold every single time is that it never returns
    // a rejected draw.
    it('never rolls anything but one through six', async () => {
      const { rows } = await migrator.query<{ low: number; high: number; distinct: string }>(
        `SELECT min(roll)::integer AS low, max(roll)::integer AS high,
                count(DISTINCT roll)::text AS distinct
           FROM (SELECT public.casino_roll_die() AS roll
                   FROM generate_series(1, 600)) AS rolled`,
      );
      const rolled = firstRow(rows, 'six hundred rolls');
      expect(rolled.low).toBe(1);
      expect(rolled.high).toBe(6);
      expect(rolled.distinct, 'six hundred rolls should show all six faces').toBe('6');
    });

    // Counted off the mapping rather than written down beside it, so biasing
    // the die also moves the number the screen shows.
    it('derives each game’s disclosed probability from that same mapping', async () => {
      const { rows } = await pool.query<{ parity: number; number: number }>(
        `SELECT public.casino_dice_win_probability_ppm('dice_parity') AS parity,
                public.casino_dice_win_probability_ppm('dice_number') AS number`,
      );
      const disclosed = firstRow(rows, 'the disclosed probabilities');
      expect(disclosed.parity, 'three faces of six').toBe(500_000);
      // 1/6 is 166,666.67 ppm and the disclosure floors, so it is never a
      // better chance than the member actually has.
      expect(disclosed.number, 'one face of six').toBe(166_666);
    });

    it('refuses a game it does not run', async () => {
      await expect(
        pool.query('SELECT public.casino_dice_win_probability_ppm($1::text)', ['dice_roulette']),
      ).rejects.toMatchObject({ code: '22023' });
    });
  });

  describe('the distribution trial each game needs', () => {
    it.each(GAMES)('rolls at least the full million for %s', (game) => {
      const trial = trials.get(game);
      expect(trial, `no trial was recorded for ${game}`).toBeDefined();
      expect(BigInt(trial?.trials ?? '0') >= BigInt(TRIAL_SIZE)).toBe(true);
      expect(trial?.replayed).toBe(false);
    });

    /**
     * The assertion a win-share z-test cannot make. Under `byte % 6` the six
     * faces score about 122 here while an honest die sits near five, and the
     * tolerance is 40 -- so this is the test that would have caught the biased
     * mapping, and the z-score beside it would not have: 주사위 홀짝 is exactly
     * fair under that bias and 주사위 숫자 맞히기 is only 3.5 sigma out.
     */
    it.each(GAMES)('finds the six faces evenly spread for %s', (game) => {
      const trial = trials.get(game);
      const chi = Number(trial?.chi_square ?? 'NaN');
      expect(chi, 'the six-face chi-square').toBeLessThanOrEqual(
        Number(trial?.tolerance_chi_square ?? '0'),
      );
      expect(Number(trial?.tolerance_chi_square), 'five degrees of freedom').toBe(40);
      expect(trial?.passed, 'the trial recorded itself as passing').toBe(true);
    });

    it.each(GAMES)('records six face counts that add up to the rolls made for %s', (game) => {
      const trial = trials.get(game);
      const counts = (trial?.face_counts ?? []).map((count) => BigInt(count));
      expect(counts, 'a die has six faces').toHaveLength(6);
      const total = counts.reduce((sum, count) => sum + count, 0n);
      expect(total, 'the face counts must account for every roll').toBe(BigInt(trial?.trials ?? '0'));
      // About one byte in sixty-four is thrown away; a run that rejected none
      // would mean the rejection branch never fired.
      expect(BigInt(trial?.rejected_bytes ?? '0') > 0n, 'no byte was ever rejected').toBe(true);
    });

    it.each(GAMES)('keeps the observed win share on the disclosure for %s', (game) => {
      const trial = trials.get(game);
      expect(Math.abs(Number(trial?.z_score ?? 'NaN'))).toBeLessThanOrEqual(5);
      expect(
        Math.abs(
          (trial?.observed_win_probability_ppm ?? 0) - (trial?.expected_win_probability_ppm ?? 0),
        ),
      ).toBeLessThanOrEqual(5_000);
    });

    it('returns the original trial for a replayed key rather than rolling again', async () => {
      const key = randomUUID();
      const first = firstRow(
        (
          await pool.query<TrialRow>(
            'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
            [key, 'dice_parity', 1000],
          )
        ).rows,
        'the first trial',
      );
      const replay = firstRow(
        (
          await pool.query<TrialRow>(
            'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
            [key, 'dice_parity', 1000],
          )
        ).rows,
        'the replayed trial',
      );
      expect(replay.replayed).toBe(true);
      expect(replay.trial_id).toBe(first.trial_id);
      expect(replay.face_counts, 'a replay must not reroll').toEqual(first.face_counts);
    });

    it('refuses a key already used for another game or another size', async () => {
      const key = randomUUID();
      await pool.query(
        'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
        [key, 'dice_parity', 1000],
      );
      await expect(
        pool.query(
          'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
          [key, 'dice_number', 1000],
        ),
      ).rejects.toMatchObject({ code: '23505' });
      await expect(
        pool.query(
          'SELECT * FROM public.casino_run_dice_distribution_trial($1::uuid, $2::text, $3::bigint)',
          [key, 'dice_parity', 2000],
        ),
      ).rejects.toMatchObject({ code: '23505' });
    });
  });

  /**
   * 060's gate asked for one trial, about the coin. With three games that
   * would open the casino on evidence about a game a member need never play.
   */
  describe('the activation gate, now once per game', () => {
    const OPEN_THE_CASINO =
      "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'casino'";

    it.each(GAMES)('refuses to open the casino with no qualifying %s trial', async (game) => {
      await rolledBack(async (client) => {
        await client.query(
          `ALTER TABLE public.casino_dice_distribution_trials
             DISABLE TRIGGER casino_dice_distribution_trials_immutable`,
        );
        await client.query('DELETE FROM public.casino_dice_distribution_trials WHERE game = $1', [
          game,
        ]);
        const error = await refused(client, () => client.query(OPEN_THE_CASINO));
        expect(code(error)).toBe('55000');
        expect(message(error)).toContain(game);
      });
    });

    // A gate that refused everything would pass the two cases above and still
    // be broken.
    it('lets the casino open once every game has one on record', async () => {
      await rolledBack(async (client) => {
        const opened = await client.query(OPEN_THE_CASINO);
        expect(opened.rowCount, 'the recorded trials should have opened the way').toBe(1);
      });
    });

    it('never stands in the way of closing the casino', async () => {
      await rolledBack(async (client) => {
        await client.query(OPEN_THE_CASINO);
        await client.query(
          `ALTER TABLE public.casino_dice_distribution_trials
             DISABLE TRIGGER casino_dice_distribution_trials_immutable`,
        );
        await client.query('DELETE FROM public.casino_dice_distribution_trials');
        const closed = await client.query(
          `UPDATE public.feature_switches SET state = 'disabled' WHERE feature_key = 'casino'`,
        );
        expect(closed.rowCount, 'the casino could not be closed').toBe(1);
      });
    });
  });

  /**
   * The hole a second table opens, and the reason `casino_daily_usage` exists.
   * If each game counted only its own rows a member would get 3,000 WLD of
   * exposure per game and 1,500 of loss per game.
   */
  describe('the daily caps, which belong to the member and not to the game', () => {
    it('shows a coin stake against every game’s headroom', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        await playCoin(client, actor, 500);

        const terms = await termsFor(client, actor);
        for (const game of ['coin', ...GAMES]) {
          const row = termsRow(terms, game);
          expect(row.daily_stake_used, `${game} did not count the coin play`).toBe('500');
          expect(row.remaining_stake, `${game} headroom after a 500 coin stake`).toBe('2500');
        }
      });
    });

    it('shows a dice stake against the coin’s headroom', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        await playDice(client, actor, 'dice_parity', 'odd', 500);

        const { rows } = await client.query<{ daily_stake_used: string; remaining_stake: string }>(
          `SELECT daily_stake_used::text, remaining_stake::text
           FROM public.casino_coin_terms($1::uuid)`,
          [actor],
        );
        const coin = firstRow(rows, 'casino_coin_terms');
        expect(coin.daily_stake_used, 'the coin did not count the dice play').toBe('500');
        expect(coin.remaining_stake).toBe('2500');
      });
    });

    /**
     * Six maximum stakes is exactly the day's 3,000, whichever games they were
     * spread across. The loss cap of 1,500 can bind first on an unlucky run,
     * which is the control working rather than a failure, so either refusal is
     * accepted -- what is not accepted is a seventh play going through.
     */
    it('stops a member after 3,000 WLD spread across the games', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        for (let play = 0; play < 6; play += 1) {
          const attempt =
            play % 2 === 0
              ? () => playCoin(client, actor, 500)
              : () => playDice(client, actor, 'dice_parity', 'even', 500);
          const error = await refused(client, attempt);
          if (error !== null) {
            expect(message(error)).toMatch(/daily (stake|loss) limit/);
            return;
          }
        }
        const error = await refused(client, () =>
          playDice(client, actor, 'dice_number', '3', 500),
        );
        expect(message(error), 'a seventh maximum stake was allowed').toMatch(
          /daily (stake|loss) limit/,
        );
      });
    });

    // 060's meaning, which 099's settlement had quietly replaced with the
    // stake: the most this member can still lose today, not the size of the
    // bet they just placed.
    it('reports the worst case as the lesser remaining allowance, not the stake', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const terms = await termsFor(client, actor);
        const parity = termsRow(terms, 'dice_parity');
        expect(parity.remaining_stake).toBe('3000');
        expect(parity.remaining_loss).toBe('1500');
        expect(parity.worst_case_loss, 'the lesser of the two allowances').toBe('1500');

        const { rows } = await playDice(client, actor, 'dice_parity', 'odd', 500);
        const played = firstRow(rows, 'casino_play_dice');
        expect(played.worst_case_loss, 'not the 500 that was staked').not.toBe('500');
        expect(BigInt(played.worst_case_loss) <= 1500n).toBe(true);
      });
    });
  });

  describe('the two triggers, on the table the dice land in', () => {
    it('refuses a roll from a member who has locked themselves out', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        await client.query(
          `SELECT public.member_set_casino_self_limit($1, 1000, 1000,
             clock_timestamp() + interval '7 days')`,
          [actor],
        );
        const error = await refused(client, () =>
          playDice(client, actor, 'dice_number', '6', 100),
        );
        expect(code(error)).toBe('55000');
        expect(message(error)).toContain('locked yourself out');
      });
    });

    // The self-limit is a member's cap on their whole casino day, so a limit
    // spent on the coin has to bind the dice as well.
    it('counts a coin stake against the member’s own daily limit before a roll', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        await client.query('SELECT public.member_set_casino_self_limit($1, 500, 500, NULL)', [
          actor,
        ]);
        await playCoin(client, actor, 500);
        const error = await refused(client, () =>
          playDice(client, actor, 'dice_parity', 'odd', 100),
        );
        expect(code(error)).toBe('55000');
        expect(message(error)).toContain('your own daily stake limit');
      });
    });

    // 14.4: 대출 잔액이 있으면 카지노 이용 제한. It held for one game out of
    // three until the trigger reached this table.
    it('refuses a roll while a loan is outstanding', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        await reachLendingGrade(client, actor);
        await client.query('SELECT public.bank_borrow($1, $2, 500)', [randomUUID(), actor]);

        const error = await refused(client, () =>
          playDice(client, actor, 'dice_parity', 'even', 100),
        );
        expect(code(error)).toBe('55000');
        expect(message(error)).toContain('repay your loan');
      });
    });
  });

  describe('the arithmetic that makes both games return ninety-five percent', () => {
    it('prices the two games as the proposal does', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const terms = await termsFor(client, actor);

        const parity = termsRow(terms, 'dice_parity');
        expect(parity.win_probability_ppm).toBe(500_000);
        expect(parity.payout_multiplier_ppm, '1.9x').toBe(1_900_000);
        expect(parity.house_edge_ppm, '0.5 x 1.9 = 0.95').toBe(50_000);

        const number = termsRow(terms, 'dice_number');
        expect(number.win_probability_ppm).toBe(166_666);
        expect(number.payout_multiplier_ppm, '5.7x').toBe(5_700_000);
        // 166,666 x 5.7 leaves 949,996 ppm returned, so the edge is 50,004 --
        // five percent to two places, and the floor in the disclosed
        // probability is why it is not exactly 50,000.
        expect(number.house_edge_ppm).toBe(50_004);
      });
    });

    it('rounds a payout down rather than minting the fraction', async () => {
      const { rows } = await migrator.query<{ hundred: string; ten: string; fifteen: string }>(
        `SELECT public.casino_net_win(100, 5700000)::text AS hundred,
                public.casino_net_win(10, 5700000)::text AS ten,
                public.casino_net_win(15, 1900000)::text AS fifteen`,
      );
      const paid = firstRow(rows, 'the payout arithmetic');
      expect(paid.hundred, '100 x 4.7 net').toBe('470');
      expect(paid.ten).toBe('47');
      expect(paid.fifteen, '15 x 1.9 is 28.5, so the net is 13').toBe('13');
    });

    it('settles a roll at the net, and the ledger balances', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const { rows } = await playDice(client, actor, 'dice_number', '4', 100);
        const played = firstRow(rows, 'casino_play_dice');

        expect(played.outcome_face, 'a die shows one to six').toBeGreaterThanOrEqual(1);
        expect(played.outcome_face).toBeLessThanOrEqual(6);
        const net = Number(played.net_amount);
        expect([470, -100], `face ${played.outcome_face} paid ${net}`).toContain(net);
        expect(net === 470, 'a win must be the face that was chosen').toBe(
          played.outcome_face === 4,
        );

        const { rows: postings } = await client.query<{ amount: string; direction: string }>(
          'SELECT amount::text, direction FROM public.ledger_postings WHERE transaction_id = $1',
          [played.transaction_id],
        );
        expect(postings).toHaveLength(2);
        for (const posting of postings) expect(posting.amount).toBe(String(Math.abs(net)));
        expect(new Set(postings.map((posting) => posting.direction)).size).toBe(2);
      });
    });

    it('refuses a price that would stop a game being a sink', async () => {
      await rolledBack(async (client) => {
        // 6,000,000 ppm on a 1-in-6 game returns everything; 1,000,001 pays
        // nothing at all once the minimum stake is rounded.
        for (const multiplier of [6_000_000, 7_000_000, 1_000_001]) {
          const error = await refused(client, () =>
            client.query(
              `UPDATE public.casino_game_payouts SET payout_multiplier_ppm = $1
               WHERE game = 'dice_number'`,
              [multiplier],
            ),
          );
          expect(code(error), `${multiplier} was accepted`).toBe('23514');
        }
      });
    });

    it.each([9, 501])('refuses a stake of %i, outside the policy range', async (stake) => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const error = await refused(client, () =>
          playDice(client, actor, 'dice_parity', 'odd', stake),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('refuses a choice that does not belong to the game', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        for (const [game, choice] of [
          ['dice_parity', '3'],
          ['dice_number', 'odd'],
          ['dice_number', '7'],
          ['dice_roulette', 'red'],
        ] as const) {
          const error = await refused(client, () => playDice(client, actor, game, choice, 100));
          expect(code(error), `${game} accepted ${choice}`).toBe('22023');
        }
      });
    });
  });

  describe('a resent key', () => {
    it('returns the stored roll rather than rolling again', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const key = randomUUID();
        const first = firstRow(
          (await playDice(client, actor, 'dice_parity', 'odd', 100, key)).rows,
          'the first roll',
        );
        const replay = firstRow(
          (await playDice(client, actor, 'dice_parity', 'odd', 100, key)).rows,
          'the replayed roll',
        );

        expect(replay.replayed).toBe(true);
        expect(replay.play_id).toBe(first.play_id);
        expect(replay.outcome_face, 'a replay must not reroll').toBe(first.outcome_face);
        expect(replay.net_amount).toBe(first.net_amount);
        expect(replay.transaction_id).toBe(first.transaction_id);

        const { rows: ledger } = await client.query<{ posted: string }>(
          `SELECT count(*)::text AS posted FROM public.ledger_transactions
           WHERE idempotency_key = $1`,
          [key],
        );
        expect(firstRow(ledger, 'the ledger').posted, 'a replay must not post twice').toBe('1');
      });
    });

    it('refuses a key already settled on different terms', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const key = randomUUID();
        await playDice(client, actor, 'dice_parity', 'odd', 100, key);

        for (const [game, choice, stake] of [
          ['dice_parity', 'even', 100],
          ['dice_parity', 'odd', 200],
          ['dice_number', '1', 100],
        ] as const) {
          const error = await refused(client, () =>
            playDice(client, actor, game, choice, stake, key),
          );
          expect(code(error), `${game}/${choice}/${stake} was accepted`).toBe('23505');
        }
      });
    });

    it('refuses a receipt belonging to somebody else', async () => {
      await rolledBack(async (client) => {
        const actor = await player(client);
        const stranger = await player(client);
        const key = randomUUID();
        await playDice(client, actor, 'dice_number', '2', 100, key);

        const error = await refused(client, () =>
          playDice(client, stranger, 'dice_number', '2', 100, key),
        );
        expect(code(error)).toBe('28000');
      });
    });
  });

  describe('the role stays where every casino migration has put it', () => {
    it('cannot read the new tables directly', async () => {
      for (const table of [
        'virtual_casino_dice_plays',
        'casino_game_payouts',
        'casino_dice_distribution_trials',
      ]) {
        await expect(
          pool.query(`SELECT 1 FROM public.${table} LIMIT 1`),
          `${table} became readable`,
        ).rejects.toMatchObject({ code: '42501' });
      }
    });

    it('cannot rewrite a recorded dice trial', async () => {
      await expect(
        pool.query('DELETE FROM public.casino_dice_distribution_trials'),
      ).rejects.toMatchObject({ code: '42501' });
    });

    // Every refusal above has to come from a function deciding, never from the
    // role having lost a grant: both arrive as an error and only one of them
    // means the deployment is broken.
    it('is refused by the functions themselves, never by a missing grant', async () => {
      const unknown = '00000000-0000-4000-8000-000000000000';
      const attempts = [
        () => pool.query('SELECT * FROM public.casino_game_terms($1::uuid)', [unknown]),
        () => pool.query('SELECT * FROM public.casino_dice_fairness()'),
        () =>
          pool.query(
            'SELECT * FROM public.casino_play_dice($1::uuid, $2::uuid, $3, $4, $5::bigint)',
            [randomUUID(), unknown, 'dice_parity', 'odd', 100],
          ),
        () => pool.query('SELECT public.casino_dice_face_for_byte($1::integer)', [300]),
        () =>
          pool.query('SELECT * FROM public.casino_latest_qualifying_dice_trial($1::text)', [
            'dice_parity',
          ]),
      ];
      for (const attempt of attempts) {
        const error = await rejectionOf(attempt);
        expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
      }
    });
  });
});
