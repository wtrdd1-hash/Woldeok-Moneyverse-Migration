'use client';

import { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

/** The public tools page is informational. External search-provider mutations are operator-only. */
export function PublicSitemapSubmitBox() {
  const { locale } = useLocale();
  const [selectedSitemap, setSelectedSitemap] = useState('sitemap.xml');

  const options = [
    {
      value: 'sitemap.xml',
      label: localeLabel(locale, '전체 통합 사이트맵', 'Comprehensive Unified Sitemap', '総合統合サイトマップ', '全站综合网站地图', 'Sitemap tổng hợp toàn diện'),
    },
    {
      value: 'sitemap-stocks.xml',
      label: localeLabel(locale, '주식 사이트맵', 'Stocks & Equities Sitemap', '株式サイトマップ', '股票证券网站地图', 'Sitemap cổ phiếu chứng khoán'),
    },
    {
      value: 'sitemap-static.xml',
      label: localeLabel(locale, '금융도구·가이드 사이트맵', 'Tools & Guides Sitemap', '金融ツール・ガイドサイトマップ', '金融工具与指南网站地图', 'Sitemap công cụ & hướng dẫn'),
    },
    {
      value: 'sitemap-board.xml',
      label: localeLabel(locale, '게시판 사이트맵', 'Community Board Sitemap', '掲示板サイトマップ', '社区讨论区网站地图', 'Sitemap diễn đàn cộng đồng'),
    },
    {
      value: 'sitemap-announcements.xml',
      label: localeLabel(locale, '공지사항 사이트맵', 'Announcements Sitemap', 'お知らせサイトマップ', '官方公告网站地图', 'Sitemap thông báo chính thức'),
    },
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
            {localeLabel(locale, '공개 사이트맵 안내', 'Public Sitemap Directory', '公開サイトマップ案内', '公开网站地图指引', 'Thư mục Sitemap công khai')}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {localeLabel(
              locale,
              '사이트맵은 공개 문서이며 누구나 확인할 수 있습니다. Google Search Console 등 검색엔진에 등록하는 작업은 운영자 전용입니다. 사이트맵 제출은 검색 결과 노출이나 색인을 보장하지 않습니다.',
              'Sitemaps are public XML manifests viewable by anyone. Search console submission and indexing are managed by platform operators. Submission does not guarantee immediate search indexing.',
              'サイトマップは公開文書であり、どなたでも確認できます。検索エンジンへの登録は管理者専用です。送信は検索結果の表示やインデックスを保証するものではありません。',
              '网站地图属于公开透明的XML清单，任何人均可查阅。搜索引擎平台提交由系统管理员执行，提交不保证必然收录。',
              'Sitemap là tài liệu công khai có thể xem bất kỳ lúc nào. Việc lập chỉ mục tìm kiếm do ban quản trị phụ trách.'
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="public-sitemap-select" className="text-sm font-semibold text-foreground">
            {localeLabel(locale, '사이트맵 선택', 'Select Sitemap', 'サイトマップ選択', '选择网站地图', 'Chọn Sitemap')}
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
          {localeLabel(locale, '공개 사이트맵 보기', 'View Public XML', 'サイトマップ表示', '查看公开地图', 'Xem XML công khai')} <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        {localeLabel(
          locale,
          '운영자 공식 등록: 관리자 SEO 관제에서 인증된 Search Console 계정으로만 제출할 수 있습니다.',
          'Official Operator Submission: Only verified accounts in Admin SEO Control Tower may submit indices.',
          '公式登録: 管理者SEOコンソールで認証されたアカウントのみが提出できます。',
          '官方提交声明：仅限在管理后台通过验证的搜索引擎控制台账号进行正式提交。',
          'Đăng ký chính thức: Chỉ tài khoản quản trị viên đã xác thực mới có thể gửi dữ liệu.'
        )}
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
