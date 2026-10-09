'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Bell, CheckCheck, Gift, Send, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface NotificationItem {
  id: string;
  category: string;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const BASE_POLL_INTERVAL_MS = 15000;
const MAX_POLL_INTERVAL_MS = 60000;

export function NotificationCenterModal() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [countUnavailable, setCountUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryRequest, setRetryRequest] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const retryDelayRef = useRef(BASE_POLL_INTERVAL_MS);

  // Keep the last known count on failure; never turn an outage into a false zero.
  useEffect(() => {
    let active = true;
    let generation = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let currentRequest: AbortController | null = null;

    const clearScheduled = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    const schedule = (delay: number) => {
      clearScheduled();
      if (!active || document.hidden) return;
      timeout = setTimeout(() => {
        timeout = null;
        void poll();
      }, delay);
    };

    const poll = async () => {
      if (!active || document.hidden) return;
      const pollGeneration = generation;
      const request = new AbortController();
      currentRequest = request;
      try {
        const response = await fetch('/api/notifications/unread-count', {
          signal: request.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Unread count unavailable');
        const data = await response.json();
        if (!active || request.signal.aborted || generation !== pollGeneration) return;
        const count: unknown = data?.unreadCount;
        if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
          throw new Error('Invalid unread count');
        }
        setUnreadCount(count);
        setCountUnavailable(false);
        retryDelayRef.current = BASE_POLL_INTERVAL_MS;
      } catch {
        if (active && !request.signal.aborted && generation === pollGeneration) {
          setCountUnavailable(true);
          retryDelayRef.current = Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2);
        }
      } finally {
        if (currentRequest === request) currentRequest = null;
        if (active && generation === pollGeneration && !document.hidden) {
          schedule(retryDelayRef.current);
        }
      }
    };

    const onVisibilityChange = () => {
      generation += 1;
      clearScheduled();
      currentRequest?.abort();
      if (!document.hidden) {
        retryDelayRef.current = BASE_POLL_INTERVAL_MS;
        void poll();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (!document.hidden) void poll();

    return () => {
      active = false;
      generation += 1;
      clearScheduled();
      currentRequest?.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    const loadNotifications = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch('/api/notifications?unreadOnly=' + (filter === 'unread'), {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Notification service unavailable');
        const data = await response.json();
        if (!Array.isArray(data?.notifications)) throw new Error('Invalid notification response');
        if (!controller.signal.aborted) setNotifications(data.notifications);
      } catch {
        if (!controller.signal.aborted) {
          setLoadError('알림을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadNotifications();
    return () => controller.abort();
  }, [open, filter, retryRequest]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    }
  };

  const handleClaimAll = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/notifications/claim-all', { method: 'POST' });
      if (res.ok) {
        await handleMarkAllRead();
      }
    } catch {
      // ignore
    } finally {
      setClaiming(false);
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
          aria-label={countUnavailable
            ? `알림 센터 열기 (현재 알림 상태 확인 불가${unreadCount > 0 ? `, 마지막 확인 미확인 알림 ${unreadCount}건` : ""})`
            : unreadCount > 0
              ? `알림 센터 열기 (미확인 알림 ${unreadCount}건)`
              : "알림 센터 열기 (미확인 알림 없음)"}
          className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border/50 bg-background/80 hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {countUnavailable && (
            <span aria-hidden="true" className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
          )}
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-border/60 bg-card/95 backdrop-blur-md rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
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
                disabled={notifications.every((n) => n.is_read)}
                className="min-h-11 text-xs px-2.5 rounded-lg border-border/40"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                모두 읽음
              </Button>
              <Button
                size="sm"
                onClick={handleClaimAll}
                disabled={claiming || unreadCount === 0}
                className="min-h-11 text-xs px-2.5 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/15"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                원클릭 모두 수령
              </Button>
            </div>
          </div>

          {/* 필터 탭 */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFilter('all')}
              className={`min-h-11 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              전체 알림
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`min-h-11 px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
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

        {/* 알림 목록 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[280px]">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">알림을 불러오는 중...</span>
            </div>
          ) : loadError ? (
            <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-sm text-amber-700 dark:text-amber-300">
              <p>{loadError}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setRetryRequest((value) => value + 1)} disabled={loading} className="min-h-11 gap-2 border-amber-500/50">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                다시 시도
              </Button>
            </div>
          ) : notifications.length === 0 ? (
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
