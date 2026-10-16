import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {describe,expect,it} from 'vitest';

const migratorUrl=process.env.MIGRATOR_DATABASE_URL;
const isDisposableCI=process.env.CI==='true' && process.env.GITHUB_ACTIONS==='true';
if(isDisposableCI&&!migratorUrl)throw Error('CI private league read validation needs disposable MIGRATOR_DATABASE_URL');

describe('Stock league scoped read privilege, on disposable PostgreSQL',()=>{
 it.skipIf(!isDisposableCI || !migratorUrl)('runs scoped functions without exposing roles or private portfolios to app role',()=>{
  const url=new URL(migratorUrl!);
  if(!['postgres:','postgresql:'].includes(url.protocol)|| !['localhost','127.0.0.1'].includes(url.hostname)
    ||(url.port!==''&&url.port!=='5432')||url.username!=='moneyverse_migrator'
    ||url.pathname!=='/woldeok_moneyverse_dev')throw Error('refuse non-disposable DB');
  const script=join(__dirname,'fixtures','stock-league-private-read-v755.sql');
  const r=spawnSync('psql',['-X','-v','ON_ERROR_STOP=1','-f',script],{
   encoding:'utf8',timeout:30000,
   env:{...process.env,PGHOST:url.hostname,PGPORT:url.port||'5432',
     PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),
     PGDATABASE:decodeURIComponent(url.pathname.slice(1))},
  });
  if(r.error)throw Error(`isolated SQL unavailable (${r.error.name})`);
  expect(r.status).toBe(0);
  expect(r.stdout).toContain('STOCK_LEAGUE_PRIVATE_READ_ROLE_NONDISCLOSURE_PASS');
  expect(r.stdout).toContain('ROLLBACK');
 });
});
