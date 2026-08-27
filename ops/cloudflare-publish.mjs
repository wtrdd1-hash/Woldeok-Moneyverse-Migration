// Publishes one hostname through the tunnel that already runs on this host.
//
// Two changes, both idempotent: a proxied CNAME pointing the name at the
// tunnel, and one ingress rule routing it to this stack's edge container.
//
// The tunnel's configuration is shared with six other hostnames, so the
// existing rules are read, preserved, and written back with exactly one entry
// added — and the whole document is saved to disk first. The new rule goes
// immediately before the catch-all, because Cloudflare matches in order and
// anything after the catch-all is unreachable.
import { readFileSync, writeFileSync } from 'node:fs';

const HOSTNAME = process.env.PUBLISH_HOSTNAME;
const SERVICE = process.env.PUBLISH_SERVICE;
if (!HOSTNAME || !SERVICE) throw new Error('PUBLISH_HOSTNAME and PUBLISH_SERVICE are required');

const env = Object.fromEntries(
  readFileSync('/e', 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trimStart().startsWith('#'))
    .map((line) => {
      const at = line.indexOf('=');
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const headers = {
  'content-type': 'application/json',
  'x-auth-email': env.CF_EMAIL,
  'x-auth-key': env.CF_GLOBAL_API_KEY ?? env.CF_API_KEY,
};

async function call(path, init = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...init });
  const body = await response.json();
  if (!body.success) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed: ${JSON.stringify(body.errors)}`);
  }
  return body.result;
}

const tunnelPath = `/accounts/${env.CF_ACCOUNT_ID}/cfd_tunnel/${env.CF_TUNNEL_ID}/configurations`;
const current = await call(tunnelPath);
writeFileSync('/backup/tunnel-config.json', JSON.stringify(current, null, 2));
console.log('saved the existing configuration to tunnel-config.json');

const ingress = current.config?.ingress ?? [];
const already = ingress.find((rule) => rule.hostname === HOSTNAME);

if (already) {
  console.log(`ingress: ${HOSTNAME} already routes to ${already.service}`);
  if (already.service !== SERVICE) {
    already.service = SERVICE;
    await call(tunnelPath, {
      method: 'PUT',
      body: JSON.stringify({ config: { ...current.config, ingress } }),
    });
    console.log(`ingress: repointed ${HOSTNAME} to ${SERVICE}`);
  }
} else {
  // The catch-all is the rule with no hostname; everything after it is dead.
  const catchAll = ingress.findIndex((rule) => rule.hostname === undefined);
  const at = catchAll === -1 ? ingress.length : catchAll;
  ingress.splice(at, 0, { hostname: HOSTNAME, service: SERVICE });
  await call(tunnelPath, {
    method: 'PUT',
    body: JSON.stringify({ config: { ...current.config, ingress } }),
  });
  console.log(`ingress: added ${HOSTNAME} -> ${SERVICE} (${ingress.length} rules now)`);
}

const target = `${env.CF_TUNNEL_ID}.cfargotunnel.com`;
const existing = await call(
  `/zones/${env.CF_ZONE_ID}/dns_records?type=CNAME&name=${encodeURIComponent(HOSTNAME)}`,
);
const record = { type: 'CNAME', name: HOSTNAME, content: target, proxied: true, ttl: 1 };

if (existing.length === 0) {
  await call(`/zones/${env.CF_ZONE_ID}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(record),
  });
  console.log(`dns: created CNAME ${HOSTNAME}`);
} else {
  const first = existing[0];
  if (first.content === target && first.proxied) {
    console.log(`dns: CNAME ${HOSTNAME} already points at the tunnel`);
  } else {
    await call(`/zones/${env.CF_ZONE_ID}/dns_records/${first.id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
    console.log(`dns: repointed CNAME ${HOSTNAME}`);
  }
}
