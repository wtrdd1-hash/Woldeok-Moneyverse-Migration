'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  adminUserId: string;
}

const DM_PRESETS = [
  { id: 'default', label: '기본 무결성 연동', desc: '원장 대사/음수잔액/감사체인 기본 검증', icon: '🔔' },
  { id: 'whale', label: '고래 대규모 자금 이동', desc: '단일 5천만 WLD+ 급격 이체 감지', icon: '🐋' },
  { id: 'jackpot', label: '카지노 1억 WLD 잭팟', desc: '슬롯/룰렛 초대형 잭팟 즉시 직보', icon: '🎰' },
  { id: 'treasury', label: '국고 준비금 결핍 경보', desc: '국고 잔액 10억 WLD 미만 하회', icon: '⚠️' },
  { id: 'killswitch', label: '비상 킬스위치 가동', desc: '체결 엔진/카지노 긴급 중단 조치', icon: '🛑' },
  { id: 'bank_delinquency', label: '대출 연체 급증 경보', desc: '연체율 8.7% 돌파 및 뱅크런 조기 경보', icon: '📉' },
] as const;

export function AdminDiscordDmTestButton({ adminUserId }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  async function handleSendTest(presetId?: string) {
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
        toast.success(`[${found?.label ?? targetPreset}] 관리자 DM이 발송되었습니다!`, {
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
          <span>📨</span> 관리자 1:1 관제 DM 프리셋 발송
        </span>
        <span className="font-mono text-[11px] text-muted-foreground/80">ID: {adminUserId}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {DM_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset.id)}
              className={`flex flex-col items-start p-2 rounded-md border text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-foreground ring-1 ring-indigo-500'
                  : 'border-border/50 bg-background/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-semibold">
                <span>{preset.icon}</span>
                <span className="truncate">{preset.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{preset.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleSendTest()}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-8"
        >
          {loading ? '발송 중...' : `선택된 [${DM_PRESETS.find((p) => p.id === selectedPreset)?.label}] DM 발송`}
        </Button>
      </div>
    </div>
  );
}
