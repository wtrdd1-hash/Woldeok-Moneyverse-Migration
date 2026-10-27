import type { BlogPost } from './blog.types';

/** Only a validated compound-specific article may embed the savings simulator. */
export function shouldShowCompoundInlineCalculator(post: BlogPost): boolean {
  return post.category === 'COMPOUND'
    && post.relatedCalculatorHref === '/tools/compound-calculator';
}

export function shouldShowFinancialPromotions(post: BlogPost): boolean {
  return post.category !== 'TECH';
}

export function shouldShowReadership(post: Pick<BlogPost, 'viewCountVerified' | 'views'>): boolean {
  return post.viewCountVerified === true && Number.isSafeInteger(post.views) && post.views >= 0;
}
