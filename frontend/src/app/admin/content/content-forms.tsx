'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { changePublication, saveAnnouncement, savePhoto } from './actions';

function PublishNow({ id }: { readonly id: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        name="publishNow"
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
        className="size-5"
      />
      <Label htmlFor={id} className="text-sm font-normal">
        저장 후 바로 공개하기
      </Label>
    </div>
  );
}

export function AnnouncementEditor() {
  const [state, action] = useActionState(saveAnnouncement, IDLE);
  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="announcement-file">공지 이미지 (선택)</FieldLabel>
        <Input
          id="announcement-file"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="min-h-11 py-2"
        />
        <FieldDescription>
          PNG, JPEG, WebP · 최대 8 MiB. 별도 이미지 디스크에 저장됩니다.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="announcement-image-alt">이미지 대체 텍스트</FieldLabel>
        <Input
          id="announcement-image-alt"
          name="imageAltText"
          maxLength={300}
          autoComplete="off"
          placeholder="이미지 내용을 설명해 주세요"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="announcement-title">공지 제목</FieldLabel>
        <Input
          id="announcement-title"
          name="title"
          maxLength={160}
          autoComplete="off"
          placeholder="예: 주말 점검 안내"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="announcement-body">공지 내용</FieldLabel>
        <Textarea
          id="announcement-body"
          name="body"
          rows={8}
          maxLength={12000}
          placeholder="이용자가 알아야 할 내용을 적어 주세요."
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="announcement-id">공지 ID (수정할 때만)</FieldLabel>
        <Input id="announcement-id" name="announcementId" autoComplete="off" placeholder="UUID" />
        <FieldDescription>비워 두면 새 공지로 저장합니다.</FieldDescription>
      </Field>
      <PublishNow id="announcement-publish-now" />
      <SubmitButton className="w-fit">공지 저장 →</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

export function PhotoEditor() {
  const [state, action] = useActionState(savePhoto, IDLE);
  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="photo-file">사진 파일</FieldLabel>
        <Input
          id="photo-file"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="min-h-11 py-2"
        />
        <FieldDescription>
          업로드하면 내부 보관 키가 자동으로 정해집니다. 이미 올린 파일이라면 아래에 키를 직접
          적어도 됩니다.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="photo-storage-key">내부 보관 키</FieldLabel>
        <Input
          id="photo-storage-key"
          name="storageKey"
          maxLength={255}
          autoComplete="off"
          placeholder="파일 업로드 시 자동 입력"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="photo-image-url">승인된 HTTPS 이미지 주소</FieldLabel>
        <Input
          id="photo-image-url"
          name="imageUrl"
          type="url"
          maxLength={2048}
          autoComplete="off"
          placeholder="https://cdn.example.com/gallery/event-01.jpg"
          required
        />
        <FieldDescription>
          허용된 호스트 목록은 데이터베이스가 관리합니다. 이 화면에서는 바꿀 수 없어요.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="photo-alt">대체 텍스트</FieldLabel>
        <Input
          id="photo-alt"
          name="altText"
          maxLength={300}
          autoComplete="off"
          placeholder="사진을 짧고 정확하게 설명해 주세요"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="photo-id">사진 ID (수정할 때만)</FieldLabel>
        <Input id="photo-id" name="photoId" autoComplete="off" placeholder="UUID" />
      </Field>
      <PublishNow id="photo-publish-now" />
      <SubmitButton className="w-fit">사진 등록 →</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

export function PublicationEditor() {
  const [state, action] = useActionState(changePublication, IDLE);
  const [kind, setKind] = useState('announcements');
  const [publish, setPublish] = useState('true');

  return (
    <form action={action} className="grid gap-4">
      {/* Radix Select is not a native control, so both choices travel in
          hidden fields the way a <select name> would. */}
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="publish" value={publish} />
      <Field>
        <FieldLabel htmlFor="publication-kind">항목 종류</FieldLabel>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger id="publication-kind" className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="announcements">공지</SelectItem>
            <SelectItem value="photos">사진</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="publication-item">항목 ID</FieldLabel>
        <Input id="publication-item" name="itemId" autoComplete="off" placeholder="UUID" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="publication-state">공개 상태</FieldLabel>
        <Select value={publish} onValueChange={setPublish}>
          <SelectTrigger id="publication-state" className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">공개</SelectItem>
            <SelectItem value="false">비공개</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <SubmitButton className="w-fit">상태 기록하기 →</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
