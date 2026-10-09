'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, Trophy, Award, Sparkles, Send, ShieldCheck, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Donor {
  readonly user_id: string;
  readonly username: string;
  readonly nickname?: string;
  readonly total_donated_wld: string;
  readonly donation_count: number;
  readonly honor_title: string;
}

const PRESET_DONATIONS = [
  { amount: '1000', label: '1,000 WLD', title: '🥉 브론즈 서포터' },
  { amount: '10000', label: '10,000 WLD', title: '🥈 실버 가디언' },
  { amount: '50000', label: '50,000 WLD', title: '🥇 골드 필란트로피스트' },
];

export function TreasuryDonationCard() {
  const [amount, setAmount] = useState('10000');
  const [memo, setMemo] = useState('초기 시민 정착 및 공공 복지 기금 후원');
  const [submitting, setSubmitting] = useState(false);
  const [donors, setDonors] = useState<readonly Donor[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDonors() {
      try {
        const res = await fetch('/api/admin/treasury/donations/top');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setDonors(data);
        }
      } catch {
        // Fallback
      }
    }
    loadDonors();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number.parseInt(amount, 10) <= 0) {
      toast.error('기부할 금액을 올바르게 입력해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/treasury/donate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amountWld: amount.trim(),
          memo: memo.trim() || '국고 자발적 공공 기부',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || '기부 처리에 실패했습니다.');
      }

      toast.success(
        `국고에 ${Number(amount).toLocaleString('ko-KR')} WLD 기부가 완료되었습니다! 명예 칭호: [${data.honor_title || '기부자'}] 획득`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '기부 처리 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#090A0F] shadow-xl overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  국고 공공 기부 & 명예의 전당
                </CardTitle>
                <Badge className="bg-amber-500 text-black text-[10px] font-black">
                  HONOR SINK
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                잉여 자금을 국고에 환원하여 초기/빈곤 시민 복지 기금을 후원하고 공식 명예 칭호를 획득하세요.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Flame className="size-4" />
            <span>인플레이션 억제 공공 펀드</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 기부 폼 */}
        <form onSubmit={handleDonate} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {PRESET_DONATIONS.map((preset) => (
              <Button
                key={preset.amount}
                type="button"
                variant={amount === preset.amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(preset.amount)}
                className={`h-auto py-2 flex flex-col items-center justify-center gap-0.5 rounded-xl border-zinc-800 font-mono text-xs ${
                  amount === preset.amount
                    ? 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                    : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <span>{preset.label}</span>
                <span className="text-[10px] opacity-80">{preset.title.split(' ')[1]}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">기부 금액 직접 입력 (WLD)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10000"
              className="w-full h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">후원 응원 한마디 (메모)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="초기 유저 정착을 응원합니다!"
              className="w-full h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !amount || Number.parseInt(amount, 10) <= 0}
            className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold gap-2 transition-all active:scale-[0.98]"
          >
            <Send className="size-4" />
            <span>
              {submitting
                ? '기부 처리 중...'
                : `${Number(amount || 0).toLocaleString('ko-KR')} WLD 국고 기부 및 칭호 획득`}
            </span>
          </Button>
        </form>

        {/* 명예의 전당 랭킹 요약 */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Trophy className="size-3.5 text-amber-400" />
              <span>명예의 전당 (Top Philanthropists)</span>
            </span>
            <span className="text-[11px] text-zinc-500">누적 기부 순</span>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 divide-y divide-zinc-800/40 text-xs">
            {donors.length > 0 ? (
              donors.slice(0, 3).map((d, idx) => (
                <div key={d.user_id} className="p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-amber-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white truncate">
                      {d.nickname || d.username}
                    </span>
                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400">
                      {d.honor_title}
                    </Badge>
                  </div>
                  <span className="font-mono font-bold text-zinc-300 shrink-0">
                    {Number(d.total_donated_wld).toLocaleString('ko-KR')} WLD
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-zinc-500 text-xs">
                첫 번째 국고 공공 기부자가 되어 명예의 전당 1위에 등재되세요!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
