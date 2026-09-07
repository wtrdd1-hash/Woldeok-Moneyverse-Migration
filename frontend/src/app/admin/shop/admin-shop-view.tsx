'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Search, CheckCircle, XCircle } from 'lucide-react';
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [editStock, setEditStock] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = items.filter(
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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '수정에 실패했습니다.');
      }

      setStatusMsg('성공적으로 저장되었습니다.');
      setEditingId(null);
      setTimeout(() => {
        setStatusMsg(null);
        startTransition(() => {
          router.refresh();
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setStatusMsg(`오류: ${msg}`);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="상품명, 코드, 카테고리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
className="w-full rounded-2xl border border-border/50 bg-card py-2 pl-10 pr-4 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          총 <strong className="text-foreground">{items.length}</strong>개 상품 등록됨
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 text-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-2xl">
          {statusMsg}
        </div>
      )}

      <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-border/40 text-[11px] font-extrabold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">코드 / 상품명</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">희귀도</th>
                <th className="px-4 py-3">가격 (WLD)</th>
                <th className="px-4 py-3">재고 / 제한</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-medium">
              {filtered.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-surface/40 transition-all">
                    <td className="px-4 py-3">
                      <span className="font-bold text-foreground block">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-surface text-[10px] font-bold border border-border/40">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-extrabold uppercase text-primary">
                        {item.rarity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 rounded-lg border border-primary bg-surface px-2 py-1 text-xs font-bold text-foreground"
                        />
                      ) : (
                        <span className="font-extrabold text-primary">
                          {groupDigits(item.base_price)} WLD
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing && item.is_limited ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          placeholder="재고"
                          className="w-20 rounded-lg border border-primary bg-surface px-2 py-1 text-xs font-bold"
                        />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {item.current_stock !== null ? `${item.current_stock}개 남음` : '무제한'}
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
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40',
                          )}
                        >
                          {editActive ? '판매 중' : '판매 중지'}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-bold',
                            item.active ? 'text-emerald-400' : 'text-red-400',
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
                          className="px-2.5 py-1 rounded-lg border border-border/50 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-surface"
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
