import type { Metadata } from 'next';
import { ArrowRight, Check, Compass, Gift, Sparkles, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: '신규 사용자 UX 시안',
  description: '월덕 머니버스 신규 사용자 경험을 위한 세 가지 홈 화면 시안입니다.',
  robots: { index: false, follow: false },
};

const variants = [
  {
    number: '01',
    name: '첫 미션',
    headline: '처음 방문한 분도\n3분 안에 시작하게',
    reason: '가입 후 무엇을 해야 하는지 바로 보이게 해, 로그인 전 이탈을 줄이는 온보딩 중심안입니다.',
    gradient: 'from-[#234e3a] via-[#1a3428] to-[#12221a]',
    accent: 'bg-[#f0d4c7] text-[#512b20]',
  },
  {
    number: '02',
    name: '커뮤니티 펄스',
    headline: '지금 함께하는\n사람과 활동을 먼저',
    reason: '활성 커뮤니티의 신호를 첫 화면에서 보여 주어 Discord 참여 동기를 만드는 신뢰 중심안입니다.',
    gradient: 'from-[#17372a] via-[#2e6047] to-[#193326]',
    accent: 'bg-[#d8eadf] text-[#183b2a]',
  },
  {
    number: '03',
    name: '경제 탐험',
    headline: '활동 → 보상 → 상점을\n한 번에 이해하게',
    reason: 'WLD가 어떻게 쓰이는지 투명하게 설명해, 게임 경제의 재미와 안전성을 동시에 전달하는 구조입니다.',
    gradient: 'from-[#3d3829] via-[#234a37] to-[#162c22]',
    accent: 'bg-[#f5deb0] text-[#543b18]',
  },
] as const;

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-10 md:py-16">
      <header className="grid gap-5 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow mb-4">Stitch-informed UX exploration</p>
          <h1 className="text-4xl md:text-5xl">신규 사용자 유입을 위한 홈 화면 3안</h1>
          <p className="mt-5 max-w-2xl leading-8 text-muted-foreground [word-break:keep-all]">
            처음 온 사용자가 서비스 정체성, 첫 행동, 커뮤니티의 재미를 빠르게 이해하도록 설계한
            비교용 시안입니다. 실제 운영 화면에는 선택한 한 안만 다듬어 반영합니다.
          </p>
        </div>
        <p className="rounded-full border bg-surface px-4 py-2 text-sm text-muted-foreground">
          프로토타입 · 검색 제외
        </p>
      </header>

      <section aria-label="디자인 시안 비교" className="grid gap-8 xl:grid-cols-3">
        {variants.map((variant, index) => (
          <article key={variant.number} className="grid gap-5">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-sm font-bold tracking-[0.18em] text-clay-ink">{variant.number}</p>
              <p className="text-sm font-bold text-muted-foreground">{variant.name}</p>
            </div>
            <ConceptFrame variant={variant} index={index} />
            <div className="rounded-2xl border bg-surface p-5 shadow-plate">
              <h2 className="text-xl">{variant.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground [word-break:keep-all]">
                {variant.reason}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-[28px] border bg-mint p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="eyebrow mb-3">Recommended direction</p>
          <h2 className="text-2xl">추천: 01 첫 미션 + 02 커뮤니티 펄스의 활동 카드</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground [word-break:keep-all]">
            신규 사용자는 시작할 이유와 다음 행동을 동시에 필요로 합니다. 첫 미션의 명확한 경로를
            중심으로 두고, 실제 운영 데이터가 준비되면 커뮤니티 활동 카드를 보조 신호로 붙이는 조합이
            가장 안전합니다.
          </p>
        </div>
        <a href="#concept-1" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 text-sm font-extrabold text-white">
          1안 다시 보기 <ArrowRight className="size-4" />
        </a>
      </section>
    </main>
  );
}

function ConceptFrame({ variant, index }: { readonly variant: (typeof variants)[number]; readonly index: number }) {
  return (
    <div id={`concept-${index + 1}`} className={`min-h-[570px] overflow-hidden rounded-[28px] bg-gradient-to-br ${variant.gradient} p-4 text-white shadow-raised`}>
      <div className="flex items-center justify-between border-b border-white/15 pb-3 text-xs font-bold">
        <span className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded bg-[#dcebe1] text-[#214b38]">W</span> 월덕 머니버스</span>
        <span className="text-white/60">로그인</span>
      </div>
      {index === 0 && <FirstMission variant={variant} />}
      {index === 1 && <CommunityPulse variant={variant} />}
      {index === 2 && <EconomyExplorer variant={variant} />}
    </div>
  );
}

function FirstMission({ variant }: { readonly variant: (typeof variants)[number] }) {
  return <div className="grid gap-7 px-2 pt-10"><p className="text-xs font-bold tracking-[0.16em] text-[#f0d4c7]">YOUR FIRST DAY</p><h3 className="whitespace-pre-line text-4xl leading-[1.15]">{variant.headline}</h3><p className="text-sm leading-6 text-white/70">Discord 커뮤니티 활동을 WLD 기록과 게임 보상으로 이어가 보세요.</p><button className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold ${variant.accent}`}>첫 활동 시작하기 <ArrowRight className="size-4" /></button><div className="grid gap-2 rounded-2xl bg-white/10 p-4">{['로그인하고 이용 동의하기', '오늘의 첫 퀘스트 확인하기', '보상 기록과 상점 둘러보기'].map((step, i) => <div key={step} className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-white/15 text-xs">{i + 1}</span>{step}{i === 0 && <Check className="ml-auto size-4 text-[#d8eadf]" />}</div>)}</div></div>;
}

function CommunityPulse({ variant }: { readonly variant: (typeof variants)[number] }) {
  return <div className="grid gap-6 px-2 pt-10"><p className="text-xs font-bold tracking-[0.16em] text-[#d8eadf]">COMMUNITY PULSE</p><h3 className="whitespace-pre-line text-4xl leading-[1.15]">{variant.headline}</h3><div className="grid grid-cols-2 gap-3"><Metric icon={<Users />} value="128" label="이번 주 활동"/><Metric icon={<Gift />} value="24" label="진행 중 퀘스트"/></div><div className="grid gap-2 rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-white/60">최근 커뮤니티 활동</p>{['시즌 3 참여 안내가 올라왔어요', '새로운 상점 아이템을 확인해 보세요', '오늘의 퀘스트가 갱신됐어요'].map((entry) => <div key={entry} className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-[#d8eadf]" />{entry}</div>)}</div><button className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold ${variant.accent}`}>커뮤니티에 참여하기 <ArrowRight className="size-4" /></button></div>;
}

function EconomyExplorer({ variant }: { readonly variant: (typeof variants)[number] }) {
  return <div className="grid gap-6 px-2 pt-10"><p className="text-xs font-bold tracking-[0.16em] text-[#f5deb0]">HOW THE ECONOMY WORKS</p><h3 className="whitespace-pre-line text-4xl leading-[1.15]">{variant.headline}</h3><div className="grid gap-2">{[[Compass, '활동하기', '퀘스트와 커뮤니티 활동'], [Gift, 'WLD 받기', '게임 안의 보상 기록'], [Sparkles, '상점 이용', 'WLD로 아이템 교환']].map(([Icon, title, description]) => { const I = Icon as typeof Compass; return <div key={title as string} className="flex items-center gap-3 rounded-xl bg-white/10 p-3"><I className="size-5 text-[#f5deb0]"/><span><b className="block text-sm">{title as string}</b><small className="text-xs text-white/60">{description as string}</small></span></div>; })}</div><p className="rounded-xl border border-white/15 p-3 text-xs leading-5 text-white/65">WLD는 서비스 내 가상 데이터이며 현금 거래·환전 기능은 제공하지 않습니다.</p><button className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold ${variant.accent}`}>이용 방법 알아보기 <ArrowRight className="size-4" /></button></div>;
}

function Metric({ icon, value, label }: { readonly icon: React.ReactNode; readonly value: string; readonly label: string }) {
  return <div className="rounded-2xl bg-white/10 p-4"><span className="text-[#d8eadf]">{icon}</span><b className="mt-3 block text-2xl">{value}</b><small className="text-xs text-white/60">{label}</small></div>;
}
