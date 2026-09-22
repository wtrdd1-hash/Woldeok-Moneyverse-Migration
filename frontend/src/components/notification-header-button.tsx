'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useViewer } from '@/lib/use-viewer';

export function NotificationHeaderButton() {
  const viewer = useViewer();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const prevCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!viewer?.signedIn) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          const count = Number(data.unreadCount ?? data.unread_count ?? 0) || 0;
          setUnreadCount(count);

          // Toast notification on new incoming notifications
          if (hasInitializedRef.current && count > prevCountRef.current) {
            toast.info('새 알림이 도착했습니다.', {
              description: '알림 센터에서 중요한 안내 사항을 확인해 보세요.',
              action: {
                label: '확인',
                onClick: () => {
                  window.location.href = '/account/notifications';
                },
              },
            });
          }
          prevCountRef.current = count;
          hasInitializedRef.current = true;
        }
      } catch {
        // silent polling failure
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [viewer?.signedIn]);

  if (!viewer?.signedIn) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-10 sm:size-11 text-muted-foreground hover:text-foreground shrink-0"
      aria-label="알림 센터"
    >
      <Link href="/account/notifications">
        <Bell className="size-4.5 sm:size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
