#!/usr/bin/env bash
# Replaces unreadable OAuth display-name ciphertext with the current Discord
# profile name. Provider subjects remain encrypted: they are login identifiers,
# while display names are public labels and are deliberately stored as text.
set -euo pipefail

cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"
export STACK="${STACK:-wdmv}"

rows="$(mktemp)"
updates="$(mktemp)"
trap 'rm -f "$rows" "$updates"' EXIT

docker compose exec -T --user postgres db psql -X -qAt -F $'\t' \
  -U moneyverse_migrator -d "${DB_NAME:-moneyverse_migration}" \
  -c "SELECT user_id::text, provider_subject FROM public.identities WHERE provider='discord' AND display_name LIKE 'enc:v1:rnd:%'" \
  > "$rows"
[ -s "$rows" ] || { echo 'discord display-name recovery: nothing pending'; exit 0; }

docker compose exec -T backend node -e '
  const { createDecipheriv, createHash } = require("node:crypto");
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", chunk => { input += chunk; });
  process.stdin.on("end", async () => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guild = process.env.DISCORD_INTERACTIONS_GUILD_ID;
    if (!token || !guild) return;
    const raws = [process.env.DATA_ENCRYPTION_KEY, ...(process.env.LEGACY_DATA_ENCRYPTION_KEYS || "").split(",")].filter(Boolean);
    const keys = raws.map(raw => createHash("sha256").update(raw).digest());
    const decrypt = value => {
      if (!value.startsWith("enc:v1:")) return value;
      const p = value.split(":");
      for (const key of keys) try {
        const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(p[3], "hex"));
        decipher.setAuthTag(Buffer.from(p[4], "hex"));
        return Buffer.concat([decipher.update(Buffer.from(p[5], "hex")), decipher.final()]).toString("utf8");
      } catch {}
      return null;
    };
    const wanted = new Map(input.split("\n").filter(Boolean).map(line => {
      const [userId, subject] = line.split("\t");
      return [decrypt(subject), userId];
    }).filter(([subject]) => /^\d{5,32}$/.test(subject || "")));
    let after = "", matched = 0;
    do {
      const url = new URL(`https://discord.com/api/v10/guilds/${guild}/members`);
      url.searchParams.set("limit", "1000");
      if (after) url.searchParams.set("after", after);
      const response = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
      if (!response.ok) throw new Error(`Discord member lookup failed (${response.status})`);
      const members = await response.json();
      for (const member of members) {
        const userId = wanted.get(member.user?.id);
        const name = member.user?.global_name || member.user?.username;
        if (userId && typeof name === "string" && name.trim()) {
          process.stdout.write(`${userId}\t${Buffer.from(name.trim(), "utf8").toString("base64")}\n`);
          wanted.delete(member.user.id);
          matched++;
        }
      }
      after = members.length === 1000 ? members[members.length - 1]?.user?.id || "" : "";
    } while (after && wanted.size);
    process.stderr.write(`discord display-name recovery matched ${matched} member(s)\n`);
  });
' < "$rows" > "$updates"

[ -s "$updates" ] || { echo 'discord display-name recovery: no matching member'; exit 0; }
{
  cat <<'SQL'
CREATE TEMP TABLE recovered_names(user_id uuid PRIMARY KEY, encoded_name text);
COPY recovered_names(user_id, encoded_name) FROM STDIN;
SQL
  cat "$updates"
  cat <<'SQL'
\.
UPDATE public.identities AS identity
SET display_name = convert_from(decode(recovered.encoded_name, 'base64'), 'UTF8')
FROM recovered_names AS recovered
WHERE identity.user_id = recovered.user_id
  AND identity.provider = 'discord'
  AND identity.display_name LIKE 'enc:v1:rnd:%';
SQL
} | docker compose exec -T --user postgres db psql -X -q -v ON_ERROR_STOP=1 \
  -U moneyverse_migrator -d "${DB_NAME:-moneyverse_migration}"
echo "discord display-name recovery applied $(wc -l < "$updates") update(s)"
