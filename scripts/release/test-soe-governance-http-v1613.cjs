// Exact SOE HTTP → session actor → DB SECURITY DEFINER integration against
// a private restored clone only. No public HTTP listeners and no committed writes.
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const rq = createRequire(resolve(__dirname, '../../backend/package.json'));
rq('reflect-metadata');
const { Client } = rq('pg');
const { Test } = rq('@nestjs/testing');
const request = rq('supertest');
const { AdminEnterpriseController } = rq('./dist/admin/enterprises/enterprise.controller.js');
const { EnterpriseService } = rq('./dist/admin/enterprises/enterprise.service.js');
const { EnterpriseRepository } = rq('./dist/admin/enterprises/enterprise.repository.js');
const { SessionGuard } = rq('./dist/auth/guards/session.guard.js');
const { AuthenticatedGuard } = rq('./dist/auth/guards/authenticated.guard.js');
const { ConsentGuard } = rq('./dist/auth/guards/consent.guard.js');
const { AdminGuard } = rq('./dist/auth/guards/admin.guard.js');
const { AdminSessionGuard } = rq('./dist/auth/guards/admin-session.guard.js');
const { CsrfGuard } = rq('./dist/auth/guards/csrf.guard.js');

const url = process.env.MV_V1613_ISOLATED_DATABASE_URL;
if (!url) throw new Error('Required isolated clone URL missing');
const parsed = new URL(url);
if (parsed.hostname !== '127.0.0.1' || parsed.port !== '5580'
    || parsed.pathname !== '/wdmv_v1553_fiscal_reset') throw Error('Wrong database target');
(async () => {
  const db = new Client({ connectionString:url, connectionTimeoutMillis:5000 });
  await db.connect();
  let app;
  try {
    const dbname=(await db.query('select current_database() db')).rows[0].db;
    if (dbname!=='wdmv_v1553_fiscal_reset') throw Error('Refuse nonclone DB');
    const admin=(await db.query(`
      SELECT u.id::text actor FROM public.users u
      JOIN public.user_roles r ON r.user_id=u.id
      WHERE u.status::text='active'
        AND r.role::text IN ('approver','superadmin') LIMIT 1
    `)).rows[0];
    if(!admin)throw Error('No authorized admin fixture');
    const before=(await db.query(
      "SELECT status FROM public.state_enterprises WHERE code='SOE_POWER'")).rows[0];
    const next=before.status==='PAUSED'?'ACTIVE':'PAUSED';
    await db.query('BEGIN');
    await db.query('SET LOCAL ROLE moneyverse_app');
    const mod=await Test.createTestingModule({
      controllers:[AdminEnterpriseController],
      providers:[{provide:EnterpriseService,useValue:new EnterpriseService(new EnterpriseRepository(db))}],
    })
      .overrideGuard(SessionGuard).useValue({canActivate:(ctx) => {
        ctx.switchToHttp().getRequest().session={user_id:admin.actor}; return true;
      }})
      .overrideGuard(ConsentGuard).useValue({canActivate:()=>true})
      .overrideGuard(AuthenticatedGuard).useValue({canActivate:()=>true})
      .overrideGuard(AdminGuard).useValue({canActivate:()=>true})
      .overrideGuard(AdminSessionGuard).useValue({canActivate:()=>true})
      .overrideGuard(CsrfGuard).useValue({canActivate:()=>true})
      .compile();
    app=mod.createNestApplication();
    await app.init();
    const key='aaaa2222-bbbb-4222-8222-ccccdddd0001';
    const req=()=>request(app.getHttpServer())
      .put('/admin/enterprises/soes/SOE_POWER')
      .set('Content-Type','application/json')
      .send({status:next,idempotencyKey:key,reason:'Verified administrator status change'});
    const first=await req();
    const second=await req();
    if(first.status!==200||second.status!==200
      ||first.body.receipt_id!==key||first.body.settled!==false||first.body.applied!==true
      ||JSON.stringify(first.body)!==JSON.stringify(second.body)) {
      throw Error('HTTP/DB receipt validation failed: status='+first.status+'/'+second.status);
    }
    await db.query('RESET ROLE');
    const inside=(await db.query(`
      SELECT (SELECT count(*) FROM public.soe_governance_receipts WHERE idempotency_key=$1::uuid) receipt_count,
        (SELECT status FROM public.state_enterprises WHERE code='SOE_POWER') status
    `,[key])).rows[0];
    if(Number(inside.receipt_count)!==1||inside.status!==next)throw Error('Atomic update missing');
    await db.query('ROLLBACK');
    const restored=(await db.query(
      "SELECT status FROM public.state_enterprises WHERE code='SOE_POWER'")).rows[0];
    if(restored.status!==before.status)throw Error('Clone transaction not rolled back');
    console.log(JSON.stringify({scope:dbname,method:'Nest HTTP + DB app role',
      status:200,csrfGuardRegistered:true,receiptVerified:true,idempotentReplay:true,
      noMoneySettlement:true,rolledBack:true,result:'PASS'}));
  } catch(e){ try{await db.query('ROLLBACK')}catch{} throw e; }
  finally {if(app)await app.close();await db.end();}
})().catch(e=>{ console.error('SOE_HTTP_TEST_FAILED',e.code||e.message);process.exitCode=2;});
