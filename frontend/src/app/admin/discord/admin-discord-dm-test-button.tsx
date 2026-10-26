'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  adminUserId: string;
  configured: boolean;
}

const DM_PRESETS = [
  { id: 'default', label: '기본 모의 DM', desc: '테스트 메시지 전송만 검증', icon: '🔔' },
  { id: 'whale', label: '모의 대규모 자금 이동', desc: '실제 이체 감지 아님', icon: '🐋' },
  { id: 'jackpot', label: '모의 카지노 잭팟', desc: '실제 당첨 아님', icon: '🎰' },
  { id: 'treasury', label: '모의 국고 경보', desc: '실제 잔액과 무관', icon: '⚠️' },
  { id: 'killswitch', label: '모의 비상 중단', desc: '실제 서비스 중단 아님', icon: '🛑' },
  { id: 'bank_delinquency', label: '모의 대출 연체', desc: '실제 연체 통계 아님', icon: '📉' },
] as const;

export function AdminDiscordDmTestButton({ adminUserId, configured }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  async function handleSendTest(presetId?: string) {
    if (!configured) return;
    const targetPreset = presetId || selectedPreset;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/discord/test-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: targetPreset }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const found = DM_PRESETS.find((p) => p.id === targetPreset);
        toast.success(`[${found?.label ?? targetPreset}] 모의 DM 전송이 확인되었습니다.`, {
          description: `수신자: ${adminUserId} | 채널: ${data.channelId || 'DM'}`,
        });
      } else {
        toast.error('테스트 DM 발송 실패', {
          description: data.error || '디스코드 봇 설정을 확인해 주세요.',
        });
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-muted/20">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <span>📨</span> 관리자 1:1 모의 DM 테스트
        </span>
        <span className="font-mono text-[11px] text-muted-foreground/80">
          ID: {adminUserId || '미확인'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {DM_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset.id)}
              aria-pressed={isSelected}
              className={`flex min-h-11 flex-col items-start p-2 rounded-md border text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-foreground ring-1 ring-indigo-500'
                  : 'border-border/50 bg-background/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-semibold">
                <span>{preset.icon}</span>
                <span className="truncate">{preset.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                {preset.desc}
              </span>
            </button>
          );
        })}
      </div>

      {!configured && (
        <p role="status" className="text-xs text-muted-foreground">
          서버에서 DM 전송 설정을 확인할 수 없어 테스트가 비활성화되었습니다.
        </p>
      )}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleSendTest()}
          disabled={loading || !configured}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs min-h-11"
        >
          {loading
            ? '발송 중...'
            : `선택된 [${DM_PRESETS.find((p) => p.id === selectedPreset)?.label}] DM 발송`}
        </Button>
      </div>
    </div>
  );
}
