import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Accent, PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiOrNull } from '@/lib/api';
import { submitLocalLogin } from './actions';

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
        월덕 머니버스 자체 계정 또는 Discord·Google 계정으로 로그인할 수 있어요.
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-base">월덕 머니버스 계정으로 로그인</CardTitle>
          <CardDescription>가입한 이메일과 비밀번호로 로그인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitLocalLogin} className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="local-email">이메일</Label>
              <Input
                id="local-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
                className="min-h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="local-password">비밀번호</Label>
              <Input
                id="local-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                required
                className="min-h-11"
              />
            </div>
            <Button type="submit" className="min-h-11 w-full sm:w-fit">
              자체 계정으로 로그인
              <ArrowRight />
            </Button>
            <p className="text-xs text-muted-foreground">
              비밀번호는 로그인 확인에만 사용되며 브라우저 저장소에 보관하지 않습니다.
            </p>
          </form>
        </CardContent>
      </Card>

      <nav aria-label="외부 로그인 제공자 선택" className="grid gap-3">
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
            외부 로그인 제공자는 연결 준비 중이지만 월덕 머니버스 자체 계정 로그인은 계속 사용할 수
            있습니다.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground">
        로그인하면 서비스 이용 정책이 적용됩니다.{' '}
        <Link href="/privacy" className="text-primary">
          개인정보 처리 안내
        </Link>
      </p>
    </div>
  );
}
