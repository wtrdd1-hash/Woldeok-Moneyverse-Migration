import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as release from './verify-isolated-test-public.mjs';

const origin='https://test.easy-scraping.com';
const fixture={purpose:'native-test-operator',origin,username:'native-qa',password:'synthetic-operator-'.padEnd(48,'x')};
async function temporary(run) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'native-operator-test-'));
  try{return await run(dir);}finally{
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));
    await fs.rm(dir,{recursive:true,force:true});
  }
}
test('operator authorization is sent only to fixed Test read-only probes without redirects',async()=>{
  assert.equal(typeof release.createTestPublicRequester,'function');
  const calls=[],authorization='Basic '+Buffer.from(fixture.username+':'+fixture.password).toString('base64');
  const request=release.createTestPublicRequester(authorization,async(url,options)=>{calls.push({url,options});return {ok:true};});
  await request('/api/version');await request('/','HEAD');
  assert.equal(calls.length,2);
  for(const {url,options} of calls) {
    assert.equal(url.origin,origin);
    assert.equal(options.headers.authorization,authorization);
    assert.equal(options.redirect,'error');
    assert.equal(options.cache,'no-store');
  }
  assert.throws(()=>request('https://easy-scraping.com/api/version'));
  assert.throws(()=>request('//example.invalid/'));
  assert.throws(()=>request('/api/version?redirect=elsewhere'));
  assert.throws(()=>request('/api/version','POST'));
  assert.equal(calls.length,2);
});
test('operator credentials are optional for anonymous evidence checks',async()=>{
  assert.equal(typeof release.createTestPublicRequester,'function');
  let headers;
  await release.createTestPublicRequester(undefined,async(_,options)=>{headers=options.headers;return {};})('/frontend-version');
  assert.equal(Object.hasOwn(headers,'authorization'),false);
});
test('a private scoped Test credential file produces authorization without exposing its values',async()=>{
  assert.equal(typeof release.loadTestOperatorAuthorization,'function');
  await temporary(async dir=>{
    const file=path.join(dir,'operator.json');await fs.writeFile(file,JSON.stringify(fixture),{mode:0o600});
    const authorization=await release.loadTestOperatorAuthorization(file);
    assert.equal(authorization,'Basic '+Buffer.from(fixture.username+':'+fixture.password).toString('base64'));
  });
});
test('Production or another purpose cannot be used as Test operator credentials',async()=>{
  assert.equal(typeof release.loadTestOperatorAuthorization,'function');
  await temporary(async dir=>{
    for(const changed of [{origin:'https://easy-scraping.com'},{purpose:'database-login'},{username:'moneyverse_app'}]) {
      const file=path.join(dir,'operator.json');await fs.writeFile(file,JSON.stringify({...fixture,...changed}),{mode:0o600});
      await assert.rejects(release.loadTestOperatorAuthorization(file));
    }
  });
});
test('group-readable credential files and relative credential paths fail closed',async()=>{
  assert.equal(typeof release.loadTestOperatorAuthorization,'function');
  await temporary(async dir=>{
    const file=path.join(dir,'operator.json');await fs.writeFile(file,JSON.stringify(fixture),{mode:0o644});
    await assert.rejects(release.loadTestOperatorAuthorization(file));
  });
  await assert.rejects(release.loadTestOperatorAuthorization('operator.json'));
});
test('credential symlinks cannot redirect a release probe to another secret file',async()=>{
  assert.equal(typeof release.loadTestOperatorAuthorization,'function');
  await temporary(async dir=>{
    const file=path.join(dir,'operator.json'),link=path.join(dir,'operator-link.json');
    await fs.writeFile(file,JSON.stringify(fixture),{mode:0o600});await fs.symlink(file,link);
    await assert.rejects(release.loadTestOperatorAuthorization(link));
  });
});
