'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Ticket, ArrowUpRight, TrendingUp, Calculator, BookOpen, Coins } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';

/**
 * Recommendations and Ecosystem Links placed at the bottom of calculator pages.
 * Maximizes Internal Linking discovery for crawlers and CRO conversion for human visitors.
 */
export function ToolsEcosystemLinks() {
  const { locale } = useLocale();
  const rawViewer = useViewer();
  const viewer = (rawViewer && typeof rawViewer === 'object' && 'viewer' in rawViewer ? (rawViewer as { viewer: Viewer | null }).viewer : rawViewer) as Viewer | null;

  return (
    <section className="mt-12 space-y-8 border-t border-border/60 pt-10 text-foreground w-full">
      {/* 1. 비회원 대상 웰컴 정착금 & 잭팟 복권 전환 배너 카드 */}
      {!viewer?.signedIn && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-br from-amber-950/30 via-zinc-950 to-emerald-950/20 p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                <Gift className="size-3.5" />
                <span>{localeLabel(locale, '신규 유저 온보딩 혜택', 'Starter Welcome Bonus', '新規ユーザー特典', '新人入驻专属礼包')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
                {localeLabel(
                  locale,
                  '계산된 자산을 가상 경제에서 직접 굴려보세요!',
                  'Grow Your Simulated Wealth in Woldeok Moneyverse!',
                  '計算した資産を仮想経済で実際に増やしてみよう！',
                  '在虚拟经济中亲自增殖您所测算的资产！',
                )}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {localeLabel(
                  locale,
                  '지금 회원가입 시 신규 정착금 10,000 WLD와 1등 당첨금 1,000만 WLD 메가 잭팟 복권 1장을 100% 무료로 즉시 지급해 드립니다.',
                  'Sign up now to instantly claim 10,000 WLD starter grant and 1 free Mega Jackpot Lottery ticket.',
                  '今すぐ無料登録で、新規定着金10,000 WLDと1等1,000万WLDメガ宝くじ1枚を即時進呈します。',
                  '立即注册即可免费获赠10,000 WLD新手定居金及1张千万元巨额大奖彩票。',
                )}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:items-end gap-2">
              <Link
                href="/login?ref=calc_conversion"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-black text-zinc-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Coins className="size-4" />
                <span>{localeLabel(locale, '1초 가입하고 정착금 받기', 'Claim 10,000 WLD & Ticket', '1秒登録して10,000 WLD受取', '1秒注册领取10,000 WLD')}</span>
                <ArrowUpRight className="size-4" />
              </Link>
              <span className="text-[11px] text-zinc-500 text-center sm:text-right">
                {localeLabel(locale, '별도 인증 없이 소셜 1초 로그인 지원', 'Instant 1-Click Social Sign-in', '1クリックソーシャルログイン対応', '支持一键快速社交登录')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. 에코시스템 3대 탐색 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 가상 주식 HOT 4종 */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <TrendingUp className="size-4 text-amber-500" />
              {localeLabel(locale, '가상 주식 인기 거래 종목', 'Trending Virtual Stocks', '人気急上昇仮想株式', '热门虚拟股票')}
            </span>
            <Link href="/stocks" className="text-xs text-amber-500 hover:underline">
              {localeLabel(locale, '전체보기', 'View All', 'すべて見る', '查看全部')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/stocks/CHIPS" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">CHIPS</span>
              <span className="text-[11px] text-muted-foreground">침팬지 반도체</span>
            </Link>
            <Link href="/stocks/DUCKS" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">DUCKS</span>
              <span className="text-[11px] text-muted-foreground">월덕 인더스트리</span>
            </Link>
            <Link href="/stocks/COIN" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">COIN</span>
              <span className="text-[11px] text-muted-foreground">도지 밈 파이낸스</span>
            </Link>
            <Link href="/stocks/SPACE" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">SPACE</span>
              <span className="text-[11px] text-muted-foreground">덕스페이스 로켓</span>
            </Link>
          </div>
        </div>

        {/* 연계 계산기 4종 */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Calculator className="size-4 text-emerald-500" />
              {localeLabel(locale, '연관 금융 계산기', 'Related Calculators', '関連金融計算機', '相关金融计算器')}
            </span>
            <Link href="/tools" className="text-xs text-emerald-500 hover:underline">
              {localeLabel(locale, '전체 도구', 'All Tools', 'すべてのツール', '所有工具')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/tools/loan-interest-calculator" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">대출이자 계산기</span>
              <span className="text-[11px] text-muted-foreground">원리금 vs 체증식</span>
            </Link>
            <Link href="/tools/dividend-tax-calculator" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">배당소득세 계산기</span>
              <span className="text-[11px] text-muted-foreground">15.4% 원천징수</span>
            </Link>
            <Link href="/tools/isa-calculator" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">ISA 비과세 계산기</span>
              <span className="text-[11px] text-muted-foreground">200만~400만 한도</span>
            </Link>
            <Link href="/tools/compound-calculator" className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex flex-col gap-0.5">
              <span className="font-bold text-foreground">복리 예적금 계산기</span>
              <span className="text-[11px] text-muted-foreground">월적립 복리 효과</span>
            </Link>
          </div>
        </div>

        {/* 실전 금융 가이드 */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpen className="size-4 text-blue-500" />
              {localeLabel(locale, '실전 금융 & 파밍 가이드', 'Guides & Manuals', '実践ガイド＆マニュアル', '实战指南与手册')}
            </span>
            <Link href="/roadmap" className="text-xs text-blue-500 hover:underline">
              {localeLabel(locale, '성장 로드맵', 'Roadmap', 'ロードマップ', '路线图')}
            </Link>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <Link href="/guide/stock-trading" className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between">
              <span className="font-medium text-foreground">가상 주식 실전 매매 가이드</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/guide/virtual-banking" className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between">
              <span className="font-medium text-foreground">복리 예금 & 이자 파밍 노하우</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/guide/career-mastery" className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between">
              <span className="font-medium text-foreground">직업 8대 티어 일일 급여 파밍</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
