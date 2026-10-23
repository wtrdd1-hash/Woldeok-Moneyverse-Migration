import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Compass,
  Coins,
  Flame,
  Landmark,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  Calendar,
  Clock,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '월덕 머니버스 실전 이용 가이드 — 3분 마스터 & 성장 로드맵',
  description:
    '월덕 머니버스의 가상경제 생태계를 3분 만에 마스터하는 공식 사용 가이드. 초보 지원금 5,000 WLD 수령부터 8대 직업 출근, 가상 주식 모의투자, 은행 저축, 일일 5분 루프까지 체계적으로 안내합니다.',
  alternates: { canonical: canonicalUrl('/guide') },
};

export default function GuidePage() {
  const guideBreadcrumb = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '이용 가이드', path: '/guide' },
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 sm:space-y-10 px-4 sm:px-6 py-4 sm:py-8 pb-28 zero-overflow-shield">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(guideBreadcrumb) }} />

      {/* 1. Header Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
          <Sparkles className="size-3.5" />
          <span>공식 사용 가이드 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
          3분 만에 마스터하는 <span className="text-emerald-400">월덕 머니버스</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          월덕 머니버스는 <strong className="text-slate-200">“벌기 → 선택하기 → 성장하기”</strong>로 이어지는 지속형 소셜 가상경제입니다.
          실제 현금이나 투자가 아니며, 100% 안전한 가상 재화(WLD)로 금융과 경제를 시뮬레이션합니다.
        </p>
      </div>

      {/* 2. 핵심 요약 카드: 첫 3분 온보딩 루프 (Toss Bento Style) */}
      <div className="toss-card toss-card-primary p-6 sm:p-8 space-y-6 bg-gradient-to-br from-[#121929] via-[#0d131f] to-[#090d14] border border-slate-700/60 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center">
              <Zap className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">처음 오셨나요? 첫 3분 입문 코스</h2>
              <p className="text-xs text-slate-400">가입 즉시 5단계로 가상경제의 흐름을 체험하세요</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-1 text-xs">
            정착금 10,000 WLD
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {[
            { step: '1', title: '계정 생성 & 정착금', desc: '10,000 WLD 무료 지급' },
            { step: '2', title: '첫 직업 출근', desc: '45초 작업 완료 + 보상' },
            { step: '3', title: '가상 주식 관심 등록', desc: '10대 가상 상장사 탐색' },
            { step: '4', title: '가상 은행 저축', desc: '연 3.2% 안전 복리 예금' },
            { step: '5', title: '일일 퀘스트 완료', desc: '시즌 경험치(EXP) 획득' },
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black grid place-items-center">
                {item.step}
              </div>
              <p className="text-xs font-black text-slate-100 pt-1">{item.title}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 4대 핵심 시스템 바로가기 그리드 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-black text-slate-100">핵심 경제 서피스 바로가기</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/stocks"
            className="toss-card p-5 space-y-3 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:scale-[1.02] transition-all group"
          >
            <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">가상 주식 거래소</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                10대 상장사의 10단 호가창과 캔들 차트를 보며 1초 모의투자를 진행합니다.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
              <span>거래소 이동</span>
              <ArrowRight className="size-3" />
            </div>
          </Link>

          <Link
            href="/work"
            className="toss-card p-5 space-y-3 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl hover:border-sky-500/50 hover:scale-[1.02] transition-all group"
          >
            <div className="size-10 rounded-2xl bg-sky-500/15 text-sky-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">8대 직업 & 파밍</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                출근 후 타이머 완료 시 WLD와 숙련도 경험치를 안전하게 정산받습니다.
              </p>
            </div>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1 pt-1">
              <span>작업장 출근</span>
              <ArrowRight className="size-3" />
            </div>
          </Link>

          <Link
            href="/bank"
            className="toss-card p-5 space-y-3 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl hover:border-amber-500/50 hover:scale-[1.02] transition-all group"
          >
            <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Landmark className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">가상 은행 & 금고</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                이자율 연 3.2%의 안전 예금과 마이너스 통장 등 가상 금융 상품을 운용합니다.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-1">
              <span>은행 방문</span>
              <ArrowRight className="size-3" />
            </div>
          </Link>

          <Link
            href="/tools"
            className="toss-card p-5 space-y-3 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl hover:border-rose-500/50 hover:scale-[1.02] transition-all group"
          >
            <div className="size-10 rounded-2xl bg-rose-500/15 text-rose-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Coins className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">20종 금융 계산기</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                복리, 주식 물타기, 배당소득세, 대출 상환 등 실생활 금융 시뮬레이터를 무료로 제공합니다.
              </p>
            </div>
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-1">
              <span>계산기 전체보기</span>
              <ArrowRight className="size-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. 일일 5분 루프 가이드 (Daily Loop) */}
      <div className="toss-card p-6 sm:p-7 space-y-5 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="size-4.5 text-sky-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-100">바쁜 현대인을 위한 5분 데일리 루프</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-sky-400">Step 1 (0:00 ~ 0:30)</span>
            <p className="text-sm font-bold text-slate-100">홈 화면 잔고 확인</p>
            <p className="text-xs text-slate-400 leading-relaxed">오늘의 경제 지표와 실시간 인기 주식 TOP 3를 훑어봅니다.</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-emerald-400">Step 2 (0:30 ~ 2:00)</span>
            <p className="text-sm font-bold text-slate-100">직업 출근 & 보상 수령</p>
            <p className="text-xs text-slate-400 leading-relaxed">작업장에 출근하여 45~90초 타이머 후 WLD 수당을 정산받습니다.</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-amber-400">Step 3 (2:00 ~ 4:00)</span>
            <p className="text-sm font-bold text-slate-100">모의투자 & 예금 저축</p>
            <p className="text-xs text-slate-400 leading-relaxed">거래소에서 매매하거나 유휴 자금을 가상 은행에 안전하게 예치합니다.</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-purple-400">Step 4 (4:00 ~ 5:00)</span>
            <p className="text-sm font-bold text-slate-100">일일 퀘스트 완료</p>
            <p className="text-xs text-slate-400 leading-relaxed">퀘스트 보상으로 시즌 경험치를 챙기고 내일 성장을 준비합니다.</p>
          </div>
        </div>
      </div>

      {/* 5. 7일차 주간 성장 사다리 (D1 ~ D7) */}
      <div className="toss-card p-6 sm:p-7 space-y-5 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="size-4.5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-100">D1 ~ D7 주간 성장 사다리</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { day: 'D1', title: '입문과 정착', desc: '초보 지원금 수령, 프로필 설정, 첫 배송 작업 완료' },
            { day: 'D2', title: '가상 시장 탐색', desc: '관심 종목 1개 등록 및 첫 모의 매수 튜토리얼' },
            { day: 'D3', title: '스타터 수집 세트', desc: '상점에서 스타터 아이템 구매 및 인벤토리 확인' },
            { day: 'D4', title: '가상 은행 저축', desc: '복리 예금 상품 가입 및 일일 이자 정산 경험' },
            { day: 'D5', title: '직업 숙련도 상승', desc: '연속 출근을 통해 숙련도 티어 승격 및 수당 증액' },
            { day: 'D7', title: '주간 결산 리포트', desc: '일주일간의 수입/지출 및 포트폴리오 수익률 결산' },
          ].map((item) => (
            <div key={item.day} className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
              <div className="size-8 rounded-xl bg-slate-800 text-emerald-400 font-fintech font-black text-xs grid place-items-center shrink-0">
                {item.day}
              </div>
              <div>
                <p className="text-xs font-black text-slate-100">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 안전 가이드라인 고지 */}
      <div className="toss-card p-5 sm:p-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-start gap-3.5 text-xs text-slate-400">
        <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-200">100% 무손실 가상경제 원칙</p>
          <p className="leading-relaxed [word-break:keep-all]">
            월덕 머니버스의 모든 자산과 화폐(WLD)는 커뮤니티 게임을 위해 설계된 가상 데이터입니다.
            실제 현금 충전이나 출금은 불가능하며, 금전적 손실 없이 안전하게 복리, 주식, 사업 등 거시 경제의 원리를 학습하고 즐길 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
