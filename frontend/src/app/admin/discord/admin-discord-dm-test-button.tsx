'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  adminUserId: string;
}

export function AdminDiscordDmTestButton({ adminUserId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSendTest() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/discord/test-dm', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success(`디스코드 관리자(${adminUserId})에게 테스트 DM이 발송되었습니다!`, {
          description: `DM 채널 ID: ${data.channelId || '생성됨'}`,
        });
      } else {
        toast.error('테스트 DM 발송 실패', {
          description: data.error || '디스코드 봇 설정을 확인해 주세요.',
        });
      }
    } catch (err) {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSendTest}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
    >
      {loading ? 'DM 발송 중...' : '중요 정보 테스트 DM 발송'}
    </Button>
  );
}
