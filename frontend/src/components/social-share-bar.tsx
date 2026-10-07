'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

interface SocialShareBarProps {
  readonly title?: string;
  readonly description?: string;
  readonly url?: string;
  readonly hashtags?: readonly string[];
  readonly className?: string;
}

export function SocialShareBar({
  title = '머니버스 가상 금융 및 계산기 시뮬레이션',
  description = '실시간 금융 시뮬레이션과 모의투자, 복리 계산기를 경험해보세요.',
  url,
  hashtags = ['머니버스', '가상금융', '주식계산기', '재테크'],
  className = '',
}: SocialShareBarProps) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const getShareUrl = (): string => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://easy-scraping.com';
  };

  const currentUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        toast.success(
          localeLabel(
            locale,
            '링크가 클립보드에 복사되었습니다! 원하는 곳에 붙여넣어 공유하세요.',
            'Link copied to clipboard! Share it anywhere.',
            'リンクがクリップボードにコピーされました！',
            '链接已复制到剪贴板！',
          ),
        );
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error(
        localeLabel(
          locale,
          '링크 복사에 실패했습니다.',
          'Failed to copy link.',
          'リンクのコピーに失敗しました。',
          '复制链接失败。',
        ),
      );
    }
  };

  const handleShareTwitter = () => {
    const text = `${title}\n${description}`;
    const tagString = hashtags.join(',');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}&hashtags=${encodeURIComponent(tagString)}`;
    if (typeof window !== 'undefined') {
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
    }
  };

  const handleShareKakao = () => {
    // Web Share API 지원 시 모바일에서 카카오톡, 메시지 앱 등으로 즉시 공유
    if (typeof window !== 'undefined' && navigator.share) {
      navigator
        .share({
          title,
          text: description,
          url: currentUrl,
        })
        .catch(() => {});
    } else {
      // 데스크톱 또는 미지원 시 링크 복사 안내
      handleCopyLink();
    }
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    if (typeof window !== 'undefined') {
      window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Share2 className="size-4" />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-tight text-foreground block">
            {localeLabel(
              locale,
              '결과 공유 & 백링크 추천',
              'Share & Recommend',
              '結果を共有・推薦',
              '分享与推荐',
            )}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {localeLabel(
              locale,
              '친구, 커뮤니티(X, 카톡, 디시 등)에 이 시나리오를 공유해보세요.',
              'Share this scenario to X, KakaoTalk, or forums.',
              'このシナリオをXやSNSで共有しましょう。',
              '将此方案分享至社交平台。',
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* X (구 트위터) 공유 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShareTwitter}
          className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors"
          title="X (Twitter) 공유"
        >
          <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">X(트위터)</span>
        </Button>

        {/* 카카오톡 / 스마트 공유 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShareKakao}
          className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-[#FEE500] hover:text-[#191919] transition-colors"
          title="카카오톡 또는 모바일 공유"
        >
          <MessageCircle className="size-3.5" />
          <span className="hidden sm:inline">카카오톡</span>
        </Button>

        {/* 페이스북 공유 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShareFacebook}
          className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-blue-600 hover:text-white transition-colors"
          title="페이스북 공유"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden md:inline">페이스북</span>
        </Button>

        {/* 링크 복사 */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 px-2.5 text-xs font-medium gap-1.5 transition-transform active:scale-[0.98]"
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>
            {copied
              ? localeLabel(locale, '복사됨!', 'Copied!', 'コピー済み', '已复制')
              : localeLabel(locale, '링크 복사', 'Copy Link', 'リンクコピー', '复制链接')}
          </span>
        </Button>
      </div>
    </div>
  );
}
