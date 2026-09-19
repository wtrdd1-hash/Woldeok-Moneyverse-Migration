import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from './actions';

export const metadata: Metadata = { title: '비밀번호 재설정', robots: { index: false, follow: false } };
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{sent?: string; error?: string}> }) {
  const params = await searchParams;
  return <div className="grid gap-6"><PageHeader title="비밀번호 재설정">가입한 이메일로 30분 동안 한 번 사용할 수 있는 재설정 링크를 보내드려요.</PageHeader>
    {params.sent === '1' && <Alert><AlertDescription>해당 이메일로 가입한 계정이 있다면 재설정 링크를 보냈습니다. 받은편지함을 확인해 주세요.</AlertDescription></Alert>}
    <Card><CardContent><form action={requestPasswordReset} className="grid max-w-md gap-4">
      <div className="grid gap-2"><Label htmlFor="reset-email">이메일</Label><Input id="reset-email" name="email" type="email" autoComplete="email" maxLength={254} required className="min-h-11" /></div>
      <Button type="submit" className="min-h-11 w-full sm:w-fit">재설정 링크 받기</Button>
    </form></CardContent></Card><Link href="/login" className="text-sm text-primary">로그인으로 돌아가기</Link></div>;
}
