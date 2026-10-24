/**
 * Pre-merge protection against independently green PRs claiming the same
 * PostgreSQL migration number. In-branch migration-parity tests cannot see
 * migrations added on another open PR; the merged result would be invalid.
 *
 * Read-only GitHub API: no branch, PR, database or deployment mutation.
 */

const MIGRATION = /^packages\/database\/migrations\/([0-9]{3})-[A-Za-z0-9._-]+\.sql$/;
const ADDITIONS = new Set(['added', 'renamed', 'copied']);

export function migrationNumber(file) {
  if (!file || !ADDITIONS.has(file.status)) return null;
  const match = MIGRATION.exec(file.filename ?? '');
  return match ? Number(match[1]) : null;
}

export function findMigrationCollisions(currentPr, currentFiles, otherPulls) {
  const current = currentFiles
    .map((file) => ({ number: migrationNumber(file), filename: file.filename }))
    .filter((file) => file.number !== null);
  if (current.length === 0) return [];

  const collisions = [];
  for (const pull of otherPulls) {
    if (pull.number === currentPr) continue;
    for (const other of pull.files) {
      const number = migrationNumber(other);
      if (number === null) continue;
      for (const file of current) {
        if (file.number !== number) continue;
        collisions.push({
          number,
          currentFile: file.filename,
          otherPr: pull.number,
          otherFile: other.filename,
        });
      }
    }
  }
  return collisions.sort((a, b) => a.number - b.number || a.otherPr - b.otherPr);
}

async function main() {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') return;
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const pr = Number(process.env.PR_NUMBER);
  if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !token || !Number.isSafeInteger(pr) || pr < 1) {
    throw new Error('migration collision check requires a valid PR, repository and read-only GitHub token');
  }

  async function api(path) {
    const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'moneyverse-migration-collision-guard',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status} while checking migration PRs`);
    const result = await response.json();
    if (!Array.isArray(result)) throw new Error('GitHub API did not return a list');
    return result;
  }

  async function pages(path, limit = 30) {
    const result = [];
    for (let page = 1; page <= limit; page += 1) {
      const separator = path.includes('?') ? '&' : '?';
      const items = await api(`${path}${separator}per_page=100&page=${page}`);
      result.push(...items);
      if (items.length < 100) return result;
    }
    throw new Error('GitHub API pagination cap reached; cannot prove migration safety');
  }

  const currentFiles = await pages(`pulls/${pr}/files`);
  if (!currentFiles.some((file) => migrationNumber(file) !== null)) {
    console.log('Migration PR collision guard: no added migrations; no cross-PR scan required.');
    return;
  }

  const openPulls = (await pages('pulls?state=open')).filter((pull) => pull.number !== pr);
  const otherPulls = [];
  // Bound concurrency so large repositories do not exhaust secondary rate limits.
  for (let index = 0; index < openPulls.length; index += 5) {
    const batch = await Promise.all(openPulls.slice(index, index + 5).map(async (pull) => ({
      number: pull.number,
      files: await pages(`pulls/${pull.number}/files`),
    })));
    otherPulls.push(...batch);
  }

  const collisions = findMigrationCollisions(pr, currentFiles, otherPulls);
  if (collisions.length === 0) {
    console.log(`Migration PR collision guard: checked ${otherPulls.length} open PRs; no number conflicts.`);
    return;
  }
  for (const conflict of collisions) {
    console.error(`::error::Migration ${conflict.number} is claimed by PR #${pr} (${conflict.currentFile}) and open PR #${conflict.otherPr} (${conflict.otherFile}). Coordinate a new immutable version before merge.`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error(`::error::Migration PR collision guard unavailable: ${error instanceof Error ? error.message : String(error)}. Fail closed.`);
    process.exitCode = 1;
  });
}