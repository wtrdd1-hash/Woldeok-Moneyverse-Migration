'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Bold, ChevronDown, Code, FileText, HelpCircle, ImagePlus, Italic, Link2, List, Quote } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { IDLE } from '@/lib/action-state';
import { createStockAwarePost } from './stock-actions';

/**
 * Lightweight safe markdown renderer for live client-side preview
 */
function renderMarkdownPreview(markdown: string) {
  if (!markdown.trim()) {
    return <p className="text-muted-foreground text-sm italic">내용을 입력하면 여기에 실시간으로 미리보기가 표시됩니다.</p>;
  }

  const lines = markdown.split('\n');
  return (
    <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="font-bold text-base mt-2 text-foreground">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="font-bold text-lg mt-3 text-foreground">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={idx} className="font-extrabold text-xl mt-4 text-foreground">{line.slice(2)}</h2>;
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-primary/50 bg-muted/40 pl-3 py-1 italic text-muted-foreground rounded-r">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={idx} className="list-disc ml-5 text-foreground">
              {line.slice(2)}
            </li>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }
        return (
          <p key={idx} className="text-foreground leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function NewPostForm({ defaultStockSymbol }: { readonly defaultStockSymbol?: string | undefined }) {
  const [open, setOpen] = useState(Boolean(defaultStockSymbol));
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [bodyText, setBodyText] = useState('');
  const [state, action] = useActionState(createStockAwarePost, IDLE);
  const form = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.status === 'ok') {
      form.current?.reset();
      setBodyText('');
      setOpen(false);
      setActiveTab('write');
    }
  }, [state]);

  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${prefix}${selected || '텍스트'}${suffix}`;

    const updated = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setBodyText(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant={open ? 'outline' : 'default'}
          className="min-h-11 rounded-2xl px-6 font-extrabold shadow-sm transition-all"
          aria-expanded={open}
          aria-controls="board-composer"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? '작성창 닫기' : '새 게시글 작성'}
          <ChevronDown className={cn('size-4 transition-transform ml-1.5', open && 'rotate-180')} />
        </Button>
        <p className="text-xs text-muted-foreground hidden sm:block">
          가상주식 종목 및 보유 관계를 함께 투명하게 공개할 수 있습니다.
        </p>
      </div>

      <form
        ref={form}
        id="board-composer"
        action={action}
        hidden={!open}
        className="grid gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-lg backdrop-blur-sm animate-in fade-in duration-200"
      >
        <Field>
          <FieldLabel htmlFor="board-title" className="font-semibold">
            제목
          </FieldLabel>
          <Input
            id="board-title"
            name="title"
            maxLength={120}
            placeholder="게시글 제목을 입력하세요 (최대 120자)"
            className="min-h-11 rounded-xl text-sm"
            required
          />
        </Field>

        {/* Content Area with Markdown Write & Preview Tabs */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-8 flex items-center gap-1.5',
                  activeTab === 'write'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <FileText className="size-3.5" />
                작성
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-8 flex items-center gap-1.5',
                  activeTab === 'preview'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <HelpCircle className="size-3.5" />
                실시간 미리보기
              </button>
            </div>

            {/* Quick Markdown Toolbar */}
            {activeTab === 'write' && (
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  title="굵게"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  title="기울임"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <Italic className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  title="인용구"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <Quote className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  title="인라인 코드"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <Code className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  title="목록"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <List className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://)')}
                  title="링크"
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  <Link2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {activeTab === 'write' ? (
            <Field>
              <Textarea
                ref={textareaRef}
                id="board-body"
                name="body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                maxLength={5000}
                rows={7}
                placeholder="내용을 작성하세요. 마크다운 문법(제목 #, 인용 >, 목록 - 등)을 지원합니다."
                className="rounded-xl text-sm font-sans"
                required
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                <span>마크다운 형식 지원</span>
                <span>{bodyText.length} / 5,000자</span>
              </div>
            </Field>
          ) : (
            <div className="min-h-[170px] rounded-xl border border-border/80 bg-muted/20 p-4">
              {renderMarkdownPreview(bodyText)}
            </div>
          )}
        </div>

        {/* Stock Relationship Metadata */}
        <div className="grid gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="board-stock-symbol" className="text-xs font-semibold">
              가상주식 종목코드 (선택)
            </FieldLabel>
            <Input
              id="board-stock-symbol"
              name="stockSymbol"
              maxLength={16}
              placeholder="예: WDX"
              defaultValue={defaultStockSymbol}
              className="min-h-11 rounded-xl text-sm"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="board-category" className="text-xs font-semibold">
              게시글 분류
            </FieldLabel>
            <select
              id="board-category"
              name="category"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="analysis">종목 분석</option>
              <option value="question">질문과 답변</option>
              <option value="journal">매매 일지</option>
              <option value="business">사업체 이야기</option>
              <option value="system">시스템 정보</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="board-stance" className="text-xs font-semibold">
              시장 관점
            </FieldLabel>
            <select
              id="board-stance"
              name="stance"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="none">없음</option>
              <option value="bullish">🟢 긍정 (상승 기대)</option>
              <option value="neutral">🟡 중립 (관망)</option>
              <option value="bearish">부정 (하락 주의)</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="board-position" className="text-xs font-semibold">
              보유 관계 공개
            </FieldLabel>
            <select
              id="board-position"
              name="positionDisclosure"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="undisclosed">미공개</option>
              <option value="holder">주식 보유 중</option>
              <option value="no_position">미보유 (관심)</option>
              <option value="operator_related">운영 관련자</option>
            </select>
          </Field>

          <p className="text-xs text-muted-foreground sm:col-span-2">
            ※ 분석 글 작성 시 보유 관계 공개를 권장합니다. 실제 투자 권유가 아닌 서비스 내부 가상 경제 토론입니다.
          </p>
        </div>

        {/* Photo Attachment (Optional) */}
        <div className="grid gap-3 rounded-2xl border border-dashed border-border/80 p-4">
          <Field>
            <FieldLabel htmlFor="board-photo" className="flex items-center gap-2 text-xs font-semibold">
              <ImagePlus className="size-4 text-primary" aria-hidden />
              사진 첨부 (선택)
            </FieldLabel>
            <Input
              id="board-photo"
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="min-h-11 rounded-xl text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="board-image-alt" className="text-xs font-semibold">
              사진 설명 (대체 텍스트)
            </FieldLabel>
            <Input
              id="board-image-alt"
              name="imageAltText"
              maxLength={300}
              placeholder="사진을 첨부한 경우 내용을 짧게 설명해 주세요"
              className="min-h-11 rounded-xl text-sm"
            />
          </Field>
          <p className="text-xs text-muted-foreground">PNG · JPEG · WebP, 최대 4MB</p>
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton className="min-h-11 rounded-xl px-8 font-bold">
            게시글 등록
          </SubmitButton>
        </div>

        <ActionAlert state={state} />
      </form>
    </div>
  );
}
