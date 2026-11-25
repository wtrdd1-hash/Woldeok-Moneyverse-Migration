#!/usr/bin/env python3
"""Read-only acceptance against the exact newly owned Test backend and DB."""
import hashlib,json,os,re,subprocess,time,urllib.request,urllib.error
from pathlib import Path
import backend as b

def sql(query,role='moneyverse_migrator'):
    env=json.loads((b.STAGE/'bootstrap.json').read_text());b.validate_authority(env)
    receipt=json.loads((b.STAGE/'database-receipt.json').read_text())
    item=json.loads(subprocess.check_output(['docker','inspect',b.CONTAINER]))[0]
    b.validate_container(item,receipt['containerId'])
    if not query.lstrip().lower().startswith('select '):raise ValueError('acceptance only permits SELECT')
    password=env['APP_DB_PASSWORD'] if role=='moneyverse_app' else env['PGPASSWORD']
    if role not in ('moneyverse_migrator','moneyverse_app'):raise ValueError('unexpected Test principal')
    childenv={**os.environ,'PGPASSWORD':password,'PGOPTIONS':'-c default_transaction_read_only=on'}
    args=['docker','exec','-i','-e','PGPASSWORD','-e','PGOPTIONS',b.CONTAINER,'psql','-X','-v','ON_ERROR_STOP=1','-A','-t','-h','127.0.0.1','-p','5432','-U',role,'-d',b.DATABASE,'-c',query]
    result=subprocess.run(args,env=childenv,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
    return result.stdout.strip()

def get(path,headers=None):
    req=urllib.request.Request('http://127.0.0.1:55438'+path,headers=headers or {})
    try:
        with urllib.request.urlopen(req,timeout=15) as response:
            status=response.status;raw=response.read();hdr=dict(response.headers)
    except urllib.error.HTTPError as response:
        status=response.code;raw=response.read();hdr=dict(response.headers)
    try:body=json.loads(raw)
    except ValueError:body={}
    return {'status':status,'headers':hdr,'body':body}

def main():
    version=get('/api/version')
    pid=int(subprocess.check_output(['systemctl','show','--value','-p','MainPID',b.UNIT],text=True).strip())
    if pid<=0:raise ValueError('owned Test backend has no process')
    unit=Path('/etc/systemd/system')/b.UNIT
    if unit.read_text()!=b.render_unit():raise ValueError('foreign Test service unit')
    jar=Path(b.JAR);st=jar.stat()
    jarhash=hashlib.sha256(jar.read_bytes()).hexdigest()
    openjar=False
    for fd in (Path('/proc')/str(pid)/'fd').iterdir():
        try:
            fst=fd.stat()
            if fst.st_dev==st.st_dev and fst.st_ino==st.st_ino:openjar=True
        except FileNotFoundError:pass
    cmd=(Path('/proc')/str(pid)/'cmdline').read_bytes().split(b'\0')
    source=version['body'].get('data',{}).get('applicationSourceSha')
    db=json.loads(sql("SELECT json_build_object('name',current_database(),'role',current_user,'readOnly',current_setting('transaction_read_only'),'superuser',r.rolsuper,'createRole',r.rolcreaterole,'createDb',r.rolcreatedb) FROM pg_roles r WHERE rolname=current_user",'moneyverse_app'))
    rows=json.loads(sql("SELECT coalesce(json_agg(x),'[]'::json) FROM (SELECT filename,checksum FROM public.schema_migrations ORDER BY filename) x"))
    files=sorted((b.SOURCE/'packages/database/migrations').glob('[0-9][0-9][0-9]-*.sql'))
    expected=[{'filename':p.name,'checksum':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
    parity=rows==expected and [int(p.name[:3]) for p in files]==list(range(2,len(files)+2))
    counts=json.loads(sql("SELECT json_build_object('users',(SELECT count(*) FROM public.users),'identities',(SELECT count(*) FROM public.identities),'sessions',(SELECT count(*) FROM public.auth_sessions))"))
    perms=json.loads(sql("SELECT json_build_object('stockTableReadable',has_table_privilege('moneyverse_app','public.virtual_stocks','SELECT'),'coreMoneyExecutable',has_function_privilege('moneyverse_app','public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)','EXECUTE'))"))
    session=get('/api/v1/auth/session')
    testcors=get('/api/v1/auth/session',{'Origin':'https://test.easy-scraping.com'})
    prodcors=get('/api/v1/auth/session',{'Origin':'https://easy-scraping.com'})
    summary=get('/api/v1/wallet/summary')
    wallet=get('/api/v1/wallet')
    balance=get('/api/v1/wallet/balance')
    admin=get('/api/v1/admin/me')
    forged={'X-User-Id':'11111111-1111-4111-8111-111111111111','X-Actor-User-Id':'11111111-1111-4111-8111-111111111111','X-Admin-Role':'superadmin'}
    forgedsummary=get('/api/v1/wallet/summary',forged)
    forgedwallet=get('/api/v1/wallet',forged)
    forgedadmin=get('/api/v1/admin/me',forged)
    forgedportfolio=get('/api/v1/stocks/portfolio',forged)
    stocks=get('/api/v1/stocks');board=get('/api/v1/board')
    canonicalstocks=json.loads(sql("SELECT coalesce(json_agg(x),'[]'::json) FROM (SELECT id::text,symbol,current_price::text,day_open_price::text,day_high_price::text,day_low_price::text,shares_outstanding::text,shares_available::text FROM public.stock_market_overview()) x",'moneyverse_app'))
    canonicalboard=json.loads(sql("SELECT coalesce(json_agg(post_id::text ORDER BY created_at DESC,post_id DESC),'[]'::json) FROM public.member_board_public_list_with_stock(50)",'moneyverse_app'))
    runtime=dict(line.split('=',1) for line in (b.STAGE/'runtime.env').read_text().splitlines())
    activity=int(sql("SELECT count(*) FROM pg_stat_activity WHERE datname='"+b.DATABASE+"' AND usename='moneyverse_app'"))
    journal=subprocess.check_output(['journalctl','-u',b.UNIT,'--no-pager','--output=cat'],text=True)
    pool_readonly=bool(re.search(r'readOnly\s*\.+\s*true',journal))
    network=dict(line.split('=',1) for line in subprocess.check_output(['systemctl','show',b.UNIT,'-p','IPAddressAllow','-p','IPAddressDeny','-p','DynamicUser'],text=True).splitlines())
    checks={
      'sourceIdentity':version['status']==200 and source==b.SHA and jarhash==b.JAR_SHA and openjar and b.JAR.encode() in cmd,
      'databaseIsolation':db['name']==b.DATABASE and db['role']=='moneyverse_app' and not db['superuser'] and not db['createRole'] and not db['createDb'] and activity>0,
      'readOnly':db['readOnly']=='on' and runtime['SPRING_DATASOURCE_HIKARI_READONLY']=='true' and pool_readonly,
      'migrationParity':parity,
      'anonymousSession':session['status']==200 and b.signed_out(session['body']),
      'walletDenied':wallet['status'] in (401,403) and balance['status'] in (401,403),
      'guestSummaryRedacted':all(r['status']==200 and r['body'].get('signedIn') is False and r['body'].get('totalAvailableAmount','missing') is None for r in [summary,forgedsummary]),
      'adminDenied':admin['status'] in (401,403),
      'stockCanonical':stocks['status']==200 and b.stock_rows_match(stocks['body'],canonicalstocks),
      'boardCanonical':board['status']==200 and board['body'].get('ok') is True and [p.get('id') for p in board['body'].get('posts',[])]==canonicalboard,
      'forgedActorDenied':all(r['status'] in (401,403) for r in [forgedwallet,forgedadmin,forgedportfolio]),
      'syntheticOnly':counts=={'users':0,'identities':0,'sessions':0},
      'jobsConfiguredOff':runtime['MONEYVERSE_SCHEDULING_ENABLED']=='false' and runtime['MONEYVERSE_MARKET_TICKERENABLED']=='false',
      'botOffline':runtime['DISCORD_BOT_TOKEN']=='' and 'Bot token is empty or unconfigured' in journal,
      'loopbackSandbox':network=={'IPAddressAllow':'127.0.0.0/8 ::1/128','IPAddressDeny':'0.0.0.0/0 ::/0','DynamicUser':'yes'},
      'testCors':testcors['status']==200 and testcors['headers'].get('Access-Control-Allow-Origin')=='https://test.easy-scraping.com' and not prodcors['headers'].get('Access-Control-Allow-Origin'),
      'privilegeBoundary':perms=={'stockTableReadable':False,'coreMoneyExecutable':False},
    }
    receipt=json.loads((b.STAGE/'database-receipt.json').read_text())
    policy=dict(line.split('=',1) for line in subprocess.check_output(['systemctl','show',b.UNIT,'-p','Restart','-p','RestartUSec','-p','SuccessExitStatus','-p','StartLimitIntervalUSec','-p','StartLimitBurst','-p','UnitFileState'],text=True).splitlines())
    container_policy=json.loads(subprocess.check_output(['docker','inspect',b.CONTAINER]))[0]['HostConfig']['RestartPolicy']['Name']
    continuity={'servicePolicy':policy,'containerRestartPolicy':container_policy,'verified':policy=={'Restart':'on-failure','RestartUSec':'3s','SuccessExitStatus':'143','StartLimitIntervalUSec':'5min','StartLimitBurst':'5','UnitFileState':'enabled'} and container_policy=='unless-stopped'}
    report={'applicationSource':b.SHA,'jarSha256':jarhash,'apiOrigin':'http://127.0.0.1:55438',
      'processIdentity':{'unit':b.UNIT,'pid':pid,'openJarMatches':openjar,'openJarSha256':jarhash if openjar else None,'sourceVersion':source,'cwd':str((Path('/proc')/str(pid)/'cwd').resolve())},
      'database':{**db,'transactionReadOnly':db['readOnly'],'readOnly':db['readOnly']=='on' and pool_readonly,'syntheticOnly':checks['syntheticOnly'],'currentDatabaseName':db['name'],'host':'127.0.0.1','port':55436,**receipt,'migrationsCount':len(rows),'migrationParity':parity,'syntheticCounts':counts,'appConnections':activity,'effectivePoolReadOnly':pool_readonly,'permissions':perms},
      'runtimeConfiguration':{'schedulingEnabled':runtime['MONEYVERSE_SCHEDULING_ENABLED'],'tickerEnabled':runtime['MONEYVERSE_MARKET_TICKERENABLED'],'botOffline':checks['botOffline'],'sqlInitMode':runtime['SPRING_SQL_INIT_MODE'],'hibernateDdlAuto':runtime['SPRING_JPA_HIBERNATE_DDLAUTO'],'network':network},
      'continuity':continuity,
      'checks':checks,'httpStatuses':{name:result['status'] for name,result in [('version',version),('session',session),('wallet',wallet),('walletBalance',balance),('walletSummary',summary),('forgedWalletSummary',forgedsummary),('admin',admin),('stock',stocks),('board',board),('forgedWallet',forgedwallet),('forgedAdmin',forgedadmin),('forgedPortfolio',forgedportfolio),('testOrigin',testcors),('productionOrigin',prodcors)]},
      'canonicalRowCounts':{'stocks':len(canonicalstocks),'board':len(canonicalboard)},
      'accepted':all(checks.values()) and continuity['verified'],
      'limitations':['Anonymous public reads and denial boundaries only. No member/admin positive session, financial mutation, full route inventory, or Production backend acceptance.','Read-only proof combines effective Hikari DEBUG configuration with independent app-role read-only SQL; no diagnostic endpoint added to application.']}
    private=b.STAGE/'acceptance.json'
    private.write_text(json.dumps(report,indent=2)+'\n');os.chmod(private,0o600)
    print(json.dumps(report,indent=2))
    return 0 if report['accepted'] else 1
if __name__=='__main__':raise SystemExit(main())
