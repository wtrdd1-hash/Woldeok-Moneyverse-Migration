'use client';

import { useActionState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from './actions';
import type { PasswordResetRequestState } from './actions';

const IDLE: PasswordResetRequestState = { status: 'idle' };

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, IDLE);

  return (
    <div className="grid gap-4">
      {state.status !== 'idle' && !pending && (
        <div role="status" aria-live="polite" aria-atomic="true">
          <Alert variant={state.status === 'accepted' ? 'default' : 'destructive'}>
            <AlertDescription>
              {state.status === 'accepted'
                ? '재설정 요청을 접수했습니다. 해당 이메일로 가입한 계정이 있다면 링크가 발송될 수 있습니다. 메일 발송 완료 여부는 확인되지 않았습니다.'
                : state.status === 'invalid'
                  ? '올바른 이메일 주소를 입력해 주세요.'
                  : '재설정 요청 접수 여부를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.'}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Card>
        <CardContent>
          <form action={action} className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">이메일</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                className="min-h-11"
              />
            </div>
            <Button type="submit" disabled={pending} aria-disabled={pending} className="min-h-11 w-full sm:w-fit">
              {pending ? '요청 확인 중…' : '재설정 링크 받기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
