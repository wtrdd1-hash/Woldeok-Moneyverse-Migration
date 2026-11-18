import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { runSemanticQa } from './scheduled-semantic-qa.mjs';

async function serve({ missingIs200 = false, allHtml502 = false, invalidRobots = false, adminStatus = 302 } = {}) {
  const server = createServer((req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405).end();
      return;
    }
    if (req.url === '/api/version') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { framework: 'Spring Boot 3.3.5', version: 'v-test', activeEngine: 'Java Spring Boot' } }));
      return;
    }
    if (allHtml502) {
      res.writeHead(502, { 'content-type': 'text/html' });
      res.end('<html>Bad gateway</html>');
      return;
    }
    if (req.url === '/' || req.url === '/login') {
      res.writeHead(200, { 'content-type': 'text/html; charset=UTF-8' });
      res.end('<!DOCTYPE html><html><body>Moneyverse</body></html>');
      return;
    }
    if (req.url === '/admin') {
      res.writeHead(adminStatus, adminStatus===302? {'location': '/login?error=login_required'} : {});
      res.end();
      return;
    }
    if (req.url === '/robots.txt') {
      res.writeHead(200, { 'content-type': invalidRobots?'text/html':'text/plain' });
      res.end(invalidRobots?'<html>Moneyverse</html>':'User-agent: *\nDisallow: /admin\n');
      return;
    }
    if (req.url === '/sitemap.xml') {
      res.writeHead(200, { 'content-type': 'application/xml' });
      res.end('<?xml version="1.0"?><urlset></urlset>');
      return;
    }
    if (req.url.startsWith('/__qa_semantic_not_found_')) {
      res.writeHead(missingIs200?200:404, { 'content-type': 'text/html' });
      res.end(missingIs200?'<html>SPA fallback</html>':'Not found');
      return;
    }
    res.writeHead(404).end();
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  return { server, base };
}

test('real HTTP success suite requires semantic content, auth redirect and missing-route 404', async () => {
  const { server, base } = await serve();
  try {
    const report = await runSemanticQa(base, { timeoutMs: 1500, label: 'test', candidateSha: 'a'.repeat(40) });
    assert.equal(report.summary.pass, 7);
    assert.equal(report.summary.fail, 0);
    assert.equal(report.summary.blocked, 0);
    assert.equal(report.overall, 'PASS');
    assert.equal(report.fullFunctionalQa, 'NOT_TESTED');
    assert.equal(report.releaseCertification, 'BLOCKED');
    assert.equal(report.candidateSha, 'a'.repeat(40));
  } finally { server.close(); }
});

test('fallback 200 and robots HTML are individual FAIL; never misreported as healthy', async () => {
  const { server, base } = await serve({ missingIs200: true, invalidRobots: true });
  try {
    const r = await runSemanticQa(base, { timeoutMs: 1500 });
    assert.equal(r.summary.fail, 2);
    assert.equal(r.overall, 'FAIL');
    assert.equal(r.cases.find(x => x.id==='SEM-404').result, 'FAIL');
    assert.equal(r.cases.find(x => x.id==='SEM-ROBOTS').result, 'FAIL');
  } finally { server.close(); }
});

test('official Test UI 502 with live API 200 is a FAIL rather than full QA PASS', async () => {
  const { server, base } = await serve({ allHtml502: true });
  try {
    const r = await runSemanticQa(base, { timeoutMs: 1500 });
    assert.equal(r.cases.find(x => x.id==='SEM-VERSION').result, 'PASS');
    assert.equal(r.cases.find(x => x.id==='SEM-HOME').result, 'FAIL');
    assert.equal(r.cases.find(x => x.id==='SEM-LOGIN').result, 'FAIL');
    assert.equal(r.overall, 'FAIL');
    assert.equal(r.releaseCertification, 'BLOCKED');
  } finally { server.close(); }
});

test('anonymous admin 403 allowed; transport error blocked, never body or credentials in report', async () => {
  const { server, base } = await serve({ adminStatus: 403 });
  try {
    const r = await runSemanticQa(base, { timeoutMs: 1500 });
    assert.equal(r.cases.find(x => x.id==='SEM-ADMIN').result, 'PASS');
    assert.equal(r.overall, 'PASS');
    assert.equal(JSON.stringify(r).includes('Moneyverse</body>'), false);
  } finally { server.close(); }
  const unreachable = await runSemanticQa('http://127.0.0.1:1', { timeoutMs: 400 });
  assert.equal(unreachable.overall, 'BLOCKED');
  assert.equal(unreachable.summary.blocked, 7);
  assert.equal(JSON.stringify(unreachable).includes('Bearer'), false);
});
