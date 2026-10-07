'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export interface SocialShareToolbarProps {
  readonly title: string;
  readonly description?: string | undefined;
  readonly url?: string | undefined;
  readonly hashtags?: readonly string[] | undefined;
  readonly className?: string | undefined;
  readonly compact?: boolean | undefined;
}

export function SocialShareToolbar({
  title,
  description,
  url,
  hashtags = ['월덕머니버스', '가상주식', '재테크', '금융계산기'],
  className = '',
  compact = false,
}: SocialShareToolbarProps) {
  const [isCopied, setIsCopied] = useState(false);

  const getTargetUrl = () => {
    if (url) {
      if (url.startsWith('http')) return url;
      if (typeof window !== 'undefined') return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return typeof window !== 'undefined' ? window.location.href : 'https://easy-scraping.com';
  };

  const handleCopyLink = async () => {
    const target = getTargetUrl();
    try {
      await navigator.clipboard.writeText(target);
      setIsCopied(true);
      toast.success('공유 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleShareTwitter = () => {
    const target = getTargetUrl();
    const shareText = description ? `${title}\n${description}` : title;
    const tagString = hashtags.join(',');
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(target)}&hashtags=${encodeURIComponent(tagString)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const handleShareKakao = () => {
    const target = getTargetUrl();
    const shareText = description ? `[월덕 머니버스] ${title}\n${description}\n${target}` : `[월덕 머니버스] ${title}\n${target}`;

    // 모바일 기기 감지 시 카카오링크 커스텀 스킴 우선 시도
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // 카카오톡 텍스트 공유 웹 인텐트
      const kakaoScheme = `kakaolink://send?msg=${encodeURIComponent(shareText)}&url=${encodeURIComponent(target)}`;
      window.location.href = kakaoScheme;
      setTimeout(() => {
        // 앱이 없을 경우 클립보드 복사 안내
        navigator.clipboard.writeText(target);
        toast.info('카카오톡이 설치되어 있지 않아 링크가 복사되었습니다.');
      }, 1500);
    } else {
      // PC의 경우 카카오스토리/카카오 공유 웹 엔드포인트 또는 링크 복사 후 토스트
      const kakaoWeb = `https://story.kakao.com/share?url=${encodeURIComponent(target)}&text=${encodeURIComponent(title)}`;
      window.open(kakaoWeb, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const handleShareFacebook = () => {
    const target = getTargetUrl();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleNativeShare = async () => {
    const target = getTargetUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: target,
        });
      } catch {
        // 사용자 취소 시 무시
      }
    } else {
      handleCopyLink();
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleShareKakao}
          title="카카오톡으로 공유"
          className="h-8 px-2.5 bg-[#FEE500]/10 hover:bg-[#FEE500]/20 border-[#FEE500]/30 text-amber-300 text-xs font-semibold"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1 text-[#FEE500]" />
          카톡
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleShareTwitter}
          title="X(트위터)로 공유"
          className="h-8 px-2.5 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400 text-xs font-semibold"
        >
          <span className="font-bold mr-1">𝕏</span>
          트윗
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCopyLink}
          title="링크 복사"
          className="h-8 px-2 text-zinc-400 hover:text-zinc-200"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Share2 className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">1초만에 SNS 공유하고 친구에게 자랑하기</h4>
            <p className="text-[11px] text-zinc-400">카카오톡, X(트위터), 커뮤니티로 바로 공유해 보세요.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* 카카오톡 */}
          <Button
            type="button"
            size="sm"
            onClick={handleShareKakao}
            className="h-8 px-3 bg-[#FEE500] hover:bg-[#FEE500]/90 text-zinc-900 font-bold text-xs shadow-sm active:scale-95 transition-transform"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1 fill-zinc-900" />
            카카오톡
          </Button>

          {/* X (트위터) */}
          <Button
            type="button"
            size="sm"
            onClick={handleShareTwitter}
            className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 active:scale-95 transition-transform"
          >
            <span className="font-bold mr-1.5 text-xs">𝕏</span>
            트위터 공유
          </Button>

          {/* 페이스북 */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleShareFacebook}
            className="h-8 px-2.5 bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/30 text-blue-400 text-xs hidden sm:inline-flex"
          >
            <span className="font-bold mr-1">f</span>
            페이스북
          </Button>

          {/* 링크 복사 */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 font-medium text-xs active:scale-95 transition-transform"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                복사완료!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                링크 복사
              </>
            )}
          </Button>

          {/* 모바일 Web Share */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleNativeShare}
            title="기기 전체 공유"
            className="h-8 px-2 text-zinc-400 hover:text-zinc-200 sm:hidden"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
