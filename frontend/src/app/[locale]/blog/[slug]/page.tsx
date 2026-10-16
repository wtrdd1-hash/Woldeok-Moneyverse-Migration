import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { metadataForArticle, renderBlogArticle } from '../../../blog/blog-page-server';
import { type BlogLocale } from '../../../blog/blog-seo';
export const dynamic = 'force-dynamic';
interface Props {params:Promise<{locale:string;slug:string}>;}
function valid(locale:string):locale is BlogLocale {
  return locale === 'en' || locale === 'ja' || locale === 'zh';
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {locale,slug} = await params;
  return valid(locale) ? metadataForArticle(slug,locale) : {robots:{index:false,follow:false}};
}
export default async function LocalArticle({params}:Props) {
  const {locale,slug} = await params;
  if (!valid(locale)) notFound();
  return renderBlogArticle(slug,locale);
}
