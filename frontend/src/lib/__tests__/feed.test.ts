import { describe, it, expect } from 'vitest';
import { GET } from '@/app/feed.xml/route';

describe('RSS 2.0 Feed XML Route', () => {
  it('generates a valid RSS 2.0 XML document with correct headers and channel meta', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toContain('public, max-age=3600');

    const xml = await response.text();

    // XML declaration and RSS root
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>월덕 머니버스 (Woldeok Moneyverse)</title>');
    expect(xml).toContain('<atom:link href="https://easy-scraping.com/feed.xml" rel="self" type="application/rss+xml" />');

    // Key items presence
    expect(xml).toContain('<item>');
    expect(xml).toContain('실시간 주식 물타기 / 평단가 계산기');
    expect(xml).toContain('복리 수익률 &amp; 목표 자산 달성 계산기');
    expect(xml).toContain('삼성전자');
    expect(xml).toContain('</channel>');
    expect(xml).toContain('</rss>');
  });
});
