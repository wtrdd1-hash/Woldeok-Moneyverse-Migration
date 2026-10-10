'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Bell, Sparkles, Check, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useViewer } from '@/lib/use-viewer';

interface UserConversionLockInWidgetProps {
  readonly title: string;
  readonly summaryValue: string;
  readonly summaryLabel: string;
  readonly toolCategory?: string | undefined;
}

export function UserConversionLockInWidget({
  title,
  summaryValue,
  summaryLabel,
  toolCategory = 'finance',
}: UserConversionLockInWidgetProps) {
  const viewer = useViewer();
  const [activeTab, setActiveTab] = useState<'save_alert' | 'welcome_bonus' | 'share_card'>('save_alert');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSimulatedSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card/95 via-card/80 to-amber-950/10 shadow-xl backdrop-blur-md overflow-hidden transition-all">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <CardTitle className="text-sm font-extrabold text-foreground tracking-tight">
              ⚡ 맞춤형 결과 보존 & 웰컴 리워드 센터
            </CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-[11px] font-bold">
            신규 혜택 +10,000 WLD
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          방금 계산하신 <span className="font-bold text-foreground">[{title}]</span> 결과를 영구 저장하고 맞춤형 금융 혜택을 수령하세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 3대 A/B 전환 탭 바 */}
        <div className="flex rounded-xl bg-secondary/50 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('save_alert')}
            className={`flex-1 min-h-[38px] px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'save_alert'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="size-3.5" />
            <span>결과 저장 & 만기 알림</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('welcome_bonus')}
            className={`flex-1 min-h-[38px] px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'welcome_bonus'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="size-3.5 text-amber-300" />
            <span>10만 WLD 시드 받기</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('share_card')}
            className={`flex-1 min-h-[38px] px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share_card'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="size-3.5" />
            <span>인증 리포트 소장</span>
          </button>
        </div>

        {/* 탭 1: 결과 저장 & 만기 알림 등록 */}
        {activeTab === 'save_alert' && (
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{summaryLabel}</span>
              <span className="font-mono font-black text-amber-400 text-sm">{summaryValue}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              이 계산 수치를 내 계정에 영구 보존하고, 목표 만기일 도래 시 카카오톡/이메일로 무료 알림을 보내드립니다.
            </p>
            {viewer ? (
              <Button
                size="sm"
                onClick={handleSimulatedSave}
                disabled={savedSuccess}
                className="w-full min-h-[40px] font-bold text-xs bg-amber-500 hover:bg-amber-600 text-black gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="size-4" /> 내 포트폴리오에 성공적으로 저장되었습니다!
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" /> 내 계정에 현재 진단 결과 즉시 저장하기
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  asChild
                  className="flex-1 min-h-[40px] font-bold text-xs bg-amber-500 hover:bg-amber-600 text-black gap-1.5"
                >
                  <Link href="/register">
                    간편가입 후 결과 저장 & 알림 받기 <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="min-h-[40px] font-semibold text-xs border-border"
                >
                  <Link href="/login">기존 회원 로그인</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 탭 2: 1만 WLD 시드머니 웰컴 리워드 */}
        {activeTab === 'welcome_bonus' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">신규 회원 전용 무상 지원금</span>
              <span className="font-mono font-black text-amber-400 text-sm">+10,000 WLD</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              방금 확인하신 <span className="text-foreground font-semibold">{summaryValue}</span> 목표를 달성할 수 있도록, 가상 주식 거래소 및 중앙은행에서 자유롭게 굴릴 수 있는 정착 지원금 1만 WLD와 복권 1장을 즉시 지급해 드립니다.
            </p>
            <Button
              size="sm"
              asChild
              className="w-full min-h-[40px] font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black gap-1.5 shadow-md shadow-amber-950"
            >
              <Link href={viewer ? '/bank' : '/register'}>
                <Sparkles className="size-4" />
                {viewer ? '중앙은행 스마트 복리 포켓 바로가기' : '1만 WLD 지원금 받고 모의투자 시작하기'}
              </Link>
            </Button>
          </div>
        )}

        {/* 탭 3: 인증 리포트 소장 & 공유 */}
        {activeTab === 'share_card' && (
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">인증 배지</span>
              <span className="font-mono font-bold text-cyan-400">Verified Calculator Report</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              본 진단 결과를 깔끔한 핀테크 영수증 카드 형태로 캡처하여 오픈채팅방이나 SNS에 친구들과 간편하게 공유할 수 있습니다.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(`[월덕 머니버스 ${title} 진단 결과]\n${summaryLabel}: ${summaryValue}\n지금 확인하기: https://easy-scraping.com`);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3000);
                }
              }}
              className="w-full min-h-[40px] font-bold text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
            >
              <Download className="size-4" />
              {savedSuccess ? '클립보드에 진단 요약이 복사되었습니다!' : '진단 결과 요약 텍스트 복사하기'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
