import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
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
  TrendingDown,
  Zap,
  Calendar,
  Clock,
  Award,
  Layers,
  BookOpen,
  Wallet,
  Send,
  PieChart,
  Calculator,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '월덕 머니버스 실전 이용 가이드 — 3분 마스터 & 통합 로드맵',
  description:
    '월덕 머니버스의 가상경제 생태계를 3분 만에 마스터하는 공식 실전 이용 가이드. 정착금 10,000 WLD 수령부터 토스형 자산 대시보드, 가상 주식 실시간 매매 및 보유 주식 즉시 판매, 월덕뱅크 복리 예금, 1:1 간편 송금까지 체계적으로 안내합니다.',
  alternates: { canonical: canonicalUrl('/guide') },
};

export default async function GuidePage() {
  const locale = await getServerLocale();
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
          <span>공식 실전 이용 가이드 2026 최신판</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
          {localeLabel(
            locale,
            '3분 만에 마스터하는 월덕 머니버스',
            'Master Woldeok Moneyverse in 3 Minutes',
            '3分でマスターするウォルドク・マネーバース',
            '3分钟玩转月德虚拟金融元宇宙',
            'Làm chủ Woldeok Moneyverse trong 3 phút'
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          월덕 머니버스는 <strong className="text-slate-200">“자산 관리 → 모의 투자 → 복리 성장”</strong>으로 이어지는 100% 안전한 지속형 가상 금융경제 시뮬레이터입니다.
          실제 현금 충전이나 손실 없이 가상 화폐(WLD)로 실전 금융과 거시경제를 체험할 수 있습니다.
        </p>
      </div>

      {/* 2. 핵심 요약 카드: 첫 3분 온보딩 루프 (Toss Bento Style) */}
      <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-[#121929] via-[#0d131f] to-[#090d14] border border-slate-700/60 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center">
              <Zap className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">처음 시작하시나요? 첫 3분 입문 로드맵</h2>
              <p className="text-xs text-slate-400">가입 즉시 5단계로 가상 금융경제의 핵심 흐름을 완벽히 마스터하세요</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 text-xs">
            시작 정착금 10,000 WLD 무료 지급
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {[
            {
              step: '1',
              title: '시작 & 정착금 수령',
              desc: '가입 즉시 지갑에 10,000 WLD가 안전하게 자동 지급됩니다.',
              href: '/wallet',
            },
            {
              step: '2',
              title: '홈 대시보드 탐색',
              desc: '토스형 벤토 카드에서 순자산과 실시간 급등락 TOP 4를 확인합니다.',
              href: '/',
            },
            {
              step: '3',
              title: '가상 주식 매수/매도',
              desc: '10대 상장사 호가창에서 매수하고, 지갑에서 원터치 즉시 매도합니다.',
              href: '/stocks',
            },
            {
              step: '4',
              title: '월덕뱅크 복리 예금',
              desc: '남는 현금을 예금에 넣어 매일 실시간 복리 이자를 적립합니다.',
              href: '/bank',
            },
            {
              step: '5',
              title: '1:1 간편 송금 & 도구',
              desc: '친구에게 WLD를 즉시 송금하고 12대 금융 계산기를 활용합니다.',
              href: '/wallet',
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all block group"
            >
              <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black grid place-items-center group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <p className="text-xs font-black text-slate-100 pt-0.5 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. 최신 핵심 경제 서피스별 상세 가이드 (4대 벤토 카드) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-black text-slate-100">핵심 기능별 상세 이용 가이드</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. 가상 주식 거래소 & 보유 주식 관리 */}
          <div className="p-6 space-y-4 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-lg hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">가상 주식 거래소 & 보유 주식 매도</h3>
                  <p className="text-xs text-slate-400">10대 가상 상장사 모의투자 및 원터치 판매</p>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[11px]">
                실시간 10단 호가
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>실시간 10단 호가창 & 차트 분석</span>
                </p>
                <p className="text-slate-400 pl-5">
                  매수/매도 잔량 불균형과 체결 틱, 9대 거시경제 지표를 확인하며 시장가/지정가 주문을 실행합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-rose-400" />
                  <span>보유 주식 확인 & 즉시 판매(매도)</span>
                </p>
                <p className="text-slate-400 pl-5">
                  <strong className="text-slate-200">내 지갑(`/wallet`)</strong>과 <strong className="text-slate-200">포트폴리오(`/stocks/portfolio`)</strong>에서 내가 가진 모든 주식의 수량, 평단가, 실시간 손익률을 확인하고, 빨간색 <strong className="text-rose-400">[매도]</strong> 버튼으로 언제든 원클릭 현금화할 수 있습니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-sky-400" />
                  <span>3섹터 분산 투자 & 리밸런싱</span>
                </p>
                <p className="text-slate-400 pl-5">
                  기술/금융/제조 3대 섹터의 자산 배분 비중을 도넛 차트로 진단하고 건전한 분산 포트폴리오를 유지합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="btn-toss h-9 text-xs font-bold rounded-xl flex-1">
                <Link href="/stocks">
                  <span>거래소 바로가기</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl border-slate-700 text-slate-300 hover:text-slate-100 flex-1">
                <Link href="/stocks/portfolio">
                  <span>내 포트폴리오</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* B. 월덕뱅크 가상 은행 & 복리 예금 */}
          <div className="p-6 space-y-4 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-lg hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">월덕뱅크 가상 은행 & 복리 예금</h3>
                  <p className="text-xs text-slate-400">실시간 이자 라이브 카운팅 & 스마트 예금</p>
                </div>
              </div>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[11px]">
                일일 복리 이자
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-amber-400" />
                  <span>단일 통장 원카드 & 채우기/보내기</span>
                </p>
                <p className="text-slate-400 pl-5">
                  토스뱅크 방식의 직관적인 단일 카드에서 예금 잔액과 실시간 적립 중인 미수령 이자를 1초 단위로 확인하고 즉시 수령합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>저축 팟(Savings Pot) & 목적별 포켓</span>
                </p>
                <p className="text-slate-400 pl-5">
                  비상금, 주식 투자금, 목표 구매금 등 목적별 저축 포켓을 자유롭게 개설하고 목표 달성률을 링 차트로 추적합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-purple-400" />
                  <span>스마트 가상 신용 대출 & KTB 국채</span>
                </p>
                <p className="text-slate-400 pl-5">
                  신용등급에 따른 마이너스 대출 한도 조회와 가상 국채(KTB) 만기 수익률 시뮬레이션을 제공합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="btn-toss h-9 text-xs font-bold rounded-xl flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950">
                <Link href="/bank">
                  <span>은행 통장 열기</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl border-slate-700 text-slate-300 hover:text-slate-100 flex-1">
                <Link href="/guide/virtual-banking">
                  <span>복리 전략 가이드</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* C. 가상 지갑 & 1:1 간편 송금 */}
          <div className="p-6 space-y-4 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-lg hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-sky-500/15 text-sky-400 grid place-items-center">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">내 지갑 & 1:1 간편 송금</h3>
                  <p className="text-xs text-slate-400">통합 자산 관리 & 무손실 복식부기 원장</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sky-400 border-sky-500/30 text-[11px]">
                원장 안전 보장
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-sky-400" />
                  <span>3분할 자산 스트립 (현금/예금/주식)</span>
                </p>
                <p className="text-slate-400 pl-5">
                  즉시 사용 가능한 유동 현금, 은행 예치금, 실시간 주식 평가액이 자동 합산된 순자산을 직관적으로 파악합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>수수료 없는 1:1 간편 송금</span>
                </p>
                <p className="text-slate-400 pl-5">
                  상대방의 유저 ID 또는 지갑 주소를 입력해 수수료 없이 WLD를 즉시 실시간 송금합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-amber-400" />
                  <span>일일 보상 & 출석 체크</span>
                </p>
                <p className="text-slate-400 pl-5">
                  매일 지갑 페이지에서 일일 활동 보상 및 출석 보너스를 원클릭으로 수령할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="btn-toss h-9 text-xs font-bold rounded-xl flex-1 bg-sky-500 hover:bg-sky-600 text-slate-950">
                <Link href="/wallet">
                  <span>내 지갑 확인하기</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl border-slate-700 text-slate-300 hover:text-slate-100 flex-1">
                <Link href="/wallet#wallet-transfer">
                  <span>간편 송금</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* D. 12대 금융 계산기 허브 & 분석 도구 */}
          <div className="p-6 space-y-4 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-lg hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-rose-500/15 text-rose-400 grid place-items-center">
                  <Calculator className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">12대 금융 계산기 & 시뮬레이터</h3>
                  <p className="text-xs text-slate-400">실생활 금융 수학 & 투자 시뮬레이션</p>
                </div>
              </div>
              <Badge variant="outline" className="text-rose-400 border-rose-500/30 text-[11px]">
                무료 금융 툴
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-rose-400" />
                  <span>대출 이자 및 원리금 균등 상환 계산</span>
                </p>
                <p className="text-slate-400 pl-5">
                  원리금 균등, 원금 균등, 만기 일시 상환 방식별 월 납입금과 총 이자 지출을 정밀 비교합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>복리 이자 & 저축 목표 역산</span>
                </p>
                <p className="text-slate-400 pl-5">
                  초기 원금과 매월 적립액, 기대 수익률에 따른 72의 법칙 복리 자산 곡선을 시각화합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-sky-400" />
                  <span>주식 물타기(DCA) & 평단가 계산</span>
                </p>
                <p className="text-slate-400 pl-5">
                  추가 매수 수량과 가격에 따른 최종 평단가와 목표 탈출 가격을 손쉽게 시뮬레이션합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button asChild size="sm" className="btn-toss h-9 text-xs font-bold rounded-xl flex-1 bg-rose-500 hover:bg-rose-600 text-slate-950">
                <Link href="/tools">
                  <span>계산기 전체보기</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl border-slate-700 text-slate-300 hover:text-slate-100 flex-1">
                <Link href="/tools/compound-interest">
                  <span>복리 계산기</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 하루 5분 데일리 마스터 루프 (Daily Habit Loop) */}
      <div className="p-6 sm:p-7 space-y-5 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="size-4.5 text-sky-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-100">바쁜 분들을 위한 실전 5분 데일리 루프</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-sky-400">Step 1 (0:00 ~ 0:30)</span>
            <p className="text-sm font-bold text-slate-100">홈 대시보드 점검</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              순자산 변동과 실시간 급등락 TOP 4 종목을 가볍게 확인합니다.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-emerald-400">Step 2 (0:30 ~ 1:30)</span>
            <p className="text-sm font-bold text-slate-100">은행 복리 이자 수령</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              월덕뱅크에서 밤사이 적립된 일일 복리 이자를 원클릭으로 챙깁니다.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-amber-400">Step 3 (1:30 ~ 3:30)</span>
            <p className="text-sm font-bold text-slate-100">보유 주식 점검 및 매도</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              수익률이 목표치에 도달한 종목은 차익 실현(매도)하고 저평가 종목을 매수합니다.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-purple-400">Step 4 (3:30 ~ 5:00)</span>
            <p className="text-sm font-bold text-slate-100">잉여 자금 예금 저축</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              매도 대금과 유휴 현금을 은행 통장에 채워 넣어 내일 이자를 극대화합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 5. 7일차 주간 성장 사다리 (D1 ~ D7) */}
      <div className="p-6 sm:p-7 space-y-5 bg-[#0f1422] border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="size-4.5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-100">초보에서 자산가로: 7일 성장 로드맵</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { day: 'D1', title: '정착과 계좌 개설', desc: '10,000 WLD 수령 후 홈 대시보드 및 지갑 잔액 확인' },
            { day: 'D2', title: '첫 모의 주식 매수', desc: '거래소에서 우량 가상 종목 1주 매수 후 호가 변동 관찰' },
            { day: 'D3', title: '첫 주식 매도(판매)', desc: '지갑 또는 포트폴리오에서 보유 주식을 직접 매도해 보기' },
            { day: 'D4', title: '월덕뱅크 복리 예금', desc: '현금의 50%를 은행에 예치하고 일일 복리 이자 체험' },
            { day: 'D5', title: '목적별 저축 포켓', desc: '목돈 모으기용 세이빙 포켓을 만들어 목표 설정하기' },
            { day: 'D7', title: '포트폴리오 주간 결산', desc: '3섹터 분산 비중과 순자산 성장률을 종합 진단하기' },
          ].map((item) => (
            <div key={item.day} className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
              <div className="size-8 rounded-xl bg-slate-800 text-emerald-400 font-mono font-black text-xs grid place-items-center shrink-0">
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

      {/* 6. 서브 가이드 상세 허브 링크 */}
      <div className="p-6 space-y-4 bg-[#0f1422] border border-slate-800 rounded-3xl">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-100">주제별 심화 전문 가이드</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/guide/stock-trading"
            className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
                가상 주식 실전 매매 & 호가창 분석
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">10단 호가, 체결 틱, 분할 매매</p>
            </div>
            <ChevronRight className="size-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href="/guide/virtual-banking"
            className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                가상 금융 & 복리 예금·국채 전략
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">복리 공식, 세이빙 포켓, 국채</p>
            </div>
            <ChevronRight className="size-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            href="/guide/glossary"
            className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-black text-slate-100 group-hover:text-sky-400 transition-colors">
                가상경제 핵심 용어 사전
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">호가창, 미실현손익, 복식부기</p>
            </div>
            <ChevronRight className="size-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* 7. 안전 가이드라인 고지 (100% 무손실 원칙) */}
      <div className="p-5 sm:p-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-start gap-3.5 text-xs text-slate-400">
        <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-200">100% 무손실 가상경제 시뮬레이션 원칙</p>
          <p className="leading-relaxed [word-break:keep-all]">
            월덕 머니버스의 모든 자산과 화폐(WLD)는 건전한 금융 학습과 커뮤니티 시뮬레이션을 위해 설계된 가상 데이터입니다.
            실제 현금 결제나 충전, 외부 현금화는 일절 지원하지 않으며, 어떠한 금전적 위험 없이 안전하게 주식 모의투자, 복리 이자, 자산 배분 전략을 실습할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
