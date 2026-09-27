import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Sparkles, ArrowRight, ShieldCheck, Zap, TrendingUp, Landmark, Briefcase } from 'lucide-react';

interface InvitePageProps {
  readonly params: Promise<{ readonly code: string }>;
}

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `[초대장] 1,000만 WLD 스타터 패키지가 도착했습니다! (코드: ${code}) | 월덕 머니버스`,
    description: `친구 초대로 월덕 머니버스에 가입하고 1,000만 WLD 시드머니와 에너지 회복 포션을 즉시 수령하세요. 가상 주식, 복리 예금, 직업 파밍의 세계로 초대합니다.`,
    openGraph: {
      title: `1,000만 WLD 초대장 도착! (초대코드: ${code})`,
      description: '지금 가입하면 즉시 1,000만 WLD + 스타터 지원 상자를 지급받을 수 있습니다.',
      url: `https://easy-scraping.com/invite/${code}`,
      type: 'website',
    },
  };
}

export default async function InviteLandingPage({ params }: InvitePageProps) {
  const { code } = await params;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      {/* 히어로 섹션 */}
      <div className="relative pt-20 pb-16 px-4 max-w-4xl mx-auto text-center">
        {/* 네온 글로우 */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-6 animate-pulse">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>초대 코드: {code} 인증 완료</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          축하합니다! <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
            1,000만 WLD 지원금
          </span>
          이 도착했습니다
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          친구의 특별 초대로 월덕 머니버스에 오신 것을 환영합니다. <br className="hidden sm:inline" />
          지금 시작하시면 주식 투자 및 복리 예금에 즉시 활용 가능한 스타터 자금을 100% 무료로 드립니다.
        </p>

        {/* 메인 보상 수령 CTA 카드 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-amber-500/40 shadow-2xl max-w-xl mx-auto relative overflow-hidden mb-12">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <span className="text-xs font-bold text-zinc-400 uppercase">신규 가입자 웰컴 패키지</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              즉시 지급 확정
            </span>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-white">초기 투자 시드머니</span>
              </div>
              <span className="text-base font-black text-amber-300 font-mono">+10,000,000 WLD</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">에너지 피로회복제</span>
              </div>
              <span className="text-base font-black text-emerald-400 font-mono">5개 (즉시 충전)</span>
            </div>
          </div>

          <Link
            href={`/auth/login?invite=${code}`}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition"
          >
            <span>1,000만 WLD 받고 시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-[11px] text-zinc-500 text-center mt-3">
            간편 로그인 후 첫 직업 파밍을 완료하면 지갑으로 보상이 자동 이체됩니다.
          </p>
        </div>

        {/* 3대 핵심 콘텐츠 소개 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <TrendingUp className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">실시간 가상 주식 거래소</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              10개 가상 기업(반도체, 바이오, 밈코인 등)의 10-Depth 호가창과 차트를 분석하며 실전 매매를 경험하세요.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <Landmark className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">가상 복리 예적금 은행</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              매일 자정 복리 이자가 원장에 쌓이는 정기예금과 적금 상품으로 안전하게 자산을 불려나가세요.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <Briefcase className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">직업 파밍 & 승진 시스템</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              인턴부터 CEO까지 승진하며 매일 일일 급여와 주말 피버 보너스를 획득하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
