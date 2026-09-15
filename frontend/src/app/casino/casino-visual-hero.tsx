import { Coins, Dice5, Gem, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GAME_ART = [
  { icon: Coins, label: 'COIN', detail: '50 / 50', className: 'from-amber-400/30 to-orange-500/5' },
  { icon: Dice5, label: 'DICE', detail: '1–6', className: 'from-violet-400/30 to-fuchsia-500/5' },
  { icon: Gem, label: 'GEMS', detail: 'LUCKY', className: 'from-cyan-400/30 to-blue-500/5' },
] as const;

export function CasinoVisualHero() {
  return (
    <Card className="relative overflow-hidden border-amber-400/20 bg-slate-950 text-white shadow-2xl">
      <div className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-amber-400/15 blur-3xl" />
      <CardContent className="relative grid gap-5 p-5 lg:grid-cols-[1fr_1.35fr] lg:items-center lg:p-7">
        <div>
          <div className="mb-3 flex items-center gap-2 text-amber-300">
            <Sparkles className="size-5" aria-hidden="true" />
            <span className="text-xs font-black tracking-[0.22em]">LUCKY ZONE ARCADE</span>
          </div>
          <p className="text-2xl font-black tracking-tight sm:text-3xl">한 판은 짧게, 결과는 선명하게</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
            동전·주사위·슬롯 테마를 한 화면에서 즐기고, 모든 확률과 WLD 정산은 서버가 결정합니다.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/55">
            <Trophy className="size-4 text-amber-300" aria-hidden="true" />
            승패 연출은 결과를 바꾸지 않으며 실제 현금 환전은 지원하지 않습니다.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {GAME_ART.map(({ icon: Icon, label, detail, className }) => (
            <div
              key={label}
              className={`group rounded-3xl border border-white/10 bg-gradient-to-b ${className} p-4 text-center shadow-lg transition-transform hover:-translate-y-0.5`}
            >
              <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-black/25 shadow-inner sm:size-16">
                <Icon className="size-8 drop-shadow" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <p className="mt-3 text-[11px] font-black tracking-[0.18em] text-white/65">{label}</p>
              <p className="mt-1 text-sm font-black text-white">{detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
