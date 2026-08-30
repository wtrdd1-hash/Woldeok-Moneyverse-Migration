'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IDLE } from '@/lib/action-state';
import type { ProfileSettings, ProfileView } from './profile';
import {
  DISPLAY_NAME_MAX,
  FIELD_CHOICES,
  IMAGE_URL_MAX,
  INHERIT,
  NO_TITLE,
  VISIBILITY_CHOICES,
  VISIBILITY_FIELDS,
  fieldInputName,
  titleChoices,
} from './profile';
import { removeProfileImage, saveProfile, uploadProfileImage } from './actions';

/**
 * The profile's write surface.
 *
 * A `<form action={serverAction}>`, so it works before hydration and carries
 * no CSRF token into the browser -- the action fetches one on the server and
 * spends it in the same call. `SubmitButton` disables itself while a request
 * is in flight; this write is an upsert of one row rather than an event, so
 * there is no idempotency key behind it and the disabled control is the whole
 * defence against a double submission. Sending the same settings twice stores
 * the same settings.
 *
 * Every control is pre-filled from the profile that was just read, because
 * `member_update_profile` replaces every column from its arguments: a control
 * that started blank would clear the field it belongs to on the first save.
 */
export function ProfileSettingsForm({
  profile,
  settings,
}: {
  readonly profile: ProfileView;
  readonly settings: ProfileSettings;
}) {
  const [state, action] = useActionState(saveProfile, IDLE);
  const [visibility, setVisibility] = useState<string>(profile.visibility);
  const [featuredTitle, setFeaturedTitle] = useState<string>(profile.featured_title ?? NO_TITLE);

  // One record rather than five hooks: the five controls differ only by which
  // key they carry, and the action reads them back the same way.
  //
  // Started from what is stored, not from the default. `member_update_profile`
  // replaces the whole map, so a control that opened at '프로필 설정 따름'
  // would publish a field the member had hidden the moment they saved a change
  // to their display name -- a privacy control failing open, and silently.
  // 093's `member_profile_settings` is the read that makes this possible.
  const [fields, setFields] = useState<Readonly<Record<string, string>>>(() =>
    Object.fromEntries(
      VISIBILITY_FIELDS.map(
        (field) => [field.key, settings.field_visibility[field.key] ?? INHERIT] as const,
      ),
    ),
  );

  const chosen = VISIBILITY_CHOICES.find((choice) => choice.value === visibility);
  const titles = titleChoices(profile.featured_title);

  return (
    <form action={action} className="grid gap-6">
      {/* Radix Select is not a native control, so each chosen value travels in
          a hidden field the way a <select name> would. */}
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="featuredTitle" value={featuredTitle} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="profile-display-name">프로필에 보일 이름</FieldLabel>
          {/* The read coalesces the stored name with the sign-in identity's,
              so a member who has never set one finds their OAuth name here.
              Pre-filling it freezes that fallback on the first save, and
              clearing the box is how they get it back -- which the
              description below says. Starting blank instead would silently
              erase the name of every member who did set one. */}
          <Input
            id="profile-display-name"
            name="displayName"
            defaultValue={profile.display_name ?? ''}
            maxLength={DISPLAY_NAME_MAX}
            autoComplete="off"
            placeholder="월덕이"
            className="min-h-11"
          />
          <FieldDescription>
            비워 두면 로그인 계정의 이름을 그대로 사용해요. {DISPLAY_NAME_MAX}자까지 쓸 수 있어요.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="profile-image-url">프로필 이미지 주소</FieldLabel>
          {/* `type="text"`, not `type="url"`: a path on this site is a value
              the API accepts and a URL input refuses, so the browser would
              block a submission the server was happy with. */}
          <Input
            id="profile-image-url"
            name="imageUrl"
            type="text"
            inputMode="url"
            maxLength={IMAGE_URL_MAX}
            defaultValue={profile.image_url ?? ''}
            autoComplete="off"
            placeholder="https://"
            className="min-h-11"
          />
          <FieldDescription>
            https로 시작하는 주소나 이 사이트의 경로를 넣을 수 있어요. 아래에서 파일을 직접 올리면
            이 칸은 올린 사진의 주소로 바뀝니다.
          </FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="profile-visibility">프로필 공개 범위</FieldLabel>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger id="profile-visibility" className="min-h-11 w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_CHOICES.map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{chosen?.description}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="profile-featured-title">대표 칭호</FieldLabel>
        <Select value={featuredTitle} onValueChange={setFeaturedTitle}>
          <SelectTrigger id="profile-featured-title" className="min-h-11 w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {titles.map((title) => (
              <SelectItem key={title.value} value={title.value}>
                {title.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          받은 적이 있는 칭호만 걸 수 있어요. 받지 않은 칭호를 고르면 저장되지 않고 그대로
          남아 있어요.
        </FieldDescription>
      </Field>

      <FieldSet className="gap-4">
        <FieldLegend>항목별 공개 범위</FieldLegend>
        <FieldDescription className="max-w-prose">
          항목마다 따로 정하지 않으면 위에서 고른 프로필 공개 범위를 따라요. 지금은 저장해 둔
          항목별 설정을 다시 불러올 수 없어서 이 화면은 언제나 &lsquo;프로필 설정 따름&rsquo;에서
          시작해요. 저장하면 여기 있는 값으로 전체가 새로 저장되니, 예전에 정해 둔 항목이 있다면
          다시 골라 주세요.
        </FieldDescription>

        <div className="grid gap-4">
          {VISIBILITY_FIELDS.map((field) => {
            const setting = fields[field.key] ?? INHERIT;
            return (
              <div
                key={field.key}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Label htmlFor={`profile-field-${field.key}`} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
                <input type="hidden" name={fieldInputName(field.key)} value={setting} />
                <Select
                  value={setting}
                  onValueChange={(value) =>
                    setFields((previous) => ({ ...previous, [field.key]: value }))
                  }
                >
                  <SelectTrigger
                    id={`profile-field-${field.key}`}
                    className="min-h-11 w-full sm:w-52"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_CHOICES.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </FieldSet>

      <SubmitButton className="w-fit">프로필 저장</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

/**
 * Choosing a picture, as its own form.
 *
 * Separate from the settings form on purpose. That one replaces every column
 * from what it holds, so a file input inside it would make picking a photo
 * and renaming yourself one submission that could half-fail; this writes one
 * column and leaves the rest alone. It also means a member can change their
 * picture without re-confirming every visibility control.
 */
export function ProfileImageForm({ imagePath }: { readonly imagePath: string | null }) {
  const [upload, uploadAction] = useActionState(uploadProfileImage, IDLE);
  const [removal, removeAction] = useActionState(removeProfileImage, IDLE);
  const uploaded = imagePath !== null && imagePath.startsWith('/media/profile/');

  return (
    <div className="grid gap-4">
      <form action={uploadAction} className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="profile-image-file">사진 올리기</FieldLabel>
          <Input
            id="profile-image-file"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="min-h-11"
          />
          <FieldDescription>
            PNG · JPEG · WebP, 4MB까지. 올리면 이전 사진은 서버에서 지워집니다. 공개 범위는 아래
            &lsquo;프로필 이미지&rsquo; 설정을 따르므로, 비공개로 두면 주소를 알아도 열리지 않아요.
          </FieldDescription>
        </Field>
        <SubmitButton className="w-fit">사진 올리기</SubmitButton>
        <ActionAlert state={upload} />
      </form>

      {uploaded && (
        <form action={removeAction} className="grid gap-3">
          <SubmitButton variant="outline" className="w-fit">
            올린 사진 내리기
          </SubmitButton>
          <ActionAlert state={removal} />
        </form>
      )}
    </div>
  );
}
