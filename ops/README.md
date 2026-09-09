# Operator scripts

Run on the deployment host, never here. Each mounts a credentials file into a
container, does its work there, and prints only what it changed — so nothing
in this repository, this terminal, or a CI log ever holds a secret.

## `cloudflare-inspect.mjs`

Read-only. Lists the tunnel's ingress rules and the zone's DNS records.

```bash
docker run --rm \
  -v /root/Wolduk_Moneyverse/.env:/e:ro \
  -v "$PWD/ops/cloudflare-inspect.mjs:/s.mjs:ro" \
  node:20-alpine node /s.mjs
```

## `cloudflare-publish.mjs`

Publishes one hostname through the tunnel that already runs on the host: a
proxied CNAME, and one ingress rule pointing at this stack's edge container.

Both changes are idempotent, and the tunnel's whole existing configuration is
written to `/backup/tunnel-config.json` before anything is sent. The new rule
goes immediately *before* the catch-all, because Cloudflare matches ingress in
order and anything after the catch-all is unreachable.

```bash
mkdir -p ~/moneyverse-migration/cf-backup
docker run --rm \
  -e PUBLISH_HOSTNAME=migration.easy-scraping.com \
  -e PUBLISH_SERVICE=http://wdmv:80 \
  -v /root/Wolduk_Moneyverse/.env:/e:ro \
  -v "$PWD/ops/cloudflare-publish.mjs:/s.mjs:ro" \
  -v "$HOME/moneyverse-migration/cf-backup:/backup" \
  node:20-alpine node /s.mjs
```

The tunnel's configuration is shared with every other site on that host. The
script reads the existing rules, preserves them, and adds exactly one.

## `cloudflare-unpublish.mjs`

Takes one hostname back off the tunnel: its ingress rule and the CNAME that
aimed it there. Backs the tunnel up first, refuses to write a configuration
with no catch-all, and deletes a DNS record only when it is a CNAME pointing
at this tunnel — anything else belongs to another site and is left alone.

```bash
docker run --rm \
  -e UNPUBLISH_HOSTNAME=migration.easy-scraping.com \
  -v /root/Wolduk_Moneyverse/.env:/e:ro \
  -v "$PWD/ops/cloudflare-unpublish.mjs:/s.mjs:ro" \
  -v "$HOME/moneyverse-migration/cf-backup:/backup" \
  node:20-alpine node /s.mjs
```

## What cannot be automated

The two OAuth providers keep their redirect allowlists outside any API this
host holds a credential for:

| Provider | Where |
| --- | --- |
| Discord | Developer Portal → the application → OAuth2 → Redirects. `PATCH /applications/@me` answers 200 and silently ignores `redirect_uris`, so the portal is the only way. |
| Google | Cloud Console → Credentials → the OAuth 2.0 client → Authorised redirect URIs. |

Each needs `https://<host>/auth/<provider>/callback` — the exact value
`APP_BASE_URL` names, which the API also checks against `APP_BASE_URL`
before it will enable the provider at all.
