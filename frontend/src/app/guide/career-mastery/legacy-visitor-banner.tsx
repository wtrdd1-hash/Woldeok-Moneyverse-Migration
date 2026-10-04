'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Code2, Sparkles, Gift, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LegacyVisitorBanner() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref === 'legacy_tech_blog') {
      setIsVisible(true);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-zinc-900/90 to-zinc-950 p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="배너 닫기"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" /> IT/개발자 방문자 환영
            </span>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" /> 10,000 WLD 무료 지원금 제공
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white">
            기술 블로그에서 방문하셨나요? 월덕 머니버스에서 <span className="text-emerald-400">핀테크 개발자</span>로 전직해보세요!
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            과거 기술 포스팅을 찾아오신 개발자님을 환영합니다! 머니버스에서는 Python, Node.js 기술을 활용해 가상 경제 알고리즘을 개발하고 
            매일 WLD 연봉 급여와 모의투자 시드머니를 파밍할 수 있습니다.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20">
            <Link href="/work">
              개발자 급여 파밍 시작하기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
