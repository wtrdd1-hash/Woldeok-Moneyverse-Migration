import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiOrNull } from '@/lib/api';
import { submitLocalLogin } from './actions';

const PROVIDERS = {
  discord: {
    name: 'Discord',
    action: 'Discord로 계속하기',
    bgColor: 'hover:bg-[#5865F2]/10 hover:text-[#5865F2] hover:border-[#5865F2]/30',
  },
  google: {
    name: 'Google',
    action: 'Google로 계속하기',
    bgColor: 'hover:bg-foreground/5 hover:border-foreground/20',
  },
} as const;

type ProviderId = keyof typeof PROVIDERS;
const ORDER: readonly ProviderId[] = ['google', 'discord'];

export async function LoginProvidersView({
  error,
  notice,
}: {
  readonly error?: string | undefined;
  readonly notice?: string | undefined;
}) {
  const data = await apiOrNull<{ providers: { id: string; enabled: boolean }[] }>(
    '/api/v1/auth/providers',
  );
  const enabled = new Set((data?.providers ?? []).filter((p) => p.enabled).map((p) => p.id));
  const availableProviders = ORDER.filter((id) => enabled.has(id));

  return (
    <div className="mx-auto w-full max-w-[420px] py-4 sm:py-8">
      {/* Brand & Heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          반가워요!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          월덕 머니버스에서 경제와 자산을 시작해보세요.
        </p>
      </div>

      {notice && (
        <Alert className="mb-5 border-primary/30 bg-primary/5 text-foreground">
          <AlertDescription className="text-xs font-medium leading-relaxed">{notice}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main FinTech Card */}
      <Card className="border-border/80 bg-card/95 shadow-sm backdrop-blur-sm">
        <CardContent className="p-6 sm:p-7">
          {/* Local Email Login Form */}
          <form action={submitLocalLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="local-email" className="text-xs font-semibold text-muted-foreground">
                이메일 주소
              </Label>
              <Input
                id="local-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
                placeholder="name@example.com"
                className="min-h-11"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="local-password" className="text-xs font-semibold text-muted-foreground">
                  비밀번호
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary transition-colors hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="local-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                required
                placeholder="비밀번호 입력"
                className="min-h-11"
              />
            </div>

            <Button
              type="submit"
              className="min-h-11 w-full sm:w-fit"
            >
              자체 계정으로 로그인
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </form>

          {/* Social Sign-in Divider */}
          {availableProviders.length > 0 && (
            <>
              <div className="relative my-6 text-center">
                <Separator className="absolute inset-x-0 top-1/2" />
                <span className="relative bg-card px-3 text-xs font-medium text-muted-foreground">
                  또는 간편 로그인
                </span>
              </div>

              <div className="grid gap-2.5">
                {availableProviders.map((id) => {
                  const copy = PROVIDERS[id];
                  return (
                    <Button
                      key={id}
                      variant="outline"
                      size="lg"
                      asChild
                      className={'w-full justify-center rounded-xl border-border/80 text-sm font-medium transition-colors ' + copy.bgColor}
                    >
                      <a href={'/auth/' + id + '/authorize'}>
                        {copy.action}
                      </a>
                    </Button>
                  );
                })}
              </div>
            </>
          )}

          {/* Registration Notice */}
          <div className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
            아직 월덕 머니버스 회원이 아니신가요?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              계정 만들기
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer Legal Links */}
      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/80">
        로그인 시 월덕 머니버스의{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          이용약관
        </Link>
        과{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          개인정보처리방침
        </Link>
        에 동의하게 됩니다.
      </p>
    </div>
  );
}
