import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { currentViewer } from '@/lib/viewer';
import { redirect } from 'next/navigation';
import { submitLocalRegister } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '계정 만들기',
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  missing_fields: '모든 항목을 올바르게 입력해 주세요.',
  invalid_display_name: '닉네임은 2자 이상 20자 이하로 입력해 주세요.',
  weak_password: '비밀번호는 8자 이상이어야 합니다.',
  email_conflict: '이미 가입된 이메일 주소입니다. 다른 이메일을 사용하거나 로그인해 주세요.',
  policy_or_password_violation: '비밀번호 규칙을 만족하지 않거나 정책 확인이 필요합니다.',
  bad_request: '입력하신 정보가 올바르지 않습니다. 다시 확인해 주세요.',
  registration_failed: '회원가입을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

export default async function RegisterPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string; readonly success?: string }>;
}) {
  const [{ error, success }, viewer] = await Promise.all([
    searchParams,
    currentViewer(),
  ]);

  if (viewer.signedIn) {
    redirect('/');
  }

  const errorMessage = error && ERROR_MESSAGES[error] ? ERROR_MESSAGES[error] : undefined;

  if (success === '1') {
    return (
      <div className="mx-auto w-full max-w-[440px] py-8 sm:py-12">
        <Card className="border-border/80 bg-card/95 shadow-sm backdrop-blur-sm">
          <CardContent className="p-7 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">인증 링크가 발송되었습니다</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              입력하신 이메일 주소로 계정 활성화 링크를 발송했습니다.<br />
              이메일의 링크를 클릭하여 가입을 완료해 주세요.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button asChild size="lg" className="min-h-12 w-full rounded-xl text-sm font-semibold">
                <Link href="/login">로그인 화면으로 이동</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[440px] py-4 sm:py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          새 계정 만들기
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          월덕 머니버스의 회원이 되어 가상 경제를 체험해보세요.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription className="text-xs font-medium leading-relaxed">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/80 bg-card/95 shadow-sm backdrop-blur-sm">
        <CardContent className="p-6 sm:p-7">
          <form action={submitLocalRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-muted-foreground">
                이메일 주소
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  required
                  placeholder="name@example.com"
                  className="min-h-12 rounded-xl border-border/80 pl-10 text-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reg-display-name" className="text-xs font-semibold text-muted-foreground">
                활동 닉네임 (2~20자)
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="reg-display-name"
                  name="displayName"
                  type="text"
                  autoComplete="nickname"
                  maxLength={20}
                  minLength={2}
                  required
                  placeholder="닉네임 입력"
                  className="min-h-12 rounded-xl border-border/80 pl-10 text-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reg-password" className="text-xs font-semibold text-muted-foreground">
                비밀번호 (8자 이상)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  placeholder="비밀번호 입력"
                  className="min-h-12 rounded-xl border-border/80 pl-10 text-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-3 min-h-12 w-full rounded-xl text-sm font-semibold tracking-wide shadow-sm active:scale-[0.99]"
            >
              가입하고 시작하기
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </form>

          <div className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              로그인하기
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/80">
        가입 진행 시 월덕 머니버스의{' '}
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
