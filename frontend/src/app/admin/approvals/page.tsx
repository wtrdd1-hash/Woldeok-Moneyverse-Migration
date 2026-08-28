import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdministrator } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { ApprovalRequest } from '../types';
import { ApprovalDecision, NewApprovalForm } from '../admin-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/approvals');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminApprovalsPage() {
  await requireAdministrator();
  const approvals = await apiOrNull<{ approvals: ApprovalRequest[] }>('/api/v1/admin/approvals');

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">새 승인 요청</CardTitle>
            <CardDescription>
              두 사람 승인이 필요한 작업은 요청자와 다른 운영자만 결정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewApprovalForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">승인 요청</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {approvals === null ? (
              <EmptyState title="승인 요청을 불러오지 못했어요." />
            ) : approvals.approvals.length === 0 ? (
              <EmptyState title="표시할 승인 요청이 없습니다." />
            ) : (
              approvals.approvals.map((request) => (
                <div
                  key={request.approval_request_id}
                  className="grid gap-2 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-mono text-sm">{request.action}</code>
                    <Badge
                      variant={
                        request.status === 'approved'
                          ? 'secondary'
                          : request.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {request.status}
                    </Badge>
                    {request.requires_two_person_approval && (
                      <Badge variant="outline">2인 승인</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatMoment(request.created_at)}
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-md border bg-muted p-2 font-mono text-[0.7rem]">
                    {JSON.stringify(request.payload, null, 2)}
                  </pre>
                  {request.decision_reason && (
                    <p className="text-xs text-muted-foreground">
                      사유: {request.decision_reason}
                    </p>
                  )}
                  {request.status === 'pending' && (
                    <ApprovalDecision approvalRequestId={request.approval_request_id} />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
    </div>
  );
}
