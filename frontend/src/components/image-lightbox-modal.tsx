'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface ImageLightboxModalProps {
  readonly src: string | null;
  readonly alt?: string;
  readonly onClose: () => void;
}

export function ImageLightboxModal({ src, alt = '확대 이미지', onClose }: ImageLightboxModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) return;
    setZoomLevel(1);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/92 backdrop-blur-md p-2 sm:p-4 animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      {/* 상단 컨트롤 바 */}
      <div
        className="w-full max-w-4xl flex items-center justify-between gap-2 z-20 py-2 px-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="text-[10px] text-zinc-300 border-zinc-700 shrink-0 font-mono">
            {Math.round(zoomLevel * 100)}%
          </Badge>
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {alt || '서류/이미지 상세 뷰어'}
          </span>
        </div>

        {/* 줌 및 외부 링크 조작 버튼군 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.8}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="축소"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="100% 원본 크기 리셋"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3.5}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="확대 (글씨 선명하게 보기)"
          >
            <ZoomIn className="size-4" />
          </button>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            title="새 탭에서 고해상도 원본 열기"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">새창 원본</span>
          </a>
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="다운로드"
          >
            <Download className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors ml-1"
            title="닫기 (ESC)"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* 중앙 메인 이미지 스크롤 및 패닝 뷰어 컨테이너 */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-5xl my-2 overflow-auto flex items-center justify-center p-2 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out flex items-center justify-center cursor-zoom-in"
          onClick={handleZoomIn}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl select-none bg-white/5"
            draggable={false}
          />
        </div>
      </div>

      {/* 하단 모바일 가이드 캡션 */}
      <div
        className="text-[11px] text-zinc-400 text-center py-1 px-3 bg-zinc-900/60 rounded-full border border-zinc-800 backdrop-blur-xs flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span>💡 터치하여 확대하거나 상단 돋보기 버튼으로 글자를 크게 확대해 읽으실 수 있습니다.</span>
      </div>
    </div>
  );
}

