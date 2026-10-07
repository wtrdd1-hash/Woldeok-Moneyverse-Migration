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
        <div className="flex flex-wrap gap-2 pt-1">
          {imageUrls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              onClick={() => setSelectedImg(url)}
              className={cn(
                'group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-xs max-w-[260px] sm:max-w-[320px]',
                isMine ? 'border-primary-foreground/30 bg-black/20' : 'border-border/80 bg-background/80'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="채팅 첨부 이미지"
                loading="lazy"
                className="max-h-56 w-auto object-cover rounded-xl transition-transform duration-300 group-hover:brightness-95"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1 text-[10px] font-bold">
                  <ZoomIn className="size-3.5" />
                  <span>확대</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 라이트박스 팝업 */}
      <ImageLightboxModal
        src={selectedImg}
        alt="첨부 이미지 확대"
        onClose={() => setSelectedImg(null)}
      />
    </div>
  );
}
