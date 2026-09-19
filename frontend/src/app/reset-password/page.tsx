import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { completePasswordReset } from './actions';
export const metadata: Metadata = { title: '새 비밀번호 설정', robots: { index: false, follow: false } };
const errors: Record<string,string> = { invalid:'재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 요청해 주세요.', policy:'사용하기 어려운 비밀번호입니다. 다른 비밀번호를 선택해 주세요.', fields:'새 비밀번호를 입력해 주세요.' };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{token?: string; error?: string}> }) {
 const p=await searchParams; const token=p.token??'';
 return <div className="grid gap-6"><PageHeader title="새 비밀번호 설정">재설정이 완료되면 기존 로그인 세션은 모두 종료됩니다.</PageHeader>
 {p.error && errors[p.error] && <Alert variant="destructive"><AlertDescription>{errors[p.error]}</AlertDescription></Alert>}
 {token ? <Card><CardContent><form action={completePasswordReset} className="grid max-w-md gap-4"><input type="hidden" name="token" value={token}/><div className="grid gap-2"><Label htmlFor="new-password">새 비밀번호</Label><Input id="new-password" name="password" type="password" autoComplete="new-password" maxLength={128} required className="min-h-11" /></div><Button type="submit" className="min-h-11 w-full sm:w-fit">비밀번호 변경</Button></form></CardContent></Card> : <Alert variant="destructive"><AlertDescription>재설정 토큰이 없습니다. 새 링크를 요청해 주세요.</AlertDescription></Alert>}
 <Link href="/forgot-password" className="text-sm text-primary">새 재설정 링크 요청</Link></div>;
}
