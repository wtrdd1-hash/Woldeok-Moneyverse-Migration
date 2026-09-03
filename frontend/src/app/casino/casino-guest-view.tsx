import Link from 'next/link';
import { Coins, Dices, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GAME_SHOWCASE = [
  {
    icon: Coins,
    title: '동전 뒤집기 (Coin Flip)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50%',
    description:
      '앞면과 뒷면 중 하나를 예측하는 직관적이고 빠른 클래식 미니게임입니다. 50:50 공정 확률로 WLD를 획득할 수 있습니다.',
  },
  {
    icon: Dices,
    title: '주사위 홀짝 (Dice Parity)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50%',
    description:
      '주사위를 굴려 나오는 눈금이 홀수인지 짝수인지 맞추는 캐주얼 게임입니다. 짧은 라운드로 부담 없이 즐길 수 있습니다.',
  },
  {
    icon: Dices,
    title: '주사위 정밀 예측 (Dice Exact)',
    badge: '5.7배 대박 배당',
    probability: '당첨 확률 16.67%',
    description:
      '1부터 6까지의 주사위 눈금을 정확히 맞추는 고배당 게임입니다. 높은 배당률로 짜릿한 역전 승부를 노려보세요.',
  },
  {
    icon: Sparkles,
    title: '럭키 슬롯머신 (777 Slots)',
    badge: '최대 10배 배당',
    probability: '심볼 조합형 잭팟',
    description:
      '3개의 릴이 회전하며 7, 체리, 벨 등 일치하는 기호 조합에 따라 최대 10배의 보상을 지급하는 아케이드 슬롯입니다.',
  },
  {
    icon: Sparkles,
    title: '하이 앤 로우 (Hi-Lo Card)',
    badge: '1.9배 배당',
    probability: '기준 카드 고저 예측',
    description:
      '공개된 기준 카드 대비 다음 카드의 숫자가 더 높을지 낮을지를 예측하는 정통 카드 심리 미니게임입니다.',
  },
];

export function CasinoGuestView() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="WOLDEOK MONEYVERSE · LUCKY ZONE"
        title="럭키존 (가상 미니게임)"
      >
        동전 뒤집기, 주사위 홀짝, 슬롯머신, 하이앤로우 등 5종의 다채로운 가상 미니게임을 즐기고 WLD 자산을 획득하세요.
      </PageHeader>

      {/* 로그인 유도 배너 */}
      <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-card to-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-amber-500 text-xl">🎮</span>
              <span>로그인하고 5종 미니게임을 바로 시작하세요</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discord 계정으로 간편하게 3초 만에 시작할 수 있습니다. 가입 시 일일 출석 및 활동 보상으로 WLD를 바로 드려요.
            </p>
          </div>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400 font-bold shrink-0">
            <Link href="/login">
              <span>Discord로 시작하기</span>
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* 5종 게임 라인업 쇼케이스 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_SHOWCASE.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-border/60 hover:border-amber-500/40 transition-colors">
              <CardHeader className="pb-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Icon className="size-4" />
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{item.probability}</span>
                </div>
                <CardTitle className="text-sm font-bold mt-2">{item.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* 공정성 및 이용 원칙 */}
      <Card className="border-border/40 bg-surface/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>투명한 공정성 검증 및 자가 한도 보호</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <p>• 월덕 머니버스의 모든 게임은 100만 회 난수 검증(Chi-Square & Z-score)을 통과한 무결성 원장 위에서 동작합니다.</p>
          <p>• 과도한 게임 몰입을 방지하기 위해 1일 베팅 한도 및 손실 자가 제한 시스템을 제공합니다.</p>
          <p>• 게임 결과 생성과 WLD 자산 정산은 서버 데이터베이스 트랜잭션에서 원자적(Atomic)으로 실행되어 조작이 불가능합니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}