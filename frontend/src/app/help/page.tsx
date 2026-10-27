import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HelpSearch } from './help-search';
import { normalizeHelpLocale } from './locale';

export const dynamic = 'force-dynamic';
// No index until independent approval, purge, expiry and sitemap gates pass.
export const metadata: Metadata = { title: '검증된 도움말', robots: { index: false, follow: false } };

export default async function HelpPage({ searchParams }: { searchParams?: Promise<{ locale?: string }> }) {
  const locale = normalizeHelpLocale((await searchParams)?.locale);
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') notFound();
  return <main className="mx-auto grid w-full max-w-3xl gap-6 p-4">
    <header><h1 className="text-3xl font-bold">{locale === 'en' ? 'Verified Help' : '검증된 도움말'}</h1><p>승인된 자료만 표시합니다. 최신 정책은 각 문서의 근거를 확인해 주세요.</p></header>
    <HelpSearch initialLocale={locale} />
    <p>답변을 찾지 못하셨나요? <Link href="/support" className="underline underline-offset-4">직접 관리자에게 문의하기</Link></p>
  </main>;
}
