import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface LogsSubNavProps {
  readonly current: 'audit' | 'errors' | 'activity' | 'delivery' | 'integrity' | 'system';
}

export function LogsSubNav({ current }: LogsSubNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
      <Button
        variant={current === 'audit' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'audit' ? 'font-bold shadow-xs' : ''}
        asChild
      >
        <Link href="/admin/logs">📜 전역 감사 로그</Link>
      </Button>
      <Button
        variant={current === 'errors' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'errors' ? 'font-bold shadow-xs border border-red-500/30 text-red-400 bg-red-950/30' : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'}
        asChild
      >
        <Link href="/admin/logs/errors">🚨 오류 & 장애 원장</Link>
      </Button>
      <Button
        variant={current === 'activity' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'activity' ? 'font-bold shadow-xs' : ''}
        asChild
      >
        <Link href="/admin/logs/activity">👥 접속 · 체류 · 클릭 로그</Link>
      </Button>
      <Button
        variant={current === 'delivery' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'delivery' ? 'font-bold shadow-xs' : ''}
        asChild
      >
        <Link href="/admin/logs/delivery">📡 Discord 전달 로그</Link>
      </Button>
      <Button
        variant={current === 'integrity' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'integrity' ? 'font-bold shadow-xs' : ''}
        asChild
      >
        <Link href="/admin/logs/integrity">🛡️ 해시체인 무결성 검증</Link>
      </Button>
      <Button
        variant={current === 'system' ? 'secondary' : 'ghost'}
        size="sm"
        className={current === 'system' ? 'font-bold shadow-xs' : ''}
        asChild
      >
        <Link href="/admin/logs/system">🖥️ 시스템 런타임 로그</Link>
      </Button>
    </div>
  );
}
