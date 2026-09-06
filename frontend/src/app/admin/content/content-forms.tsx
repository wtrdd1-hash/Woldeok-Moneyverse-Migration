'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActionState, useState } from 'react';
import { TranslatedText as T } from '@/components/translated-text';
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
import {
  changePublication,
  saveAnnouncement,
  savePhoto,
  approvePhotoAction,
  rejectPhotoAction,
  togglePhotoPublicationAction,
  deleteAnnouncementAction,
  toggleAnnouncementPublicationAction,
  updateAnnouncementAction,
  toggleAnnouncementPinAction,
} from './actions';
import { Badge } from '@/components/ui/badge';
import { formatMoment } from '@/lib/money';
import { Check, Trash2, Pin, Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

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
          onChange={handleFileChange}
        />
        {previewUrl && (
          <div className="mt-2.5 overflow-hidden rounded-xl border border-primary/40 bg-surface/50 p-1 w-fit">
            <img
              src={previewUrl}
              alt="선택한 이미지 미리보기"
              className="max-h-48 rounded-lg object-contain"
            />
          </div>
        )}
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

export interface PendingPhotoItem {
  readonly photo_id: string;
  readonly storage_key: string;
  readonly image_url: string;
  readonly alt_text: string;
  readonly uploaded_by: string;
  readonly uploader_display_name: string;
  readonly submitted_at: string;
}

export interface AdminPhotoItem extends PendingPhotoItem {
  readonly content_state: 'draft' | 'published';
  readonly published_at: string | null;
}

export function PhotoManagementGrid({ items }: { readonly items: readonly AdminPhotoItem[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        등록된 사진이 없습니다.
      </div>
    );
  }

  async function toggle(item: AdminPhotoItem) {
    setLoadingId(item.photo_id);
    const result = await togglePhotoPublicationAction(
      item.photo_id,
      item.content_state !== 'published',
    );
    setFeedback(result.message ?? null);
    setLoadingId(null);
  }

  async function remove(item: AdminPhotoItem) {
    if (!confirm(`사진 "${item.alt_text}"을(를) 영구 삭제하시겠습니까?`)) return;
    setLoadingId(item.photo_id);
    const result = await rejectPhotoAction(item.photo_id);
    setFeedback(result.message ?? null);
    setLoadingId(null);
  }

  return (
    <div className="grid gap-4">
      {feedback && <p className="rounded-md border bg-muted/40 p-3 text-sm">{feedback}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.photo_id} className="overflow-hidden">
            <div className="aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src={item.image_url}
                alt={item.alt_text}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <CardContent className="grid gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">
                  {item.content_state === 'published' ? '공개' : '비공개'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatMoment(item.published_at ?? item.submitted_at)}
                </span>
              </div>
              <p className="text-sm font-semibold">{item.alt_text}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={loadingId === item.photo_id}
                  onClick={() => toggle(item)}
                >
                  {item.content_state === 'published' ? '비공개' : '공개'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  disabled={loadingId === item.photo_id}
                  onClick={() => remove(item)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PhotoReviewQueue({ items }: { readonly items: readonly PendingPhotoItem[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; error?: boolean } | null>(
    null,
  );

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        <T
          korean="현재 검토 대기 중인 회원의 제출 사진이 없습니다. 모든 사진이 검토 완료되었습니다."
          english="No pending photo submissions to review. All submissions have been processed."
        />
      </div>
    );
  }

  const handleApprove = async (photoId: string) => {
    setLoadingId(photoId);
    setMessage(null);
    try {
      const res = await approvePhotoAction(photoId);
      if (res.status === 'error') {
        setMessage({ id: photoId, text: res.message || '승인하지 못했습니다.', error: true });
      } else {
        setMessage({ id: photoId, text: '성공적으로 승인 및 공개되었습니다!' });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (photoId: string) => {
    if (!confirm('정말 이 사진을 반려하고 삭제하시겠습니까?')) return;
    setLoadingId(photoId);
    setMessage(null);
    try {
      const res = await rejectPhotoAction(photoId);
      if (res.status === 'error') {
        setMessage({ id: photoId, text: res.message || '반려하지 못했습니다.', error: true });
      } else {
        setMessage({ id: photoId, text: '사진이 정상적으로 반려되었습니다.' });
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.photo_id} className="overflow-hidden border bg-card/60 backdrop-blur-sm">
          <div className="relative aspect-video w-full overflow-hidden bg-black/50 flex items-center justify-center">
            <img
              src={item.image_url}
              alt={item.alt_text}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <CardContent className="grid gap-2.5 p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-primary/10 text-primary border-primary/30"
              >
                <T korean="검토 대기중" english="Pending Review" />
              </Badge>
              <span className="text-[0.75rem] text-muted-foreground">
                {formatMoment(item.submitted_at)}
              </span>
            </div>

            <div className="grid gap-1">
              <p className="font-semibold text-sm line-clamp-2" title={item.alt_text}>
                {item.alt_text}
              </p>
              <p className="text-xs text-muted-foreground">
                <T korean="제출자:" english="Uploader:" />{' '}
                <span className="text-foreground font-medium">{item.uploader_display_name}</span>{' '}
                <code className="text-[0.65rem] font-mono">
                  ({item.uploaded_by.slice(0, 8)}...)
                </code>
              </p>
            </div>

            {message?.id === item.photo_id && (
              <p
                className={`text-xs ${message.error ? 'text-destructive' : 'text-emerald-500 font-medium'}`}
              >
                {message.text}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2 pt-2 border-t">
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                disabled={loadingId === item.photo_id}
                onClick={() => handleApprove(item.photo_id)}
              >
                <Check className="mr-1.5 h-4 w-4" />
                <T korean="승인 (공개)" english="Approve (Publish)" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                disabled={loadingId === item.photo_id}
                onClick={() => handleReject(item.photo_id)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                <T korean="반려" english="Reject" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface AdminAnnouncementItem {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly contentState: 'draft' | 'published';
  readonly isPinned: boolean;
  readonly publishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function AnnouncementManagementTable({
  items,
}: {
  readonly items: readonly AdminAnnouncementItem[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    id?: string;
    message: string;
    isError?: boolean;
  } | null>(null);

  const [editingItem, setEditingItem] = useState<AdminAnnouncementItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editPinned, setEditPinned] = useState(false);
  const [editState, setEditState] = useState<'draft' | 'published'>('published');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = (item: AdminAnnouncementItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditPinned(item.isPinned);
    setEditState(item.contentState);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const res = await updateAnnouncementAction({
        announcementId: editingItem.announcementId,
        title: editTitle,
        body: editBody,
        isPinned: editPinned,
        contentState: editState,
      });
      if (res.status === 'error') {
        setEditError(res.message || '공지사항을 수정하지 못했습니다.');
      } else {
        setFeedback({ message: '공지사항이 성공적으로 수정되었습니다.' });
        setEditingItem(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (item: AdminAnnouncementItem) => {
    setLoadingId(item.announcementId);
    setFeedback(null);
    try {
      const res = await toggleAnnouncementPinAction(
        item.announcementId,
        item.isPinned,
        item.title,
        item.body,
      );
      if (res.status === 'error') {
        setFeedback({
          id: item.announcementId,
          message: res.message || '고정 상태를 변경하지 못했습니다.',
          isError: true,
        });
      } else {
        setFeedback({
          id: item.announcementId,
          message: !item.isPinned
            ? '📌 공지사항을 상단에 고정했습니다.'
            : '상단 고정을 해제했습니다.',
        });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`공지 "${title}"을(를) 정말 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`))
      return;
    setLoadingId(id);
    setFeedback(null);
    try {
      const res = await deleteAnnouncementAction(id);
      if (res.status === 'error') {
        setFeedback({ id, message: res.message || '공지를 삭제하지 못했습니다.', isError: true });
      } else {
        setFeedback({ id, message: '공지사항이 성공적으로 삭제되었습니다.' });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (id: string, currentPublished: boolean) => {
    setLoadingId(id);
    setFeedback(null);
    try {
      const res = await toggleAnnouncementPublicationAction(id, !currentPublished);
      if (res.status === 'error') {
        setFeedback({ id, message: res.message || '상태를 변경하지 못했습니다.', isError: true });
      } else {
        setFeedback({
          id,
          message: !currentPublished ? '공지로 공개되었습니다.' : '비공개(초안)로 전환되었습니다.',
        });
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        등록된 공지사항이 없습니다. 새 운영 공지를 작성해 보세요.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {feedback && (
        <div
          className={`rounded-md p-3 text-sm font-medium ${
            feedback.isError
              ? 'bg-destructive/15 text-destructive border border-destructive/30'
              : 'bg-primary/10 text-primary border border-primary/30'
          }`}
        >
          {feedback.message}
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs text-muted-foreground">
            <tr>
              <th className="p-3">상태</th>
              <th className="p-3">제목 및 본문 요약</th>
              <th className="p-3">작성일시 / 공개일시</th>
              <th className="p-3 text-right">관리 작업</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => {
              const isPublished = item.contentState === 'published';
              const isLoading = loadingId === item.announcementId;
              return (
                <tr
                  key={item.announcementId}
                  className={`hover:bg-muted/20 transition-colors ${item.isPinned ? 'bg-amber-500/5' : ''}`}
                >
                  <td className="p-3 align-top whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        }`}
                      >
                        {isPublished ? '● 공개중' : '○ 초안(비공개)'}
                      </span>
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Pin className="size-3 fill-amber-500 text-amber-600 dark:text-amber-400" />
                          상단 고정
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      {item.isPinned && <span className="text-amber-500 font-bold">📌</span>}
                      <span>{item.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-xl">
                      {item.body}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-1">
                      ID: {item.announcementId}
                    </div>
                  </td>
                  <td className="p-3 align-top text-xs text-muted-foreground whitespace-nowrap">
                    <div>작성: {new Date(item.createdAt).toLocaleString('ko-KR')}</div>
                    {item.publishedAt && (
                      <div className="text-primary/80">
                        공개: {new Date(item.publishedAt).toLocaleString('ko-KR')}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleTogglePin(item)}
                        className={`h-8 text-xs gap-1 ${
                          item.isPinned ? 'border-amber-500/50 text-amber-600 bg-amber-500/10' : ''
                        }`}
                        title={item.isPinned ? '상단 고정 해제' : '상단 고정 핀'}
                      >
                        <Pin
                          className={`size-3.5 ${item.isPinned ? 'fill-amber-500 text-amber-600' : 'text-muted-foreground'}`}
                        />
                        {item.isPinned ? '고정 해제' : '상단 고정'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => openEdit(item)}
                        className="h-8 text-xs gap-1"
                      >
                        <Edit3 className="size-3.5" />
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant={isPublished ? 'outline' : 'default'}
                        disabled={isLoading}
                        onClick={() => handleToggle(item.announcementId, isPublished)}
                        className="h-8 text-xs"
                      >
                        {isPublished ? '비공개로' : '바로 공개'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => handleDelete(item.announcementId, item.title)}
                        className="h-8 text-xs"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 공지사항 수정 모달 다이얼로그 */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="size-5 text-amber-500" />
              공지사항 내용 수정
            </DialogTitle>
            <DialogDescription>
              공지사항 제목, 본문 내용, 상단 고정 여부 및 공개 상태를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="grid gap-4 py-2">
            {editError && (
              <div className="rounded-md p-3 text-xs bg-destructive/15 text-destructive border border-destructive/30">
                {editError}
              </div>
            )}
            <div className="grid gap-1.5">
              <label htmlFor="edit-announcement-title" className="text-sm font-semibold">
                공지 제목
              </label>
              <Input
                id="edit-announcement-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={160}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-announcement-body" className="text-sm font-semibold">
                공지 내용 (줄글)
              </label>
              <Textarea
                id="edit-announcement-body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={7}
                maxLength={12000}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <Pin className="size-4 text-amber-500" />
                    상단 고정 (Pin)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    목록 최상단에 📌 뱃지와 함께 고정 노출
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editPinned}
                  onChange={(e) => setEditPinned(e.target.checked)}
                  className="size-5 accent-amber-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <div className="text-sm font-semibold">발행 상태</div>
                  <div className="text-xs text-muted-foreground">
                    {editState === 'published' ? '사용자 화면에 공개' : '초안(비공개)'}
                  </div>
                </div>
                <Select
                  value={editState}
                  onValueChange={(val) => setEditState(val as 'draft' | 'published')}
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">공개</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? '저장 중...' : '수정 완료'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
