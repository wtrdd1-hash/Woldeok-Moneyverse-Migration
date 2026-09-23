'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Building2,
  Landmark,
  Trophy,
  Home,
  ShieldAlert,
  Sparkles,
  Inbox,
  Clock,
} from 'lucide-react';

export type NotificationCategory =
  | 'ALL'
  | 'BUSINESS'
  | 'BANK'
  | 'SEASON'
  | 'SPACE'
  | 'SECURITY'
  | 'SYSTEM';

interface NotificationItem {
  readonly id: string;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  readonly time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'BUSINESS',
    title: '원자재 조달 및 수급 완료',
    message: '스마트 편의점 부자재 20개 입고 완료. 운영비 2% 하드 싱크(20 WLD) 소각 정산되었습니다.',
    time: '10분 전',
    read: false,
  },
  {
    id: 'notif-2',
    category: 'BANK',
    title: '일일 게임 예금 이자 적립 대기',
    message: '새로운 가상 예금 이자 +1,840 WLD가 계산되었습니다. 가상 은행 화면에서 수령하세요.',
    time: '1시간 전',
    read: false,
  },
  {
    id: 'notif-3',
    category: 'SEASON',
    title: '시즌 1: First Capital 랭킹 업데이트',
    message: '시즌 명예 순위가 갱신되었습니다. 현재 상위 5위권 헌액록을 확인해 보세요.',
    time: '3시간 전',
    read: false,
  },
  {
    id: 'notif-4',
    category: 'SPACE',
    title: '개인 공간 인테리어 VIBE 달성',
    message: '스타터 룸 가구 배치로 룸 분위기 점수 120pt를 달성했습니다.',
    time: '어제',
    read: true,
  },
  {
    id: 'notif-5',
    category: 'SECURITY',
    title: '보안 감사 세션 확인',
    message: '새로운 브라우저 환경에서 안전한 세션 토큰이 발급되었습니다.',
    time: '2일 전',
    read: true,
  },
  {
    id: 'notif-6',
    category: 'SYSTEM',
    title: '머니버스 v392 경제 엔진 활성화',
    message: '사업체 공급망 루프와 5대 혁신 위젯이 성공적으로 가동되었습니다.',
    time: '3일 전',
    read: true,
  },
];

const CATEGORIES: { id: NotificationCategory; label: string; icon: React.ElementType }[] = [
  { id: 'ALL', label: '전체', icon: Bell },
  { id: 'BUSINESS', label: '사업·공급망', icon: Building2 },
  { id: 'BANK', label: '금융·이자', icon: Landmark },
  { id: 'SEASON', label: '시즌·순위', icon: Trophy },
  { id: 'SPACE', label: '공간·도시', icon: Home },
  { id: 'SECURITY', label: '보안·인증', icon: ShieldAlert },
  { id: 'SYSTEM', label: '시스템', icon: Sparkles },
];

export function NotificationTabsBar() {
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedCat, setSelectedCat] = useState<NotificationCategory>('ALL');

  const unreadCount = items.filter((item) => !item.read).length;

  const handleMarkAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleItemClick = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const filteredItems = items.filter(
    (item) => selectedCat === 'ALL' || item.category === selectedCat,
  );

  return (
    <div className="space-y-4">
      {/* 상단 탭 & 일괄 읽음 처리 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        {/* 가로 스크롤 카테고리 탭 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.id;
            const catUnread = items.filter(
              (i) => !i.read && (cat.id === 'ALL' || i.category === cat.id),
            ).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
                {catUnread > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      isSelected
                        ? 'bg-background text-primary'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {catUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 전체 읽음 처리 버튼 */}
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
            unreadCount > 0
              ? 'border-border/80 bg-background text-foreground hover:bg-muted'
              : 'border-transparent text-muted-foreground/50 cursor-not-allowed'
          }`}
        >
          <CheckCheck className="size-4 text-emerald-500" />
          <span>모두 읽음 ({unreadCount})</span>
        </button>
      </div>

      {/* 알림 피드 리스트 */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-10 text-center">
            <Inbox className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">
              해당 분류의 알림 내역이 없습니다.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group flex items-start gap-3.5 rounded-2xl border p-4 transition-all cursor-pointer ${
                item.read
                  ? 'border-border/50 bg-card/40 opacity-70 hover:opacity-100 hover:bg-card/70'
                  : 'border-primary/40 bg-primary/5 shadow-sm hover:border-primary/60 hover:bg-primary/10'
              }`}
            >
              {/* 안읽음 인디케이터 점 */}
              <div className="mt-1 flex size-2 shrink-0 items-center justify-center">
                {!item.read && (
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              {/* 내용 */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">
                      {item.title}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="size-3" /> {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
