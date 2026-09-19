import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { PrivacyRequestForm } from '../account-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '개인정보 센터',
  robots: { index: false, follow: false },
};

interface PrivacyRequest {
  readonly requestId: string;
  readonly requestType: string;
  readonly detail: string | null;
  readonly status: string;
  readonly createdAt: string;
}

const REQUEST_TYPE_NAME: Readonly<Record<string, string>> = {
  access: '개인정보 열람 요청',
  correction: '개인정보 정정 요청',
  restriction: '개인정보 처리 제한 요청',
  withdrawal: '개인정보 동의 철회 요청',
  deletion: '개인정보 삭제 요청',
};

export default async function AccountPrivacyPage() {
  await requireMember();
  const privacyData = await apiOrNull<{ requests: PrivacyRequest[] }>('/api/v1/privacy/requests');

  return (
    <div data-page="account-privacy" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="PRIVACY CENTER" title="개인정보 센터">
        내 정보에 관한 요청을 기록하고 접수 현황을 한곳에서 확인할 수 있습니다.
      </PageHeader>

      <section className="grid gap-3" aria-labelledby="privacy-request-title">
        <SectionHeader id="privacy-request-title" eyebrow="DATA SUBJECT REQUESTS" title="내 정보에 관한 요청" />
        <p className="max-w-prose text-sm text-muted-foreground">
          열람·정정·처리 제한·동의 철회·삭제 요청을 기록할 수 있습니다. 요청 기록은 즉시 처리 완료를 뜻하지 않습니다.{' '}
          <Link href="/privacy#privacy-rights" className="text-primary">이용자 권리와 처리 기준 보기 →</Link>
        </p>

        {privacyData === null ? (
          <EmptyState title="개인정보 요청 기록을 불러올 수 없어요." description="잠시 후 다시 시도해 주세요." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">새 요청 기록</CardTitle></CardHeader>
              <CardContent><PrivacyRequestForm /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">내 요청 기록</CardTitle></CardHeader>
              <CardContent>
                {privacyData.requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">아직 기록한 개인정보 요청이 없어요.</p>
                ) : (
                  <ul className="grid gap-3">
                    {privacyData.requests.map((request) => (
                      <li key={request.requestId} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium">{REQUEST_TYPE_NAME[request.requestType] ?? request.requestType}</p>
                        <p className="text-xs text-muted-foreground">
                          <time dateTime={request.createdAt}>{formatMoment(request.createdAt)}</time> · {request.status === 'received' ? '접수됨' : request.status}
                        </p>
                        {request.detail ? <p className="mt-1 text-sm">{request.detail}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="min-h-11"><Link href="/privacy#privacy-rights">개인정보처리방침 보기</Link></Button>
        <Button asChild variant="ghost" className="min-h-11"><Link href="/account">내 계정으로 돌아가기</Link></Button>
      </div>
    </div>
  );
}
