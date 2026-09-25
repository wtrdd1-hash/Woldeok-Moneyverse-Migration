#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'frontend', 'src', 'app');

function parseArgs(argv) {
  let output = null;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--output') {
      output = argv[index + 1] ?? null;
      index += 1;
    }
  }
  return { output };
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && entry.name === 'page.tsx') files.push(full);
  }
  return files;
}
function routeFromFile(file) {
  const relative = path.relative(appRoot, path.dirname(file));
  if (relative === '') return '/';
  const segments = relative.split(path.sep).filter((segment) => {
    if (segment.startsWith('@')) return false;
    return !(segment.startsWith('(') && segment.endsWith(')'));
  });
  return `/${segments.join('/')}`;
}

function routeKind(route) {
  return route.includes('[') ? 'dynamic' : 'static';
}

async function recordFor(file) {
  const route = routeFromFile(file);
  const source = path.relative(repoRoot, file).split(path.sep).join('/');
  const text = await readFile(file, 'utf8');
  const dataPage = text.match(/data-page\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
  return {
    route,
    source,
    routeKind: routeKind(route),
    administrator: route === '/admin' || route.startsWith('/admin/'),
    dataPage,
  };
}

const { output } = parseArgs(process.argv.slice(2));
const files = await walk(appRoot);
const pages = await Promise.all(files.map(recordFor));
pages.sort((a, b) => a.route.localeCompare(b.route));
const duplicates = pages.filter((page, index) =>
  index > 0 && page.route === pages[index - 1].route
);
if (duplicates.length > 0) {
  throw new Error(`duplicate frontend routes: ${duplicates.map((page) => page.route).join(', ')}`);
}

const canonical = JSON.stringify(pages);
const inventory = {
  schemaVersion: 1,
  repositoryHead: process.env.GITHUB_SHA ?? null,
  routeCount: pages.length,
  administratorRouteCount: pages.filter((page) => page.administrator).length,
  dynamicRouteCount: pages.filter((page) => page.routeKind === 'dynamic').length,
  dataPageMarkerCount: pages.filter((page) => page.dataPage !== null).length,
  inventorySha256: createHash('sha256').update(canonical).digest('hex'),
  pages,
};

const serialized = `${JSON.stringify(inventory, null, 2)}\n`;
if (output) {
  const absolute = path.resolve(repoRoot, output);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, serialized);
} else {
  process.stdout.write(serialized);
}

if (pages.length === 0) throw new Error('no frontend page.tsx routes discovered');
if (inventory.administratorRouteCount === 0) throw new Error('no administrator routes discovered');
