import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Accent, PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';

const PROVIDERS = {
  discord: {
    name: 'Discord',
    action: 'Discord로 계속',
    description: 'Discord 계정으로 빠르게 시작해요.',
    note: 'Discord의 계정 비밀번호는 월덕 머니버스에 전달되지 않아요.',
  },
  google: {
    name: 'Google',
    action: 'Google로 계속',
    description: 'Google 계정으로 안전하게 시작해요.',
    note: 'Google의 계정 비밀번호는 월덕 머니버스에 전달되지 않아요.',
  },
} as const;

type ProviderId = keyof typeof PROVIDERS;
const ORDER: readonly ProviderId[] = ['discord', 'google'];

export async function LoginProvidersView({ error }: { readonly error?: string | undefined }) {
  const data = await apiOrNull<{ providers: { id: string; enabled: boolean }[] }>(
    '/api/v1/auth/providers',
  );
  const enabled = new Set((data?.providers ?? []).filter((p) => p.enabled).map((p) => p.id));
  const anyEnabled = ORDER.some((id) => enabled.has(id));

  return (
    <div className="grid gap-6">
      <PageHeader
        title={
          <>
            어떤 계정으로
            <br />
            <Accent>시작할까요?</Accent>
          </>
        }
      >
        Discord 또는 Google 계정으로 로그인할 수 있어요. 선택한 제공자의 고유 식별자와 표시명만
        서비스 계정 연결에 사용합니다.
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <nav aria-label="로그인 제공자 선택" className="grid gap-3">
        {ORDER.map((id) => {
          const copy = PROVIDERS[id];
          const available = enabled.has(id);
          return (
            <Card key={id} className="gap-3">
              <CardHeader>
                <CardTitle className="text-base">{copy.action}</CardTitle>
                <CardDescription>
                  {available ? copy.description : '운영자가 연결 준비 중이에요.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {available ? (
                  <Button asChild className="min-h-11 w-full sm:w-fit">
                    <a href={`/auth/${id}/authorize`}>
                      {copy.action}
                      <ArrowRight />
                    </a>
                  </Button>
                ) : (
                  <Badge variant="outline" className="w-fit">
                    준비 중
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  {available
                    ? copy.note
                    : `${copy.name} 로그인은 아직 테스트 서버에 연결되지 않았어요.`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </nav>

      {!anyEnabled && (
        <Alert>
          <AlertDescription>
            <b>로그인 연결을 준비하고 있어요.</b> 제공자 설정이 완료되면 이 화면의 버튼이 바로
            활성화됩니다.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground">
        계속하면 각 제공자의 로그인 화면으로 이동합니다.{' '}
        <Link href="/privacy" className="text-primary">
          개인정보 처리 안내
        </Link>
      </p>
    </div>
  );
}
