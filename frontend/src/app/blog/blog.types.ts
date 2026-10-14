export type BlogCategory = 'WEALTH' | 'COMPOUND' | 'STOCKS' | 'TAX' | 'MACRO';

export const BLOG_CATEGORIES: ReadonlyArray<{ id: BlogCategory; label: string }> = [
  { id: 'COMPOUND', label: '복리 & 저축' },
  { id: 'TAX', label: '절세 & 세제혜택' },
  { id: 'STOCKS', label: '가상 주식 투자' },
  { id: 'WEALTH', label: '자산 배분 & 포트폴리오' },
  { id: 'MACRO', label: '거시 경제 & 국고' },
];

export interface BlogAuthor {
  readonly name: string;
  readonly role: string;
  readonly badge: string;
}

export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly category: BlogCategory;
  readonly categoryLabel: string;
  readonly author: BlogAuthor;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly readTimeMinutes: number;
  readonly tags: readonly string[];
  readonly relatedCalculatorHref: string;
  readonly relatedCalculatorName: string;
  readonly relatedStockTicker?: string;
  readonly isAiGenerated: boolean;
  readonly views: number;
}
