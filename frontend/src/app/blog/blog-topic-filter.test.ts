import { describe, expect, it } from 'vitest';
import { filterVerifiedEditorialTopic } from './blog-topic-filter';
import type { BlogHubSummary } from './blog-hub-client';

const make = (slug: string, verifiedTopic?: 'ECONOMY' | 'CODING' | 'COMPUTER') => ({
  slug, title: slug, excerpt: 'intro', category: verifiedTopic === 'ECONOMY' ? 'MACRO' : 'TECH',
  tags: [], author: { name: 'editor', role: 'writer', badge: 'verified' },
  publishedAt: '2026-10-28T00:00:00.000Z', readTimeMinutes: 3, views: 0,
  relatedCalculatorHref: '/blog', relatedCalculatorName: 'blog', categoryLabel: 'subject',
  ...(verifiedTopic ? { verifiedTopic } : {}),
}) as BlogHubSummary;

describe('verified editorial subject filter on public blog', () => {
  const posts = [make('verified-economy', 'ECONOMY'), make('verified-coding', 'CODING'),
    make('verified-computer', 'COMPUTER'), make('unverified-static')];
  it('does not filter the legacy all-topics hub', () => {
    expect(filterVerifiedEditorialTopic(posts, 'ALL')).toEqual(posts);
  });
  it('shows only source-verified rows of the requested topic', () => {
    expect(filterVerifiedEditorialTopic(posts, 'CODING').map(post => post.slug)).toEqual(['verified-coding']);
    expect(filterVerifiedEditorialTopic(posts, 'COMPUTER').map(post => post.slug)).toEqual(['verified-computer']);
    expect(filterVerifiedEditorialTopic(posts, 'ECONOMY').map(post => post.slug)).toEqual(['verified-economy']);
  });
});
