'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useViewer } from '@/lib/use-viewer';

const BASE_POLL_INTERVAL_MS = 15000;
const MAX_POLL_INTERVAL_MS = 60000;

export function ChatHeaderButton() {
  const viewer = useViewer();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const prevCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);
  const retryDelayRef = useRef<number>(BASE_POLL_INTERVAL_MS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!viewer?.signedIn) return;

    let isSubscribed = true;

    const scheduleNext = (delayMs: number) => {
      if (!isSubscribed) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchUnread, delayMs);
    };

    const fetchUnread = async () => {
      if (!isSubscribed) return;
      if (typeof document !== 'undefined' && document.hidden) {
        scheduleNext(BASE_POLL_INTERVAL_MS);
        return;
      }

      try {
        const res = await fetch('/app-api/v1/chat/unread-count');
        if (res.ok) {
          const data = await res.json();
          const count = Number(data.totalUnread ?? data.unreadCount ?? data.unread_count ?? 0) || 0;
          if (isSubscribed) {
            setUnreadCount(count);

            // Toast notification on new incoming messages
            if (hasInitializedRef.current && count > prevCountRef.current) {
              toast.info('새 쪽지가 도착했습니다.', {
                description: '쪽지함에서 확인해 보세요.',
                action: {
                  label: '확인',
                  onClick: () => {
                    window.location.href = '/chat';
                  },
                },
              });
            }
            prevCountRef.current = count;
            hasInitializedRef.current = true;
          }
          retryDelayRef.current = BASE_POLL_INTERVAL_MS;
          scheduleNext(BASE_POLL_INTERVAL_MS);
        } else {
          retryDelayRef.current = Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2);
          scheduleNext(retryDelayRef.current);
        }
      } catch {
        retryDelayRef.current = Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2);
        scheduleNext(retryDelayRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden && isSubscribed) {
        fetchUnread();
      }
    };

    fetchUnread();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isSubscribed = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [viewer?.signedIn]);

  if (!viewer?.signedIn) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-10 sm:size-11 text-muted-foreground hover:text-foreground shrink-0"
      aria-label="쪽지함"
    >
      <Link href="/chat">
        <MessageSquare className="size-4.5 sm:size-5" />
        {unreadCount > 0 && (
          <span className="absolute 1.5 top-1.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-extrabold text-destructive-foreground shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
