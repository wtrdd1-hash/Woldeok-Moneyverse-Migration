import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { completeEmailVerification } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '이메일 인증',
  robots: { index: false, follow: false },
};

const STATUS_COPY: Readonly<Record<string, string>> = {
  invalid: '인증 링크 형식이 올바르지 않아요. 회원가입을 다시 진행해 주세요.',
  failed: '인증 링크가 만료되었거나 이미 사용되었습니다. 회원가입을 다시 진행해 새 인증 링크를 받아 주세요.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly token?: string; readonly status?: string }>;
}) {
  const { token = '', status } = await searchParams;
  const message = status ? STATUS_COPY[status] : undefined;
  const usableToken = token.length >= 32 && token.length <= 512;

  return (
    <div data-page="verify-email" className="mv-page mv-page--utility grid gap-6">
      <PageHeader title="이메일 인증">
        회원가입을 완료하려면 이메일로 받은 인증 링크를 열어 주세요.
      </PageHeader>

      {message && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>가입 이메일 확인</CardTitle>
          <CardDescription>
            인증 링크는 30분 동안 유효하며 한 번만 사용할 수 있습니다. 가입을 시작한 앱의 쿠키나 CSRF 토큰 없이도 다른 브라우저에서 인증할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {usableToken ? (
            <form action={completeEmailVerification}>
              <input type="hidden" name="token" value={token} />
              <Button type="submit">이메일 인증하고 가입 완료</Button>
            </form>
          ) : (
            <Alert>
              <AlertDescription>인증 토큰이 없습니다. 이메일의 인증 링크를 다시 열어 주세요.</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            인증이 끝나면 앱으로 돌아가 로그인 상태를 다시 확인해 주세요.{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              로그인 화면으로 돌아가기
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
