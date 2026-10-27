import { describe, expect, it } from 'vitest';
import {
  moderationPageHref,
  parseChatQueue,
  parseTakedownQueue,
  readModerationOffset,
  safeTargetHref,
} from './moderation-queue';

const chat = {
  report_id: '11111111-1111-4111-8111-111111111111', reporter_id: '22222222-2222-4222-8222-222222222222', reporter_username: 'reporter',
  reporter_nickname: 'Reporter', reported_user_id: '33333333-3333-4333-8333-333333333333',
  reported_username: 'reported', reported_nickname: 'Reported',
  conversation_id: '44444444-4444-4444-8444-444444444444', reason: 'fraud_scam', details: 'Evidence',
  evidence_count: 3, status: 'SUBMITTED', created_at: '2026-10-27T01:00:00Z',
  actioned_at: null, actioned_by: null, actioner_nickname: null,
};
const takedown = {
  id: '55555555-5555-4555-8555-555555555555', case_id: 'TKD-20261028-ABC123', requester_email: 'user@example.com',
  requester_type: 'victim_self', reason_category: 'doxxing_credible_threat',
  target_content_url: 'https://example.com/post/1', target_content_type: 'board_post',
  description: 'Evidence', status: 'SUBMITTED', admin_notes: null,
  actioned_at: null, created_at: '2026-10-27T01:00:00Z',
};

describe('moderation queues use authenticated page-sized API evidence', () => {
  it('accepts valid chat and takedown responses without treating count as global', () => {
    expect(parseChatQueue({ items: [chat], count: 1 })?.items).toHaveLength(1);
    expect(parseTakedownQueue({ items: [takedown], count: 1 })?.items).toHaveLength(1);
    expect(parseTakedownQueue({ items: [{ ...takedown, status: 'APPEALED' }], count: 1 })?.items).toHaveLength(1);
  });
  it('keeps failures distinct from verified empty queues', () => {
    expect(parseChatQueue(null)).toBeNull();
    expect(parseTakedownQueue({ error: 'timeout' })).toBeNull();
    expect(parseChatQueue({ items: [], count: 0 })?.items).toEqual([]);
    expect(parseTakedownQueue({ items: [], count: 0 })?.items).toEqual([]);
  });
  it('rejects partial, forged or inconsistent records before showing action controls', () => {
    expect(parseChatQueue({ items: [chat], count: 99 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, report_id: '' }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, evidence_count: -1 }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, created_at: 'invalid' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, case_id: null }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, status: 'UNKNOWN' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [takedown, takedown], count: 2 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, status: 'TRIAGED' }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: Array(51).fill(chat), count: 51 })).toBeNull();
  });
  it('rejects malformed UUIDs, duplicate case numbers and invalid action dates', () => {
    expect(parseChatQueue({ items: [{ ...chat, report_id: 'not-a-uuid' }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, actioned_at: 'not-a-date' }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, actioned_by: 'wrong-id' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, case_id: 'invalid' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, id: 'invalid' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, actioned_at: 'garbage' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [takedown, { ...takedown, id: '66666666-6666-4666-8666-666666666666' }], count: 2 })).toBeNull();
  });
  it('rejects unsafe target URLs, unknown categories and unsupported chat reasons before enabling moderation', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,boom', 'ftp://example.com/a']) {
      expect(parseTakedownQueue({ items: [{ ...takedown, target_content_url: url }], count: 1 })).toBeNull();
    }
    expect(parseTakedownQueue({ items: [{ ...takedown, requester_type: 'unverified' }], count: 1 })).toBeNull();
    expect(parseTakedownQueue({ items: [{ ...takedown, target_content_type: 'unsafe' }], count: 1 })).toBeNull();
    expect(parseChatQueue({ items: [{ ...chat, reason: 'unknown' }], count: 1 })).toBeNull();
  });
  it('accepts only bounded page-aligned offsets and retains the selected queue', () => {
    expect(readModerationOffset('50')).toBe(50);
    expect(readModerationOffset('10000')).toBe(10000);
    expect(readModerationOffset('10050')).toBe(0); // NestJS rejects offsets above 10000
    for (const value of ['-50', '25', '1e2', 'Infinity', '9999999999', ['50'], undefined]) {
      expect(readModerationOffset(value)).toBe(0);
    }
    expect(moderationPageHref('takedowns', 50, 100)).toBe('/admin/safety?view=takedowns&chatOffset=50&takedownOffset=100');
    expect(moderationPageHref('chat-reports', 0, 50)).toBe('/admin/safety?view=chat-reports&chatOffset=0&takedownOffset=50');
  });
  it('never offers executable or unsafe schemes as evidence links', () => {
    expect(safeTargetHref('https://example.com/a')).toBe('https://example.com/a');
    expect(safeTargetHref('http://example.com/a')).toBe('http://example.com/a');
    expect(safeTargetHref('javascript:alert(1)')).toBeNull();
    expect(safeTargetHref('data:text/html,boom')).toBeNull();
    expect(safeTargetHref('/relative')).toBeNull();
    expect(safeTargetHref('https://user:pass@example.com')).toBeNull();
  });
});
