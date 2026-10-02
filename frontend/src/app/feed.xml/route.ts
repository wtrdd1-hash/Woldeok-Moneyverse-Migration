import { NextResponse } from 'next/server';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { POPULAR_STOCKS_DATASET } from '@/config/pseo-stocks.config';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  const now = new Date().toUTCString();

  const feedItems = [
    {
      title: '월덕 머니버스 - 글로벌 가상 금융 & 모의 주식 거래 플랫폼',
      link: `${base}/`,
      description: '실시간 가상 주식 거래소, 채굴 센터, 금융 계산기 및 디스코드 연동 경제 생태계.',
      pubDate: now,
      guid: `${base}/`,
    },
    {
      title: '실시간 주식 물타기 / 평단가 계산기',
      link: `${base}/tools/stock-calculator`,
      description: '국내외 주식 및 암호화폐 추가 매수 시 목표 평단가와 필요 투자금을 정밀하게 산출합니다.',
      pubDate: now,
      guid: `${base}/tools/stock-calculator`,
    },
    {
      title: '복리 수익률 & 목표 자산 달성 계산기',
      link: `${base}/tools/compound-calculator`,
      description: '월별 적립식 투자와 복리 이자율에 따른 미래 예상 자산과 그래프를 시각화합니다.',
      pubDate: now,
      guid: `${base}/tools/compound-calculator`,
    },
    {
      title: '머니버스 가상 채굴 수익률 & ROI 시뮬레이터',
      link: `${base}/tools/farming-calculator`,
      description: '채굴 노드 효율, 전기세 및 감가상각을 고려한 순수익 및 원금 회수 기간 계산기.',
      pubDate: now,
      guid: `${base}/tools/farming-calculator`,
    },
    ...POPULAR_STOCKS_DATASET.slice(0, 20).map((stock) => ({
      title: `${stock.nameKo} (${stock.nameEn}) 평단가 및 물타기 시뮬레이션 계산기`,
      link: `${base}/tools/stock-calculator/${stock.ticker.toLowerCase()}-water-calculator`,
      description: `${stock.nameKo} 주가 하락 시 탈출을 위한 추가 매수 수량과 평단가 변화를 1초 만에 확인하세요.`,
      pubDate: now,
      guid: `${base}/tools/stock-calculator/${stock.ticker.toLowerCase()}-water-calculator`,
    })),
    ...ALL_SEO_PRESETS.slice(0, 10).map((preset) => ({
      title: `${preset.title} - 머니버스 금융 도구`,
      link: `${base}/tools/${preset.category === 'compound' ? 'compound-calculator' : preset.category === 'stock' ? 'stock-calculator' : 'farming-calculator'}/${preset.slug}`,
      description: preset.summary || preset.metaDescription || preset.title,
      pubDate: now,
      guid: `${base}/tools/${preset.category === 'compound' ? 'compound-calculator' : preset.category === 'stock' ? 'stock-calculator' : 'farming-calculator'}/${preset.slug}`,
    })),
  ];

  const escapeXml = (str: string | null | undefined) =>
    (str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>월덕 머니버스 (Woldeok Moneyverse)</title>
    <link>${base}</link>
    <description>실시간 가상 주식 거래소, 금융 계산기 및 글로벌 커뮤니티 경제 허브</description>
    <language>ko-kr</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    ${feedItems
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.guid}</guid>
    </item>`,
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
