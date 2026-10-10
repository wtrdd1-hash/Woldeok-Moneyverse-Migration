'use client';

import React, { useState } from 'react';
import { ZoomIn, Image as ImageIcon } from 'lucide-react';
import { ImageLightboxModal } from './image-lightbox-modal';
import { cn } from '@/lib/cn';

export interface ChatMessageRendererProps {
  readonly body: string;
  readonly isMine?: boolean;
}

const CHAT_IMAGE_REGEX = /(https?:\/\/[^\s]+|\/api\/v1\/content\/chat\/media\/[^\s]+|\/media\/[^\s]+)\.(png|jpg|jpeg|webp|gif)/gi;
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/api\/v1\/content\/chat\/media\/[^\s)]+|\/media\/[^\s)]+)\)/gi;

export function ChatMessageRenderer({ body, isMine }: ChatMessageRendererProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // 1. 마크다운 이미지 또는 URL 추출
  const imageUrls: string[] = [];
  let cleanText = body;

  // 마크다운 이미지 태그 ![alt](url) 치환 및 추출
  cleanText = cleanText.replace(MARKDOWN_IMAGE_REGEX, (_, __, url) => {
    if (!imageUrls.includes(url)) imageUrls.push(url);
    return '';
  });

  // 일반 이미지 URL 치환 및 추출
  cleanText = cleanText.replace(CHAT_IMAGE_REGEX, (url) => {
    if (!imageUrls.includes(url)) imageUrls.push(url);
    return '';
  });

  cleanText = cleanText.replace(/^\[이미지\]\s*/g, '').trim();

  return (
    <div className="space-y-2">
      {/* 텍스트 내용 */}
      {cleanText ? (
        <p className="leading-relaxed whitespace-pre-wrap break-words">{cleanText}</p>
      ) : imageUrls.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
          <ImageIcon className="size-3.5" />
          <span>첨부 이미지</span>
        </div>
      ) : null}

      {/* 첨부 이미지 썸네일 그리드 */}
      {imageUrls.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 w-full max-w-[340px]">
          {imageUrls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={cn(
                'group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 shadow-sm',
                isMine ? 'border-primary-foreground/30 bg-black/20' : 'border-border/80 bg-background/90'
              )}
            >
              {/* 이미지 썸네일 (object-contain으로 원본 서류 글자 잘림 방지) */}
              <div
                onClick={() => setSelectedImg(url)}
                className="relative overflow-hidden cursor-pointer bg-zinc-950/40 p-1 flex items-center justify-center min-h-[140px] max-h-[260px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="첨부 서류 및 이미지"
                  loading="lazy"
                  className="max-h-[250px] w-auto max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2 rounded-full bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold shadow-lg">
                    <ZoomIn className="size-4" />
                    <span>클릭하여 서류 크게 읽기</span>
                  </span>
                </div>
              </div>

              {/* 하단 모바일/데스크톱 상시 노출 조작 툴바 (글자 읽기 보장) */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-muted/60 border-t border-border/50 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedImg(url)}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline text-left"
                >
                  <ZoomIn className="size-3.5" />
                  <span>🔍 원본 확대 및 돋보기 읽기</span>
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-[10px] underline ml-2 shrink-0 font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  새창 열기 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 라이트박스 팝업 */}
      <ImageLightboxModal
        src={selectedImg}
        alt="첨부 서류 및 이미지 확대 뷰어"
        onClose={() => setSelectedImg(null)}
      />
    </div>
  );
}

