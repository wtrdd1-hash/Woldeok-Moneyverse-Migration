'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Briefcase,
  Landmark,
  TrendingUp,
  Store,
  Flame,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

interface FlowNode {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  role: string;
  description: string;
  descriptionEn: string;
  inflow: string;
  outflow: string;
  link: string;
  linkLabel: string;
  icon: typeof Briefcase;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const FLOW_NODES: FlowNode[] = [
  {
    id: 'node-mint',
    name: '1. 생산 및 활동 (노동 채굴)',
    nameEn: '1. Production & Work',
    category: 'WLD 화폐 공급원 (MINT)',
    role: '퀘스트 출석 및 8대 전문 직업 완수를 통해 시스템에서 신규 WLD가 안전하게 발행됩니다.',
    description:
      '사용자가 정당한 활동(출석, 직업 업무, NPC 주문)을 수행하면 서버 권위적 트랜잭션을 통해 지갑 원장에 WLD가 생성(Mint)되고 직업 경험치가 부여됩니다. 일일 배정 한도로 과도한 통화 발행을 엄격히 통제합니다.',
    descriptionEn:
      'Users mint WLD through verified check-ins, job assignments, and NPC quests. Server daily caps prevent hyperinflation.',
    inflow: '유저의 시간 및 활동 노력',
    outflow: '지갑 원장으로 WLD 급여 지급',
    link: '/work',
    linkLabel: '잡보드(직업) 가기',
    icon: Briefcase,
    accentColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'node-banking',
    name: '2. 가상 금융 (이자 자산 증식)',
    nameEn: '2. Virtual Banking',
    category: '금융 레버리지 및 저축 (ACCUMULATE)',
    role: '복리 예금에 자금을 예치하여 일복리 이자를 거두거나 가상 국채로 고수익을 확정합니다.',
    description:
      '모은 WLD를 은행에 예치하면 매일 일복리 0.5%가 원금에 더해져 가속 증식됩니다. 7일/30일 만기 국채는 시장 변동과 무관하게 국고에서 100% 원금과 이자를 보증 지급합니다.',
    descriptionEn:
      'Deposit funds into Compound Savings to earn daily 0.5% interest. Treasury bonds offer guaranteed yields backed by the treasury.',
    inflow: '유저 여유 자금 예치',
    outflow: '일일 복리 이자 및 국채 만기 정산',
    link: '/bank',
    linkLabel: '가상 은행 가기',
    icon: Landmark,
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'node-invest',
    name: '3. 투자 및 경영 (자본 확장)',
    nameEn: '3. Investment & Enterprises',
    category: '기업 지분 및 배당 (EXPAND)',
    role: '10대 상장사 주식 매매 및 나만의 스타트업 창업을 통해 패시브 배당 소득을 획득합니다.',
    description:
      '월덕거래소에서 실시간 10-Depth 호가창으로 주식을 매매하여 시세 차익과 배당금을 수령하고, 마이비즈에서 법인을 창업하여 매일 기업 운영 이익을 일괄 정산받습니다.',
    descriptionEn:
      'Trade 10 listed equities on real-time orderbooks and found startups to collect daily corporate dividends.',
    inflow: '주식 매수 대금 및 창업 투자금',
    outflow: '일일 주주 배당금 & 시세 차익',
    link: '/stocks',
    linkLabel: '거래소 가기',
    icon: TrendingUp,
    accentColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'node-commerce',
    name: '4. 소비 및 교환 (상점 & 마켓)',
    nameEn: '4. Commerce & Marketplace',
    category: '경제 순환 및 생산성 부스트 (COMMERCE)',
    role: '생산성 도구/물약을 구매하여 직업 효율을 올리고 유저 간 P2P 아이템을 거래합니다.',
    description:
      '덕마켓에서 작업 보너스 장비와 피로도 회복 포션을 구입하여 노동 생산성을 극대화합니다. 마켓플레이스에서는 유저 간 경매 및 직거래를 통해 자유로운 아이템 유통이 이루어집니다.',
    descriptionEn:
      'Acquire productivity boosters and stamina potions in the shop. Trade unique items via P2P marketplace auctions.',
    inflow: '아이템 구매 대금 및 경매 입찰금',
    outflow: '생산성 버프 장비 & 거래 아이템',
    link: '/shop',
    linkLabel: '아이템 상점 가기',
    icon: Store,
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'node-burn',
    name: '5. 국고 비축 & 자동 소각 (통화 안정)',
    nameEn: '5. Treasury & Auto-Burn',
    category: '디플레이션 밸런싱 (STABILITY & SINK)',
    role: '거래 수수료 및 클럽 창설 비용이 국고로 유입되고 일부가 영구 소각되어 통화 가치를 보존합니다.',
    description:
      '주식 매매 수수료(0.05%), 마켓플레이스 거래세(2%), 클럽 창설비(10,000 WLD) 등이 국고 금고로 환류되며, 일정 비율이 영구 소각(Burn)되어 화폐 가치 하락과 인플레이션을 방어합니다.',
    descriptionEn:
      'Trading fees (0.05%), marketplace taxes (2%), and club founding fees (10,000 WLD) flow into the treasury; portions are burned to stabilize WLD value.',
    inflow: '거래세, 수수료, 창설비',
    outflow: '영구 소각(소멸) & 국고 재정 지원',
    link: '/wallet/activity',
    linkLabel: '원장 활동 내역 보기',
    icon: Flame,
    accentColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
];

export function EconomyFlowDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-mint');
  const fallbackNode: FlowNode = FLOW_NODES[0]!;
  const activeNode: FlowNode = FLOW_NODES.find((n) => n.id === selectedNodeId) ?? fallbackNode;
  const ActiveIcon = activeNode.icon;

  return (
    <section
      aria-labelledby="flow-diagram-heading"
      className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-background p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2 pb-6 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500 mb-2">
            <Layers className="size-3.5" />
            <span>INTERACTIVE ECONOMIC CYCLE</span>
          </div>
          <h2 id="flow-diagram-heading" className="text-2xl font-black tracking-tight sm:text-3xl">
            <T korean="가상경제 5대 선순환 아키텍처" english="5-Pillar Economic Cycle Architecture" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 [word-break:keep-all]">
            <T
              korean="머니버스의 WLD는 단순 보상이 아닌, 발행 ➔ 증식 ➔ 투자 ➔ 소비 ➔ 소각으로 이어지는 정밀한 경제 순환 모델 위에서 작동합니다."
              english="WLD operates on a sustainable closed-loop economy: Mint ➔ Accumulate ➔ Invest ➔ Consume ➔ Burn."
            />
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs border-indigo-500/40 bg-indigo-500/5 text-indigo-400">
          복식부기 실시간 무손실 원장
        </Badge>
      </div>

      {/* Interactive 5 Nodes Row (Clickable) */}
      <div className="grid gap-2.5 pt-6 sm:grid-cols-5">
        {FLOW_NODES.map((node, idx) => {
          const isSelected = selectedNodeId === node.id;
          const Icon = node.icon;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className={cn(
                'group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 outline-none',
                isSelected
                  ? 'border-primary/80 bg-primary/10 shadow-md ring-1 ring-primary/40'
                  : 'border-border/70 bg-card/60 hover:border-border hover:bg-card/90',
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn('grid size-8 place-items-center rounded-xl transition-colors', node.bgColor, node.accentColor)}>
                  <Icon className="size-4" />
                </span>
                <span className="font-mono text-[10px] font-black text-muted-foreground">
                  0{idx + 1}
                </span>
              </div>

              <div className="mt-3">
                <div className={cn('text-xs font-bold leading-tight line-clamp-1', isSelected ? 'text-foreground font-black' : 'text-foreground/80')}>
                  {node.name.split('(')[0]}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                  {node.category.split('(')[0]}
                </div>
              </div>

              {isSelected && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Node Deep Dive Bento Panel */}
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-xl sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold', activeNode.bgColor, activeNode.accentColor)}>
                <ActiveIcon className="size-3.5" />
                <span>{activeNode.category}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              <T korean={activeNode.name} english={activeNode.nameEn} />
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 [word-break:keep-all]">
              <T korean={activeNode.description} english={activeNode.descriptionEn} />
            </p>

            <div className="pt-2">
              <Button asChild className="min-h-[44px] font-bold">
                <Link href={activeNode.link}>
                  <span>{activeNode.linkLabel}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Inflow & Outflow Card */}
          <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
              자금 및 가치 흐름 (VALUE FLOW)
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                  INFLOW
                </span>
                <span className="text-zinc-300 [word-break:keep-all]">{activeNode.inflow}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded-md bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
                  OUTFLOW
                </span>
                <span className="text-zinc-300 [word-break:keep-all]">{activeNode.outflow}</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-zinc-950/80 p-3 text-[11px] text-zinc-400 border border-zinc-800/60 leading-relaxed [word-break:keep-all]">
              💡 {activeNode.role}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
