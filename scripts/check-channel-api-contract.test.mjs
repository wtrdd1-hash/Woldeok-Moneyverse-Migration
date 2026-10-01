import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyChannelApiInventory } from './check-channel-api-contract.mjs';

const appRoute = {
  channel: 'APP',
  method: 'GET',
  pathTemplate: '/app-api/v2/wallet',
  authMode: 'SESSION',
  scope: 'app.wallet.read',
  idempotencyRequired: false,
  csrfRequired: false,
  integrityPolicy: 'NONE',
  economyCommand: null,
  sharedReadOnly: false,
  availability: 'TARGET',
  legacyPath: '/app-api/v1/wallet',
};

test('reports a documented mobile endpoint missing from the App manifest', () => {
  const errors = verifyChannelApiInventory({
    manifest: [],
    mobileEndpoints: [{ method: 'GET', path: '/app-api/v1/wallet' }],
    existingRouteRoots: new Set(['/app-api/v1']),
  });
  assert.match(errors.join('\n'), /missing APP manifest entry/i);
});

test('requires a route handler root only after a channel route is LIVE', () => {
  const targetErrors = verifyChannelApiInventory({
    manifest: [appRoute],
    mobileEndpoints: [{ method: 'GET', path: '/app-api/v1/wallet' }],
    existingRouteRoots: new Set(['/app-api/v1']),
  });
  assert.equal(targetErrors.length, 0);

  const liveErrors = verifyChannelApiInventory({
    manifest: [{ ...appRoute, availability: 'LIVE' }],
    mobileEndpoints: [{ method: 'GET', path: '/app-api/v1/wallet' }],
    existingRouteRoots: new Set(['/app-api/v1']),
  });
  assert.match(liveErrors.join('\n'), /LIVE APP route root .*app-api\/v2/i);
});

test('rejects an APP manifest entry with no documented v1 source', () => {
  const errors = verifyChannelApiInventory({
    manifest: [{ ...appRoute, legacyPath: '/app-api/v1/not-real' }],
    mobileEndpoints: [{ method: 'GET', path: '/app-api/v1/wallet' }],
    existingRouteRoots: new Set(['/app-api/v1']),
  });
  assert.match(errors.join('\n'), /APP manifest entry has no mobile contract source/i);
});
