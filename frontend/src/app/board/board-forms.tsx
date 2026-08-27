'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { createPost, deletePost } from './actions';

export function NewPostForm() {
  const [state, action] = useActionState(createPost, IDLE);
  const form = useRef<HTMLFormElement>(null);

  // Clearing on success is what tells the member the draft is gone; leaving
  // it filled invites the same post twice.
  useEffect(() => {
    if (state.status === 'ok') form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="board-title">제목</FieldLabel>
        <Input id="board-title" name="title" maxLength={120} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="board-body">내용</FieldLabel>
        <Textarea id="board-body" name="body" maxLength={5000} rows={5} required />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          개인정보나 계정 정보는 남기지 말아 주세요.
        </p>
        <SubmitButton>글 작성</SubmitButton>
      </div>
      <ActionAlert state={state} />
    </form>
  );
}

export function DeletePostButton({ postId }: { readonly postId: string }) {
  const [state, action] = useActionState(deletePost, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="postId" value={postId} />
        <SubmitButton variant="ghost" size="sm" className="text-muted-foreground">
          삭제
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
