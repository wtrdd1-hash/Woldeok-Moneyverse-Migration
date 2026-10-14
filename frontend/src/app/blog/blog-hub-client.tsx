'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Calculator,
  Calendar,
  Eye,
  Tag,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { BlogPost, BlogCategory } from './blog.types';
import { BLOG_CATEGORIES } from './blog.types';

interface Props {
  readonly initialPosts: readonly BlogPost[];
}

export function BlogHubClient({ initialPosts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = initialPosts.filter((post) => {
    const matchCategory = selectedCategory === 'ALL' || post.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const featuredPost = filteredPosts[0] ?? initialPosts[0];
  const regularPosts = filteredPosts.filter((p) => p.slug !== featuredPost?.slug);

  return (
    <div className="space-y-8">
      {/* Header Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Button
            type="button"
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs h-8 px-3 rounded-lg font-medium shrink-0 ${
              selectedCategory === 'ALL' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'
            }`}
          >
            전체 보기 ({initialPosts.length})
          </Button>
          {BLOG_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs h-8 px-3 rounded-lg font-medium shrink-0 ${
                selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-muted-foreground'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="키워드, 주제, 태그 검색..."
            className="pl-8 text-xs h-8 bg-background/80"
          />
        </div>
      </div>

      {/* Featured Main Post */}
      {featuredPost && (
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-background to-card/80 overflow-hidden relative shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <BookOpen className="size-48 text-indigo-400" />
          </div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                <Flame className="size-3 mr-1 fill-white" /> 오늘의 추천 칼럼
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border/80 text-muted-foreground">
                {featuredPost.categoryLabel}
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="size-3" /> 완독 {featuredPost.readTimeMinutes}분
              </span>
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="group">
              <CardTitle className="text-xl sm:text-2xl font-black text-foreground group-hover:text-indigo-400 transition-colors leading-snug">
                {featuredPost.title}
              </CardTitle>
            </Link>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {featuredPost.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{featuredPost.author.name}</span>
              <span>·</span>
              <span className="font-mono">{new Date(featuredPost.publishedAt).toLocaleDateString('ko-KR')}</span>
              <span>·</span>
              <span className="font-mono flex items-center gap-1">
                <Eye className="size-3" /> {featuredPost.views.toLocaleString()}회
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={featuredPost.relatedCalculatorHref}
                className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1.5 rounded-md border border-indigo-500/20"
              >
                <Calculator className="size-3" />
                <span>{featuredPost.relatedCalculatorName}</span>
              </Link>
              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                <Link href={`/blog/${featuredPost.slug}`}>
                  칼럼 전문 읽기 <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Posts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-400" />
            <span>최신 금융 아티클 목록</span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">총 {filteredPosts.length}편</span>
        </div>

        {regularPosts.length === 0 && !featuredPost ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
            검색 조건에 맞는 블로그 글이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularPosts.map((post) => (
              <Card
                key={post.slug}
                className="border-border/60 bg-card/70 hover:border-indigo-500/40 hover:bg-card transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80">
                      {post.categoryLabel}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      완독 {post.readTimeMinutes}분
                    </span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="group">
                    <CardTitle className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-3 mt-1.5 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-[11px]">
                      {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-semibold text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      읽기 <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
