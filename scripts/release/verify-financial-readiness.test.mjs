import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateFinancialReadiness, readFinancialSnapshot, PROTECTED_FINANCIAL_TABLES } from './verify-financial-readiness.mjs';

const good = Object.freeze({
  identity:{database:'moneyverse_test',role:'moneyverse_app'},
  grants:PROTECTED_FINANCIAL_TABLES.map(name=>({name,can_insert:false,can_update:false,can_delete:false})),
  ledger:{
    balance_rows:3,unexplained_account_count:0,unexplained_delta_wld:'0',
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
  const c={async query(sql,args){calls.push({sql,args});if(sql.includes('current_database()'))return{rows:[good.identity]};if(sql.includes('has_table_privilege'))return{rows:good.grants};if(sql.includes('account_net AS'))return{rows:[good.ledger]};return{rows:[]};}};
  assert.deepEqual(await readFinancialSnapshot(c),good);
  assert.equal(calls[0].sql,'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(calls.at(-1).sql,'ROLLBACK');
  assert(!calls.some(c=>/INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE/i.test(c.sql)&&!c.sql.includes('has_table_privilege')&&!c.sql.includes('READ ONLY')));
});

test('snapshot rolls back on failed financial query',async()=>{
  const calls=[];
  const c={async query(sql){calls.push(sql);if(sql.includes('account_net AS'))throw Error('query interrupted');
    if(sql.includes('current_database()'))return{rows:[good.identity]};
    if(sql.includes('has_table_privilege'))return{rows:good.grants};return{rows:[]}}};
  await assert.rejects(()=>readFinancialSnapshot(c),/query interrupted/);
  assert.equal(calls.at(-1),'ROLLBACK');
});
