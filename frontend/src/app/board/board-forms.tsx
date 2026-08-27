'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { IDLE } from '@/lib/action-state';
import { createPost } from './actions';

/**
 * Folded away until asked for.
 *
 * The board is a place to read first and write second, and a permanently open
 * composer pushed the list of posts below the fold on a phone. The list is
 * what the page is for.
 */
export function NewPostForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createPost, IDLE);
  const form = useRef<HTMLFormElement>(null);

  // Clearing on success is what tells the member the draft is gone; leaving
  // it filled invites the same post twice. The composer closes with it, so
  // the list they just added to is the next thing they see.
  useEffect(() => {
    if (state.status === 'ok') {
      form.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant={open ? 'outline' : 'default'}
          className="h-11 rounded-[12px] px-5 font-extrabold"
          aria-expanded={open}
          aria-controls="board-composer"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? '접기' : '글쓰기'}
          <ChevronDown className={cn('transition-transform', open && 'rotate-180')} />
        </Button>
        <p className="text-xs text-muted-foreground">
          개인정보나 계정 정보는 남기지 말아 주세요.
        </p>
      </div>

      <form
        ref={form}
        id="board-composer"
        action={action}
        hidden={!open}
        className="grid gap-4 rounded-[14px] border bg-surface p-4"
      >
        <Field>
          <FieldLabel htmlFor="board-title">제목</FieldLabel>
          <Input id="board-title" name="title" maxLength={120} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="board-body">내용</FieldLabel>
          <Textarea id="board-body" name="body" maxLength={5000} rows={6} required />
        </Field>
        <div className="justify-self-end">
          <SubmitButton>등록</SubmitButton>
        </div>
        <ActionAlert state={state} />
      </form>
    </div>
  );
}
