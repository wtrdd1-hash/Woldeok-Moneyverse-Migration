'use client';

import Link from 'next/link';
import { Coins, Dices, Sparkles, ArrowRight, ShieldCheck, Bomb, Gem, CircleDot } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

export function CasinoGuestView() {
  const { locale } = useLocale();

  const titleText = localeLabel(
    locale,
    '아케이드 (가상 미니게임)',
    'Arcade (Virtual Mini-Games)',
    'アーケード（仮想ミニゲーム）',
    '街机（虚拟小游戏）',
    'Arcade (Trò chơi ảo)'
  );

  const descText = localeLabel(
    locale,
    '모든 게임의 적용 확률과 배당을 확인하고 동전·주사위 기반 서버 게임을 즐겨보세요.',
    'Explore verified odds, payout tables, and provably fair coin & dice simulations.',
    '検証されたオッズ、配当率、サーバー検証ゲームをお楽しみください。',
    '探索透明概率、赔率乘数与经服务器端可信验证的硬币及骰子小游戏。',
    'Khám phá tỷ lệ cược đã xác minh và các trò chơi tung xúc xắc, lật xu công bằng.'
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="WOLDEOK MONEYVERSE · ARCADE"
        title={titleText}
      >
        {descText}
      </PageHeader>

      {/* 법적 고지 배너 */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
        <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
          <span>⚖️</span>
          <span>
            {localeLabel(
              locale,
              '[법적 고지] 폐쇄형 가상 포인트 안내 및 현금 환전 불가',
              '[Legal Notice] Closed-loop virtual simulation & No cash out',
              '【法的告知】クローズドループ仮想ポイントのご案内・現金換金不可',
              '【法律声明】封闭式虚拟积分说明与禁止兑现',
              '[Thông báo pháp lý] Tiền tệ mô phỏng khép kín & Không đổi tiền mặt'
            )}
          </span>
        </div>
        <p className="leading-relaxed text-amber-200/90">
          {localeLabel(
            locale,
            '본 아케이드의 모든 미니게임은 커뮤니티 전용 폐쇄형 포인트(WLD)로만 구동되며, 어떠한 경우에도 현금, 암호화폐, 실물 재화로의 환전·환급·거래가 일체 불가합니다.',
            'All mini-games operate strictly with in-game closed virtual points (WLD) and can NEVER be exchanged, refunded, or traded for real currency or monetary goods.',
            '当アーケードのすべてのミニゲームはコミュニティ専用の仮想ポイント（WLD）でのみ動作し、いかなる場合も現金や実物資産への換金は不可能です。',
            '本区域所有小游戏仅支持平台虚拟代币（WLD），任何情况下均不得兑换、提现或交易真实货币与实物财产。',
            'Tất cả trò chơi mini chỉ sử dụng điểm ảo khép kín (WLD) và không thể quy đổi ra tiền mặt hoặc tài sản thực tế dưới bất kỳ hình thức nào.'
          )}
        </p>
      </div>

      {/* 안내 카드 */}
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            {localeLabel(
              locale,
              '로그인 후 게임 플레이가 가능합니다',
              'Sign In Required to Play',
              'プレイにはログインが必要です',
              '需要登录后开始游玩',
              'Cần đăng nhập để bắt đầu chơi'
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            {localeLabel(
              locale,
              '가입 즉시 10,000 WLD의 무료 정착금이 지급되며 다양한 미니게임을 즐기실 수 있습니다.',
              'Get 10,000 WLD starter capital immediately upon registration to enjoy all virtual mini-games.',
              '新規登録で10,000 WLDの無料スターター資金を獲得し、多彩なミニゲームをお楽しみいただけます。',
              '立即注册即可免费领取 10,000 WLD 初始启动金，体验丰富的小游戏。',
              'Nhận ngay 10.000 WLD vốn khởi đầu khi đăng ký để trải nghiệm đầy đủ các trò chơi.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="font-bold">
            <Link href="/login" className="flex items-center gap-1.5">
              {localeLabel(locale, '로그인하고 시작하기', 'Sign In and Start', 'ログインして始める', '登录并开始', 'Đăng nhập và Bắt đầu')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
