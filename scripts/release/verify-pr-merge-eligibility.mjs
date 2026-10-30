#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const blockedLabel = /\b(?:hold|blocked|wip)\b|\bdo[-_ ]?not[-_ ]?merge\b/i;
const blockedTitle = /(?:^|[\s\[(/:])(?:draft|hold|wip|do[-_ ]?not[-_ ]?merge)(?=$|[\s\])/:])/i;

export function verifyPrMergeEligibility(event) {
  const pr = event?.pull_request;
  if (!pr || typeof pr !== 'object') throw new Error('unknown pull request metadata');
  if (pr.draft !== false) throw new Error('draft or unknown readiness');
  if (pr.state !== 'open') throw new Error('pull request is not open');
  if (typeof pr.base?.ref !== 'string' || !pr.base.ref) throw new Error('unknown pull request base');
  if (!Number.isSafeInteger(pr.number) || pr.number <= 0) throw new Error('unknown PR number');
  if (typeof pr.head?.sha !== 'string' || !/^[0-9a-f]{40}$/.test(pr.head.sha)) {
    throw new Error('unknown PR head SHA');
  }
  if (typeof pr.title !== 'string' || !pr.title.trim()) throw new Error('unknown PR title');
  if (!Array.isArray(pr.labels) || pr.labels.some((label) => typeof label?.name !== 'string')) {
    throw new Error('unknown PR labels');
  }
  if (blockedTitle.test(pr.title)) throw new Error('draft/HOLD/WIP title forbids merge');
  if (pr.labels.some((label) => blockedLabel.test(label.name))) {
    throw new Error('HOLD/blocked/do-not-merge label forbids merge');
  }
  return { number: pr.number, headSha: pr.head.sha, status: 'eligible' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const path = process.argv[2] || process.env.GITHUB_EVENT_PATH;
    if (!path) throw new Error('GITHUB_EVENT_PATH missing');
    const event = JSON.parse(readFileSync(path, 'utf8'));
    process.stdout.write(JSON.stringify(verifyPrMergeEligibility(event)) + '\n');
  } catch (error) {
    process.stderr.write('::error::BLOCKED: ' + error.message + '\n');
    process.exitCode = 1;
  }
}
