import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('native Spring UI has an isolated source-bound CI test and artifact gate', () => {
  const ci=readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8');
  const job=ci.split('\n  spring-web-check:')[1];
  assert.ok(job,'native Spring job must exist');
  assert.match(job,/needs: \[classify, policy\]/);
  assert.match(job,/SPRING_PROFILES_ACTIVE: test/);
  assert.match(job,/SERVER_ADDRESS: 127\.0\.0\.1/);
  assert.match(job,/\.\/gradlew test bootJar/);
  assert.match(job,/native-chrome\.test\.mjs/);
  assert.match(job,/spring-native-candidate-\$\{\{ github\.sha \}\}/);
  assert.match(job,/sha256/);
  assert.doesNotMatch(job,/GH_TOKEN|secrets\.|sudo|systemctl|nginx|deployments: write|packages: write/);
});
