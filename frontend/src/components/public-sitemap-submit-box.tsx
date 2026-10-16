'use client';

import { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

/** The public tools page is informational. External search-provider mutations are operator-only. */
export function PublicSitemapSubmitBox() {
  const [selectedSitemap, setSelectedSitemap] = useState('sitemap.xml');
  const options = [
    { value: 'sitemap.xml', label: '전체 통합 사이트맵' },
    { value: 'sitemap-stocks.xml', label: '주식 사이트맵' },
    { value: 'sitemap-static.xml', label: '금융도구·가이드 사이트맵' },
    { value: 'sitemap-board.xml', label: '게시판 사이트맵' },
    { value: 'sitemap-announcements.xml', label: '공지사항 사이트맵' },
  ];

  return (
    <section
      className="min-w-0 rounded-2xl border border-border/70 bg-card p-4 sm:p-6 space-y-4"
      aria-labelledby="public-sitemap-heading"
    >
      <div className="flex items-start gap-3">
        <Globe className="mt-1 size-5 shrink-0 text-blue-400" aria-hidden="true" />
        <div className="min-w-0 space-y-2">
          <h2 id="public-sitemap-heading" className="text-lg font-bold text-foreground">
            공개 사이트맵 안내
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            사이트맵은 공개 문서이며 누구나 확인할 수 있습니다. Google Search Console 등 검색엔진에
            등록하는 작업은 운영자 전용입니다. 사이트맵 제출은 검색 결과 노출이나 색인을 보장하지
            않습니다.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="public-sitemap-select" className="text-sm font-semibold text-foreground">
            사이트맵 선택
          </label>
          <select
            id="public-sitemap-select"
            className="w-full min-h-[44px] rounded-lg border border-border bg-background p-2 text-sm"
            value={selectedSitemap}
            onChange={(event) => setSelectedSitemap(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <a
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
          href={`/${selectedSitemap}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          공개 사이트맵 보기 <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        운영자 공식 등록: 관리자 SEO 관제에서 인증된 Search Console 계정으로만 제출할 수 있습니다.
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <a
          className="underline underline-offset-2"
          href="https://search.google.com/search-console/about"
          target="_blank"
          rel="noreferrer"
        >
          Google Search Console
        </a>
        <a
          className="underline underline-offset-2"
          href="https://searchadvisor.naver.com/console/board"
          target="_blank"
          rel="noreferrer"
        >
          Naver Search Advisor
        </a>
        <a className="underline underline-offset-2" href="/robots.txt">
          robots.txt
        </a>
      </div>
    </section>
  );
}
