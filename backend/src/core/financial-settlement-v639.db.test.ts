import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PvpArenaRepository } from '../casino/pvp-arena.repository';
import { BlackMarketRepository } from '../marketplace/black-market.repository';

const v639Enabled = process.env.V639_DB_ISOLATED === 'yes';
const v654Enabled = process.env.V654_DB_ISOLATED === 'yes';
if (v639Enabled && v654Enabled) throw new Error('Select only one dedicated synthetic settlement database');
const DATABASE_URL = v654Enabled ? process.env.V654_TEST_DATABASE_URL : process.env.V639_TEST_DATABASE_URL;
const enabled = v639Enabled || v654Enabled;
const expectedDatabase = v654Enabled ? '/wdmv_fix_v654' : '/wdmv_fix_v639';
if (enabled && (!DATABASE_URL || new URL(DATABASE_URL).hostname !== '127.0.0.1'
  || new URL(DATABASE_URL).port !== '5580' || new URL(DATABASE_URL).pathname !== expectedDatabase)) {
  throw new Error('Refusing financial integration tests outside the selected dedicated disposable database');
}
const pool = enabled ? new Pool({ connectionString: DATABASE_URL }) : null;
const creator = randomUUID();
const opponent = randomUUID();
const creatorAccount = randomUUID();
const opponentAccount = randomUUID();
const treasuryAccount = randomUUID();
const sinkAccount = randomUUID();

const fixtureSchema = [
  `CREATE TABLE IF NOT EXISTS public.pvp_wager_rooms(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), creator_user_id uuid NOT NULL,
    creator_name text NOT NULL, opponent_user_id uuid, opponent_name text,
    game_type text NOT NULL, stake_amount numeric NOT NULL, fee_rate numeric NOT NULL,
    creator_move text, opponent_move text, winner_id uuid, treasury_fee numeric,
    battle_result jsonb, status text NOT NULL DEFAULT 'waiting',
    created_at timestamptz DEFAULT now(), settled_at timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS public.black_market_auctions(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_code text, item_title text,
    item_description text, item_icon text DEFAULT '', item_buff_type text DEFAULT '',
    item_buff_value numeric DEFAULT 0, starts_at timestamptz DEFAULT now(),
    ends_at timestamptz NOT NULL, starting_bid numeric DEFAULT 0,
    current_bid numeric NOT NULL, highest_bidder_id uuid,
    highest_bidder_name text, bid_count int DEFAULT 0, status text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS public.black_market_bid_logs(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), auction_id uuid, bidder_user_id uuid,
    bidder_name text, bid_amount numeric, created_at timestamptz DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS public.user_inventory_items(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid,
    item_code text, category text, name text, description text,
    rarity text, quantity integer
  )`,
  `CREATE TABLE IF NOT EXISTS public.in_app_notifications(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid,
    category text, title text, body text, link text
  )`,
];

const execute = async (sql: string, args: unknown[] = []) => {
  if (!pool) throw new Error('isolated db not initialized');
  return pool.query(sql, args);
};
async function balance(id: string): Promise<number> {
  const r = await execute('SELECT available_amount::float AS amount FROM public.account_balances WHERE account_id=$1', [id]);
  return Number(r.rows[0]?.amount);
}
async function addAuction(id: string, value: number) {
  await execute(
    `INSERT INTO public.black_market_auctions
     (id,item_code,item_title,item_description,ends_at,current_bid,highest_bidder_id,status)
     VALUES ($1,'item','Synthetic','Test only',clock_timestamp()-interval '1 hour',$2,$3,'active')`,
    [id, value, creator],
  );
}
describe.runIf(enabled)('separate PostgreSQL atomicity verification (never production DB)', () => {
  beforeAll(async () => {
    for (const sql of fixtureSchema) await execute(sql);
    // Idempotent fixture reset, permitted only by the strict disposable DB URL gate.
    await execute("DELETE FROM public.account_balances WHERE account_id IN (SELECT id FROM public.accounts WHERE system_key IN ('treasury', 'sink'))");
    await execute("DELETE FROM public.accounts WHERE system_key IN ('treasury', 'sink')");
    await execute('INSERT INTO public.users(id) VALUES ($1),($2)', [creator, opponent]);
    await execute(
      `INSERT INTO public.accounts (id,account_type,owner_user_id) VALUES
       ($1,'USER_CASH',$2), ($3,'USER_CASH',$4)`,
      [creatorAccount,creator,opponentAccount,opponent],
    );
    await execute(
      `INSERT INTO public.accounts(id,account_type,system_key) VALUES
       ($1,'TREASURY','treasury'),($2,'SINK','sink')`,
      [treasuryAccount,sinkAccount],
    );
    await execute(
      `INSERT INTO public.account_balances(account_id,available_amount)
       VALUES($1,10000),($2,10000),($3,0),($4,0)`,
      [creatorAccount,opponentAccount,treasuryAccount,sinkAccount],
    );
  });
  beforeEach(async () => {
    await execute('UPDATE public.account_balances SET available_amount=CASE WHEN account_id=$1 OR account_id=$2 THEN 10000 ELSE 0 END',
      [creatorAccount,opponentAccount]);
    await execute('TRUNCATE public.pvp_wager_rooms, public.black_market_auctions, public.user_inventory_items, public.in_app_notifications');
  });
  afterAll(async () => { await pool?.end(); });

  it('settles one PvP match with conserved total and one settled room', async () => {
    const repo = new PvpArenaRepository(pool!);
    const room = await repo.createRoom({ creatorUserId:creator, gameType:'dice',stakeAmount:1000 });
    await repo.joinAndPlay({ roomId:room.id, opponentUserId:opponent });
    expect((await execute('SELECT status FROM public.pvp_wager_rooms WHERE id=$1',[room.id])).rows[0]?.status).toBe('settled');
    expect(await balance(creatorAccount)+await balance(opponentAccount)+await balance(treasuryAccount)).toBe(20000);
    expect(await balance(treasuryAccount)).toBe(60);
  });
  it('rolls back all PvP money when notification insert fails', async () => {
    const repo = new PvpArenaRepository(pool!);
    const room = await repo.createRoom({ creatorUserId:creator,gameType:'dice',stakeAmount:1000 });
    await execute(`CREATE OR REPLACE FUNCTION public.v639_block_notification() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic notification failure'; END; $$`);
    await execute('CREATE TRIGGER v639_fail_notify BEFORE INSERT ON public.in_app_notifications FOR EACH ROW EXECUTE FUNCTION public.v639_block_notification()');
    try {
      await expect(repo.joinAndPlay({roomId:room.id,opponentUserId:opponent})).rejects.toThrow();
      expect(await balance(creatorAccount)).toBe(10000);
      expect(await balance(opponentAccount)).toBe(10000);
      expect(await balance(treasuryAccount)).toBe(0);
      expect((await execute('SELECT status FROM public.pvp_wager_rooms WHERE id=$1',[room.id])).rows[0]?.status).toBe('waiting');
    } finally {
      await execute('DROP TRIGGER IF EXISTS v639_fail_notify ON public.in_app_notifications');
      await execute('DROP FUNCTION IF EXISTS public.v639_block_notification()');
    }
  });
  it('settles one auction with item, sink credit and no duplicate charge', async () => {
    const repo = new BlackMarketRepository(pool!);
    const auctionId = randomUUID(); await addAuction(auctionId,1000);
    await Promise.all([repo.settleExpiredAuctions(),repo.settleExpiredAuctions()]);
    expect(await balance(creatorAccount)).toBe(9000);
    expect(await balance(sinkAccount)).toBe(1000);
    expect((await execute('SELECT status FROM public.black_market_auctions WHERE id=$1',[auctionId])).rows[0]?.status).toBe('settled');
    expect((await execute('SELECT count(*) AS n FROM public.user_inventory_items')).rows[0]?.n).toBe('1');
  });
  it('rolls back failed auction and retains active status for retry', async () => {
    const repo = new BlackMarketRepository(pool!);
    const auctionId=randomUUID();await addAuction(auctionId,1000);
    await execute(`CREATE OR REPLACE FUNCTION public.v639_block_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic inventory failure'; END; $$`);
    await execute('CREATE TRIGGER v639_fail_inventory BEFORE INSERT ON public.user_inventory_items FOR EACH ROW EXECUTE FUNCTION public.v639_block_inventory()');
    try {
      await repo.settleExpiredAuctions();
      expect(await balance(creatorAccount)).toBe(10000);
      expect(await balance(sinkAccount)).toBe(0);
      expect((await execute('SELECT status FROM public.black_market_auctions WHERE id=$1',[auctionId])).rows[0]?.status).toBe('active');
    } finally {
      await execute('DROP TRIGGER IF EXISTS v639_fail_inventory ON public.user_inventory_items');
      await execute('DROP FUNCTION IF EXISTS public.v639_block_inventory()');
    }
  });
});
