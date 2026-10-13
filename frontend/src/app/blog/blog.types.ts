export type BlogCategory = 'WEALTH' | 'COMPOUND' | 'STOCKS' | 'TAX' | 'MACRO';

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
