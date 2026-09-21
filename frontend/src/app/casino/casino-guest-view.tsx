'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Coins,
  Dices,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
  Trophy,
  Flame,
  Gem,
  Compass,
  Gift
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type GameCategory = 'all' | 'classic' | 'high_multiplier' | 'themed';

interface GameItem {
  id: string;
  category: 'classic' | 'high_multiplier' | 'themed';
  icon: typeof Coins;
  color: string;
  bgColor: string;
  title: string;
  badge: string;
  probability: string;
  payout: string;
  description: string;
}

const GAME_SHOWCASE: readonly GameItem[] = [
  {
    id: 'coin',
    category: 'classic',
    icon: Coins,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    title: '동전 뒤집기 (Coin Flip)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50.0%',
    payout: '1.90x',
    description: '앞면과 뒷면 중 하나를 예측하는 직관적이고 빠른 클래식 미니게임입니다. 50:50 공정 확률로 WLD를 획득할 수 있습니다.',
  },
  {
    id: 'dice_parity',
    category: 'classic',
    icon: Dices,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    title: '주사위 홀짝 (Dice Parity)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50.0%',
    payout: '1.90x',
    description: '주사위를 굴려 나오는 눈금이 홀수인지 짝수인지 맞추는 캐주얼 게임입니다. 짧은 라운드로 부담 없이 즐길 수 있습니다.',
  },
  {
    id: 'dice_exact',
    category: 'high_multiplier',
    icon: Dices,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    title: '주사위 정밀 예측 (Dice Exact)',
    badge: '5.7배 대박 배당',
    probability: '당첨 확률 16.67%',
    payout: '5.70x',
    description: '1부터 6까지의 주사위 눈금을 정확히 맞추는 고배당 게임입니다. 높은 배당률로 짜릿한 역전 승부를 노려보세요.',
  },
  {
    id: 'slots',
    category: 'high_multiplier',
    icon: Flame,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    title: '럭키 777 슬롯 (Lucky Slots)',
    badge: '5.7배 대박 배당',
    probability: '주사위 6번 매핑 (16.67%)',
    payout: '5.70x',
    description: '서버 주사위 숫자 규칙을 슬롯 머신 릴로 구현한 테마 게임입니다. 트리플 777이 정렬되는 순간 대박 보상이 정산됩니다.',
  },
  {
    id: 'hilo',
    category: 'themed',
    icon: Sparkles,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    title: '하이 앤 로우 (Hi-Lo Card)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50.0%',
    payout: '1.90x',
    description: '주사위 홀짝 규칙을 High/Low 카드 선택 화면으로 표현한 테마 게임입니다. High는 홀수, Low는 짝수로 정산됩니다.',
  },
  {
    id: 'wheel',
    category: 'themed',
    icon: Compass,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    title: '컬러 휠 (Color Wheel)',
    badge: '1.9배 배당',
    probability: '당첨 확률 50.0%',
    payout: '1.90x',
    description: '황금색(홀수) 또는 푸른색(짝수)을 선택하며 주사위 홀짝 서버 규칙으로 결과와 보상이 정산됩니다.',
  },
  {
    id: 'treasure',
    category: 'themed',
    icon: Gift,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    title: '보물 상자 (Treasure Box)',
    badge: '5.7배 대박 배당',
    probability: '당첨 확률 16.67%',
    payout: '5.70x',
    description: '여섯 개의 황금 상자 중 보물이 든 상자 하나를 선택하며 서버 주사위 숫자 규칙으로 정산됩니다.',
  },
  {
    id: 'gems',
    category: 'themed',
    icon: Gem,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    title: '럭키 젬 (Lucky Gem)',
    badge: '5.7배 대박 배당',
    probability: '당첨 확률 16.67%',
    payout: '5.70x',
    description: '여섯 가지 빛나는 신비로운 보석 중 오늘의 행운 보석을 맞추는 고배당 미니게임입니다.',
  },
];

export function CasinoGuestView() {
  const [filter, setFilter] = useState<GameCategory>('all');
  const [demoMode, setDemoMode] = useState<'coin' | 'slot' | 'dice'>('coin');
  const [demoCoin, setDemoCoin] = useState<'HEADS (앞면)' | 'TAILS (뒷면)' | null>(null);
  const [demoSlots, setDemoSlots] = useState<[string, string, string]>(['CHERRY', 'LEMON', '777']);
  const [demoDice, setDemoDice] = useState<number | null>(null);
  const [isDemoSpinning, setIsDemoSpinning] = useState(false);

  const filteredGames = filter === 'all'
    ? GAME_SHOWCASE
    : GAME_SHOWCASE.filter((g) => g.category === filter);

  const handleRunDemo = () => {
    if (isDemoSpinning) return;
    setIsDemoSpinning(true);

    if (demoMode === 'coin') {
      const faces: ('HEADS (앞면)' | 'TAILS (뒷면)')[] = ['HEADS (앞면)', 'TAILS (뒷면)'];
      let count = 0;
      const interval = setInterval(() => {
        setDemoCoin(faces[count % 2] ?? 'HEADS (앞면)');
        count++;
        if (count > 8) {
          clearInterval(interval);
          setDemoCoin(Math.random() > 0.5 ? 'HEADS (앞면)' : 'TAILS (뒷면)');
          setIsDemoSpinning(false);
        }
      }, 70);
    } else if (demoMode === 'slot') {
      const symbols = ['CHERRY', 'LEMON', 'BELL', 'DIAMOND', 'STAR', '777'];
      let count = 0;
      const interval = setInterval(() => {
        setDemoSlots([
          symbols[Math.floor(Math.random() * symbols.length)] ?? 'CHERRY',
          symbols[Math.floor(Math.random() * symbols.length)] ?? 'LEMON',
          symbols[Math.floor(Math.random() * symbols.length)] ?? '777'
        ]);
        count++;
        if (count > 10) {
          clearInterval(interval);
          const isJackpot = Math.random() < 0.25;
          if (isJackpot) {
            setDemoSlots(['777', '777', '777']);
          } else {
            setDemoSlots([
              symbols[Math.floor(Math.random() * 5)] ?? 'CHERRY',
              symbols[Math.floor(Math.random() * 5)] ?? 'LEMON',
              symbols[Math.floor(Math.random() * 5)] ?? 'BELL'
            ]);
          }
          setIsDemoSpinning(false);
        }
      }, 70);
    } else if (demoMode === 'dice') {
      let count = 0;
      const interval = setInterval(() => {
        setDemoDice(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count > 8) {
          clearInterval(interval);
          setDemoDice(Math.floor(Math.random() * 6) + 1);
          setIsDemoSpinning(false);
        }
      }, 70);
    }
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="WOLDEOK MONEYVERSE · LUCKY ZONE"
        title="럭키존 (가상 미니게임)"
      >
        8종 가상 게임의 적용 확률과 배당을 실시간 확인하고 투명한 RNG 원장 게임을 즐겨보세요.
      </PageHeader>

      {/* 로그인 유도 핀테크 히어로 배너 */}
      <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-card to-card p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 text-sm font-bold">
                <Trophy className="size-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                로그인하고 8종 가상 미니게임을 시작하세요
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discord 계정으로 간편하게 3초 만에 시작할 수 있습니다. 가입 시 일일 출석 및 활동 보상으로 WLD를 바로 드려요.
            </p>
          </div>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400 font-bold shrink-0 min-h-11 px-5 rounded-xl">
            <Link href="/login">
              <span>Discord로 시작하기</span>
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* 실시간 무료 체험 인터랙티브 시뮬레이터 */}
      <Card className="border-border/70 bg-surface/50 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <CardTitle className="text-sm font-bold">무료 체험 인터랙티브 시뮬레이터</CardTitle>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setDemoMode('coin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${demoMode === 'coin' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                동전 체험
              </button>
              <button
                type="button"
                onClick={() => setDemoMode('slot')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${demoMode === 'slot' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                777 슬롯 체험
              </button>
              <button
                type="button"
                onClick={() => setDemoMode('dice')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${demoMode === 'dice' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                주사위 체험
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center justify-center min-h-20 w-full sm:w-auto px-6 py-3 rounded-2xl bg-card border border-border/80 shadow-inner">
              {demoMode === 'coin' && (
                <div className="flex items-center gap-3">
                  <div className={`size-11 rounded-full border-2 border-amber-500/50 bg-amber-500/10 flex items-center justify-center text-amber-500 ${isDemoSpinning ? 'animate-spin' : ''}`}>
                    <Coins className="size-6" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block font-mono">가상 동전 결과</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-foreground">
                      {demoCoin ? `[${demoCoin}]` : '버튼을 눌러 체험'}
                    </span>
                  </div>
                </div>
              )}
              {demoMode === 'slot' && (
                <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold">
                  <div className="flex gap-2 bg-background/90 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    {demoSlots.map((s, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded bg-card border border-border select-none transition-transform ${isDemoSpinning ? 'animate-bounce text-amber-500' : s === '777' ? 'text-amber-500 font-extrabold' : 'text-foreground'}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {demoMode === 'dice' && (
                <div className="flex items-center gap-3">
                  <div className={`size-11 rounded-xl border-2 border-blue-500/50 bg-blue-500/10 flex items-center justify-center text-blue-500 ${isDemoSpinning ? 'animate-spin' : ''}`}>
                    <Dices className="size-6" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block font-mono">가상 주사위 눈금</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-foreground">
                      {demoDice ? `[${demoDice}번 (${demoDice % 2 === 1 ? '홀' : '짝'})]` : '버튼을 눌러 체험'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleRunDemo}
                disabled={isDemoSpinning}
                className="w-full sm:w-auto min-h-11 px-6 rounded-xl font-bold gap-2 bg-amber-500 text-black hover:bg-amber-400"
              >
                <RotateCw className={`size-4 ${isDemoSpinning ? 'animate-spin' : ''}`} />
                <span>{isDemoSpinning ? '체험 진행 중…' : '무료 시뮬레이션 돌려보기'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 필터 탭 */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-border/50 pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'}`}
        >
          전체 8종 게임
        </button>
        <button
          type="button"
          onClick={() => setFilter('classic')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'classic' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'}`}
        >
          클래식 50:50 (동전·홀짝)
        </button>
        <button
          type="button"
          onClick={() => setFilter('high_multiplier')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'high_multiplier' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'}`}
        >
          고배당 5.7배 (777 슬롯·정밀)
        </button>
        <button
          type="button"
          onClick={() => setFilter('themed')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'themed' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:bg-muted text-muted-foreground'}`}
        >
          테마 게임 (카드·휠·보물·보석)
        </button>
      </div>

      {/* 8종 게임 라인업 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="border-border/60 hover:border-amber-500/50 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${item.bgColor} ${item.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold">
                      {item.badge}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">
                    {item.probability}
                  </span>
                </div>
                <CardTitle className="text-sm font-bold mt-2.5">{item.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <Button asChild variant="outline" className="w-full min-h-10 text-xs font-bold rounded-xl border-border/80 hover:bg-amber-500/10 hover:border-amber-500/40">
                  <Link href="/login" className="flex items-center justify-between w-full">
                    <span>로그인하고 승부하기</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 공정성 및 책임 도박 원칙 */}
      <Card className="border-border/40 bg-surface/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>투명한 암호학적 공정성 검증 및 자가 한도 보호 시스템</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <p>• 동전·주사위 난수 생성과 WLD 정산은 서버 데이터베이스 트랜잭션에서 100% 원자적으로 처리됩니다.</p>
          <p>• 과도한 게임 몰입을 방지하기 위해 1일 베팅 한도 및 손실 자가 제한(Self-Exclusion) 시스템을 상시 제공합니다.</p>
          <p>• 100만 회 이상의 정규분포 적합성(Z-Score) 통계 검증을 통과한 공식 난수 엔진만을 사용합니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
