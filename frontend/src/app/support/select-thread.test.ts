import { describe, expect, it } from 'vitest';
import { selectSupportThread } from './select-thread';

const owned = [{ thread_id: '11111111-1111-4111-8111-111111111111' }, { thread_id: '22222222-2222-4222-8222-222222222222' }];

describe('private support deep-link selection', () => {
  it('selects only a thread confirmed in the owner-scoped API list', () => {
    expect(selectSupportThread(owned, owned[1]!.thread_id)).toEqual({ selected: owned[1]!.thread_id, unavailable: false });
  });
  it('falls back to an owned thread without querying a foreign, stale, or malformed ID', () => {
    expect(selectSupportThread(owned, '33333333-3333-4333-8333-333333333333')).toEqual({ selected: owned[0]!.thread_id, unavailable: true });
    expect(selectSupportThread(owned, ['unexpected'])).toEqual({ selected: owned[0]!.thread_id, unavailable: true });
  });
  it('returns an empty state without leaking any requested ID when no threads exist', () => {
    expect(selectSupportThread([], '33333333-3333-4333-8333-333333333333')).toEqual({ selected: undefined, unavailable: true });
    expect(selectSupportThread([], undefined)).toEqual({ selected: undefined, unavailable: false });
  });
});
