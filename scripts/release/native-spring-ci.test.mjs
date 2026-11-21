import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,readdirSync,globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));

test('native Spring UI has an isolated source-bound CI test and artifact gate', () => {
  const ci=readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8');
  const job=ci.split('\n  spring-web-check:')[1];
  assert.ok(job,'native Spring job must exist');
  assert.match(job,/needs: \[classify, policy\]/);
  assert.match(job,/SPRING_PROFILES_ACTIVE: test/);
  assert.match(job,/SERVER_ADDRESS: 127\.0\.0\.1/);
  assert.match(job,/\.\/gradlew test bootJar/);
  const command=job.match(/run: node --test ([^\n]+)/)?.[1];
  assert.ok(command,'native UI test selection is required');
  const patterns=command.trim().split(/\s+/);
  assert.ok(patterns.every(value=>/^[a-z0-9*./_-]+$/i.test(value)),'test selection must contain file patterns only');
  const selected=new Set(patterns.flatMap(pattern=>globSync(pattern,{cwd:root})));
  const required=readdirSync(new URL('../../scripts/',import.meta.url))
    .filter(file=>file.startsWith('native-')&&file.endsWith('.test.mjs'))
    .map(file=>'scripts/'+file);
  required.push('scripts/admin-tools.test.mjs','scripts/mv39-money.test.mjs');
  for(const path of required)assert.ok(selected.has(path),'native CI omitted '+path);
  assert.match(job,/spring-native-candidate-\$\{\{ github\.sha \}\}/);
  assert.match(job,/sha256/);
  assert.doesNotMatch(job,/GH_TOKEN|secrets\.|sudo|systemctl|nginx|deployments: write|packages: write/);
});

test('canonical native administrator shop joins the existing disposable PostgreSQL gate without skipped proof',()=>{
  const ci=readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8');
  const gradle=readFileSync(new URL('../../spring-backend/build.gradle.kts',import.meta.url),'utf8');
  const gate=gradle.split('tasks.register<Test>("postgresMessagingTest")')[1]?.split('tasks.register<Test>("postgresShopTest")')[0];
  assert.ok(gate,'Existing disposable PostgreSQL task must remain available');
  assert.match(gradle,/excludeTags\([^\n]*"postgres-shop"/);
  assert.match(gate,/includeTags\("postgres-messaging", "postgres-shop"\)/);
  assert.match(gate,/AdminShopPostgresIntegrationTest\.xml/);
  assert.match(gate,/shopTests >= 5/);
  assert.match(gate,/shopFailures == 0 && shopErrors == 0 && shopSkipped == 0/);
  assert.match(ci,/"postgresMessagingTest","--no-daemon"/);
});
