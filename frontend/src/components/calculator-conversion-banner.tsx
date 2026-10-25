'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

interface CalculatorConversionBannerProps {
  readonly title?: string;
  readonly description?: string;
  readonly targetSymbol?: string;
  readonly targetUrl?: string;
  readonly bonusAmount?: string;
}

export function CalculatorConversionBanner({
  title,
  description,
  targetSymbol = 'CHIPS',
  targetUrl,
  bonusAmount = '10,000 WLD',
}: CalculatorConversionBannerProps) {
  const { locale } = useLocale();
  const destination = targetUrl || (targetSymbol ? `/stocks/${targetSymbol}` : '/stocks');

  const defaultTitle = localeLabel(
    locale,
    '계산된 전략, 실전 가상 투자로 지금 바로 검증해보세요!',
    'Validate Your Strategy in Real-time Paper Trading Now!',
    '計算した戦略をリアルタイム模擬投資で今すぐ検証！',
    '立即在实盘模拟交易中验证您的投资策略！',
    'Xác thực chiến lược tính toán với giao dịch mô phỏng ngay!'
  );

  const defaultDesc = localeLabel(
    locale,
    '신규 가입 즉시 10,000 WLD 투자 지원금 100% 무료 지급! 실제 손실 위험 없이 실시간 호가창에서 모의투자를 시작하세요.',
    'Get 10,000 WLD starter grant immediately upon signup! Test your orders with live 10-depth orderbooks with zero financial risk.',
    '新規登録で10,000 WLDの投資支援金を即時無料付与！損失リスクなしでリアルタイム板情報での模擬投資を開始しましょう。',
    '新用户注册即领 10,000 WLD 模拟投资金！在实时 10 档盘口中无风险体验交易。',
    'Nhận ngay 10.000 WLD vốn khởi nghiệp khi đăng ký! Trải nghiệm đầu tư mô phỏng không rủi ro.'
  );

  const welcomeBadge = localeLabel(
    locale,
    `신규 회원 웰컴 혜택: ${bonusAmount} 즉시 지급`,
    `Welcome Bonus: ${bonusAmount} Instant Grant`,
    `新規特典: ${bonusAmount} 即時付与`,
    `新手福利: 立即赠送 ${bonusAmount}`,
    `Phần thưởng chào mừng: Tặng ngay ${bonusAmount}`
  );

  const safeFeature = localeLabel(
    locale,
    '100% 안전한 무손실 가상 모의투자',
    '100% Risk-free Simulated Trading',
    '100% 安全な無損失模擬投資',
    '100% 无风险安全模拟交易',
    'Giao dịch mô phỏng 100% không rủi ro'
  );

  const orderbookFeature = localeLabel(
    locale,
    '실시간 10-Depth 호가창 & 캔들 차트',
    'Live 10-Depth Orderbook & Candlesticks',
    'リアルタイム 10本気配値 & ローソク足チャート',
    '实时 10 档深度盘口与 K 线图表',
    'Sổ lệnh 10 cấp độ & biểu đồ nến thời gian thực'
  );

  const ctaPrimary = localeLabel(
    locale,
    targetSymbol ? `${targetSymbol} 실전 모의투자 시작` : '가상 거래소 입장하기',
    targetSymbol ? `Start Paper Trading on ${targetSymbol}` : 'Enter Virtual Exchange',
    targetSymbol ? `${targetSymbol} 模擬投資を開始` : '仮想取引所に入る',
    targetSymbol ? `开始 ${targetSymbol} 模拟交易` : '进入虚拟交易所',
    targetSymbol ? `Bắt đầu giao dịch ${targetSymbol}` : 'Vào sàn ảo'
  );

  const ctaSecondary = localeLabel(
    locale,
    '1초 간편 회원가입하고 지원금 받기',
    'Sign up in 1 second & claim grant',
    '1秒で簡単登録して支援金を受け取る',
    '一秒极速注册并领取启动金',
    'Đăng ký trong 1 giây để nhận vốn'
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
      {/* Background glowing ambient effect */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Gift className="size-3.5 animate-bounce" />
            <span>{welcomeBadge}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="size-5 text-amber-400 shrink-0" />
            <span>{title || defaultTitle}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description || defaultDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>{safeFeature}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="size-4 text-cyan-400" />
              <span>{orderbookFeature}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Button
            asChild
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 text-sm gap-2"
          >
            <Link href={destination}>
              <span>{ctaPrimary}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
          >
            <Link href="/register">
              {ctaSecondary}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
