'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { requestOperation } from './actions';

const OPERATIONS = [
  { id: 'status', glyph: '●', label: '상태 확인', note: '승인 후 신뢰된 실행 결과 요약' },
  { id: 'logs', glyph: '≡', label: '로그 요약', note: '원본 로그는 웹에 저장하지 않음' },
  { id: 'start', glyph: '▶', label: '서버 시작', note: '다른 승인자의 검토 필수' },
  { id: 'restart', glyph: '↻', label: '서버 재시작', note: '다른 승인자의 검토 필수' },
  { id: 'stop', glyph: '■', label: '서버 종료', note: '다른 승인자의 검토 필수', danger: true },
] as const;

/**
 * Five buttons and nothing else.
 *
 * The set is fixed here because it is fixed everywhere below: the DTO admits
 * only these five, the database function releases only these five, and the
 * host agent accepts only these five. A free-text command box would have
 * nowhere to send its contents.
 */
export function OperationBoard() {
  const [state, action] = useActionState(requestOperation, IDLE);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OPERATIONS.map((operation) => (
          <Card key={operation.id} className="gap-3 py-4">
            <CardContent className="grid gap-3">
              <div className="flex items-baseline gap-2">
                <span aria-hidden className="text-lg text-muted-foreground">
                  {operation.glyph}
                </span>
                <CardTitle className="text-base">{operation.label}</CardTitle>
              </div>
              <CardDescription>{operation.note}</CardDescription>
              <form action={action}>
                <input type="hidden" name="operation" value={operation.id} />
                <SubmitButton
                  variant={'danger' in operation && operation.danger ? 'destructive' : 'outline'}
                  className="w-full"
                >
                  요청 기록
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
      <ActionAlert state={state} />
    </div>
  );
}
