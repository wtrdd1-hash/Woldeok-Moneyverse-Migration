# Approved Minecraft operation executor

This package is a **host-local worker**, not a web service. It polls the
database for one already-approved, DB-leased fixed operation, calls the
loopback-only [`minecraft-agent`](../minecraft-agent/), then records a tiny
terminal receipt. It has no HTTP listener, browser route, Discord route,
shell execution, arbitrary target, arbitrary command, or raw-log storage.

```text
server operator → two-person approval → PostgreSQL approved record
                                             │
                                             ▼
                              host-local executor (this package)
                                             │ fixed operation only
                                             ▼
                             127.0.0.1 minecraft-agent → systemd
```

The web application can request an operation and show its safe receipt, but
cannot call this worker or the host agent. A worker starts only after the
separate host installation below. Do not run it in the web Docker container:
that container's `127.0.0.1` is not the Minecraft host.

## What the worker is allowed to do

The existing database function releases only `start`, `stop`, `restart`,
`status`, or `logs` after a different approver approves it. A lease is
single-attempt: if the worker dies after the host action but before completion,
the record becomes `lease_expired` rather than being automatically retried.

The stored receipt never contains raw agent output, logs, errors, command
text, endpoint/host information, or tokens:

| Fixed operation | Stored safe receipt |
| --- | --- |
| `start`, `stop`, `restart` | `accepted: true` and a SHA-256 response digest |
| `status` | normalized `running` / `stopped` / `starting` / `stopping` / `unknown` and a digest |
| `logs` | bounded line-count metadata, truncation flag, and a digest; never log text |
| failed host call / malformed response | terminal `failed` with an empty summary |

The worker never retries a claimed command itself. It emits only small JSON
events containing a fixed event name, UTC timestamp, opaque operation ID,
fixed operation name, fixed outcome/state, and replay flag. It intentionally
does not print caught error messages.

## Database privilege boundary

Migration `017-minecraft-executor-role.sql` creates the group role
`moneyverse_minecraft_executor` with `NOLOGIN`, `NOSUPERUSER`, `NOINHERIT`, no
database/role creation, no replication, and no `BYPASSRLS`. It fails closed if
an existing role with that exact name has weaker attributes. The role gets
`USAGE` on `public` and execution of exactly these two functions:

- `minecraft_claim_next_approved_operation(uuid, integer)`
- `minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)`

It has no direct table or sequence grants. `moneyverse_app` is explicitly
revoked from both execution functions and remains limited to requester/read
functions. The worker wraps every query in a transaction with a static
`SET LOCAL ROLE moneyverse_minecraft_executor`; it rejects SQL that is not one
of those two function calls.

Migration `020-minecraft-executor-privilege-reconciliation.sql` must follow
017 on upgraded databases. It removes otherwise inherited `PUBLIC EXECUTE`
capabilities (including extension helpers), rejects unsafe role memberships,
then verifies that the executor's **effective** `public` function access is
only the two functions above without removing the web/reconciler roles' own
explicit grants.

The migration intentionally does **not** create a password-bearing login user.
After migration review, a database administrator must provision a dedicated
`NOINHERIT` login principal using the site's secret-management process, make it
a member of the group role, and put only that principal's connection string in
the protected environment file. Never use `moneyverse_app`,
`moneyverse_migrator`, `postgres`, or the group role itself in
`MINECRAFT_EXECUTOR_DATABASE_URL`.

For example, the relationship—not a password literal—should be equivalent to:

```sql
CREATE ROLE moneyverse_minecraft_executor_login LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT moneyverse_minecraft_executor TO moneyverse_minecraft_executor_login;
```

Use a unique secret managed outside shell history/Git, or approved certificate
authentication. Do not give that login user direct table grants, `CREATEROLE`,
membership in `moneyverse_migrator`, or membership in `moneyverse_app`.

## Host installation checklist

This is a checklist only. It does not deploy anything automatically.

1. Review and apply the ordered migrations through 020 to a disposable/test
   database first. Do not migrate production without a reviewed backup and
   recovery rehearsal.
2. Install and test the loopback-only `minecraft-agent` on the same Mini PC.
   Keep its port private and use a fresh high-entropy agent token.
3. Copy this repository (including the root `src/minecraft/` modules) to
   `/opt/woldeok-moneyverse`; install production Node dependencies at the root,
   then build this package (both `npm ci` and `npm run build` must run here —
   the unit starts the compiled `dist/` output, not `src/main.ts`):

   ```bash
   cd /opt/woldeok-moneyverse
   npm ci --omit=dev
   cd minecraft-executor
   npm ci && npm run build
   ```

4. Create the unprivileged OS account:

   ```bash
   sudo useradd --system --home /nonexistent --shell /usr/sbin/nologin moneyverse-executor
   ```

5. Create `/etc/woldeok-minecraft-executor.env` from `.env.example`, owned by
   `root:moneyverse-executor` with mode `0640`. It must contain a dedicated
   database-login URL, `http://127.0.0.1:<agent-port>`, and the matching agent
   token. Never place these values in the web `.env`, Git, Docker image,
   browser code, or chat.
6. Copy `systemd/woldeok-minecraft-executor.service` to
   `/etc/systemd/system/`, review the paths, then enable it only after the
   preceding checks:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now woldeok-minecraft-executor.service
   sudo systemctl status woldeok-minecraft-executor.service
   ```

The unit deliberately has no `PrivateNetwork=true`: that would isolate it from
the host loopback agent. If the database is remote, restrict egress with the
host firewall or reviewed systemd `IPAddressAllow=` rules for the exact database
address as part of deployment—not with a broad public network exception.

## Configuration and tests

`MINECRAFT_EXECUTOR_DATABASE_URL` is mandatory and must use a dedicated login
role. `MINECRAFT_EXECUTOR_DB_ROLE` is fixed to the migration-created group role.
The agent endpoint must be an explicit literal `http://127.0.0.1:<port>` or
`http://[::1]:<port>`; `localhost`, HTTPS, paths, proxies, and public addresses
are rejected. The worker also requires a token of at least 32 bytes.

The configured agent timeout must leave at least five seconds within the
single-use lease for the completion receipt. Defaults are a 60-second lease,
25-second host-agent timeout, and a 3-second polling interval.

Run focused tests without starting an agent or connecting to a database:

```bash
cd minecraft-executor
npm test
```

This package is TypeScript. `npm test` compiles to `dist/` and runs the
compiled tests; `npm start` runs the compiled `dist/minecraft-executor/src/main.js`
(the entrypoint is nested under `dist/minecraft-executor/` rather than
`dist/src/`, because this package's build root spans the repository root so
its `../../src/minecraft/*.js` imports keep resolving correctly after
compilation). Run `npm run build` after any source change and after `npm ci`
on a fresh checkout.

From the repository root, the full suite is:

```bash
npm test
```

Do not invoke `dist/minecraft-executor/src/main.js` until the database role,
agent, protected environment file, systemd unit, and test approval workflow
have all been reviewed.
