// Removes one hostname from the tunnel that runs on this host: its ingress
// rule and the CNAME that pointed the name at the tunnel.
//
// The inverse of cloudflare-publish.mjs, and it is deliberately narrower than
// that script is wide. The tunnel's configuration is shared with every other
// site on this machine, so:
//
//   * the whole document is saved to disk before anything is sent;
//   * the catch-all is never touched -- removing the rule with no hostname
//     would make every unmatched request reach whatever answered first;
//   * a DNS record is deleted only when it is a CNAME pointing at *this*
//     tunnel. An A record, or a CNAME aimed somewhere else, belongs to
//     something this script knows nothing about and is left alone.
//
// A hostname that is not there is not an error. Removing it twice is the same
// as removing it once.
import { readFileSync, writeFileSync } from 'node:fs';

const HOSTNAME = process.env.UNPUBLISH_HOSTNAME;
if (!HOSTNAME) throw new Error('UNPUBLISH_HOSTNAME is required');

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
const doomed = ingress.findIndex((rule) => rule.hostname === HOSTNAME);

if (doomed === -1) {
  console.log(`ingress: ${HOSTNAME} has no rule`);
} else {
  const [removed] = ingress.splice(doomed, 1);
  // Belt and braces: the catch-all has no hostname, so it cannot have matched
  // above, but a configuration that lost it would route every unmatched
  // request to whichever rule happened to be last.
  if (!ingress.some((rule) => rule.hostname === undefined)) {
    throw new Error('refusing to write an ingress list with no catch-all');
  }
  await call(tunnelPath, {
    method: 'PUT',
    body: JSON.stringify({ config: { ...current.config, ingress } }),
  });
  console.log(
    `ingress: removed ${HOSTNAME} -> ${removed.service} (${ingress.length} rules left)`,
  );
}

const target = `${env.CF_TUNNEL_ID}.cfargotunnel.com`;
const records = await call(
  `/zones/${env.CF_ZONE_ID}/dns_records?name=${encodeURIComponent(HOSTNAME)}`,
);

if (records.length === 0) {
  console.log(`dns: ${HOSTNAME} has no record`);
}
for (const record of records) {
  if (record.type !== 'CNAME' || record.content !== target) {
    console.log(
      `dns: leaving ${record.type} ${record.name} alone — it does not point at this tunnel`,
    );
    continue;
  }
  await call(`/zones/${env.CF_ZONE_ID}/dns_records/${record.id}`, { method: 'DELETE' });
  console.log(`dns: deleted CNAME ${record.name}`);
}
