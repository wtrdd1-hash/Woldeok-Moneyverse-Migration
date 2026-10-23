export type BlogCategory = 'WEALTH' | 'COMPOUND' | 'STOCKS' | 'TAX' | 'MACRO' | 'TECH';

export const BLOG_CATEGORIES: ReadonlyArray<{ id: BlogCategory; label: string }> = [
  { id: 'COMPOUND', label: '복리 & 저축' },
  { id: 'TAX', label: '절세 & 세제혜택' },
  { id: 'STOCKS', label: '가상 주식 투자' },
  { id: 'WEALTH', label: '자산 배분 & 포트폴리오' },
  { id: 'MACRO', label: '거시 경제 & 국고' },
  { id: 'TECH', label: '핀테크 & 소프트웨어 공학' },
];

export interface BlogAuthor {
  readonly name: string;
  readonly role: string;
  readonly badge: string;
}

export interface BlogTranslation {
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly tags: readonly string[];
}

export interface AcademicReference {
  readonly title: string;
  readonly authors: string;
  readonly institution: string;
  readonly year: number;
  readonly doiOrUrl?: string | undefined;
}

export type BlogCountry = 'KR' | 'US' | 'JP' | 'VN';

export type BlogPostStatus = 'PUBLISHED' | 'WITHDRAWN';

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
  readonly relatedStockTicker?: string | undefined;
  readonly isAiGenerated: boolean;
  readonly views: number;
  readonly heroImage?: string | undefined;
  readonly infographicType?: 'COMPOUND_CURVE' | 'MACRO_RADAR' | 'TAX_WATERFALL' | 'DCA_BENCHMARK' | undefined;
  readonly country?: BlogCountry | undefined;
  readonly status?: BlogPostStatus | undefined;
  readonly academicReferences?: readonly AcademicReference[] | undefined;
  readonly translations?: {
    readonly en?: BlogTranslation | undefined;
    readonly ja?: BlogTranslation | undefined;
    readonly zh?: BlogTranslation | undefined;
  } | undefined;
}
