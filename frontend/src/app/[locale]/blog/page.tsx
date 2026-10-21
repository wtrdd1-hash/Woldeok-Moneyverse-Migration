import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { metadataForHub, renderBlogHub } from '../../blog/blog-page-server';
import { type BlogLocale } from '../../blog/blog-seo';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{locale:string}>; }

function valid(locale: string): locale is BlogLocale {
  return locale === 'en' || locale === 'ja' || locale === 'zh';
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (locale === 'ko') {
    return metadataForHub('ko');
  }
  return valid(locale) ? metadataForHub(locale) : {robots:{index:false,follow:false}};
}

export default async function LocalBlogHub({params}: Props) {
  const {locale} = await params;
  if (locale === 'ko') {
    permanentRedirect('/blog');
  }
  if (!valid(locale)) notFound();
  return renderBlogHub(locale);
}
