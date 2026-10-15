'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IDLE } from '@/lib/action-state';
import { actionTakedown } from './actions';

export interface TakedownItem {
  readonly id: string;
  readonly case_id: string;
  readonly requester_email: string;
  readonly requester_type: string;
  readonly reason_category: string;
  readonly target_content_url: string;
  readonly target_content_type: string;
  readonly description: string;
  readonly status: string;
  readonly admin_notes: string | null;
  readonly actioned_at: string | null;
  readonly created_at: string;
}

export function TakedownActionDialog({ item }: { readonly item: TakedownItem }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(actionTakedown, IDLE);
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIONED_REMOVED');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={item.status === 'SUBMITTED' ? 'default' : 'outline'} className="text-xs">
          조치 처리
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-start gap-2 pr-8 text-left">
            <span>긴급 콘텐츠 삭제 조치 심사</span>
            <Badge variant="outline" className="max-w-full break-all whitespace-normal font-mono text-xs">
              {item.case_id}
            </Badge>
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-left">
            <span className="block font-medium text-foreground">
              신고자: {item.requester_email} ({item.requester_type})
            </span>
            <div className="rounded-lg border bg-muted/30 p-2.5 text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">신고 사유: </span>
                <span className="font-semibold text-destructive">{item.reason_category}</span>
              </div>
              <div className="truncate">
                <span className="text-muted-foreground">대상 URL: </span>
                <a
                  href={item.target_content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {item.target_content_url}
                </a>
              </div>
              <div className="pt-1 border-t text-muted-foreground">
                <span className="block font-medium text-foreground mb-0.5">상세 내용:</span>
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="caseId" value={item.case_id} />
          <ActionAlert state={state} />
          <p role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-foreground">
            이 메뉴는 신고 건의 심사 상태만 기록합니다. 실제 게시물을 자동 삭제하거나 차단하지 않습니다.
            삭제 또는 접근 제한은 별도로 시행하고 결과를 확인한 다음 처리 상태를 기록하세요.
          </p>

          <div className="space-y-2">
            <label htmlFor="newStatus" className="block text-xs font-medium">
              결정할 조치 상태
            </label>
            <select
              id="newStatus"
              name="newStatus"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
            >
              <option value="ACTIONED_REMOVED">삭제 조치 기록 (ACTIONED_REMOVED - 실제 처리 확인 필요)</option>
              <option value="ACTIONED_RESTRICTED">접근 제한 기록 (ACTIONED_RESTRICTED - 실제 처리 확인 필요)</option>
              <option value="TRIAGED">심사 진행 중 (TRIAGED - 추가 증거 확인)</option>
              <option value="REJECTED">반려 (REJECTED - 요건 미충족/허위 신고)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="adminNotes" className="block text-xs font-medium">
              관리자 심사 의견 및 처리 근거
            </label>
            <textarea
              id="adminNotes"
              name="adminNotes"
              rows={3}
              placeholder="예: 대상 게시물 삭제를 별도 시행한 뒤 접근 불가를 확인한 시각과 근거."
              defaultValue={item.admin_notes ?? ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <SubmitButton variant={selectedStatus === 'ACTIONED_REMOVED' ? 'destructive' : 'default'}>
              심사 상태 기록
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
