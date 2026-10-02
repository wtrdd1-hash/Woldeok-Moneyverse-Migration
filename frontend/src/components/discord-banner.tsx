import React from 'react';
import Link from 'next/link';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TranslatedText as T } from '@/components/translated-text';

export function DiscordBanner() {
  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/moneyverse';

  return (
    <section aria-labelledby="discord-community-banner-heading" className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-card to-background p-5 sm:p-6 shadow-md backdrop-blur-md">
        {/* Ambient Glow */}
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/40 text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1.5">
                <Bot className="size-3.5" />
                <T korean="공식 디스코드 봇 연동" english="Official Discord Bot Link" />
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="size-3" />
                <T korean="웹 출석 시 +10% 추가 WLD" english="Web Check-in +10% Bonus" />
              </Badge>
            </div>

            <h2 id="discord-community-banner-heading" className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
              <T
                korean="디스코드 서버에 봇을 초대하고 경제 생태계를 연동하세요"
                english="Invite Moneyverse Bot to your Discord Server & Link Virtual Economy"
              />
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              <T
                korean="디스코드 채팅 명령어와 웹 대시보드가 실시간으로 동기화됩니다. 웹사이트에서 출석 시 10% 추가 보너스와 일일 럭키 룰렛 기회를 드립니다."
                english="Chat commands and web dashboard sync in real-time. Enjoy a 10% attendance bonus and daily lucky wheel rewards on the web."
              />
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground/90 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <T korean="2FA 안전 원장 보장" english="2FA Secure Ledger" />
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-400" />
                <T korean="실시간 주식 & 금융 원장 동기화" english="Real-time Financial Sync" />
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-indigo-400" />
                <T korean="1,700+ 활성 커뮤니티" english="1,700+ Active Users" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            <Button
              asChild
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs sm:text-sm rounded-xl px-5 py-2.5 shadow-sm min-h-[44px] transition-transform active:scale-[0.98]"
            >
              <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Bot className="size-4" />
                <span><T korean="디스코드 봇 초대하기" english="Invite Discord Bot" /></span>
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border/80 hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl px-4 py-2 min-h-[38px]"
            >
              <Link href="/attendance">
                <T korean="오늘의 웹 출석 10% 받기" english="Claim +10% Web Check-in" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
