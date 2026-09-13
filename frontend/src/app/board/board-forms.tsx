'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { ChevronDown, ImagePlus } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { IDLE } from '@/lib/action-state';
import { createStockAwarePost } from './stock-actions';

export function NewPostForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createStockAwarePost, IDLE);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.status === 'ok') { form.current?.reset(); setOpen(false); } }, [state]);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant={open ? 'outline' : 'default'} className="h-11 rounded-[12px] px-5 font-extrabold" aria-expanded={open} aria-controls="board-composer" onClick={() => setOpen((current) => !current)}>
          {open ? '접기' : '글쓰기'} <ChevronDown className={cn('transition-transform', open && 'rotate-180')} />
        </Button>
        <p className="text-xs text-muted-foreground">가상주식 글은 종목과 보유 관계를 함께 표시할 수 있어요.</p>
      </div>
      <form ref={form} id="board-composer" action={action} hidden={!open} className="grid gap-4 rounded-[14px] border bg-surface p-4">
        <Field><FieldLabel htmlFor="board-title">제목</FieldLabel><Input id="board-title" name="title" maxLength={120} required /></Field>
        <Field><FieldLabel htmlFor="board-body">내용</FieldLabel><Textarea id="board-body" name="body" maxLength={5000} rows={6} required /></Field>
        <div className="grid gap-3 rounded-xl border p-3 md:grid-cols-2">
          <Field><FieldLabel htmlFor="board-stock-symbol">가상주식 종목코드 (선택)</FieldLabel><Input id="board-stock-symbol" name="stockSymbol" maxLength={16} placeholder="예: WDX" /></Field>
          <Field><FieldLabel htmlFor="board-category">글 분류</FieldLabel><select id="board-category" name="category" className="h-10 rounded-md border bg-background px-3"><option value="analysis">분석</option><option value="question">질문</option><option value="journal">기록</option><option value="business">사업</option><option value="system">시스템</option></select></Field>
          <Field><FieldLabel htmlFor="board-stance">관점</FieldLabel><select id="board-stance" name="stance" className="h-10 rounded-md border bg-background px-3"><option value="none">없음</option><option value="bullish">긍정</option><option value="neutral">중립</option><option value="bearish">부정</option></select></Field>
          <Field><FieldLabel htmlFor="board-position">보유 관계</FieldLabel><select id="board-position" name="positionDisclosure" className="h-10 rounded-md border bg-background px-3"><option value="undisclosed">미공개</option><option value="holder">보유 중</option><option value="no_position">미보유</option><option value="operator_related">운영 관련</option></select></Field>
          <p className="text-xs text-muted-foreground md:col-span-2">분석 글은 보유 관계 공개가 필요합니다. 실제 투자 권유가 아닌 서비스 내부 가상주식 토론입니다.</p>
        </div>
        <div className="grid gap-3 rounded-xl border border-dashed p-3">
          <Field><FieldLabel htmlFor="board-photo" className="flex items-center gap-2"><ImagePlus className="size-4" aria-hidden />사진 첨부 (선택)</FieldLabel><Input id="board-photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" /></Field>
          <Field><FieldLabel htmlFor="board-image-alt">사진 설명</FieldLabel><Input id="board-image-alt" name="imageAltText" maxLength={300} placeholder="사진을 첨부한 경우 내용을 짧게 설명해 주세요" /></Field>
          <p className="text-xs text-muted-foreground">PNG · JPEG · WebP, 최대 4MB</p>
        </div>
        <div className="justify-self-end"><SubmitButton>등록</SubmitButton></div>
        <ActionAlert state={state} />
      </form>
    </div>
  );
}
