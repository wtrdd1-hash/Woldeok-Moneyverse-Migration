'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { IDLE } from '@/lib/action-state';
import { submitPhoto } from './actions';

export function PhotoSubmissionForm() {
  const [state, action] = useActionState(submitPhoto, IDLE);

  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="gallery-photo">사진 파일</FieldLabel>
        <Input
          id="gallery-photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="min-h-11"
        />
        <FieldDescription>PNG · JPEG · WebP, 4MB까지. 하루에 5장까지 보낼 수 있어요.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="gallery-alt">사진 설명</FieldLabel>
        <Input
          id="gallery-alt"
          name="altText"
          type="text"
          maxLength={300}
          autoComplete="off"
          placeholder="무엇이 찍힌 사진인지 한 문장으로"
          className="min-h-11"
        />
        <FieldDescription>
          화면을 읽어 주는 도구가 이 문장을 사진 대신 읽어요. 그래서 비워 둘 수 없어요.
        </FieldDescription>
      </Field>

      <SubmitButton className="w-fit">사진 보내기</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
