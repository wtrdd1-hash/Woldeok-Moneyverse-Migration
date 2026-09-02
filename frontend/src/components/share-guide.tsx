'use client';

import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const GUIDE_URL = 'https://easy-scraping.com/guide';
const SHARE_TEXT = '월덕 머니버스 참여 방법과 WLD 보상·게임 상점 이용 안내';

/**
 * Lets a visitor choose where to share. No post, invite, or reward is created
 * by the service; the operating system or the visitor's clipboard stays in
 * control of the final destination.
 */
export function ShareGuide() {
  async function share() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '월덕 머니버스 시작하기', text: SHARE_TEXT, url: GUIDE_URL });
        return;
      } catch (error) {
        // Closing the native share picker is a normal visitor choice. Only
        // report failures that are not an explicit cancellation.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(GUIDE_URL);
      toast.success('시작 안내 링크를 복사했어요.');
    } catch {
      toast.error('링크를 복사하지 못했어요. 주소창에서 복사해 주세요.');
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void share()} className="w-fit">
      <Share2 className="size-4" />
      <span className="sm:hidden">공유</span>
      <span className="hidden sm:inline">시작 안내 공유하기</span>
      <Copy className="size-3 text-muted-foreground" aria-hidden />
    </Button>
  );
}
