import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../spring-backend/src/main/resources');
test('native template asset versions match their actual content rather than a stale release label',()=>{
  let references=0;
  for(const family of ['mv43','shared']) {
    for(const entry of readdirSync(resolve(root,'templates',family)).filter(file=>file.endsWith('.html'))) {
      const html=readFileSync(resolve(root,'templates',family,entry),'utf8');
      for(const match of html.matchAll(/(?:src|href)="(\/assets\/(?:mv39|mv40|mv43)\/[^"?]+)(?:\?v=([^"]+))?"/g)) {
        const file=resolve(root,'static','.'+match[1]);
        const expected=createHash('sha256').update(readFileSync(file)).digest('hex');
        assert.equal(match[2],expected,family+'/'+entry+': '+match[1]);references++;
      }
    }
  }
  assert.ok(references>=10,'All native entry scripts and styles must be addressed');
});
