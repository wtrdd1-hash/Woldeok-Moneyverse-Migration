import type { Metadata } from 'next';
import { metadataForHub, renderBlogHub } from './blog-page-server';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = metadataForHub('ko');
export default function BlogHubPage() {
  return renderBlogHub('ko');
}
