import { describe, expect, it } from 'vitest';
import { filterSupportThreads, parseSupportStatus, supportStatusHref } from './support-status';

const threads = [
  { thread_id: 'a', status: 'open' },
  { thread_id: 'b', status: 'waiting_user' },
  { thread_id: 'c', status: 'resolved' },
  { thread_id: 'd', status: 'open' },
];

describe('bounded support status filter', () => {
  it('allows only known statuses and defaults to all', () => {
    expect(parseSupportStatus('open')).toBe('open');
    expect(parseSupportStatus('waiting_user')).toBe('waiting_user');
    expect(parseSupportStatus('resolved')).toBe('resolved');
    expect(parseSupportStatus('OPEN')).toBe('all');
    expect(parseSupportStatus('admin')).toBe('all');
    expect(parseSupportStatus(undefined)).toBe('all');
  });

  it('filters only the provided recent window and preserves server order', () => {
    expect(filterSupportThreads(threads, 'open').map((t) => t.thread_id)).toEqual(['a', 'd']);
    expect(filterSupportThreads(threads, 'resolved').map((t) => t.thread_id)).toEqual(['c']);
    expect(filterSupportThreads(threads, 'all')).toEqual(threads);
    expect(filterSupportThreads(threads, 'waiting_user').length).toBe(1);
  });

  it('does not manufacture missing older threads from an empty window', () => {
    expect(filterSupportThreads([], 'resolved')).toEqual([]);
  });

  it('keeps a selected thread in filter navigation and escapes parameters', () => {
    expect(supportStatusHref('resolved', 'abc?foo=1')).toBe(
      '/support?status=resolved&thread=abc%3Ffoo%3D1',
    );
    expect(supportStatusHref('all')).toBe('/support');
  });
});
