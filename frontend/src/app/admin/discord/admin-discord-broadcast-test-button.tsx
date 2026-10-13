'use client';

import React, { useState } from 'react';
import { Radio, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDiscordBroadcastTestButton() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sendTestBroadcast = async (type: 'AUCTION' | 'PROPOSAL' | 'COPY_TRADE') => {
    setLoading(true);
    setStatusMessage(null);

    const payloads = {
      AUCTION: {
        type: 'LANDMARK_AUCTION',
        title: '🏛️ [테스트] 메가시티 랜드마크 경매 최고가 경신',
        description: '강남 머니버스 프라임 타워에 **550,000 WLD** 최고가 입찰이 등록되었습니다.',
        fields: [
          { name: '랜드마크', value: '강남 프라임 타워', inline: true },
          { name: '입찰 금액', value: '550,000 WLD', inline: true },
          { name: '배당 수익률', value: '연 14.8%', inline: true },
        ],
        color: 0x6366f1,
      },
      PROPOSAL: {
        type: 'TREASURY_PROPOSAL',
        title: '🗳️ [테스트] 시민 참여형 주민참여예산 신규 사업 발의',
        description: '**"월덕거래소 주식 매매 수수료 1주일간 전액 국고 대납 지원"** 제안이 등록되었습니다.',
        fields: [
          { name: '요청 예산', value: '500,000 WLD', inline: true },
          { name: '목표 득표', value: '1,000표', inline: true },
        ],
        color: 0x10b981,
      },
      COPY_TRADE: {
        type: 'COPY_TRADE',
        title: '📈 [테스트] 고래 트레이더 대규모 카피 주문 체결',
        description: '1위 고래 **여의도_헤지펀드_마스터**의 WDG 500주 매수가 14명 추종자에게 복사 체결되었습니다.',
        fields: [
          { name: '종목', value: 'WDG (월덕전자)', inline: true },
          { name: '수익률', value: '+184.2%', inline: true },
        ],
        color: 0xf59e0b,
      },
    };

    try {
      const res = await fetch('/api/discord/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloads[type]),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage(`브로드캐스트 전송 완료! (${data.deliveredToBot ? 'Discord 봇 전달 성공' : '대기열 등록'})`);
      } else {
        setStatusMessage(`전송 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (e: any) {
      setStatusMessage(`오류 발생: ${e?.message || '네트워크 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Radio className="size-4 text-emerald-500" />
          <span>실시간 금융 이벤트 브로드캐스트 송출 테스트</span>
        </CardTitle>
        <CardDescription className="text-xs">
          국고 거버넌스, 랜드마크 경매, 고래 카피트레이딩 체결 시 Discord 공지 채널로 자동 송출되는 리치 임베드를 테스트합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => sendTestBroadcast('AUCTION')}
            className="text-xs border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
          >
            🏛️ 랜드마크 경매 테스트
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => sendTestBroadcast('PROPOSAL')}
            className="text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
          >
            🗳️ 주민참여예산 테스트
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => sendTestBroadcast('COPY_TRADE')}
            className="text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            📈 고래 카피체결 테스트
          </Button>
        </div>

        {statusMessage && (
          <div className="text-xs font-mono p-2.5 rounded bg-muted/60 border border-border/50 text-foreground flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
