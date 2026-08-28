'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { IDLE } from '@/lib/action-state';
import { createComment, deleteComment, deletePost, updatePost } from '../actions';

/**
 * The author's own controls, and the reply box. Everything on this page that
 * writes lives here; the page itself stays a server component that reads.
 */

export function PostControls({
  postId,
  title,
  body,
}: {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(updatePost, IDLE);

  // The edited post is already on screen by the time this runs — the action
  // revalidated the page — so closing the editor reveals the result rather
  // than hiding it.
  useEffect(() => {
    if (state.status === 'ok') setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="min-h-11" onClick={() => setEditing(true)}>
          수정
        </Button>
        <DeletePostButton postId={postId} />
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 rounded-[14px] border bg-surface p-4">
      <input type="hidden" name="postId" value={postId} />
      <Field>
        <FieldLabel htmlFor="edit-title">제목</FieldLabel>
        <Input id="edit-title" name="title" defaultValue={title} maxLength={120} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="edit-body">내용</FieldLabel>
        <Textarea
          id="edit-body"
          name="body"
          defaultValue={body}
          maxLength={5000}
          rows={8}
          required
        />
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" className="min-h-11" onClick={() => setEditing(false)}>
          취소
        </Button>
        <SubmitButton>저장</SubmitButton>
      </div>
      <ActionAlert state={state} />
    </form>
  );
}

/**
 * Confirms first. Deleting a post is not reversible from any screen in this
 * application, and it sits next to the edit control.
 */
function DeletePostButton({ postId }: { readonly postId: string }) {
  const [state, action] = useActionState(deletePost, IDLE);
  const form = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={form} action={action} hidden>
        <input type="hidden" name="postId" value={postId} />
      </form>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="min-h-11 text-muted-foreground">
            삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 글을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제한 글과 댓글은 다시 볼 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => form.current?.requestSubmit()}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ActionAlert state={state} />
    </>
  );
}

export function CommentForm({ postId }: { readonly postId: string }) {
  const [state, action] = useActionState(createComment, IDLE);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'ok') form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="grid gap-3">
      <input type="hidden" name="postId" value={postId} />
      <Field>
        <FieldLabel htmlFor="comment-body" className="sr-only">
          댓글
        </FieldLabel>
        <Textarea
          id="comment-body"
          name="body"
          maxLength={1000}
          rows={3}
          required
          placeholder="댓글을 남겨 주세요."
        />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          줄바꿈은 한 칸 띄어쓰기로 저장됩니다.
        </p>
        <SubmitButton>댓글 등록</SubmitButton>
      </div>
      <ActionAlert state={state} />
    </form>
  );
}

export function DeleteCommentButton({
  postId,
  commentId,
}: {
  readonly postId: string;
  readonly commentId: string;
}) {
  const [state, action] = useActionState(deleteComment, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="commentId" value={commentId} />
        <SubmitButton variant="ghost" size="sm" className="min-h-11 text-muted-foreground">
          삭제
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
