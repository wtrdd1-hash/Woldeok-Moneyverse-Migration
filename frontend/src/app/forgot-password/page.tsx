import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { PasswordResetRequestForm } from './request-form';

export const metadata: Metadata = {
  title: '비밀번호 재설정',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div data-page="forgot-password" className="mv-page mv-page--utility grid gap-6">
      <PageHeader title="비밀번호 재설정">
        가입한 이메일로 30분 동안 한 번 사용할 수 있는 재설정 링크를 요청할 수 있습니다.
      </PageHeader>
      <PasswordResetRequestForm />
      <Link href="/login" className="text-sm text-primary">로그인으로 돌아가기</Link>
    </div>
  );
}
