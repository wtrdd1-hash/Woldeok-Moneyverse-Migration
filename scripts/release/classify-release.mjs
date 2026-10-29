#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const CLASSIFIER_VERSION = 'release-path-v1';

const DOC_PATHS = [
  /^docs\//,
  /^README(?:-KO)?\.md$/,
  /^README\//,
  /^AGENTS\.md$/,
  /^LICENSE$/,
  /^PROJECT_MEMORY\.md$/,
  /^implementation_plan\.md$/,
  /^walkthrough\.md$/,
  /^API_DOCUMENTATION\.md$/,
  /^[^/]+\.md$/,
];

const CONTROL_PATHS = [
  /^\.github\//,
  /^ops\//,
  /^deploy\//,
  /^scripts\//,
  /^(?:promote|stage)_[^/]+\.sh$/,
  /^capture_[^/]+\.js$/,
  /^\.editorconfig$/,
  /^\.gitignore$/,
  /^\.prettierrc\.json$/,
];

const RUNTIME_PATHS = [
  /^backend\//,
  /^frontend\//,
  /^bot\//,
  /^packages\//,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^tsconfig\.base\.json$/,
  /^eslint\.config\.mjs$/,
  /^\.npmrc$/,
  /^\.nvmrc$/,
];

const RUNTIME_GIT_PATHS = [
  'backend',
  'frontend',
  'bot',
  'packages',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'eslint.config.mjs',
  '.npmrc',
  '.nvmrc',
];

const CONTROL_GIT_PATHS = [
  '.github',
  'ops',
  'deploy',
  'scripts',
  'promote_*.sh',
  'stage_*.sh',
  '.editorconfig',
  '.gitignore',
  '.prettierrc.json',
];

function matchesAny(path, patterns) {
  return patterns.some((pattern) => pattern.test(path));
}

function pathKind(path) {
  const unsafeCharacter = Array.from(path).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 || character === '\\';
  });
  if (!path || path.startsWith('/') || path.split('/').includes('..') || unsafeCharacter) return 'unknown';
  if (matchesAny(path, DOC_PATHS)) {
    // An executable or machine-readable payload inside docs must not bypass release verification.
    if (path.startsWith('docs/') && !/\.(?:md|mdx|txt|png|jpe?g|gif|webp|pdf)$/.test(path)) return 'unknown';
    return 'docs';
  }
  if (matchesAny(path, CONTROL_PATHS)) return 'control';
  if (matchesAny(path, RUNTIME_PATHS)) return 'runtime';
  return 'unknown';
}

export function classifyPaths(paths) {
  const kinds = new Set(paths.map(pathKind));
  if (paths.length === 0 || kinds.has('unknown')) return 'UNKNOWN';

  const runtime = kinds.has('runtime');
  const control = kinds.has('control');
  if (runtime && control) return 'MIXED';
  if (runtime) return 'RUNTIME_RELEVANT';
  if (control) return 'CONTROL_PLANE_ONLY';
  return 'DOCS_ONLY';
}

function git(repo, args, options = {}) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function gitNul(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).split('\0').filter(Boolean);
}

function isSafeDocumentBlob(repo, revision, path) {
  const entries = gitNul(repo, ['ls-tree', '-z', '--full-tree', revision, '--', `:(literal)${path}`]);
  // Missing on one side is a normal addition/deletion; missing on both is invalid.
  if (entries.length === 0) return null;
  if (entries.length !== 1) return false;
  const [metadata, actualPath] = entries[0].split('\t');
  // Symlinks, gitlinks, executable files and tree entries must fail closed.
  return actualPath === path && /^100644 blob [0-9a-f]{40}$/.test(metadata);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function latestShaForPaths(repo, head, paths) {
  const value = git(repo, ['rev-list', '-1', head, '--', ...paths]);
  return value || null;
}

function migrationSetHash(repo, head) {
  const tree = git(repo, [
    'ls-tree',
    '-r',
    '--full-tree',
    head,
    '--',
    'packages/database/migrations',
  ]);
  return sha256(tree ? `${tree}\n` : '');
}

export function buildReleaseInput({ repo = process.cwd(), base, head }) {
  const root = resolve(repo);
  const repositoryHeadSha = git(root, ['rev-parse', `${head}^{commit}`]);
  const baseSha = git(root, ['rev-parse', `${base}^{commit}`]);
  const changedPaths = gitNul(root, [
    'diff',
    '--no-renames',
    '--name-only',
    '-z',
    '--diff-filter=ACMRD',
    baseSha,
    repositoryHeadSha,
  ]).sort();
  const unsafeDocumentBlob = changedPaths.some((path) => {
    if (pathKind(path) !== 'docs') return false;
    const before = isSafeDocumentBlob(root, baseSha, path);
    const after = isSafeDocumentBlob(root, repositoryHeadSha, path);
    return (before === null && after === null) || before === false || after === false;
  });
  // An unchanged branch ref is a no-op. Unknown paths or unsafe tree modes block release.
  const classification = baseSha === repositoryHeadSha && changedPaths.length === 0
    ? 'NO_CHANGES'
    : unsafeDocumentBlob ? 'UNKNOWN' : classifyPaths(changedPaths);
  const applicationSourceSha = latestShaForPaths(root, repositoryHeadSha, RUNTIME_GIT_PATHS);
  const controlPlaneSha = latestShaForPaths(root, repositoryHeadSha, CONTROL_GIT_PATHS);

  return {
    schemaVersion: 1,
    classifierVersion: CLASSIFIER_VERSION,
    baseSha,
    repositoryHeadSha,
    applicationSourceSha,
    controlPlaneSha,
    classification,
    changedPathsHash: sha256(changedPaths.length ? `${changedPaths.join('\n')}\n` : ''),
    migrationSetHash: migrationSetHash(root, repositoryHeadSha),
    changedPaths,
  };
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) throw new Error(`unexpected argument: ${arg}`);
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`missing value for --${key}`);
    values[key] = value;
    index += 1;
  }
  return values;
}

function emitGitHubOutputs(input, outputPath) {
  if (!outputPath) return;
  const lines = [
    `classification=${input.classification}`,
    `repository_head_sha=${input.repositoryHeadSha}`,
    `application_source_sha=${input.applicationSourceSha ?? ''}`,
    `control_plane_sha=${input.controlPlaneSha ?? ''}`,
    `changed_paths_hash=${input.changedPathsHash}`,
    `migration_set_hash=${input.migrationSetHash}`,
    `classifier_version=${input.classifierVersion}`,
  ];
  appendFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

const isMain =
  Boolean(process.argv[1]) &&
  (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href);

if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (!args.base || !args.head) {
      throw new Error('--base and --head are required');
    }
    const input = buildReleaseInput({ repo: args.repo, base: args.base, head: args.head });
    const json = `${JSON.stringify(input, null, 2)}\n`;
    if (args.output) writeFileSync(args.output, json, 'utf8');
    else process.stdout.write(json);
    emitGitHubOutputs(input, args['github-output'] || process.env.GITHUB_OUTPUT);
    if (input.classification === 'UNKNOWN') process.exitCode = 2;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
