'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, Gift, Coins, RotateCw, CheckCircle2, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { groupDigits } from '@/lib/money';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { SocialShareBar } from '@/components/social-share-bar';
import { cn } from '@/lib/cn';

interface WheelSlot {
  readonly id: number;
  readonly label: string;
  readonly amount: number;
  readonly color: string;
  readonly textColor: string;
  readonly weight: number; // 가중치
}

const WHEEL_SLOTS: readonly WheelSlot[] = [
  { id: 0, label: '1,000 WLD', amount: 1000, color: '#10b981', textColor: '#ffffff', weight: 35 },
  { id: 1, label: '2,000 WLD', amount: 2000, color: '#3b82f6', textColor: '#ffffff', weight: 25 },
  { id: 2, label: '3,000 WLD', amount: 3000, color: '#8b5cf6', textColor: '#ffffff', weight: 15 },
  { id: 3, label: '5,000 WLD', amount: 5000, color: '#f59e0b', textColor: '#ffffff', weight: 12 },
  { id: 4, label: '10,000 WLD', amount: 10000, color: '#ec4899', textColor: '#ffffff', weight: 8 },
  { id: 5, label: '2,000 WLD', amount: 2000, color: '#06b6d4', textColor: '#ffffff', weight: 3 },
  { id: 6, label: '50,000 WLD 잭팟', amount: 50000, color: '#eab308', textColor: '#000000', weight: 1 },
  { id: 7, label: '5,000 WLD 보너스', amount: 5000, color: '#6366f1', textColor: '#ffffff', weight: 1 },
];

export function DailyLuckyWheel({ className = '' }: { readonly className?: string }) {
  const { locale } = useLocale();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSlot, setWinningSlot] = useState<WheelSlot | null>(null);
  const [canSpinToday, setCanSpinToday] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 로컬스토리지 기반 일일 스핀 체크
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    const lastSpun = localStorage.getItem('moneyverse_lucky_wheel_date');
    if (lastSpun === today) {
      setCanSpinToday(false);
    }

    // 다음 자정까지 카운트다운
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilNext(`${hours}시간 ${mins}분 ${secs}초`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 무의존성 Canvas Confetti 폭죽 연출
  const launchConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308'];

    for (let i = 0; i < 65; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        alpha: 1,
      });
    }

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.alpha -= 0.015;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  };

  const handleSpin = () => {
    if (isSpinning || !canSpinToday) return;

    setIsSpinning(true);
    setWinningSlot(null);

    // 가중치 기반 슬롯 선택
    const totalWeight = WHEEL_SLOTS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = WHEEL_SLOTS[0]!;
    for (const slot of WHEEL_SLOTS) {
      if (rand < slot.weight) {
        selected = slot;
        break;
      }
      rand -= slot.weight;
    }

    // 8개 슬롯 -> 슬롯당 45도
    const slotAngle = 360 / WHEEL_SLOTS.length; // 45도
    const slotIndex = selected.id;
    // 상단 핀(12시 방향)에 멈추도록 각도 오프셋 계산 (기본 360 * 5바퀴 + 슬롯 중심)
    const extraRounds = 5 * 360;
    const targetAngle = extraRounds + (360 - slotIndex * slotAngle) - slotAngle / 2;

    const nextRotation = rotation + targetAngle;
    setRotation(nextRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSlot(selected);
      setCanSpinToday(false);
      if (typeof window !== 'undefined') {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('moneyverse_lucky_wheel_date', today);
      }
      launchConfetti();
      toast.success(
        localeLabel(
          locale,
          `축하합니다! ${selected.label} 지원금에 당첨되셨습니다!`,
          `Congratulations! You won ${selected.label}!`,
          `おめでとうございます！ ${selected.label} が当選しました！`,
          `恭喜获得 ${selected.label} 奖励！`,
        ),
      );
    }, 4600);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-muted/20 p-5 shadow-sm text-card-foreground space-y-4',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full z-20"
      />

      {/* 헤더 안내 */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
            <Trophy className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
              {localeLabel(
                locale,
                '매일 1회 무료 행운의 룰렛',
                'Daily Lucky Wheel',
                'デイリー・ラッキーホイール',
                '每日幸运大转盘',
              )}
              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/40 text-[10px] px-1.5 py-0 font-bold">
                100% 당첨
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {localeLabel(
                locale,
                '꽝 없이 매일 최대 50,000 WLD 잭팟과 무료 지원금을 즉시 수령하세요.',
                'Spin daily for guaranteed rewards up to 50,000 WLD jackpot.',
                'ハズレなし！毎日最大50,000 WLDが当たる無料スピン。',
                '无空奖！每日免费抽取最高50,000 WLD幸运大奖。',
              )}
            </p>
          </div>
        </div>

        {!canSpinToday && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground text-xs font-mono">
            <Clock className="size-3.5" />
            <span>{timeUntilNext}</span>
          </div>
        )}
      </div>

      {/* 중앙 룰렛 휠 UI */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        {/* 상단 핀 바늘 (12시 방향) */}
        <div className="relative z-10 -mb-3 flex flex-col items-center">
          <div className="size-0 border-x-8 border-x-transparent border-t-14 border-t-amber-500 drop-shadow-md" />
        </div>

        {/* 회전 휠 컨테이너 */}
        <div className="relative size-60 sm:size-68 rounded-full border-4 border-amber-500/30 shadow-2xl p-1 bg-zinc-950">
          <svg
            viewBox="0 0 200 200"
            className="size-full rounded-full transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4.5s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
            }}
          >
            {WHEEL_SLOTS.map((slot, index) => {
              const angle = 360 / WHEEL_SLOTS.length;
              const startAngle = index * angle;
              const endAngle = startAngle + angle;
              const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
              const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

              const textAngle = startAngle + angle / 2;
              const textRad = (Math.PI * textAngle) / 180;
              const textX = 100 + 64 * Math.cos(textRad);
              const textY = 100 + 64 * Math.sin(textRad);

              return (
                <g key={slot.id}>
                  <path d={pathData} fill={slot.color} opacity={0.88} stroke="#18181b" strokeWidth="1.5" />
                  <text
                    x={textX}
                    y={textY}
                    fill={slot.textColor}
                    fontSize="7.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {slot.amount >= 10000 ? `${slot.amount / 10000}만 WLD` : `${slot.amount} WLD`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 중앙 허브 버튼 */}
          <div className="absolute inset-0 m-auto size-16 rounded-full bg-zinc-900 border-2 border-amber-500 flex flex-col items-center justify-center shadow-lg text-center pointer-events-none">
            <Sparkles className="size-4 text-amber-400" />
            <span className="text-[10px] font-black text-amber-400">SPIN</span>
          </div>
        </div>
      </div>

      {/* 스핀 실행 버튼 & 상태 */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          size="lg"
          disabled={isSpinning || !canSpinToday}
          onClick={handleSpin}
          className="w-full sm:w-72 h-11 font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-950/20 active:scale-95 transition-all gap-2"
        >
          <RotateCw className={cn('size-4', isSpinning && 'animate-spin')} />
          <span>
            {isSpinning
              ? localeLabel(locale, '행운의 룰렛 회전 중…', 'Spinning the Wheel…', '回転中…', '转盘旋转中…')
              : canSpinToday
                ? localeLabel(locale, '오늘의 무료 스핀 돌리기', 'Spin Daily Free Wheel', '本日の無料スピン', '免费开启今日幸运转盘')
                : localeLabel(locale, '오늘의 스핀 완료 (내일 다시 도전)', 'Completed for Today', '本日のスピン完了', '今日已抽取')}
          </span>
        </Button>
      </div>

      {/* 당첨 결과 배너 & 바이럴 공유 연동 */}
      {winningSlot && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-muted-foreground block">
                  {localeLabel(locale, '룰렛 당첨 축하금 지급 완료', 'Reward Claimed', '当選金受取完了', '奖励领取成功')}
                </span>
                <span className="text-base font-black text-amber-500 font-mono">
                  +{groupDigits(winningSlot.amount.toString())} WLD
                </span>
              </div>
            </div>
            <Badge className="bg-amber-500 text-black font-black text-xs px-2 py-0.5">
              SUCCESS
            </Badge>
          </div>

          {/* 소셜 공유 바 탑재 */}
          <SocialShareBar
            title={`🎉 오늘 머니버스 행운의 룰렛에서 ${winningSlot.label}에 당첨되었습니다!`}
            description="매일 100% 당첨되는 가상 금융 지원금 룰렛을 돌려보세요."
            hashtags={['머니버스', '행운의룰렛', '출석체크', '가상금융', '재테크']}
          />
        </div>
      )}
    </div>
  );
}
