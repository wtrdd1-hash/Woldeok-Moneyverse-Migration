'use client';

import React, { useState } from 'react';
import { Save, Search, CheckCircle, XCircle, ShoppingBag, Package, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { groupDigits } from '@/lib/money';

export interface AdminShopItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly base_price: string;
  readonly rarity: string;
  readonly max_stock: number | null;
  readonly current_stock: number | null;
  readonly is_limited: boolean;
  readonly active: boolean;
  readonly purchase_limit: string;
}

interface AdminShopViewProps {
  readonly items: AdminShopItem[];
}

export function AdminShopView({ items }: AdminShopViewProps) {
  const [localItems, setLocalItems] = useState(items);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [editStock, setEditStock] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filtered = localItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startEdit = (item: AdminShopItem) => {
    setEditingId(item.id);
    setEditPrice(item.base_price);
    setEditActive(item.active);
    setEditStock(item.current_stock !== null ? String(item.current_stock) : '');
  };

  const handleSave = async (id: string) => {
    setStatusMsg('저장 중...');
    try {
      const res = await fetch(`/api/v1/admin/shop/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_price: editPrice,
          active: editActive,
          current_stock: editStock ? Number(editStock) : null,
        }),
      });

      if (!res.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      setLocalItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                base_price: editPrice,
                active: editActive,
                current_stock: editStock ? Number(editStock) : null,
              }
            : it,
        ),
      );
      setEditingId(null);
      setStatusMsg('성공적으로 저장되었습니다.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error: unknown) {
      setStatusMsg(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 상단 검색 및 상태 알림 바 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="아이템명, 코드, 카테고리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {statusMsg && (
          <div className="text-xs font-bold text-primary animate-fade-in px-3 py-1.5 bg-primary/10 rounded-lg shrink-0">
            {statusMsg}
          </div>
        )}
      </div>

      {/* 1. 모바일 뷰: 스택형 카드 뷰 (md:hidden) */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="p-4 bg-card border border-border/80 rounded-2xl shadow-sm space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface border border-border/60 text-muted-foreground">
                      {item.category}
                    </span>
                    {item.rarity && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {item.rarity}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.code}</div>
                </div>

                {isEditing ? (
                  <button
                    onClick={() => setEditActive(!editActive)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[36px] transition-all',
                      editActive
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
                    )}
                  >
                    {editActive ? '판매 중' : '판매 중지'}
                  </button>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border',
                      item.active
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
                    )}
                  >
                    {item.active ? (
                      <>
                        <CheckCircle className="size-3" /> 판매 중
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3" /> 비활성
                      </>
                    )}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              )}

              {/* 가격 및 재고 수치 영역 */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">기본 가격</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border/80 rounded-lg text-xs font-mono font-bold"
                    />
                  ) : (
                    <span className="font-mono font-bold text-foreground text-sm">
                      {groupDigits(item.base_price)} <span className="text-[10px] text-muted-foreground font-normal">WLD</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">재고 수량</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      placeholder="무제한"
                      className="w-full px-2.5 py-1.5 bg-surface border border-border/80 rounded-lg text-xs font-mono"
                    />
                  ) : (
                    <span className="font-mono font-medium text-foreground text-xs">
                      {item.current_stock !== null ? (
                        `${groupDigits(String(item.current_stock))}개`
                      ) : (
                        <span className="text-muted-foreground">무제한</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* 하단 모바일 액션 버튼 (44px 터치 타겟 대응) */}
              <div className="pt-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSave(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 min-h-[40px] rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm active:scale-[0.98] transition-transform"
                    >
                      <Save className="size-4" /> 저장 완료
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 h-10 min-h-[40px] rounded-xl border border-border/80 text-muted-foreground text-xs font-bold hover:text-foreground active:scale-[0.98] transition-transform"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(item)}
                    className="w-full flex items-center justify-center gap-1.5 h-10 min-h-[40px] rounded-xl border border-border/80 bg-surface/50 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                  >
                    아이템 설정 수정
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-2xl">
            검색 결과와 일치하는 아이템이 없습니다.
          </div>
        )}
      </div>

      {/* 2. 데스크톱 뷰: 테이블 뷰 (hidden md:block) */}
      <div className="hidden md:block bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                <th className="px-4 py-3">코드 / 아이템명</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">희귀도</th>
                <th className="px-4 py-3">기본 가격</th>
                <th className="px-4 py-3">재고 상태</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface border border-border/50 text-muted-foreground">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-muted-foreground">
                      {item.rarity || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-2 py-1 bg-surface border border-border/80 rounded text-xs font-mono font-bold"
                        />
                      ) : (
                        <span>{groupDigits(item.base_price)} WLD</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          placeholder="무제한"
                          className="w-20 px-2 py-1 bg-surface border border-border/80 rounded text-xs font-mono"
                        />
                      ) : (
                        <span>
                          {item.current_stock !== null ? `${groupDigits(String(item.current_stock))}개` : '무제한'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <button
                          onClick={() => setEditActive(!editActive)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                            editActive
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
                          )}
                        >
                          {editActive ? '판매 중' : '판매 중지'}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-bold',
                            item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {item.active ? (
                            <>
                              <CheckCircle className="size-3" /> 판매 중
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3" /> 비활성
                            </>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="p-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold"
                            title="저장"
                          >
                            <Save className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg border border-border/50 text-muted-foreground text-xs"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="px-2.5 py-1 rounded-lg border border-border/50 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                        >
                          수정
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
