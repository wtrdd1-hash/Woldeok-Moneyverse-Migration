import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ALLOWED = /\$\{|<[^>]+>|CHANGE_ME|GENERATE_A_[A-Z_]+|USER:PASSWORD@HOST|\bci_[a-z0-9_]+|process\.env/;
const SECRET_PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}/],
  ['cloud provider key', /AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}/],
  ['Slack credential', /xox[abprs]-[0-9A-Za-z-]{10,}|https:\/\/hooks\.slack\.com\/services\//],
  ['signed JWT', /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['credential URL', /:\/\/[A-Za-z0-9._%+-]+:[^@/\s"']{6,}@/],
];

export function forbiddenTrackedPath(path) {
  if (/(^|\/)\.env($|\.)/.test(path) && !/\.example$/.test(path)) return true;
  return /(^|\/)(backend\/(data|storage|uploads|backups)\/|backups\/)|\.(dump|backup|db|sqlite|sqlite3)(\.gz)?$|\.sql\.(gz|zst|xz)$|^backend\/.*\.(csv|jsonl|ndjson|log|bak)$/.test(path);
}

export function secretFindings(text) {
  if (ALLOWED.test(text)) return [];
  return SECRET_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

function run() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const failures = [];
  for (const file of files) {
    if (forbiddenTrackedPath(file)) {
      failures.push(`${file}: forbidden tracked runtime/secret data path`);
      continue;
    }
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    if (text.includes('\u0000')) continue;
    for (const finding of secretFindings(text)) failures.push(`${file}: ${finding}`);
  }
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('repository security scan passed');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
