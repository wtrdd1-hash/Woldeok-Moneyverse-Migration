'use client';

import React, { useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageLightboxModalProps {
  readonly src: string | null;
  readonly alt?: string;
  readonly onClose: () => void;
}

export function ImageLightboxModal({ src, alt = '확대 이미지', onClose }: ImageLightboxModalProps) {
  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 컨트롤 바 */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 z-10 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-full border border-zinc-700/60 shadow-lg">
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            title="다운로드"
          >
            <Download className="size-4" />
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            title="새 탭에서 원본 보기"
          >
            <ExternalLink className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            title="닫기 (ESC)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 메인 이미지 */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-700/40 bg-zinc-950/60 shadow-2xl flex items-center justify-center max-h-[85vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-full object-contain select-none transition-transform"
          />
        </div>
      </div>
    </div>
  );
}
