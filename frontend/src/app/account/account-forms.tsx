'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
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
  createPrivacyRequest,
  deleteAccount,
  startLink,
  startReauthentication,
  unlinkIdentity,
} from './actions';

export function LinkButton({ provider, label }: { readonly provider: string; readonly label: string }) {
  const [state, action] = useActionState(startLink, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="provider" value={provider} />
        <SubmitButton>{label}</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function ReauthButton({ provider }: { readonly provider: string }) {
  const [state, action] = useActionState(startReauthentication, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="provider" value={provider} />
        <SubmitButton>본인 확인하기 →</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function UnlinkButton({ identityId }: { readonly identityId: string }) {
  const [state, action] = useActionState(unlinkIdentity, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="identityId" value={identityId} />
        <SubmitButton variant="outline">연결 해제 →</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

const REQUEST_TYPES = [
  { value: 'access', label: '개인정보 열람 요청' },
  { value: 'correction', label: '개인정보 정정 요청' },
  { value: 'restriction', label: '개인정보 처리 제한 요청' },
  { value: 'withdrawal', label: '개인정보 동의 철회 요청' },
  { value: 'deletion', label: '개인정보 삭제 요청' },
] as const;

export function PrivacyRequestForm() {
  const [state, action] = useActionState(createPrivacyRequest, IDLE);
  const [requestType, setRequestType] = useState<string>('access');

  return (
    <form action={action} className="grid gap-4">
      {/* Radix Select is not a native control, so the chosen value travels in
          a hidden field the way a <select name> would. */}
      <input type="hidden" name="requestType" value={requestType} />
      <Field>
        <FieldLabel htmlFor="privacy-request-type">요청 종류</FieldLabel>
        <Select value={requestType} onValueChange={setRequestType}>
          <SelectTrigger id="privacy-request-type" className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="privacy-request-detail">
          간단한 설명{' '}
          {requestType === 'correction' && (
            <span className="text-xs text-muted-foreground">정정 요청 시 필수</span>
          )}
        </FieldLabel>
        <Textarea
          id="privacy-request-detail"
          name="detail"
          rows={4}
          maxLength={2000}
          autoComplete="off"
          placeholder="정정이 필요한 항목처럼 처리에 필요한 최소 설명만 적어 주세요."
        />
        <FieldDescription>
          연락처, 비밀번호, 인증번호, 결제·계정 비밀값은 쓰지 마세요.
        </FieldDescription>
      </Field>

      <SubmitButton className="w-fit">개인정보 요청 기록하기 →</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, IDLE);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={action} className="grid gap-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="account-delete-confirm"
          name="confirm"
          checked={confirmed}
          onCheckedChange={(value) => setConfirmed(value === true)}
          className="mt-1 size-5"
        />
        <Label htmlFor="account-delete-confirm" className="text-sm font-normal">
          위 내용을 읽었고, 서비스 이용 중단을 요청합니다.
        </Label>
      </div>
      <SubmitButton variant="destructive" disabled={!confirmed} className="w-fit">
        계정 삭제 요청 →
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
