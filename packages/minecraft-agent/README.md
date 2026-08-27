# Restricted Minecraft host agent

This is a deliberately small **host-only** control service for the Minecraft
systemd unit. It is not part of the web application and never accepts a shell
command, path, unit name, log selector, or program argument from HTTP.

It binds only to `127.0.0.1` (or `::1`), requires a high-entropy Bearer token,
uses a fixed service selected from a server-side allowlist, has a small request
body limit, rate limits, a mutation cooldown, bounded command output, and JSON
audit records on stdout. It uses `spawn(..., { shell: false })` for every host
command.

## Supported API

All requests require `Authorization: Bearer <MINECRAFT_AGENT_TOKEN>` and must
have no request body.

| Method | Endpoint | Fixed host action |
| --- | --- | --- |
| `GET` | `/v1/minecraft/status` | `systemctl show` for the configured service |
| `GET` | `/v1/minecraft/logs` | bounded recent `journalctl` output |
| `POST` | `/v1/minecraft/start` | `systemctl start` |
| `POST` | `/v1/minecraft/stop` | `systemctl stop` |
| `POST` | `/v1/minecraft/restart` | `systemctl restart` |

There is intentionally no `command`, `exec`, arbitrary service, arbitrary log
path, or arbitrary console endpoint. Keep this port private; do not publish it
through Docker, a reverse proxy, Cloudflare Tunnel, or a firewall rule.

## Configure and test locally

```bash
cd minecraft-agent
cp .env.example .env
# Edit .env: set a new token and the exact existing systemd unit name.
npm test
set -a; . ./.env; set +a
npm run build
npm start
```

This package is TypeScript. `npm test` compiles to `dist/` and runs the
compiled tests; `npm start` runs the compiled `dist/src/server.js`. Run
`npm run build` after any source change and after `npm ci` on a fresh
checkout.

The first example environment intentionally does not start until its placeholder
token is replaced. Generate a token with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

For a local smoke test from the same host only:

```bash
curl --fail-with-body \
  -H "Authorization: Bearer $MINECRAFT_AGENT_TOKEN" \
  http://127.0.0.1:18080/v1/minecraft/status
```

Do not place this token in browser JavaScript, Discord messages, Git, a public
`.env`, or a container image. A Docker container's `127.0.0.1` is not the host's
loopback interface; use a narrowly designed, authenticated host-local bridge if
the main app must later request operations. That bridge is intentionally outside
this agent and needs its own threat-model review.

## Minimal systemd installation

These commands are an operator checklist, not an automatic deployment. Verify
the service name first with `systemctl list-unit-files '*minecraft*.service'`.

1. Copy this directory to `/opt/woldeok-minecraft-agent` with source files owned
   by `root` and readable by the service account. Do not copy a development
   `.env` into it. Run `npm ci && npm run build` there — the unit starts the
   compiled `dist/src/server.js`, not `src/server.ts`.
2. Create the unprivileged account:

   ```bash
   sudo useradd --system --home /nonexistent --shell /usr/sbin/nologin moneyverse-agent
   ```

3. Create `/etc/woldeok-minecraft-agent.env`, owned by `root:moneyverse-agent`
   with mode `0640`. Copy the values from `.env.example`, replace the token, and
   use the exact service name. The configured service must also appear in
   `MINECRAFT_ALLOWED_SYSTEMD_SERVICES`.
4. Copy `systemd/woldeok-minecraft-agent.service` to
   `/etc/systemd/system/woldeok-minecraft-agent.service` and review every
   hardening option for the host distribution.
5. Copy `systemd/moneyverse-agent.sudoers.example` to
   `/etc/sudoers.d/moneyverse-minecraft-agent`, replacing both occurrences of
   `minecraft-server.service` and the `-n 200` value if configuration differs.
   Use exact commands only—never replace them with `ALL`, a wildcard, or a shell
   script. Validate it before enabling:

   ```bash
   sudo visudo -cf /etc/sudoers.d/moneyverse-minecraft-agent
   sudo chmod 0440 /etc/sudoers.d/moneyverse-minecraft-agent
   ```

6. Enable only after reviewing configuration:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now woldeok-minecraft-agent.service
   sudo systemctl status woldeok-minecraft-agent.service
   ```

If `/usr/bin/systemctl`, `/usr/bin/journalctl`, or `/usr/bin/sudo` differ on the
host, do **not** weaken the sudoers file. Update this reviewed code and the exact
sudoers entries together, then rerun the tests and review.

## Operational notes

- Every response includes a request ID. Every request produces a structured
  stdout audit record without emitting its authorization header or logs.
- `start`, `stop`, and `restart` share a short cooldown. The agent also limits
  requests per loopback client.
- Rotate the token immediately if it appears in a shell history, process list,
  repository, or log. Restart the agent after rotation.
- This agent does not itself prove an end user is an administrator. The caller
  must enforce authenticated RBAC, two-person approval where required, and audit
  logging before making the host-local request.
