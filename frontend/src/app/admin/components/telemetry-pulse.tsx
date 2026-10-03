'use client';

import { Radio, Cpu, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TelemetryPulse() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
          <strong className="font-semibold text-foreground flex items-center gap-1"><Radio className="size-3.5 text-primary" /> 텔레메트리 상태</strong>
          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">UNVERIFIED</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Cpu className="size-3 text-blue-500" /> 지연시간: <b className="text-foreground">—</b></span>
          <span className="flex items-center gap-1"><ShieldAlert className="size-3 text-amber-500" /> 상태: <b className="text-amber-600 dark:text-amber-400">수집기 미연결</b></span>
        </div>
      </div>
    </div>
  );
}
