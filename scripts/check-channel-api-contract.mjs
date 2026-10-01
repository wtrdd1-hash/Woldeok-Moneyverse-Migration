import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

function routeRootFor(channel) {
  return channel === 'APP' ? '/app-api/v2' : '/site-api/v1';
}

export function verifyChannelApiInventory({ manifest, mobileEndpoints, existingRouteRoots }) {
  const errors = [];
  const mobileKeys = new Set(
    mobileEndpoints.map((endpoint) => `${String(endpoint.method).toUpperCase()}:${endpoint.path}`),
  );
  const manifestKeys = new Set();

  for (const route of manifest) {
    const key = `${route.channel}:${route.method}:${route.pathTemplate}`;
    if (manifestKeys.has(key)) errors.push(`duplicate manifest route ${key}`);
    manifestKeys.add(key);

    const expectedPrefix = routeRootFor(route.channel);
    if (!route.pathTemplate.startsWith(`${expectedPrefix}/`)) {
      errors.push(`${key} does not use ${expectedPrefix}`);
    }

    if (route.channel === 'APP') {
      const sourceKey = `${route.method}:${route.legacyPath ?? ''}`;
      if (!route.legacyPath || !mobileKeys.has(sourceKey)) {
        errors.push(`APP manifest entry has no mobile contract source: ${key} legacy=${route.legacyPath}`);
      }
    }

    if (route.availability === 'LIVE' && !existingRouteRoots.has(expectedPrefix)) {
      errors.push(`LIVE ${route.channel} route root ${expectedPrefix} has no route handler`);
    }
  }

  const appByLegacy = new Set(
    manifest
      .filter((route) => route.channel === 'APP' && route.legacyPath)
      .map((route) => `${route.method}:${route.legacyPath}`),
  );
  for (const endpoint of mobileEndpoints) {
    const sourceKey = `${String(endpoint.method).toUpperCase()}:${endpoint.path}`;
    if (!appByLegacy.has(sourceKey)) {
      errors.push(`missing APP manifest entry for mobile contract endpoint ${sourceKey}`);
    }
  }

  return errors;
}

function existingPublicRouteRoots() {
  const roots = new Set();
  const known = [
    ['/app-api/v1', 'frontend/src/app/app-api/v1/[...path]/route.ts'],
    ['/app-api/v2', 'frontend/src/app/app-api/v2/[...path]/route.ts'],
    ['/site-api/v1', 'frontend/src/app/site-api/v1/[...path]/route.ts'],
  ];
  for (const [root, relative] of known) {
    if (fs.existsSync(path.join(ROOT, relative))) roots.add(root);
  }
  return roots;
}

function unknownChannelRouteFiles() {
  const files = [];
  for (const relativeRoot of ['frontend/src/app/app-api', 'frontend/src/app/site-api']) {
    const absolute = path.join(ROOT, relativeRoot);
    if (!fs.existsSync(absolute)) continue;
    const stack = [absolute];
    while (stack.length) {
      const current = stack.pop();
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.isFile() && entry.name === 'route.ts') files.push(path.relative(ROOT, full));
      }
    }
  }
  return files.filter((file) => ![
    'frontend/src/app/app-api/v1/[...path]/route.ts',
    'frontend/src/app/app-api/v2/[...path]/route.ts',
    'frontend/src/app/site-api/v1/[...path]/route.ts',
  ].includes(file));
}

function run() {
  const require = createRequire(import.meta.url);
  const { CHANNEL_API_ROUTES } = require(path.join(ROOT, 'packages/contract/dist/channel-api.js'));
  const mobile = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/mobile-api-contract.json'), 'utf8'));
  const roots = existingPublicRouteRoots();
  const errors = verifyChannelApiInventory({
    manifest: CHANNEL_API_ROUTES,
    mobileEndpoints: mobile.endpoints ?? [],
    existingRouteRoots: roots,
  });

  if (!roots.has('/app-api/v1')) {
    errors.push('legacy App API v1 compatibility route handler is missing before retirement');
  }
  for (const file of unknownChannelRouteFiles()) {
    errors.push(`unregistered App/Site public route handler: ${file}`);
  }

  if (errors.length) {
    console.error('Channel API contract check FAILED');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  const app = CHANNEL_API_ROUTES.filter((route) => route.channel === 'APP');
  const site = CHANNEL_API_ROUTES.filter((route) => route.channel === 'SITE');
  const live = CHANNEL_API_ROUTES.filter((route) => route.availability === 'LIVE');
  console.log(
    `Channel API contract check PASSED: APP=${app.length}, SITE=${site.length}, LIVE=${live.length}, TARGET=${CHANNEL_API_ROUTES.length - live.length}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
