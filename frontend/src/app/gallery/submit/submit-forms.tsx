'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { IDLE } from '@/lib/action-state';
import { TranslatedText as T } from '@/components/translated-text';
import { useLocale } from '@/components/locale-provider';
import { submitPhoto } from './actions';

/**
 * Validate magic bytes for PNG, JPEG, WEBP.
 */
async function validateImageMagicBytes(file: File): Promise<boolean> {
  const slice = file.slice(0, 16);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return true;
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

/**
 * Client-side auto compression for large mobile camera images (> 1.5MB)
 * Converts to optimized WebP max 1920x1920.
 */
async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= 1.5 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1920;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.webp'),
              { type: 'image/webp' },
            );
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.88,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PhotoSubmissionForm() {
  const [state, formAction] = useActionState(submitPhoto, IDLE);
  const { locale } = useLocale();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [altText, setAltText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (rawFile: File | null) => {
    if (!rawFile) return;
    setFileError(null);

    // Validate size before compression
    if (rawFile.size > 25 * 1024 * 1024) {
      setFileError('25MB 이상의 파일은 업로드할 수 없습니다.');
      return;
    }

    const isMagicValid = await validateImageMagicBytes(rawFile);
    if (!isMagicValid) {
      setFileError('지원하지 않는 파일 포맷입니다. 올바른 PNG, JPEG, WebP 이미지를 올려주세요.');
      return;
    }

    setOriginalSize(rawFile.size);
    setIsCompressing(true);

    try {
      const processed = await compressImageIfNeeded(rawFile);
      if (processed.size > 4 * 1024 * 1024) {
        setFileError('압축 후에도 파일이 4MB를 초과합니다. 다른 사진을 선택해 주세요.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(processed);
      setPreviewUrl(URL.createObjectURL(processed));
    } catch {
      setSelectedFile(rawFile);
      setPreviewUrl(URL.createObjectURL(rawFile));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOriginalSize(0);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (state.status === 'ok') {
      removeFile();
      setAltText('');
    }
  }, [state]);

  const handleSubmitAction = (formData: FormData) => {
    if (selectedFile) {
      formData.set('photo', selectedFile);
    }
    formData.set('altText', altText);
    formAction(formData);
  };

  return (
    <form action={handleSubmitAction} className="grid gap-5">
      {/* File Drop Area */}
      <div className="grid gap-2">
        <FieldLabel htmlFor="gallery-photo-input">
          <T korean="사진 파일 (터치하여 선택 또는 끌어다 놓기)" english="Photo File (Tap or Drag & Drop)" />
        </FieldLabel>

        <input
          ref={fileInputRef}
          id="gallery-photo-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              void handleFile(e.target.files[0]);
            }
          }}
        />

        {!selectedFile ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer min-h-[180px] ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[0.99]'
                : 'border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/30'
            }`}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-bold text-foreground">
                <T korean="사진을 선택하거나 여기로 끌어다 놓으세요" english="Select a photo or drag & drop here" />
              </p>
              <p className="text-xs text-muted-foreground">
                PNG · JPEG · WebP (카메라 원본 자동 최적화 지원, 최대 4MB)
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 rounded-xl text-xs gap-1.5 pointer-events-none"
              >
                <Camera className="size-4" />
                <T korean="카메라 / 갤러리 열기" english="Open Camera / Gallery" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="미리보기"
                className="size-24 rounded-xl object-cover border border-border/60 shrink-0 shadow-inner"
              />
            )}
            <div className="flex-1 grid gap-1 text-center sm:text-left min-w-0">
              <p className="text-sm font-bold truncate text-foreground flex items-center gap-2 justify-center sm:justify-start">
                <ImageIcon className="size-4 text-primary shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono">
                  {formatBytes(selectedFile.size)}
                </span>
                {originalSize > selectedFile.size && (
                  <span className="text-emerald-500 font-medium">
                    (원본 {formatBytes(originalSize)}에서 최적화 완료)
                  </span>
                )}
                {isCompressing && (
                  <span className="text-primary animate-pulse font-medium">
                    최적화 압축 중…
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeFile}
              className="min-h-11 rounded-xl gap-1.5 text-xs shrink-0 w-full sm:w-auto"
            >
              <Trash2 className="size-4" />
              <T korean="사진 변경" english="Change Photo" />
            </Button>
          </div>
        )}

        {fileError && (
          <p className="text-xs font-semibold text-destructive mt-1">
            {fileError}
          </p>
        )}
      </div>

      {/* Alt Text Field with 44px+ touch & counter */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="gallery-alt">
            <T korean="사진 설명 (화면 낭독 보조 텍스트)" english="Photo Description (Accessibility Alt Text)" />
          </FieldLabel>
          <span className={`text-xs tabular-nums ${altText.length > 280 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            {altText.length} / 300
          </span>
        </div>
        <Input
          id="gallery-alt"
          name="altText"
          type="text"
          maxLength={300}
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          autoComplete="off"
          placeholder={
            locale === 'en'
              ? 'One sentence describing what is in the photo'
              : '무엇이 찍힌 사진인지 한 문장으로 적어주세요'
          }
          className="min-h-11 rounded-xl text-sm"
          required
        />
        <FieldDescription>
          <T
            korean="시각 보조 도구가 사진 대신 이 문장을 낭독합니다. 사진의 맥락을 구체적으로 적어주세요."
            english="Screen readers read this description in place of the photo. Please be specific."
          />
        </FieldDescription>
      </Field>

      <SubmitButton
        disabled={!selectedFile || isCompressing || altText.trim() === ''}
        className="min-h-11 rounded-xl font-bold w-full sm:w-fit px-8"
      >
        <T korean="사진 업로드 제출" english="Submit Photo" />
      </SubmitButton>

      <ActionAlert state={state} />
    </form>
  );
}
