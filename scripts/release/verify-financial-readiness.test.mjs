import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateFinancialReadiness, readFinancialSnapshot, PROTECTED_FINANCIAL_TABLES } from './verify-financial-readiness.mjs';

const good = Object.freeze({
  identity:{database:'moneyverse_test',role:'moneyverse_app'},
  grants:PROTECTED_FINANCIAL_TABLES.map(name=>({name,can_insert:false,can_update:false,can_delete:false})),
  legacyTables:[],
  ledger:{
    balance_rows:3,unexplained_account_count:0,unexplained_delta_wld:'0',
    unexplained_without_postings_count:0,unexplained_without_postings_delta_wld:'0',
    unbalanced_transaction_count:0,transactions_without_postings:0,
    unknown_posting_direction_count:0,
  },
});

test('strict baseline passes only this narrow audit, never grants deployment',()=>{
  const r=evaluateFinancialReadiness(good);
  assert.equal(r.ok,true);
  assert.equal(r.status,'READY_FOR_OTHER_RELEASE_GATES');
  assert.match(r.caveat,/separate mandatory/);
});

const acceptedIdentity = {database:'woldeok_moneyverse_dev',role:'moneyverse_app'};
const acceptedGrants = good.grants.map(x => ['account_balances','accounts','system_treasury_vaults'].includes(x.name)
  ? {...x,can_insert:true,can_update:true,can_delete:true} : x);

test('owner-approved existing three DML grants are explicit warnings, not release approval',()=>{
  const r=evaluateFinancialReadiness({...good,identity:acceptedIdentity,grants:acceptedGrants});
  assert.equal(r.ok,true);
  assert.equal(r.status,'READY_FOR_OTHER_RELEASE_GATES');
  assert.deepEqual(r.blockers,[]);
  assert.deepEqual(r.warnings, [
    'OPERATOR_ACCEPTED_EXISTING_DML:account_balances',
    'OPERATOR_ACCEPTED_EXISTING_DML:accounts',
    'OPERATOR_ACCEPTED_EXISTING_DML:system_treasury_vaults',
  ]);
  assert.match(r.caveat,/treasury/);
});

test('approval requires exact role, database and original full DML shape',()=>{
  for(const identity of [{database:'other',role:'moneyverse_app'}, {database:'woldeok_moneyverse_dev',role:'other'}]){
    assert(evaluateFinancialReadiness({...good,identity,grants:acceptedGrants}).blockers
      .includes('direct_application_financial_dml:accounts'));
  }
  const changed=acceptedGrants.map(x=>x.name==='accounts'?{...x,can_delete:false}:x);
  assert(evaluateFinancialReadiness({...good,identity:acceptedIdentity,grants:changed}).blockers
    .includes('direct_application_financial_dml:accounts'));
});

test('approval never waives ledger DML or mismatched balances',()=>{
  const extra=acceptedGrants.map(x=>x.name==='ledger_transactions'?{...x,can_insert:true}:x);
  assert(evaluateFinancialReadiness({...good,identity:acceptedIdentity,grants:extra}).blockers
    .includes('direct_application_financial_dml:ledger_transactions'));
  assert(evaluateFinancialReadiness({...good,identity:acceptedIdentity,grants:acceptedGrants,
    ledger:{...good.ledger,unexplained_account_count:1,unexplained_delta_wld:'1'}}).blockers
    .includes('uncertified_account_opening_or_ledger_drift'));
});

test('fail closed when moneyverse_app can update account balances',()=>{
  const grants=good.grants.map(x=>x.name==='account_balances'?{...x,can_update:true}:x);
  const r=evaluateFinancialReadiness({...good,grants});
  assert.equal(r.ok,false);
  assert(r.blockers.includes('direct_application_financial_dml:account_balances'));
});

test('fail closed on app ledger transaction INSERT',()=>{
  const grants=good.grants.map(x=>x.name==='ledger_transactions'?{...x,can_insert:true}:x);
  assert(evaluateFinancialReadiness({...good,grants}).blockers.includes('direct_application_financial_dml:ledger_transactions'));
});

test('fail closed when protected vault core table missing',()=>{
  const grants=good.grants.filter(x=>x.name!=='system_treasury_vaults');
  assert(evaluateFinancialReadiness({...good,grants}).blockers.includes('missing_core_table:system_treasury_vaults'));
});

test('fail closed for materialized balances without certified opening',()=>{
  const r=evaluateFinancialReadiness({...good,ledger:{...good.ledger,unexplained_account_count:19,unexplained_delta_wld:'4779188'}});
  assert.equal(r.ok,false);
  assert(r.blockers.includes('uncertified_account_opening_or_ledger_drift'));
  assert.equal(r.summary.unexplainedProjectionDeltaWld,'4779188');
});

test('unbalanced debit-credit transaction is different from projection drift',()=>{
  const r=evaluateFinancialReadiness({...good,ledger:{...good.ledger,unbalanced_transaction_count:1}});
  assert(r.blockers.includes('unbalanced_ledger_transaction'));
  assert(!r.blockers.includes('uncertified_account_opening_or_ledger_drift'));
});

test('transaction with no postings fails release',()=>{
  assert(evaluateFinancialReadiness({...good,ledger:{...good.ledger,transactions_without_postings:1}})
    .blockers.includes('ledger_transaction_without_postings'));
});

test('unverified DB identity fails release',()=>{
  assert(evaluateFinancialReadiness({...good,identity:{database:null,role:null}})
    .blockers.includes('unverified_database_identity'));
});

test('empty and missing balance projection is not ready',()=>{
  assert(evaluateFinancialReadiness({...good,ledger:{...good.ledger,balance_rows:0}})
    .blockers.includes('missing_or_empty_balance_projection'));
  assert.equal(evaluateFinancialReadiness({...good,ledger:null}).ok,false);
});

test('snapshot is repeatable read-only and always rolled back',async()=>{
  const calls=[];
  const c={async query(sql,args){calls.push({sql,args});if(sql.includes('current_database()'))return{rows:[good.identity]};if(sql.includes('TRUNCATE'))return{rows:[]};if(sql.includes('has_table_privilege'))return{rows:good.grants};if(sql.includes('account_net AS'))return{rows:[good.ledger]};return{rows:[]};}};
  assert.deepEqual(await readFinancialSnapshot(c),good);
  assert.equal(calls[0].sql,'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(calls.at(-1).sql,'ROLLBACK');
  assert(!calls.some(c=>/INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE/i.test(c.sql)&&!c.sql.includes('has_table_privilege')&&!c.sql.includes('READ ONLY')));
});

test('snapshot rolls back on failed financial query',async()=>{
  const calls=[];
  const c={async query(sql){calls.push(sql);if(sql.includes('account_net AS'))throw Error('query interrupted');
    if(sql.includes('current_database()'))return{rows:[good.identity]};
    if(sql.includes('TRUNCATE'))return{rows:[]};if(sql.includes('has_table_privilege'))return{rows:good.grants};return{rows:[]}}};
  await assert.rejects(()=>readFinancialSnapshot(c),/query interrupted/);
  assert.equal(calls.at(-1),'ROLLBACK');
});


test('uncertified balances with no postings are detected without exposing account identities',()=>{
  const ledger={...good.ledger,unexplained_account_count:5,unexplained_delta_wld:'4000000',
    unexplained_without_postings_count:5,unexplained_without_postings_delta_wld:'4000000'};
  const result=evaluateFinancialReadiness({...good,ledger});
  assert(result.blockers.includes('uncertified_balance_without_any_ledger_postings'));
  assert.equal(result.summary.unexplainedWithoutPostingsAccounts,5);
  assert.equal(result.summary.unexplainedWithoutPostingsDeltaWld,'4000000');
  assert(!('accountId' in result.summary));
});

test('missing or invalid mandatory ledger counts cannot produce a green financial gate',()=>{
  for (const key of ['unexplained_account_count','unexplained_without_postings_count',
    'unbalanced_transaction_count','transactions_without_postings','unknown_posting_direction_count']) {
    const missing={...good.ledger}; delete missing[key];
    assert.equal(evaluateFinancialReadiness({...good,ledger:missing}).ok,false,`${key} missing must block`);
    for (const invalid of [null,-1,NaN,'0',1.5]) {
      const ledger={...good.ledger,[key]:invalid};
      assert.equal(evaluateFinancialReadiness({...good,ledger}).ok,false,`${key} invalid ${String(invalid)} must block`);
    }
  }
});

test('grant evidence must include uniquely identified protected tables with boolean flags',()=>{
  assert.equal(evaluateFinancialReadiness({...good,grants:[]}).ok,false);
  assert.equal(evaluateFinancialReadiness({...good,grants:null}).ok,false);
  assert.equal(evaluateFinancialReadiness({...good,grants:[...good.grants,good.grants[0]]}).ok,false);
  assert.equal(evaluateFinancialReadiness({...good,grants:good.grants.map(x=>x.name==='accounts'?{name:x.name}:x)}).ok,false);
  assert.equal(evaluateFinancialReadiness({...good,grants:good.grants.map(x=>x.name==='accounts'?{...x,can_update:'false'}:x)}).ok,false);
});

test('invalid or contradictory signed-WLD totals are blocked without lossy Number conversion',()=>{
  for (const key of ['unexplained_delta_wld','unexplained_without_postings_delta_wld']) {
    for (const value of [null,undefined,'unknown','1.5']) {
      assert.equal(evaluateFinancialReadiness({...good,ledger:{...good.ledger,[key]:value}}).ok,false);
    }
    assert.equal(evaluateFinancialReadiness({...good,ledger:{...good.ledger,[key]:'9007199254740993'}}).ok,false);
  }
});

test('release preflight fails closed when legacy schema evidence is omitted', () => {
  const report = evaluateFinancialReadiness({...good, legacyTables: undefined});
  assert.equal(report.ok, false);
  assert(report.blockers.includes('unverified_legacy_schema_grants'));
});

test('all nine production-only tables block release even if their direct grants are revoked', () => {
  const names = [
    'daily_attendance_logs', 'economic_hot_time_events', 'in_app_notifications',
    'marketplace_purchases', 'notification_preferences', 'p2p_wire_transfers',
    'user_inventory_items', 'user_notifications', 'virtual_casino_theme_plays',
  ];
  for (const name of names) {
    const row = {name, can_insert:false, can_update:false, can_delete:false, can_truncate:false};
    const report = evaluateFinancialReadiness({...good, legacyTables:[row]});
    assert.equal(report.ok, false, name);
    assert(report.blockers.includes('unreconciled_production_only_table:' + name), name);
  }
});

test('production-only table grants and malformed evidence are independently blocked', () => {
  const name = 'p2p_wire_transfers';
  const writable = {name,can_insert:false,can_update:true,can_delete:true,can_truncate:true};
  const report = evaluateFinancialReadiness({...good,legacyTables:[writable]});
  assert(report.blockers.includes('legacy_table_direct_app_dml:' + name));
  assert.equal(report.ok, false);
  for (const legacyTables of [null, [writable,writable], [{name,can_insert:'false'}], [{name:'unknown'}]]) {
    assert.equal(evaluateFinancialReadiness({...good,legacyTables}).ok,false);
  }
});

test('legacy table snapshot is queried in the same read-only transaction', async () => {
  const calls=[];
  const client={async query(sql,args){calls.push({sql,args});
    if (sql.includes('current_database()')) return {rows:good.identity?[good.identity]:[]};
    if (sql.includes('has_table_privilege') && sql.includes('TRUNCATE')) return {rows:[]};
    if (sql.includes('has_table_privilege')) return {rows:good.grants};
    if (sql.includes('account_net AS')) return {rows:[good.ledger]};
    return {rows:[]};
  }};
  const snapshot=await readFinancialSnapshot(client);
  assert.deepEqual(snapshot.legacyTables,[]);
  assert(calls.some(call => call.sql.includes('TRUNCATE') && call.args?.[0]?.includes('in_app_notifications')));
  assert.equal(calls[0].sql,'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(calls.at(-1).sql,'ROLLBACK');
});
