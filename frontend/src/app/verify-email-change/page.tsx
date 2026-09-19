import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { completeLoginEmailChange } from './actions';

export const metadata: Metadata = { title: '로그인 이메일 변경 확인', robots: { index: false, follow: false } };

export default async function VerifyEmailChangePage({ searchParams }: { readonly searchParams: Promise<{ token?: string; status?: string }> }) {
  const { token = '', status } = await searchParams;
  const validToken = token.length >= 32 && token.length <= 512;
  return <div data-page="verify-email-change" className="mv-page grid gap-6">
    <PageHeader eyebrow="ACCOUNT SECURITY" title="새 로그인 이메일 확인">확인 링크를 적용하면 로그인 이메일이 바뀌고 보안을 위해 모든 기기에서 로그아웃됩니다.</PageHeader>
    {status ? <Alert variant="destructive"><AlertDescription>{status === 'invalid' ? '확인 링크가 올바르지 않습니다.' : '확인 링크가 만료되었거나 이미 사용되었습니다.'}</AlertDescription></Alert> : null}
    <Card><CardHeader><CardTitle>이메일 변경 완료</CardTitle><CardDescription>본인이 요청한 변경일 때만 계속해 주세요.</CardDescription></CardHeader><CardContent className="grid gap-3">
      {validToken ? <form action={completeLoginEmailChange} className="w-full sm:w-auto"><input type="hidden" name="token" value={token}/><Button type="submit" className="min-h-11 w-full sm:w-auto">새 로그인 이메일 적용</Button></form> : <p className="text-sm text-muted-foreground">사용할 수 있는 확인 토큰이 없습니다.</p>}
      <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium text-primary">로그인으로 돌아가기 →</Link>
    </CardContent></Card>
  </div>;
}
