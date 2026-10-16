import type { Metadata } from 'next';
import { metadataForArticle, renderBlogArticle } from '../blog-page-server';
export const dynamic = 'force-dynamic';
interface Props { params: Promise<{slug:string}>; }
export async function generateMetadata({params}: Props): Promise<Metadata> {
  return metadataForArticle((await params).slug,'ko');
}
export default async function BlogPostPage({params}: Props) {
  return renderBlogArticle((await params).slug,'ko');
}
