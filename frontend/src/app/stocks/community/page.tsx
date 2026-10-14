import React from 'react';
import type { Metadata } from 'next';
import { TossStyleSocialFeed } from '@/components/stocks/toss-style-social-feed';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: '토스형 주주 라운지 & 모의투자 소셜 피드 | 월덕 머니버스',
  description: '실제 모의투자 주주들의 실시간 수익률 인증 뱃지와 종목별 매매 전략, 분할 매수 일지를 공유하는 커뮤니티 라운지입니다.',
};

export default function StockCommunityFeedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 뒤로가기 & 브레드크럼 */}
        <div className="flex items-center justify-between">
          <Link
            href="/stocks"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            가상 주식 거래소로 돌아가기
          </Link>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            실시간 주주 인증 커뮤니티
          </div>
        </div>

        {/* 토스형 피드 본체 */}
        <TossStyleSocialFeed />
      </div>
    </div>
  );
}
