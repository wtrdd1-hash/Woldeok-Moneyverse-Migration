'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TreasuryForceRefreshButton() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleForceRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    toast.info('국고 및 국부펀드 원장 데이터 캐시를 무효화하고 최신 상태로 강제 새로고침합니다...', {
      duration: 1500,
    });

    // 1. Next.js App Router server cache refresh
    router.refresh();

    // 2. Hard cache-busting navigation for mobile browsers (Safari/Chrome BFCache bypass)
    setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('_t', Date.now().toString());
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    }, 250);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleForceRefresh}
      disabled={refreshing}
      aria-label="국고 원장 강제 새로고침"
      className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 flex items-center gap-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs rounded-lg shadow-sm active:scale-95 transition-all"
    >
      <RefreshCw
        aria-hidden="true"
        className={`size-4 text-emerald-400 shrink-0 ${refreshing ? 'animate-spin' : ''}`}
      />
      <span>{refreshing ? '캐시 갱신 중...' : '🔄 강제 새로고침'}</span>
    </Button>
  );
}
