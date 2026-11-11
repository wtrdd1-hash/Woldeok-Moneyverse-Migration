'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PingResult {
  ok: boolean;
  telegramSent: boolean;
  discordSent: boolean;
  timestamp: string;
  error?: string;
}

export function AdminOtpChannelPingPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTestPing = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/auth/channel-otp/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || '메신저 핑 테스트 실패');
      }
      setResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageSquare className="size-4" />
              </div>
              <CardTitle className="text-base font-bold">2FA 관리자 메신저(텔레그램 & 디스코드) 연동 진단</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              관리자 R2/R3 승격 OTP 코드가 정상 전달되는지 운영 텔레그램 채널과 디스코드 웹훅으로 실시간 점검 핑을 전송합니다.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleTestPing}
            className="shrink-0 h-9 px-3 gap-1.5 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 font-semibold text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                핑 발송 중...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                실시간 핑 테스트
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sky-400" />
                텔레그램 봇 채널
              </span>
              <p className="text-[11px] text-muted-foreground font-mono">TELEGRAM_BOT_TOKEN & CHAT_ID</p>
            </div>
            {result ? (
              result.telegramSent ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] gap-1">
                  <CheckCircle2 className="size-3" /> 정상 발송됨
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[11px] gap-1">
                  <XCircle className="size-3" /> 미전달 (환경변수 확인)
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                대기 중
              </Badge>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-400" />
                디스코드 보안 웹훅
              </span>
              <p className="text-[11px] text-muted-foreground font-mono">DISCORD_ALERT_WEBHOOK_URL</p>
            </div>
            {result ? (
              result.discordSent ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] gap-1">
                  <CheckCircle2 className="size-3" /> 정상 발송됨
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[11px] gap-1">
                  <XCircle className="size-3" /> 미전달 (웹훅 확인)
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                대기 중
              </Badge>
            )}
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="size-3.5" /> 점검 완료 ({new Date(result.timestamp).toLocaleTimeString('ko-KR')})
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              동시 발송: {result.telegramSent && result.discordSent ? '듀얼 채널 성공' : '단일 채널 성공 또는 모의'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
