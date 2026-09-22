'use client';

import { useState, useEffect } from 'react';
import { Activity, Radio, Cpu, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TelemetryData {
  readonly m2Circulation: string;
  readonly activeTraders: number;
  readonly systemHealth: string;
  readonly latencyMs: number;
}

export function TelemetryPulse() {
  const [data, setData] = useState<TelemetryData>({
    m2Circulation: '4,892,100,000',
    activeTraders: 857,
    systemHealth: '100% HEALTHY',
    latencyMs: 18,
  });
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 800);

      // 3초 주기 가상 텔레메트리 갱신 및 핑
      setData((prev) => ({
        ...prev,
        latencyMs: Math.floor(15 + Math.random() * 8),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 ${
                pulsing ? 'animate-ping' : ''
              }`}
            />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <strong className="font-semibold text-foreground flex items-center gap-1">
            <Radio className="size-3.5 text-primary" /> 실시간 텔레메트리 펄스 (Live Telemetry)
          </strong>
          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
            3s 갱신
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="size-3 text-primary" /> M2 통화량:{' '}
            <b className="text-foreground">{data.m2Circulation} WLD</b>
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="size-3 text-blue-500" /> 지연시간:{' '}
            <b className="text-foreground">{data.latencyMs}ms</b>
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-500" /> 상태:{' '}
            <b className="text-emerald-600 dark:text-emerald-400">{data.systemHealth}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
