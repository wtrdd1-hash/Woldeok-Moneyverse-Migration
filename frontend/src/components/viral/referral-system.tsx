'use client';

import React, { useState } from 'react';
import { Gift, Users, Copy, Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface ReferralSystemProps {
  readonly userInviteCode?: string;
  readonly invitedCount?: number;
  readonly totalEarnedWld?: number;
}

export function ReferralSystem({
  userInviteCode = 'INV-WLD999',
  invitedCount = 3,
  totalEarnedWld = 30000000,
}: ReferralSystemProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${userInviteCode}`
    : `https://easy-scraping.com/invite/${userInviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '월덕 머니버스 1,000만 WLD 초대장 도착!',
          text: '지금 가입하면 1,000만 WLD + 스타터 지원 상자를 즉시 받을 수 있습니다. 저와 함께 가상 자산을 굴려보세요!',
          url: inviteUrl,
        });
      } catch {
        // User canceled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
      {/* 배경 네온 블러 */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 상단 뱃지 & 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>양방향 무제한 리퍼럴 이벤트</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            친구 초대하고 둘 다 <span className="text-amber-400">+1,000만 WLD</span> 즉시 받기
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            내 초대 링크로 친구가 가입하고 첫 직업 업무를 완료하면, 초대자와 친구 모두에게 보상이 100% 자동 지급됩니다.
          </p>
        </div>

        {/* 내 통계 요약 박스 */}
        <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl shrink-0">
          <div>
            <span className="text-[11px] text-zinc-500 block">초대한 친구</span>
            <span className="text-lg font-black text-white font-mono">{invitedCount}명</span>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div>
            <span className="text-[11px] text-zinc-500 block">누적 수령 보상</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{(totalEarnedWld / 10000).toLocaleString('ko-KR')}만 WLD</span>
          </div>
        </div>
      </div>

      {/* 보상 패키지 안내 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/20 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">내가 받는 보상 (초대자)</span>
            <div className="text-base font-extrabold text-white mt-0.5">+1,000만 WLD + 피로회복제 5개</div>
            <p className="text-xs text-zinc-400 mt-1">초대 인원 수 제한 없이 친구 1명당 1,000만 WLD가 무제한 누적 지급됩니다.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-500/20 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">친구가 받는 보상 (가입자)</span>
            <div className="text-base font-extrabold text-white mt-0.5">+1,000만 WLD + 스타터 지원 상자</div>
            <p className="text-xs text-zinc-400 mt-1">가입 즉시 주식 투자 및 가상 은행 복리 예금에 바로 활용할 수 있는 시드머니입니다.</p>
          </div>
        </div>
      </div>

      {/* 초대 링크 복사 및 공유 입력창 */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm font-mono focus:outline-none focus:border-amber-500/50 pr-24 select-all"
          />
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>링크 복사</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 active:scale-95 transition"
        >
          <Gift className="w-4 h-4" />
          <span>카카오톡으로 초대장 보내기</span>
        </button>
      </div>

      {/* 하단 보안 가드 안내 */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
        <span>어뷰징 방지를 위해 동일 IP 및 기기 중복 가입은 자동 필터링되며, 첫 직업 업무 완료 시 정산 원장에 반영됩니다.</span>
      </div>
    </div>
  );
}
