import type { BlogPost } from './blog.types';
import { isBlogDiscoverable } from './blog-seo';

/** Public detail pages must not reveal a withdrawn/draft body via its slug. */
export function isPublicBlogArticle(post: BlogPost): boolean {
  return isBlogDiscoverable(post);
}
