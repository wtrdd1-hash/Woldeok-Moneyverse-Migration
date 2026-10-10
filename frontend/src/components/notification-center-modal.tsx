'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Gift, Send, ShieldAlert, RefreshCw } from 'lucide-react';
import { markAccountNotificationRead } from '@/app/account/notifications/actions';

interface NotificationItem {
  id: string;
  category: string;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenterModal() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?unreadOnly=${filter === 'unread'}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Notification API unavailable');
      const payload: unknown = await res.json();
      if (!payload || typeof payload !== 'object' || !('notifications' in payload)
        || !Array.isArray(payload.notifications)
        || !payload.notifications.every((item: unknown) => {
          if (!item || typeof item !== 'object') return false;
          const record = item as Record<string, unknown>;
          return typeof record.id === 'string' && typeof record.title === 'string'
            && typeof record.body === 'string' && typeof record.category === 'string'
            && typeof record.is_read === 'boolean' && typeof record.created_at === 'string';
        })) throw new Error('Invalid notification response');
      setNotifications(payload.notifications);
      setLastChecked(new Date());
      setFeedError(false);
    } catch {
      setFeedError(true);
    } finally {
      setLoading(false);
    }
  };

  // 15초마다 미확인 알림 카운트 백그라운드 갱신
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, filter]);

  const handleMarkAllRead = async () => {
    if (loading || feedError || !lastChecked) return;
    try {
      const result = await markAccountNotificationRead(null);
      if (!result.ok) throw new Error('Read update rejected');
      setNotifications((previous) => previous.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch {
      setFeedError(true);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'TRANSACTIONAL':
        return (
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10 flex items-center gap-1">
            <Send className="h-3 w-3" /> 송금
          </Badge>
        );
      case 'PRODUCT_ACTIVITY':
      case 'SEASON_LIVEOPS':
        return (
          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10 flex items-center gap-1">
            <Gift className="h-3 w-3" /> 이벤트
          </Badge>
        );
      case 'SECURITY_CRITICAL':
        return (
          <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-500/30 bg-rose-500/10 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> 보안
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 bg-muted/20">
            시스템
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="알림 센터 열기"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-background/80 hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-border/60 bg-card/95 backdrop-blur-md rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold">실시간 알림 센터</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  송금 수취, 배당금 입금, 핫타임 버프 등 중요 소식을 확인하세요.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={loading || feedError || !lastChecked || notifications.every((n) => n.is_read)}
                className="h-8 text-xs px-2.5 rounded-lg border-border/40"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                모두 읽음
              </Button>

            </div>
          </div>

          {/* 필터 탭 */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              전체 알림
            </button>
            <button
              type="button"
              aria-pressed={filter === 'unread'}
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              미확인 알림
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-mono">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </DialogHeader>

        {lastChecked && <p role="status" className="px-5 pt-2 text-xs text-muted-foreground">마지막 서버 확인: {lastChecked.toLocaleTimeString('ko-KR')}</p>}
        {feedError && <p role="alert" className="mx-4 mt-2 rounded-lg border border-destructive p-3 text-sm">알림을 확인하거나 변경하지 못했습니다. 이전 목록이 표시될 수 있습니다. 다시 열어 새로고침해 주세요.</p>}
        {/* 알림 목록 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[280px]">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">알림을 불러오는 중...</span>
            </div>
          ) : notifications.length === 0 && !feedError ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">새로운 알림이 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">
                P2P 송금이나 경제 이벤트가 발생하면 이곳에 실시간으로 표시됩니다.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.is_read
                    ? 'border-border/40 bg-card/40 opacity-75'
                    : 'border-primary/30 bg-primary/5 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getCategoryBadge(item.category)}
                    <span className="text-xs font-bold text-foreground line-clamp-1">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                    {new Date(item.created_at).toLocaleDateString('ko-KR', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-1">{item.body}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
