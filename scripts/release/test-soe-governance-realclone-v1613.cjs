const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { Client } = createRequire(resolve(__dirname, '../../backend/package.json'))('pg');
const url = process.env.MV_V1613_ISOLATED_DATABASE_URL;
if (!url) throw Error('Isolated DB URL required');
const parsed = new URL(url);
if (parsed.hostname !== '127.0.0.1' || parsed.port !== '5580' ||
    parsed.pathname !== '/wdmv_v1553_fiscal_reset') throw Error('Unsafe DB target');
(async () => {
  const db = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  await db.connect();
  try {
    const identity = (await db.query('SELECT current_database() db, current_user actor')).rows[0];
    if (identity.db !== 'wdmv_v1553_fiscal_reset') throw Error('Wrong test DB');
    const permissions = (await db.query(`
      SELECT
      has_table_privilege('moneyverse_app','public.state_enterprises','UPDATE') can_update,
      has_table_privilege('moneyverse_app','public.soe_governance_receipts','INSERT') can_insert_receipt,
      has_function_privilege('moneyverse_app',
        'public.admin_soe_update_status(uuid,text,text,integer,text,uuid)','EXECUTE') can_call
    `)).rows[0];
    if (permissions.can_update || permissions.can_insert_receipt || !permissions.can_call) {
      throw Error('App role ACL boundary violated: ' + JSON.stringify(permissions));
    }
    const roles = await db.query(`
      SELECT u.id::text actor
      FROM public.user_roles ur JOIN public.users u ON u.id=ur.user_id
      WHERE ur.role::text IN ('approver','superadmin') AND u.status::text='active'
      LIMIT 1
    `);
    if (!roles.rows.length) throw Error('No active administrator fixture in restored Test');
    const actor = roles.rows[0].actor;
    const notAdmin = await db.query(`
      SELECT u.id::text actor FROM public.users u
      WHERE u.status::text='active'
        AND NOT EXISTS (
          SELECT 1 FROM public.user_roles r WHERE r.user_id=u.id AND
            r.role::text IN ('approver','superadmin')
        ) LIMIT 1
    `);
    const outsider = notAdmin.rows[0]?.actor || '00000000-0000-4000-8000-000000000000';
    const before = (await db.query(`
      SELECT (SELECT count(*) FROM public.soe_governance_receipts) receipts,
             (SELECT count(*) FROM public.ledger_transactions) tx,
             (SELECT count(*) FROM public.ledger_postings) postings,
             (SELECT count(*) FROM public.state_enterprise_dividend_logs) dividends
    `)).rows[0];
    const current = (await db.query(`
      SELECT code,status,dividend_rate_bps FROM public.state_enterprises
      WHERE code='SOE_POWER'
    `)).rows[0];
    if (!current) throw Error('Missing SOE_POWER in clone');
    const newStatus = current.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    const key = 'aaaa1111-bbbb-4111-8111-ccccdddd0001';
    await db.query('BEGIN');
    await db.query('SET LOCAL ROLE moneyverse_app');
    await db.query('SAVEPOINT role_negative');
    let denied = false;
    try {
      await db.query(`SELECT public.admin_soe_update_status($1::uuid,$2::text,$3::text,NULL::integer,$4::text,$5::uuid) receipt`,
        [outsider, 'SOE_POWER', newStatus, 'Unauthorized outsider changed an SOE', key]);
    } catch (err) { denied = err.code === '42501'; }
    await db.query('ROLLBACK TO SAVEPOINT role_negative');
    if (!denied) throw Error('Non-approver failed to be denied by DB');
    await db.query('SAVEPOINT direct_dml_negative');
    denied = false;
    try { await db.query(`UPDATE public.state_enterprises SET status=$1 WHERE code='SOE_POWER'`,
      [newStatus]); } catch (err) { denied = err.code === '42501'; }
    await db.query('ROLLBACK TO SAVEPOINT direct_dml_negative');
    if (!denied) throw Error('moneyverse_app direct DML unexpectedly succeeded');
    const params = [actor, 'SOE_POWER', newStatus, 'Approved emergency governance pause', key];
    const sql = `SELECT public.admin_soe_update_status($1::uuid,$2::text,$3::text,NULL::integer,$4::text,$5::uuid) receipt`;
    const one = (await db.query(sql, params)).rows[0]?.receipt;
    const replay = (await db.query(sql, params)).rows[0]?.receipt;
    if (!one?.applied || one?.settled !== false || one?.receipt_id !== key ||
        JSON.stringify(one) !== JSON.stringify(replay)) throw Error('Receipt replay invalid');
    await db.query('RESET ROLE');
    const after = (await db.query(`
      SELECT (SELECT count(*) FROM public.soe_governance_receipts) receipts,
             (SELECT count(*) FROM public.ledger_transactions) tx,
             (SELECT count(*) FROM public.ledger_postings) postings,
             (SELECT count(*) FROM public.state_enterprise_dividend_logs) dividends,
             (SELECT status FROM public.state_enterprises WHERE code='SOE_POWER') status
    `)).rows[0];
    if (+after.receipts !== +before.receipts + 1 ||
        after.tx !== before.tx || after.postings !== before.postings ||
        after.dividends !== before.dividends || after.status !== newStatus) {
      throw Error('Non-atomic or monetary SOE governance mutation');
    }
    await db.query('ROLLBACK');
    const afterRollback = (await db.query(`
      SELECT (SELECT count(*) FROM public.soe_governance_receipts) receipts,
             (SELECT status FROM public.state_enterprises WHERE code='SOE_POWER') status
    `)).rows[0];
    if (+afterRollback.receipts !== +before.receipts || afterRollback.status !== current.status) {
      throw Error('Isolation rollback did not preserve original Test data');
    }
    console.log(JSON.stringify({
      isolatedDb:identity.db, result:'PASS',
      appTableUpdate:false,appReceiptInsert:false,functionExecute:true,
      unauthorizedActorDenied:true,directDmlDenied:true,
      approvedChangeAndReceiptAtomic:true,idempotentReplay:true,
      ledgerAndDividendRowsUnchanged:true,testRolledBack:true,
    }));
  } finally { await db.end(); }
})().catch(e=>{ console.error('SOE_ISOLATED_DB_TEST_FAILED',e.code||e.message);process.exitCode=2; });
