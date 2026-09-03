import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ScrollToTop } from '@/components/scroll-to-top';
import { currentViewer } from '@/lib/viewer';
import { LoginProvidersView } from '../login-providers-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '로그인 선택 · 월덕 머니버스',
  description: 'Discord 또는 Google 계정으로 월덕 머니버스에 로그인',
  robots: { index: false, follow: false },
};

export default async function LoginProvidersPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string }>;
}) {
  const [{ error }, viewer] = await Promise.all([searchParams, currentViewer()]);
  if (viewer.signedIn) redirect(viewer.consentCurrent ? '/' : '/login');

  return (
    <ScrollToTop>
      <LoginProvidersView {...(error ? { error } : {})} />
    </ScrollToTop>
  );
}
