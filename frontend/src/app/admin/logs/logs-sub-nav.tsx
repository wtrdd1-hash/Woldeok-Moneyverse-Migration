import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface LogsSubNavProps {
  readonly current: 'audit' | 'activity' | 'delivery' | 'integrity';
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
    </div>
  );
}
