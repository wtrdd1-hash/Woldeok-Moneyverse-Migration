'use client';

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  successMessage?: string | null;
  onSuccessAcknowledge?: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  confirmVariant?: 'primary' | 'destructive' | 'emerald';
  onConfirm?: () => void;
  children: React.ReactNode;
}

export function AdminActionModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  successMessage,
  onSuccessAcknowledge,
  isLoading = false,
  confirmLabel = '확인',
  loadingLabel = '처리 중...',
  confirmVariant = 'primary',
  onConfirm,
  children,
}: AdminActionModalProps) {
  if (!isOpen) return null;

  const btnBg =
    confirmVariant === 'destructive'
      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
      : confirmVariant === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
                {subtitle && <p className="text-[11px] text-slate-400 font-mono">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Success Screen or Content */}
          {successMessage ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>처리 완료</span>
              </div>
              <p className="text-slate-200 font-mono leading-relaxed">{successMessage}</p>
              <div className="pt-2 text-right">
                <Button
                  size="sm"
                  onClick={() => {
                    onSuccessAcknowledge?.();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  확인 완료
                </Button>
              </div>
            </div>
          ) : (
            <>
              {children}

              {/* Action Buttons */}
              {onConfirm && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg ${btnBg}`}
                  >
                    {isLoading ? loadingLabel : confirmLabel}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
