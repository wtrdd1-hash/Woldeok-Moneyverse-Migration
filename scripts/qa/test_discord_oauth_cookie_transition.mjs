import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cookiesToClearAfterOAuthStart,
  cookiesToClearAfterOAuthCompletion,
} from '../../frontend/src/lib/oauth-cookie-transition.ts';

const OLD = 'mv_session=old-token; Path=/; HttpOnly; Secure; Max-Age=2592000';
const NEW = '__Host-mv_session=new-token; Path=/; HttpOnly; Secure; SameSite=Lax';

test('oauth login start invalidates preferred stale host cookie after Spring issues legacy session', () => {
  const cleared = cookiesToClearAfterOAuthStart([OLD], false);
  assert.equal(cleared.length, 1);
  assert.match(cleared[0], /^__Host-mv_session=;/);
  assert.match(cleared[0], /Max-Age=0/);
  assert.match(cleared[0], /Secure/);
  assert.match(cleared[0], /HttpOnly/);
  assert.match(cleared[0], /SameSite=Lax/);
});

test('oauth start preserves existing authenticated host cookie and non-legacy responses', () => {
  assert.deepEqual(cookiesToClearAfterOAuthStart([OLD], true), []);
  assert.deepEqual(cookiesToClearAfterOAuthStart([NEW], false), []);
  assert.deepEqual(cookiesToClearAfterOAuthStart([], false), []);
  assert.deepEqual(cookiesToClearAfterOAuthStart(['mv_session=; Max-Age=0; Path=/'], false), []);
});

test('successful Discord/Google sign-in clears stale Spring cookie when Node sets preferred cookie', () => {
  const cleared = cookiesToClearAfterOAuthCompletion([NEW], 'signed-in');
  assert.equal(cleared.length, 1);
  assert.match(cleared[0], /^mv_session=;/);
  assert.match(cleared[0], /Max-Age=0/);
  assert.match(cleared[0], /Secure/);
  assert.match(cleared[0], /SameSite=Lax/);
});

test('callback never clears another session for cancellation, linking, reauth or absent host issue', () => {
  for (const outcome of ['linked', 'reauthenticated', undefined, null]) {
    assert.deepEqual(cookiesToClearAfterOAuthCompletion([NEW], outcome), []);
  }
  assert.deepEqual(cookiesToClearAfterOAuthCompletion([OLD], 'signed-in'), []);
  assert.deepEqual(cookiesToClearAfterOAuthCompletion([], 'signed-in'), []);
  assert.deepEqual(cookiesToClearAfterOAuthCompletion(['__Host-mv_session=; Max-Age=0; Path=/'], 'signed-in'), []);
});
