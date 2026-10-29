import { afterEach, describe, expect, it, vi } from 'vitest';
import { activePublicationWindow, publishAutomaticBlogWindow } from './blog-standalone-worker';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';

afterEach(() => { vi.unstubAllEnvs(); });
describe('standalone verified blog job and local two-hour catch-up', () => {
  it('rounds odd hours to most recent even Seoul window, preserving date', () => {
    expect(selectTwoHourBlogSlot(activePublicationWindow(new Date('2026-10-29T13:58:00+09:00')))?.periodKey)
      .toBe('2026-10-29T12:00+09:00');
    expect(selectTwoHourBlogSlot(activePublicationWindow(new Date('2026-10-29T00:30:00+09:00')))?.periodKey)
      .toBe('2026-10-29T00:00+09:00');
    expect(selectTwoHourBlogSlot(activePublicationWindow(new Date('2026-10-29T23:59:00+09:00')))?.periodKey)
      .toBe('2026-10-29T22:00+09:00');
    expect(selectTwoHourBlogSlot(activePublicationWindow(new Date('2026-10-30T02:00:00+09:00')))?.periodKey)
      .toBe('2026-10-30T02:00+09:00');
  });
  it('does not connect or publish when not explicitly enabled', async () => {
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'false');
    const connect = vi.fn();
    await expect(publishAutomaticBlogWindow({connect} as never, new Date('2026-10-29T14:05:00+09:00')))
      .resolves.toEqual({skipped:true,reason:'PUBLISHER_DISABLED',periodKey:'2026-10-29T14:00+09:00'});
    expect(connect).not.toHaveBeenCalled();
  });
  it('exits without publishing if another publisher owns the DB lock', async () => {
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'true');
    const query = vi.fn().mockResolvedValue({rows:[{locked:false}]});
    const release = vi.fn();
    const connect = vi.fn().mockResolvedValue({query,release});
    await expect(publishAutomaticBlogWindow({connect} as never, new Date('2026-10-29T14:05:00+09:00')))
      .resolves.toEqual({skipped:true,reason:'PUBLISHER_BUSY',periodKey:'2026-10-29T14:00+09:00'});
    expect(query).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });
  it('releases its lock and connection when existing receipt skips generation', async () => {
    vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED', 'true');
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('pg_try_advisory_lock')) return {rows:[{locked:true}]};
      if (sql.includes('FROM public.blog_verified_articles WHERE period_key')) return {rows:[{receipt:'r',content_digest:'d',status:'PUBLISHED'}]};
      if (sql.includes('pg_advisory_unlock')) return {rows:[{pg_advisory_unlock:true}]};
      throw Error('unexpected query');
    });
    const release=vi.fn(), connect=vi.fn().mockResolvedValue({query,release});
    const result=await publishAutomaticBlogWindow({connect} as never, new Date('2026-10-29T14:06:00+09:00'));
    expect(result).toMatchObject({skipped:true,reason:'SLOT_ALREADY_CLAIMED',periodKey:'2026-10-29T14:00+09:00'});
    expect(query.mock.calls.map(c=>c[0])).toContain('SELECT pg_advisory_unlock(hashtext($1),hashtext($2))');
    expect(release).toHaveBeenCalledOnce();
  });
});
