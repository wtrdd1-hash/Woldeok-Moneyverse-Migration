'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { IDLE } from '@/lib/action-state';
import { TranslatedText as T } from '@/components/translated-text';
import { useLocale } from '@/components/locale-provider';
import { submitPhoto } from './actions';

export function PhotoSubmissionForm() {
  const [state, action] = useActionState(submitPhoto, IDLE);
  const { locale } = useLocale();

  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="gallery-photo">
          <T korean="사진 파일" english="Photo File" />
        </FieldLabel>
        <Input
          id="gallery-photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="min-h-11"
        />
        <FieldDescription>
          <T
            korean="PNG · JPEG · WebP, 4MB까지. 하루에 5장까지 보낼 수 있어요."
            english="PNG · JPEG · WebP, up to 4MB. You can submit up to 5 photos per day."
          />
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="gallery-alt">
          <T korean="사진 설명" english="Photo Description" />
        </FieldLabel>
        <Input
          id="gallery-alt"
          name="altText"
          type="text"
          maxLength={300}
          autoComplete="off"
          placeholder={
            locale === 'en'
              ? 'One sentence describing what is in the photo'
              : '무엇이 찍힌 사진인지 한 문장으로'
          }
          className="min-h-11"
        />
        <FieldDescription>
          <T
            korean="화면을 읽어 주는 도구가 이 문장을 사진 대신 읽어요. 그래서 비워 둘 수 없어요."
            english="Screen readers read this sentence in place of the photo. It cannot be left blank."
          />
        </FieldDescription>
      </Field>

      <SubmitButton className="w-fit">
        <T korean="사진 보내기" english="Submit Photo" />
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
