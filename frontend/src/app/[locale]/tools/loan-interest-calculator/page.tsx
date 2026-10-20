import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { canonicalUrl } from '@/lib/seo';
import { LOAN_LOCALES, isLoanLocale } from './loan-locales';
import { LocalizedLoanCalculator } from './localized-loan-calculator';

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 86400;
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ja' }, { locale: 'zh' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLoanLocale(locale)) return { robots: { index: false, follow: false } };
  const content = LOAN_LOCALES[locale];
  const url = canonicalUrl(`/${locale}/tools/loan-interest-calculator`);
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: url,
      languages: {
        'ko-KR': canonicalUrl('/tools/loan-interest-calculator'),
        'en-US': canonicalUrl('/en/tools/loan-interest-calculator'),
        'ja-JP': canonicalUrl('/ja/tools/loan-interest-calculator'),
        'zh-CN': canonicalUrl('/zh/tools/loan-interest-calculator'),
        'x-default': canonicalUrl('/tools/loan-interest-calculator'),
      },
    },
    robots: { index: true, follow: true },
    openGraph: { title: content.title, description: content.description, url },
  };
}

export default async function LoanCalculatorLocalePage({ params }: Props) {
  const { locale } = await params;
  if (!isLoanLocale(locale)) notFound();
  const t = LOAN_LOCALES[locale];
  return (
    <main className="mv-page mv-page--public mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-7">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{t.heading}</h1>
        <p className="text-muted-foreground">{t.lead}</p>
        <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{t.assumptions}</p>
      </header>
      <LocalizedLoanCalculator locale={locale} />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t.guideTitle}</h2>
        <p className="leading-relaxed text-muted-foreground">{t.guide}</p>
      </section>
      <Link className="inline-flex text-primary underline underline-offset-4" href={`/${locale}/tools`}>{t.cta}</Link>
    </main>
  );
}
