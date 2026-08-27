import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdministrator } from '@/lib/session';
import { OperationBoard } from './minecraft-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '마인크래프트 제어',
  robots: { index: false, follow: false },
};

interface MyOperation {
  readonly operationId: string;
  readonly approvalRequestId: string;
  readonly operation: string;
  readonly state: string;
  readonly requestedAt: string;
  readonly approvedAt: string | null;
  readonly finishedAt: string | null;
  readonly resultSummary: {
    readonly accepted?: boolean;
    readonly serviceState?: string;
    readonly lineCount?: number;
    readonly truncated?: boolean;
    readonly responseDigest?: string;
  } | null;
}

export default async function MinecraftAdminPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly operationId?: string }>;
}) {
  await requireAdministrator();
  const { operationId } = await searchParams;

  // A plain GET with the id in the URL, so a receipt is linkable and survives
  // a reload — the original held it in a form field that a refresh emptied.
  const operation =
    operationId && operationId !== ''
      ? await apiOrNull<MyOperation>(
          `/api/v1/admin/minecraft/operations/${encodeURIComponent(operationId)}`,
        )
      : null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="HOST CONTROL BOUNDARY" title="서버를 건드리기 전에, 기록부터 남겨요.">
        시작·종료·재시작·상태·로그 조회는 모두 고정된 작업으로만 요청됩니다. 이 페이지는
        호스트에 직접 연결하지 않으며, 다른 승인자의 검토와 별도 실행 에이전트가 갖춰질 때까지
        실제 서버 명령을 보내지 않습니다.
      </PageHeader>

      <section aria-labelledby="operation-title" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              FIXED OPERATION REQUEST
            </p>
            <h2 id="operation-title" className="text-lg font-medium">
              요청할 작업 선택
            </h2>
          </div>
          <Badge variant="outline">server_operator 전용</Badge>
        </div>
        <OperationBoard />
      </section>

      <Card>
        <CardHeader>
          <CardDescription>MY OPERATION RECEIPT</CardDescription>
          <CardTitle className="text-base">내 요청 상태 확인</CardTitle>
          <CardDescription>
            요청 결과의 ID는 본인 요청을 다시 확인하는 데만 사용됩니다. 다른 운영자의 요청은 이
            화면에서 조회할 수 없어요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form method="get" className="flex flex-wrap items-end gap-2">
            <Field className="w-full sm:w-96">
              <FieldLabel htmlFor="operation-id">작업 ID</FieldLabel>
              <Input
                id="operation-id"
                name="operationId"
                autoComplete="off"
                defaultValue={operationId ?? ''}
                placeholder="요청 결과에 표시된 UUID"
              />
            </Field>
            <Button type="submit" variant="outline" className="min-h-11">
              내 요청 조회
            </Button>
          </form>

          {operationId && operation === null && (
            <p className="text-sm text-muted-foreground">
              해당 ID의 내 요청을 찾을 수 없어요.
            </p>
          )}

          {operation && (
            <dl className="grid gap-2">
              <Detail term="작업" value={operation.operation} />
              <Detail term="상태" value={operation.state} />
              <Detail term="요청" value={formatMoment(operation.requestedAt)} />
              <Detail term="승인" value={formatMoment(operation.approvedAt, '아직 승인되지 않음')} />
              <Detail term="완료" value={formatMoment(operation.finishedAt, '아직 완료되지 않음')} />
              {operation.resultSummary && (
                <>
                  {operation.resultSummary.serviceState && (
                    <Detail term="서비스 상태" value={operation.resultSummary.serviceState} />
                  )}
                  {operation.resultSummary.accepted !== undefined && (
                    <Detail
                      term="수락 여부"
                      value={operation.resultSummary.accepted ? '수락됨' : '거절됨'}
                    />
                  )}
                  {operation.resultSummary.lineCount !== undefined && (
                    <Detail
                      term="로그 줄 수"
                      value={`${operation.resultSummary.lineCount}${operation.resultSummary.truncated ? ' (잘림)' : ''}`}
                    />
                  )}
                  {operation.resultSummary.responseDigest && (
                    <Detail
                      term="응답 다이제스트"
                      value={`${operation.resultSummary.responseDigest.slice(0, 16)}…`}
                      mono
                    />
                  )}
                </>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>NO DIRECT HOST ACCESS</AlertTitle>
        <AlertDescription>
          현재 웹 앱은 승인을 기록하고 본인 요청 상태만 보여 줍니다. 호스트 에이전트의
          lease·실행·완료 권한은 웹 서버와 분리되어 있고, 이 페이지는 URL·명령어·서버 경로·원본
          로그를 받지 않습니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function Detail({
  term,
  value,
  mono = false,
}: {
  readonly term: string;
  readonly value: string;
  readonly mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className={mono ? 'font-mono text-xs' : 'text-sm'}>{value}</dd>
    </div>
  );
}
