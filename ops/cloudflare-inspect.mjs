// Read-only. Prints hostnames and record names, never a credential.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('/e', 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trimStart().startsWith('#'))
    .map((line) => {
      const at = line.indexOf('=');
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const headers = env.CF_API_KEY?.length > 40 && !env.CF_EMAIL
  ? { authorization: `Bearer ${env.CF_API_KEY}` }
  : { 'x-auth-email': env.CF_EMAIL, 'x-auth-key': env.CF_GLOBAL_API_KEY ?? env.CF_API_KEY };

async function call(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers });
  return { status: response.status, body: await response.json() };
}

console.log('account', env.CF_ACCOUNT_ID ? 'set' : 'MISSING');
console.log('zone', env.CF_ZONE_ID ? 'set' : 'MISSING');
console.log('tunnel', env.CF_TUNNEL_ID ? 'set' : 'MISSING');
console.log('domain', env.CF_DOMAIN);

const config = await call(
  `/accounts/${env.CF_ACCOUNT_ID}/cfd_tunnel/${env.CF_TUNNEL_ID}/configurations`,
);
console.log('config status', config.status, 'ok', config.body.success);
if (config.body.success) {
  const ingress = config.body.result?.config?.ingress ?? [];
  console.log('ingress rules:');
  for (const rule of ingress) {
    console.log(`  ${rule.hostname ?? '(catch-all)'}${rule.path ? ' path=' + rule.path : ''} -> ${rule.service}`);
  }
} else {
  console.log(JSON.stringify(config.body.errors));
}

const dns = await call(`/zones/${env.CF_ZONE_ID}/dns_records?per_page=100`);
console.log('dns status', dns.status, 'ok', dns.body.success);
if (dns.body.success) {
  for (const record of dns.body.result) {
    console.log(`  ${record.type} ${record.name} proxied=${record.proxied}`);
  }
}
