'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserConversionLockInWidgetProps {
  readonly title: string;
  readonly summaryValue: string;
  readonly summaryLabel: string;
  readonly toolCategory?: string | undefined;
}

type Tab = 'save' | 'market' | 'share';

export function UserConversionLockInWidget({
  title,
  summaryValue,
  summaryLabel,
  toolCategory = 'finance',
}: UserConversionLockInWidgetProps) {
  const [tab, setTab] = useState<Tab>('save');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function saveLocally() {
    try {
      localStorage.setItem('wdmv_calculator_result', JSON.stringify({
        title, summaryValue, summaryLabel, toolCategory, savedAt: Date.now(),
      }));
      setMessage({ text: '계산 결과를 이 브라우저에 저장했습니다. 계정이나 서버에 동기화되지 않으며 브라우저 데이터를 삭제하면 사라집니다.', error: false });
    } catch {
      setMessage({ text: '브라우저에 계산 결과를 저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.', error: true });
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(`[머니버스 ${title}]\n${summaryLabel}: ${summaryValue}`);
      setMessage({ text: '계산 결과 요약을 클립보드에 복사했습니다.', error: false });
    } catch {
      setMessage({ text: '클립보드에 복사하지 못했습니다. 브라우저 권한을 확인해 주세요.', error: true });
    }
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card">
      <CardHeader className="border-b border-border/40">
        <CardTitle className="text-base">계산 결과 보관 및 가상 경제 안내</CardTitle>
        <CardDescription>방금 계산한 [{title}] 결과는 이 브라우저에만 저장할 수 있습니다. 계정 저장이나 자동 알림은 제공되지 않습니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-3 gap-2" aria-label="계산 결과 다음 단계">
          <button type="button" aria-pressed={tab === 'save'} onClick={() => { setTab('save'); setMessage(null); }} className={`min-h-11 rounded-lg px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${tab === 'save' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>브라우저 저장</button>
          <button type="button" aria-pressed={tab === 'market'} onClick={() => { setTab('market'); setMessage(null); }} className={`min-h-11 rounded-lg px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${tab === 'market' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>가상 거래소</button>
          <button type="button" aria-pressed={tab === 'share'} onClick={() => { setTab('share'); setMessage(null); }} className={`min-h-11 rounded-lg px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${tab === 'share' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>결과 공유</button>
        </div>
        {tab === 'save' ? (
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <p className="text-sm"><span className="text-muted-foreground">{summaryLabel}:</span> <strong className="break-words">{summaryValue}</strong></p>
            <p className="text-xs text-muted-foreground">브라우저 전용 저장입니다. 로그인 여부와 무관하며 서버 저장·만기 알림을 등록하지 않습니다.</p>
            <Button type="button" onClick={saveLocally} className="min-h-11 w-full gap-2"><Bookmark aria-hidden="true" className="size-4" /> 이 브라우저에 결과 저장</Button>
          </div>
        ) : tab === 'market' ? (
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">가상 종목과 WLD는 게임 데이터입니다. 회원가입이나 이 화면의 버튼은 보상 지급 또는 주문 체결을 수행하지 않습니다.</p>
            <Button asChild className="min-h-11 w-full gap-2"><Link href="/stocks"><TrendingUp aria-hidden="true" className="size-4" /> 가상 거래소 둘러보기 <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">현재 화면의 계산 요약을 텍스트로 복사합니다. 공식 검증 영수증이나 금융 수익 증빙은 아닙니다.</p>
            <Button type="button" variant="outline" onClick={() => { void copySummary(); }} className="min-h-11 w-full gap-2"><Download aria-hidden="true" className="size-4" /> 계산 결과 요약 복사</Button>
          </div>
        )}
        {message ? <p role={message.error ? 'alert' : 'status'} className={`text-sm ${message.error ? 'text-destructive' : 'text-muted-foreground'}`}>{message.text}</p> : null}
      </CardContent>
    </Card>
  );
}
