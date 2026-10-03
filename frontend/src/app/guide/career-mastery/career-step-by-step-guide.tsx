'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  Landmark,
  Building2,
  Cpu,
  Coins,
  ShieldCheck,
  Newspaper,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Layers,
  BarChart3,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { playWinSound, playCoinCollectSound } from '@/lib/audio-effects';

export interface JobMeta {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  field: string;
  desc: string;
  sampleTask: string;
  baseSalary: string;
  strategy: string;
}

export const CAREER_GUIDE_JOBS: JobMeta[] = [
  {
    id: 'FINTECH_DEVELOPER',
    nameKo: '핀테크 개발자',
    nameEn: 'Fintech Developer',
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    field: '알고리즘 & 스마트 컨트랙트',
    desc: '거래 시스템 백엔드 API 최적화 및 스마트 컨트랙트 단위 테스트를 수행합니다.',
    sampleTask: '스마트 컨트랙트 단위 테스트 & 가스비 최적화',
    baseSalary: '1,500 ~ 4,500 WLD',
    strategy: '가장 안정적인 기본급을 제공하며, 초보자 무자본 시드머니 모으기에 가장 적합합니다.',
  },
  {
    id: 'QUANT_TRADER',
    nameKo: '퀀트 트레이더',
    nameEn: 'Quant Trader',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    field: '주식 & 호가창 파생상품',
    desc: 'WDX 10대 종목의 호가창 유동성을 공급하고 차트 변동성 알고리즘을 분석합니다.',
    sampleTask: 'WDX-20 인덱스 10-Depth 호가 분석 및 유동성 공급',
    baseSalary: '2,000 ~ 6,000 WLD',
    strategy: '주식 거래 수수료 할인 혜택과 연계되며, 주식 매매와 함께 진행 시 수익이 극대화됩니다.',
  },
  {
    id: 'CENTRAL_BANKER',
    nameKo: '중앙은행가',
    nameEn: 'Central Banker',
    icon: <Landmark className="w-5 h-5 text-amber-400" />,
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    field: '금리 정책 & 통화 유동성',
    desc: '국채 발행 심사, 통화량 공급 조절 및 중앙은행 예적금 금리 정책을 입안합니다.',
    sampleTask: '월덕 국채 30년물 발행 심사 및 유동성 감사',
    baseSalary: '2,500 ~ 7,500 WLD',
    strategy: '중앙은행 스마트 복리 포켓 예금과 결합하면 일일 수령 급여가 복리로 증식됩니다.',
  },
  {
    id: 'REAL_ESTATE_TYCOON',
    nameKo: '부동산 재벌',
    nameEn: 'Real Estate Tycoon',
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    field: '가상 부동산 & 임대 관리',
    desc: '월덕 특별시 상가 임대차 계약 관리 및 랜드마크 시세를 감정평가합니다.',
    sampleTask: '여의도 핀테크 타워 10층 임대차 계약 갱신',
    baseSalary: '2,200 ~ 6,800 WLD',
    strategy: '가상 부동산 매입 후 임대 수익을 받는 건물주 테크트리의 필수 선행 직업입니다.',
  },
  {
    id: 'AI_RESEARCHER',
    nameKo: 'AI 연구원',
    nameEn: 'AI Researcher',
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
    color: 'border-pink-500/40 bg-pink-950/20 text-pink-300',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    field: 'AI Council & 경제 추론',
    desc: 'AI 경제 위원회의 통화 정책 시나리오를 시뮬레이션하고 추론 파라미터를 검증합니다.',
    sampleTask: 'AI Council 금리 정책 몬테카를로 시뮬레이션',
    baseSalary: '2,400 ~ 7,200 WLD',
    strategy: '정책 토론 및 AI 여론 예측 베팅과 연계하여 높은 부가 보너스를 노릴 수 있습니다.',
  },
  {
    id: 'VENTURE_CAPITALIST',
    nameKo: '벤처 투자가',
    nameEn: 'Venture Capitalist',
    icon: <Coins className="w-5 h-5 text-blue-400" />,
    color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    field: '스타트업 펀딩 & 비즈니스',
    desc: '유망 가상 비즈니스의 시드 투자를 심사하고 비상장 지분을 밸류에이션합니다.',
    sampleTask: '시리즈 A 핀테크 스타트업 실사 및 지분 배분',
    baseSalary: '2,300 ~ 7,000 WLD',
    strategy: '비즈니스 창업 및 클럽 자금 조달에 특화된 고소득 직업군입니다.',
  },
  {
    id: 'SECURITY_AUDITOR',
    nameKo: '보안 감사관',
    nameEn: 'Security Auditor',
    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
    color: 'border-teal-500/40 bg-teal-950/20 text-teal-300',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    field: '트랜잭션 무결성 & 보안',
    desc: '비정상적인 다중 계정 트랜잭션 및 악성 취약점 공격 패턴을 분석하여 차단합니다.',
    sampleTask: '스마트 컨트랙트 재진입 공격 취약점 긴급 패치 감사',
    baseSalary: '2,100 ~ 6,500 WLD',
    strategy: '보안 퀘스트 및 무결성 감사 보너스가 지속적으로 적립됩니다.',
  },
  {
    id: 'MEDIA_JOURNALIST',
    nameKo: '언론 기자',
    nameEn: 'Media Journalist',
    icon: <Newspaper className="w-5 h-5 text-orange-400" />,
    color: 'border-orange-500/40 bg-orange-950/20 text-orange-300',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    field: '가상 공시 & 특파원 보도',
    desc: '월덕 머니버스 신문 1면에 실릴 속보 기사를 취재하고 기업 공시를 발행합니다.',
    sampleTask: 'WDX-01 월덕전자 3분기 실적 어닝 서프라이즈 속보 보도',
    baseSalary: '1,800 ~ 5,500 WLD',
    strategy: '신문 발행 및 여론 형성 시 추가 원고료 인센티브가 지급됩니다.',
  },
];

export const MASTERY_TIERS_GUIDE = [
  { level: 1, code: 'APPRENTICE', name: '견습 (Apprentice)', mult: '1.0x', desc: '기본 업무 수행 가능, 일일 급여 50,000 WLD 한도' },
  { level: 5, code: 'JOURNEYMAN', name: '숙련 (Journeyman)', mult: '1.2x', desc: '업무 보상 +20% 가산, 중급 업무 목록 자동 해금' },
  { level: 10, code: 'PROFESSIONAL', name: '프로 (Professional)', mult: '1.5x', desc: '업무 보상 +50% 가산, 일일 급여 한도 100,000 WLD 확장' },
  { level: 20, code: 'SPECIALIST', name: '전문가 (Specialist)', mult: '1.8x', desc: '고급 엘리트 업무 배정, 자격증 시험 응시 자격 부여' },
  { level: 30, code: 'EXPERT', name: '엑스퍼트 (Expert)', mult: '2.1x', desc: '업무 쿨다운 시간 15% 단축, 마스터 퀘스트 오픈' },
  { level: 40, code: 'MASTER', name: '마스터 (Master)', mult: '2.5x', desc: '최고 난이도 업무 상시 배정, 주간 보너스 지급' },
  { level: 50, code: 'LEGACY', name: '레거시 명예 (Grandmaster)', mult: '3.0x', desc: '전 서버 명예의 전당 헌액, 영구 3배 급여 배율 적용' },
];

export function CareerStepByStepGuide() {
  const [selectedJob, setSelectedJob] = useState<JobMeta>(CAREER_GUIDE_JOBS[0] as JobMeta);
  const [activeTab, setActiveTab] = useState<'flow' | 'jobs' | 'mastery' | 'simulator'>('flow');

  // 인터랙티브 시뮬레이터 상태
  const [simState, setSimState] = useState<'idle' | 'working' | 'ready' | 'claimed'>('idle');
  const [timeLeft, setTimeLeft] = useState(3);
  const [simLevel, setSimLevel] = useState(12);
  const [hasCert, setHasCert] = useState(true);

  // 시뮬레이터 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simState === 'working' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (simState === 'working' && timeLeft === 0) {
      setSimState('ready');
      playCoinCollectSound();
    }
    return () => clearTimeout(timer);
  }, [simState, timeLeft]);

  const startTask = () => {
    setSimState('working');
    setTimeLeft(3);
  };

  const claimReward = () => {
    setSimState('claimed');
    playWinSound();
  };

  const resetSim = () => {
    setSimState('idle');
    setTimeLeft(3);
  };

  // 숙련도 티어 계산
  const currentTier =
    MASTERY_TIERS_GUIDE.slice().reverse().find((t) => simLevel >= t.level) ??
    (MASTERY_TIERS_GUIDE[0] as (typeof MASTERY_TIERS_GUIDE)[0]);
  const certMultiplier = hasCert ? 1.25 : 1.0;
  const estimatedWld = Math.round(2500 * parseFloat(currentTier.mult) * certMultiplier);

  return (
    <div className="space-y-8">
      {/* 4대 탭 내비게이션 */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('flow')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'flow'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. 4단계 수행 절차</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>2. 8대 직업군 도감</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mastery')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'mastery'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>3. 7대 승진 티어</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>4. 실전 모의 체험</span>
        </button>
      </div>

      {/* 탭 1: 4단계 수행 절차 (Flow) */}
      {activeTab === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <Card className="border-zinc-800 bg-zinc-900/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                    STEP 01
                  </span>
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                </div>
                <CardTitle className="text-sm font-bold text-white mt-2">직업 선택 및 전직</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  <b className="text-zinc-200">/work</b> 페이지 상단에서 원하는 전문 직업을 1클릭으로 선택합니다.
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  💡 <b>자유 전직 보장</b>: 직업을 바꿔도 기존 레벨과 경험치는 100% 보존됩니다.
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-zinc-800 bg-zinc-900/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    STEP 02
                  </span>
                  <Play className="w-4 h-4 text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-bold text-white mt-2">업무 수락 (Claim)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  난이도별(초급/중급/고급) 업무 중 원하는 업무의 <b className="text-emerald-300">[수락하기]</b>를 누릅니다.
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  ⏱️ 업무가 배정되면 <b>최소 소요시간 카운트다운</b>이 시작됩니다.
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-zinc-800 bg-zinc-900/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    STEP 03
                  </span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-bold text-white mt-2">수행 및 쿨다운 대기</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  업무 시간(30초~300초) 동안 다른 탭을 보거나 주식 시세를 확인해도 안전합니다.
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  📊 백그라운드 타이머가 유지되어 편하게 멀티태스킹이 가능합니다.
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="border-zinc-800 bg-zinc-900/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                    STEP 04
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                </div>
                <CardTitle className="text-sm font-bold text-white mt-2">제출 & WLD 입금</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  시간 완료 후 <b className="text-emerald-300">[업무 완료 제출]</b>을 누르면 WLD와 EXP가 즉시 지갑에 입금됩니다.
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  🧾 투명한 <b>WorkReceipt 거래 영수증</b>이 발급됩니다.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 실제 UI 구조 시각화 다이어그램 */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              실제 직업 화면(/work) UI 배치 가이드
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">현재 활성 직업: 핀테크 개발자 (Lv.12 프로)</div>
                    <div className="text-[11px] text-zinc-400">숙련도 보너스: +50% 배율 적용 중 | 다음 승진까지 45/200 EXP</div>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit text-emerald-400 border-emerald-500/40 bg-emerald-950/30">
                  일일 잔여 한도: 87,500 WLD
                </Badge>
              </div>

              {/* 가상 업무 카드 목업 */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">초급 1단계</span>
                    <span className="text-xs font-bold text-white">스마트 컨트랙트 단위 테스트 작성</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    소요시간: 30초 | 기본 보상: +1,500 WLD | 경험치: +25 EXP
                  </div>
                </div>

                <Button size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-default">
                  수락하기 (Claim)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 2: 8대 직업군 도감 (Jobs Catalog) */}
      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAREER_GUIDE_JOBS.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJob(job)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  selectedJob.id === job.id
                    ? `${job.color} ring-2 ring-emerald-500/50 shadow-lg scale-[1.02]`
                    : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  {job.icon}
                  {selectedJob.id === job.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-white">{job.nameKo}</div>
                <div className="text-[10px] text-zinc-400 font-mono line-clamp-1">{job.field}</div>
              </button>
            ))}
          </div>

          {/* 선택된 직업 상세 정보 카드 */}
          <Card className={`border-2 ${selectedJob.color} bg-zinc-950/90 shadow-2xl`}>
            <CardHeader className="p-5 border-b border-zinc-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    {selectedJob.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg font-bold text-white">
                        {selectedJob.nameKo}
                      </CardTitle>
                      <Badge className={selectedJob.badgeColor}>
                        {selectedJob.field}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-zinc-400 font-mono mt-0.5">
                      {selectedJob.nameEn}
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">기본 일일 급여 범위</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">{selectedJob.baseSalary}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> 직무 설명 & 주요 업무
                  </div>
                  <p className="text-zinc-400">{selectedJob.desc}</p>
                  <div className="pt-2 text-[11px] text-zinc-300 font-mono">
                    대표 업무: <span className="text-emerald-400 font-bold">{selectedJob.sampleTask}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 최적 공략 & 연계 시너지
                  </div>
                  <p className="text-zinc-400">{selectedJob.strategy}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Link href="/work">
                    {selectedJob.nameKo} 업무 시작하러 가기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭 3: 7대 승진 티어 (Mastery Tiers) */}
      {activeTab === 'mastery' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader className="p-5 border-b border-zinc-800">
              <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                직업 숙련도(Mastery) 승진 로드맵 & 영구 보상 배수
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                업무를 반복 수행하여 경험치를 쌓으면 직급이 자동으로 승진하며, 급여가 최대 3배까지 증폭됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {MASTERY_TIERS_GUIDE.map((tier, idx) => (
                <div
                  key={tier.code}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    idx >= 5
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : idx >= 3
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      {tier.level}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{tier.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">Lv.{tier.level}+</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{tier.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="font-mono text-xs font-bold border-amber-500/40 bg-amber-500/10 text-amber-300">
                      급여 배율: {tier.mult}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭 4: 실전 모의 체험 시뮬레이터 (Simulator) */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-amber-500/30 bg-zinc-950 shadow-2xl">
            <CardHeader className="p-5 border-b border-zinc-800 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                    실전 직업 업무 수행 & 급여 수령 3초 시뮬레이터
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    직접 버튼을 클릭하여 수락부터 대기, 제출, 급여 입금까지의 전 과정을 3초 만에 체험해보세요!
                  </CardDescription>
                </div>

                <Button size="sm" variant="ghost" onClick={resetSim} className="text-zinc-400 hover:text-white h-7 px-2 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" /> 리셋
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* 시뮬레이터 옵션 설정 */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 flex justify-between">
                    <span>직업 숙련도 레벨 설정</span>
                    <span className="text-emerald-400 font-mono font-bold">Lv.{simLevel} ({currentTier.name})</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={simLevel}
                    onChange={(e) => setSimLevel(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Lv.1 견습</span>
                    <span>Lv.20 전문가</span>
                    <span>Lv.50 레거시</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-zinc-300">전문 자격증 보유 여부</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={hasCert}
                        onChange={(e) => setHasCert(e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      <span>1급 공인 핀테크 자격증 (+25% 보너스)</span>
                    </label>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    예상 수령액: <b className="text-amber-400 font-mono text-xs">+{estimatedWld.toLocaleString()} WLD</b> / 회당
                  </div>
                </div>
              </div>

              {/* 인터랙티브 업무 카드 */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-inner space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-cyan-400 border-cyan-500/40 bg-cyan-950/30 mb-1">
                      모의 실습 업무
                    </Badge>
                    <h4 className="text-sm font-bold text-white">스마트 컨트랙트 최적화 및 보안 감사</h4>
                    <p className="text-xs text-zinc-400">실시간 트랜잭션 수수료를 절감하고 코드를 배포합니다.</p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase">예상 보상</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      +{estimatedWld.toLocaleString()} WLD
                    </div>
                  </div>
                </div>

                {/* 상태별 인터랙티브 영역 */}
                {simState === 'idle' && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={startTask}
                      className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" /> 1단계: 업무 수락하기 (Claim)
                    </Button>
                  </div>
                )}

                {simState === 'working' && (
                  <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> 업무 수행 중... (쿨다운 타이머)
                      </span>
                      <span className="text-white font-bold">{timeLeft}초 남음</span>
                    </div>
                    <Progress value={((3 - timeLeft) / 3) * 100} className="h-2.5 bg-zinc-800" />
                  </div>
                )}

                {simState === 'ready' && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 업무 완료!
                      </div>
                      <div className="text-[11px] text-zinc-300">
                        이제 제출 버튼을 눌러 지갑으로 급여를 수령하세요.
                      </div>
                    </div>

                    <Button
                      onClick={claimReward}
                      className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg animate-pulse cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" /> 2단계: 업무 완료 제출 & 급여 수령
                    </Button>
                  </div>
                )}

                {simState === 'claimed' && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-400/60 text-center space-y-2 animate-in zoom-in-95 duration-200">
                    <Sparkles className="w-6 h-6 text-amber-300 mx-auto animate-bounce" />
                    <div className="text-sm font-bold text-white">
                      🎉 급여 +{estimatedWld.toLocaleString()} WLD 입금 완료!
                    </div>
                    <div className="text-xs text-emerald-200 font-mono">
                      +35 직업 경험치(EXP) 획득 | WorkReceipt #WR-2026-0929 발급
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetSim}
                        className="h-8 px-4 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950 text-xs cursor-pointer"
                      >
                        한 번 더 실습하기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
