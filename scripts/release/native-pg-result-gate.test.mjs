import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const tool=new URL('./verify-native-pg-results.py',import.meta.url);
const name='com.moneyverse.catalogread.CatalogReadPostgresIntegrationTest';
function run(xml) {
 const dir=mkdtempSync(join(tmpdir(),'native-pg-gate-')),path=join(dir,'result.xml');
 try{if(xml!==null)writeFileSync(path,xml);return spawnSync('python3',[fileURLToPath(tool),'--class',name,'--minimum','4',path],{encoding:'utf8'});}
 finally{rmSync(dir,{recursive:true,force:true});}
}
function suite(attrs='',cases='<testcase/><testcase/><testcase/><testcase/>'){
 return '<?xml version="1.0"?><testsuite name="'+name+'" tests="4" failures="0" errors="0" skipped="0" '+attrs+'>'+cases+'</testsuite>';
}
test('real nonzero complete JUnit evidence is required before the native PostgreSQL task passes',()=>{
 const result=run(suite());assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/tests=4 failures=0 errors=0 skipped=0/);
});
test('missing, empty, malformed, wrong-class, zero or skipped evidence fails closed without echoing XML',()=>{
 for(const xml of [null,'',suite().replace('tests="4"','tests="0"'),suite().replace('skipped="0"','skipped="1"'),suite().replace(name,'other.Class'),suite('tests="4"'),suite().slice(0,-12),suite('', '<testcase/>'),suite().replace('failures="0"','failures="1"'),suite('', '<testcase/><testcase/><testcase/><testcase><error>PRIVATE_FIXTURE_TEXT</error></testcase>')]){
  const result=run(xml);assert.equal(result.status,1);assert.match(result.stderr,/Invalid native PostgreSQL evidence/);
  assert.doesNotMatch(result.stdout+result.stderr,/PRIVATE_FIXTURE_TEXT|<testsuite/);
 }
});

test('actual Gradle CDATA logs cannot add evidence cases or hide a real result',()=>{
 const result=run(suite('', '<testcase/><testcase/><testcase/><testcase/><system-out><![CDATA[PRIVATE_FIXTURE_TEXT <testcase/> <error/>]]></system-out><system-err><![CDATA[]]></system-err>'));
 assert.equal(result.status,0,result.stderr);assert.doesNotMatch(result.stdout+result.stderr,/PRIVATE_FIXTURE_TEXT/);
});
