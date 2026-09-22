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
          <DialogTitle className="flex items-center gap-2">
            <span>긴급 콘텐츠 삭제 조치 심사</span>
            <Badge variant="outline" className="font-mono text-xs">
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
              <option value="ACTIONED_REMOVED">긴급 삭제 승인 (ACTIONED_REMOVED - 콘텐츠 완전 소거)</option>
              <option value="ACTIONED_RESTRICTED">접근 제한 조치 (ACTIONED_RESTRICTED - 비공개/블라인드)</option>
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
              placeholder="예: 아동/청소년 보호 및 TAKE IT DOWN 기준에 부합하여 대상 게시물을 즉시 격리 삭제 조치함."
              defaultValue={item.admin_notes ?? ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <SubmitButton variant={selectedStatus === 'ACTIONED_REMOVED' ? 'destructive' : 'default'}>
              조치 확정 및 원장 기록
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
