import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// High-confidence signatures only; never print credential values.
const ALLOWED = /\$\{|<[^>]+>|CHANGE_ME|GENERATE_A_[A-Z_]+|USER:PASSWORD@HOST|\bci_[a-z0-9_]+|process\.env/;
const SECRET_PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}/],
  ['cloud provider key', /AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}/],
  ['Slack credential', /xox[abprs]-[0-9A-Za-z-]{10,}|https:\/\/hooks\.slack\.com\/services\//],
  ['Discord webhook', /https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]{20,}/],
  ['Telegram bot credential', /(?:^|[^0-9])[0-9]{8,11}:[A-Za-z0-9_-]{35}(?:$|[^A-Za-z0-9_-])/],
  ['signed JWT', /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['credential URL', /:\/\/[A-Za-z0-9._%+-]+:[^@/\s"']{6,}@/],
];

const PRIVATE_DIRECTORY = /(^|\/)(?:ops\/(?:private|recovery)|docs\/(?:internal|private)|\.internal|\.secrets|secrets\/runtime)(?:\/|$)/i;
const PRIVATE_ARTIFACT = /(?:^|\/)(?:id_rsa|id_ed25519|\.pgpass)$|\.(?:pem|key|p12|pfx|jks|keystore|age)$|\.(?:tar\.zst\.enc|sql\.(?:gz|zst|xz)|dump(?:\.gz)?|backup(?:\.gz)?|db|sqlite3?)$/i;

export function forbiddenTrackedPath(path) {
  if (/(^|\/)\.env($|\.)/.test(path) && !/\.example$/.test(path)) return true;
  return PRIVATE_DIRECTORY.test(path)
    || PRIVATE_ARTIFACT.test(path)
    || /(^|\/)(backend\/(data|storage|uploads|backups)\/|backups\/)/.test(path)
    || /^backend\/.*\.(csv|jsonl|ndjson|log|bak)$/.test(path);
}

// Existing historical internal notes may already be tracked. Refuse NEW or CHANGED
// internal/private copies without making the pre-existing baseline retroactively fail.
export function forbiddenChangedPath(path) {
  return forbiddenTrackedPath(path)
    || /(^|\/)\.npmrc$/i.test(path)
    || /^docs\/(?:updates|worklog|changelog)\/[^/]*internal[^/]*\.(?:md|txt|json|log)$/i.test(path)
    || /(^|\/)(?:audit-raw|mcp-raw|ops-secret)[^/]*\.(?:json|md|txt|log)$/i.test(path);
}

export function secretFindings(text) {
  const findings = new Set();
  for (const line of text.split('\n')) {
    if (ALLOWED.test(line)) continue;
    for (const [name, pattern] of SECRET_PATTERNS) {
      if (pattern.test(line)) findings.add(name);
    }
  }
  return [...findings];
}

function run() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const failures = [];
  for (const file of files) {
    if (forbiddenTrackedPath(file)) {
      failures.push(file + ': forbidden tracked private artifact');
      continue;
    }
    let contents;
    try { contents = readFileSync(file, 'utf8'); } catch { continue; }
    if (contents.includes('\u0000')) continue;
    for (const finding of secretFindings(contents)) failures.push(file + ': ' + finding);
  }

  const base = process.env.SECURITY_BASE_SHA || '';
  if (base && /^[0-9a-f]{40}$/.test(base) && execFileSync('git', ['cat-file', '-t', base], { encoding: 'utf8' }).trim() === 'commit') {
    const changed = execFileSync('git', ['diff', '--name-only', '-z', '--diff-filter=ACMR', base, 'HEAD'], { encoding: 'utf8' }).split('\0').filter(Boolean);
    for (const file of changed) if (forbiddenChangedPath(file)) {
      failures.push(file + ': new/modified internal or sensitive path forbidden');
    }
  } else if (process.env.GITHUB_ACTIONS === 'true') {
    failures.push('missing/invalid SECURITY_BASE_SHA: refusing unverified CI scan');
  }

  if (failures.length) {
    for (const item of [...new Set(failures)]) console.error(item);
    process.exitCode = 1;
  } else {
    console.log('repository security scan passed');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
