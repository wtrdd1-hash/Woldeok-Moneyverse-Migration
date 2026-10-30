import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { StockCommunityService } from './stock-community.service';

const url = process.env.MIGRATOR_DATABASE_URL;
const pool = url ? new Pool({ connectionString: url, max: 1 }) : null;
afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('real PostgreSQL public board category contract', () => {
  it('filters only within owner-created public latest-50 rows, excludes untagged and rolls back', async () => {
    const client = await pool!.connect();
    const actor = randomUUID();
    const stock = randomUUID();
    const symbol = `T${randomUUID().replaceAll('-', '').slice(0, 7).toUpperCase()}`;
    const analysis = randomUUID();
    const question = randomUUID();
    const untagged = randomUUID();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      await client.query('INSERT INTO public.virtual_stocks(id,symbol,name,initial_price,current_price,day_open_price) VALUES($1,$2,$3,100,100,100)',
        [stock, symbol, 'Synthetic category stock']);
      await client.query(`INSERT INTO public.member_board_posts(id,author_user_id,idempotency_key,title,body)
        VALUES($1,$4,$5,'Analysis sample','test'),($2,$4,$6,'Question sample','test'),($3,$4,$7,'Untagged sample','test')`,
        [analysis, question, untagged, actor, randomUUID(), randomUUID(), randomUUID()]);
      await client.query(`INSERT INTO public.member_board_stock_context(post_id,stock_id,category,stance,position_disclosure)
        VALUES($1,$3,'analysis','neutral','holder'),($2,$3,'question','neutral','holder')`,
        [analysis, question, stock]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new StockCommunityService(client);
      const result = await repository.publicList(undefined, undefined, 'analysis');
      expect(result.map((row) => row.postId)).toEqual([analysis]);
      expect(result[0]?.stock?.category).toBe('analysis');
      expect((await repository.publicList(symbol, 'Question', 'question')).map((row) => row.postId)).toEqual([question]);
      expect(await repository.publicList(undefined, 'Untagged', 'analysis')).toEqual([]);
      const acl = await client.query(`SELECT has_function_privilege(current_user,
        'public.member_board_public_list_with_stock(integer)', 'EXECUTE') AS can_execute,
        has_table_privilege(current_user,'public.member_board_stock_context','SELECT') AS can_select`);
      expect(acl.rows[0]?.can_execute).toBe(true);
      expect(acl.rows[0]?.can_select).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
