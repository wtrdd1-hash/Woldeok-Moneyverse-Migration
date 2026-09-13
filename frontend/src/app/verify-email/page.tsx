import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { completeEmailVerification } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '이메일 인증 · 월덕 머니버스',
  robots: { index: false, follow: false },
};

const STATUS_COPY: Readonly<Record<string, string>> = {
  invalid: '인증 링크 형식이 올바르지 않아요. 회원가입을 다시 진행해 주세요.',
  failed: '인증 링크가 만료되었거나 현재 가입 세션과 일치하지 않아요. 회원가입을 다시 진행해 주세요.',
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
    <div className="grid gap-6">
      <PageHeader title="이메일 인증">
        회원가입을 완료하려면 가입할 때 사용한 브라우저에서 이메일 주소를 확인해 주세요.
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
            인증 링크는 30분 동안 유효하며 회원가입을 시작한 로그인 전 세션에 연결되어 있습니다.
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
            다른 기기나 브라우저에서 링크를 열었다면 보안을 위해 인증이 거부될 수 있습니다.{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              로그인 화면으로 돌아가기
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
