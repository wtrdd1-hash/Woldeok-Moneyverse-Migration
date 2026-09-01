import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Lobby } from '@/components/lobby';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Kept outside the advertising allowlist.  It is an interactive, real-time
 * surface, so an advertisement must never share this page with its chat box.
 */
export const metadata: Metadata = {
  title: '커뮤니티 로비',
  description: '월덕 머니버스 실시간 커뮤니티 로비',
  robots: { index: false, follow: false },
};

export default function LobbyPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="커뮤니티 로비">
        지금 접속한 사람들과 짧게 인사하는 공간입니다. 메시지는 서버에 저장하지 않고 접속 중인
        사람에게만 전달돼요.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="grid content-start gap-5">
          <p className="max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
            비밀번호, 인증코드, 실제 금융정보, 주소·연락처 등 개인정보는 메시지에 게시하지 마세요.
          </p>
          <div className="grid gap-2">
            <PolicyLink href="/terms" title="커뮤니티 이용 규칙" detail="서로 존중하는 대화 기준" />
            <PolicyLink href="/privacy" title="개인정보 안내" detail="수집 정보와 이용자 권리" />
          </div>
        </div>

        <Card className="rounded-[18px] shadow-plate">
          <CardContent><Lobby /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function PolicyLink({ href, title, detail }: { readonly href: string; readonly title: string; readonly detail: string }) {
  return (
    <Link href={href} className="flex min-h-11 items-center justify-between gap-3 rounded-[12px] border bg-surface px-4 py-3 text-sm shadow-plate transition-transform hover:-translate-y-0.5">
      <span><b className="font-extrabold">{title}</b><span className="block text-xs text-muted-foreground">{detail}</span></span>
      <ArrowRight className="size-4 text-clay" />
    </Link>
  );
}
