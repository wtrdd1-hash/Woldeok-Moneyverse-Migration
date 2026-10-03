'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Landmark,
  Building2,
  Briefcase,
  Calculator,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Coins,
  MousePointer,
  HelpCircle,
  FastForward,
  Gift,
  Flame,
  Layers,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { InvestorProfileQuiz } from '@/components/investor-profile-quiz';

type RoadmapStage = 'early' | 'mid' | 'late';

export function RoadmapView() {
  const [stage, setStage] = useState<RoadmapStage>('early');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [actionStep, setActionStep] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // 모션 비디오 시뮬레이터 자동 타이머 (속도 조절 지원)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(30, Math.floor(100 / playbackSpeed));
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActionStep((step) => (step + 1) % 4);
          return 0;
        }
        return prev + 2;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleStageChange = (nextStage: RoadmapStage) => {
    setStage(nextStage);
    setProgress(0);
    setActionStep(0);
  };

  const handleNextStep = () => {
    setActionStep((prev) => (prev + 1) % 4);
    setProgress(0);
  };

  const handlePrevStep = () => {
    setActionStep((prev) => (prev === 0 ? 3 : prev - 1));
    setProgress(0);
  };

  const toggleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  return (
    <div className="space-y-14 py-6 sm:py-10 max-w-6xl mx-auto">
      {/* 1. 히어로 마스트헤드 */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2026 머니버스 3단계 실전 공략 가이드 & 비디오 시뮬레이터</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl font-sans">
            <span className="text-emerald-400">초반 · 중반 · 후반</span> <br className="hidden sm:inline" />
            실전 플레이 완벽 마스터 가이드
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            처음 접속해서 무엇부터 시작해야 할지 막막하셨나요?
            <br className="hidden sm:inline" />
            <strong className="text-white font-semibold">1일차 무자본 10만 WLD 시드 모으기</strong>부터 <strong>7일차 복리·주식 굴리기</strong>, <strong>30일차 부동산 건물주</strong>까지 실제 작동 화면과 인터랙티브 영상으로 따라하며 3분 만에 마스터하세요!
          </p>

          {/* 3단계 네비게이션 탭 */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3">
            <Button
              onClick={() => handleStageChange('early')}
              className={`h-11 px-5 font-semibold text-xs sm:text-sm rounded-xl transition-all ${
                stage === 'early'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              🌱 1단계: 초반 시드 모으기 (1~3일)
            </Button>
            <Button
              onClick={() => handleStageChange('mid')}
              className={`h-11 px-5 font-semibold text-xs sm:text-sm rounded-xl transition-all ${
                stage === 'mid'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              📈 2단계: 중반 복리 & 주식 (4~14일)
            </Button>
            <Button
              onClick={() => handleStageChange('late')}
              className={`h-11 px-5 font-semibold text-xs sm:text-sm rounded-xl transition-all ${
                stage === 'late'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              👑 3단계: 후반 부동산 건물주 (15일+)
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-4 font-semibold text-xs rounded-xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-950/20"
            >
              <a href="#early-guide">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                🚀 초보자 3분 퀵스타트
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. [🌱 최우선 전진 배치] 1단계: 초보자 무자본 10만 WLD 시드머니 3분 완성 공략 */}
      <section id="early-guide" className="space-y-6 rounded-3xl border border-emerald-800/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold">
                1단계 · 1~3일차 무자본
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                🌱 초반: 무자본 10만 WLD 시드머니 모으기
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              투자금 0원으로 3분 만에 종잣돈 100,000 WLD를 만드는 4가지 필수 실전 루틴입니다.
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-emerald-950/50">
            <Link href="/casino">
              1단계 시작: 무료 룰렛 돌리기
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* 4대 초반 실전 루틴 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: 일일 무료 럭키 룰렛 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" /> 01. 럭키 룰렛
                </span>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 bg-amber-500/10">
                  24시간 1회 무료
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🎰</div>
                <div className="text-xs font-bold text-amber-300 font-mono">+5,000 ~ 100,000 WLD</div>
                <div className="text-[10px] text-zinc-400">꽝 없는 100% 당첨 휠</div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                카지노 메뉴에서 매일 24시간마다 1회 주어지는 무료 룰렛을 돌려 즉시 기초 자금을 확보합니다.
              </p>
            </div>
            <Link
              href="/casino"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>룰렛 돌리러 가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 2: 덕이 펫 돌보기 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-pink-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
                  <Heart className="w-4 h-4" /> 02. 덕이 펫 돌보기
                </span>
                <Badge variant="outline" className="text-[10px] border-pink-500/40 text-pink-300 bg-pink-500/10">
                  매일 보너스
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🦆</div>
                <div className="text-xs font-bold text-pink-300 font-mono">+5,000 WLD + 호감도</div>
                <div className="text-[10px] text-zinc-400">쓰다듬기 & 먹이주기</div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                마스코트 덕이 펫을 쓰다듬고 먹이를 주면 친밀도가 올라가며 일일 케어 지원금을 지급합니다.
              </p>
            </div>
            <Link
              href="/pet"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>덕이 펫 돌보러 가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 3: 핀테크 인턴 첫 업무 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Briefcase className="w-4 h-4" /> 03. 인턴 직업 업무
                </span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                  30초 파밍
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">💻</div>
                <div className="text-xs font-bold text-emerald-300 font-mono">+15,000 WLD + 50 XP</div>
                <div className="text-[10px] text-zinc-400">직업 선택 & 업무 수락</div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                [직업] 메뉴에서 핀테크 개발자를 선택하고 [업무 시작]을 누른 뒤 30초 후 제출하면 급여가 즉시 입금됩니다.
              </p>
            </div>
            <Link
              href="/work"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>직업 업무 시작하기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 4: 웰컴 퀘스트 3종 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Award className="w-4 h-4" /> 04. 웰컴 퀘스트
                </span>
                <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-300 bg-cyan-500/10">
                  원클릭 일괄 수령
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🎁</div>
                <div className="text-xs font-bold text-cyan-300 font-mono">+50,000 WLD 보너스</div>
                <div className="text-[10px] text-zinc-400">출석 + 프로필 + 첫 업무</div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                퀘스트 메뉴에서 완료된 초보자 퀘스트 3종의 [보상 받기]를 눌러 총 10만 WLD 시드를 최종 완성합니다.
              </p>
            </div>
            <Link
              href="/quests"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>퀘스트 보상 받기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 🎬 12개 실전 UI 씬 인터랙티브 모션 비디오 시뮬레이터 플레이어 */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* 플레이어 상단 컨트롤 바 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Play className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                실제 사이트 UI 실시간 모션 비디오 시뮬레이터
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              {stage === 'early' && '🌱 초반 시뮬레이션: 무료 룰렛 회전 ➔ 덕이 펫 ➔ 인턴 업무 급여 ➔ 10만 WLD 완성 시연'}
              {stage === 'mid' && '📈 중반 시뮬레이션: 30일 복리 포켓 예치 ➔ 침팬지 반도체 10호가 매수 ➔ 5대 계산기 ➔ 1,000만 WLD 돌파 시연'}
              {stage === 'late' && '👑 후반 시뮬레이션: 강남 테헤란로 랜드 분양 ➔ 매일 자정 패시브 월세 ➔ 프레스티지 환생 ➔ 1억 건물주 등극 시연'}
            </p>
          </div>

          {/* 컨트롤 버튼 그룹 (속도/이전/재생/다음/리셋) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevStep}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs gap-1 rounded-lg"
              title="이전 씬"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">이전</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 h-9 px-3.5 text-xs gap-1.5 rounded-lg font-bold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? '일시정지' : '시연 재생'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextStep}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs gap-1 rounded-lg"
              title="다음 씬"
            >
              <span className="hidden sm:inline">다음</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleSpeed}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs font-mono rounded-lg"
              title="재생 속도 조절"
            >
              <FastForward className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              {playbackSpeed}x
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setProgress(0);
                setActionStep(0);
              }}
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white h-9 px-2.5 text-xs rounded-lg"
              title="처음부터 다시보기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 4단계 스텝 점프 썸네일 탭 */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[0, 1, 2, 3].map((stepIdx) => (
            <button
              key={stepIdx}
              onClick={() => {
                setActionStep(stepIdx);
                setProgress(0);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                actionStep === stepIdx
                  ? 'bg-zinc-900 border-emerald-500/60 text-white ring-1 ring-emerald-500/30 shadow-md'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <div className="font-mono text-[10px] text-zinc-500 font-bold">SCENE 0{stepIdx + 1}</div>
              <div className="font-semibold truncate text-[11px] sm:text-xs">
                {stage === 'early' && ['1. 무료 룰렛', '2. 덕이 펫', '3. 인턴 업무', '4. 10만 달성'][stepIdx]}
                {stage === 'mid' && ['1. 복리 포켓', '2. 주식 호가', '3. 계산기 진단', '4. 1천만 돌파'][stepIdx]}
                {stage === 'late' && ['1. 랜드 분양', '2. 패시브 월세', '3. 프레스티지', '4. 1억 제국'][stepIdx]}
              </div>
            </button>
          ))}
        </div>

        {/* 가상 브라우저 프레임 튜토리얼 뷰어 */}
        <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-4 sm:p-7 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
          {/* 브라우저 탑바 */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-400 truncate max-w-[200px] sm:max-w-none">
                easy-scraping.com
                {stage === 'early' && (actionStep === 0 ? '/casino' : actionStep === 1 ? '/pet' : actionStep === 2 ? '/work' : '/quests')}
                {stage === 'mid' && (actionStep === 0 ? '/bank' : actionStep === 1 ? '/stocks/portfolio' : actionStep === 2 ? '/tools' : '/work/promotion')}
                {stage === 'late' && (actionStep === 0 ? '/spaces/real-estate' : actionStep === 1 ? '/spaces' : actionStep === 2 ? '/progression/prestige' : '/vip')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SCENE 0{actionStep + 1}/04
              </span>
            </div>
          </div>

          {/* 중앙 시뮬레이션 인터페이스 모션 (초반 / 중반 / 후반) */}
          <div className="my-6">
            {/* [🌱 초반 4개 씬] */}
            {stage === 'early' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> 씬 01: 24시간 일일 무료 럭키 룰렛 스핀
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">무료 1회</Badge>
                    </div>
                    <div className="text-center py-6 bg-zinc-950 rounded-xl border border-zinc-800 relative overflow-hidden">
                      <div className="text-4xl font-extrabold text-amber-300 mb-2 animate-bounce">🎰</div>
                      <div className="text-lg font-bold text-white font-sans">럭키 룰렛 회전 완료!</div>
                      <p className="text-xs text-emerald-400 font-bold mt-1">+20,000 WLD 잭팟 당첨 (지갑 즉시 입금)</p>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [룰렛 돌리기] 원클릭</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5 animate-pulse" /> 클릭 시뮬레이션 중
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-pink-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-pink-400 font-bold text-sm flex items-center gap-1.5">
                        <Heart className="w-4 h-4" /> 씬 02: 마스코트 덕이 펫 케어 & 보너스 수령
                      </span>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/40">호감도 Lv.2</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">🦆</div>
                          <div>
                            <div className="font-bold text-white text-xs font-sans">부자 덕이 (Lv.2)</div>
                            <div className="text-[11px] text-pink-400">포만도 100% · 기분 최고</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-sm">+5,000 WLD</div>
                          <div className="text-[10px] text-zinc-400">일일 돌봄 지원금</div>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full w-[85%] transition-all duration-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [쓰다듬기] & [먹이주기]</span>
                      <span className="text-pink-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 친밀도 +15% 상승
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> 씬 03: 핀테크 인턴 개발자 업무 수락 & 제출
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">업무 완료</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300 font-sans">직무: 핀테크 인턴 코딩 테스트</span>
                        <span className="text-emerald-400 font-bold">+15,000 WLD</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[100%] transition-all duration-500" />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>쿨다운: 30초 완료</span>
                        <span className="text-emerald-400 font-bold">경험치 +50 XP 획득</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [업무 시작] 누르고 30초 후 [제출]</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> WorkReceipt 영수증 발행
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border-2 border-emerald-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block font-sans">
                      ★ 1단계 목표 완성: 종잣돈 10만 WLD 달성 ★
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      100,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      축하합니다! 무자본 3분 만에 초기 시드가 완성되었습니다.
                      이제 2단계(중반 복리 예금 & WDX 주식 투자)로 자산을 1,000만 단위로 굴릴 준비가 끝났습니다.
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('mid')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        2단계(중반 복리 & 주식) 시뮬레이터 보기 →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* [📈 중반 4개 씬] */}
            {stage === 'mid' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-cyan-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                        <Landmark className="w-4 h-4" /> 씬 01: 중앙은행 30일 스마트 복리 포켓 예치
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">연 7.2% 복리</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">예치 원금</span>
                        <span className="text-white font-bold">50,000 WLD (시드의 50%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">매일 자정 복리 이자</span>
                        <span className="text-emerald-400 font-bold">+295 WLD / 일 누적</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">30일 만기 세후 총액</span>
                        <span className="text-cyan-300 font-bold">58,850 WLD (자동 지갑 입금)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [중앙은행] → [30일 포켓] 예치</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 원금 100% 보장
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> 씬 02: WDX 침팬지 반도체 10-Depth 호가창 매수
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">지정가 체결</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">종목: WDX-TEC (침팬지 반도체)</span>
                        <span className="text-emerald-400 font-bold">10주 매수 완료</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">체결 단가</span>
                        <span className="text-white font-bold">74,200 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">실시간 평가 손익</span>
                        <span className="text-emerald-400 font-bold">+12.4% (+92,000 WLD)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: 10단계 호가창 클릭 후 매수</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5" /> 실시간 호가 체결
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-rose-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                        <Calculator className="w-4 h-4" /> 씬 03: 5대 계산기 목표가 역산 & SNS 공유 카드
                      </span>
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40">0.1초 진단</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">목표 익절가</span>
                        <span className="text-emerald-400 font-bold">85,000 WLD (+14.5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">물타기 손익분기</span>
                        <span className="text-cyan-400 font-bold">71,500 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">바이럴 카드 공유</span>
                        <span className="text-amber-400 font-bold">카카오톡/디스코드 1초 복사</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [금융 계산기]로 리스크 관리</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 포트폴리오 안전 진단
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-zinc-900 border-2 border-cyan-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-sans">
                      ★ 2단계 목표 완성: 1,000만 WLD 돌파 ★
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      10,000,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      복리 이자와 주식 시세 차익, 직업 승진 급여로 천만 단위 자산가가 되었습니다!
                      이제 3단계(부동산 건물주)로 진입하여 잠자는 동안에도 돈이 들어오는 제국을 만듭니다.
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('late')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        3단계(후반 부동산 건물주) 시뮬레이터 보기 →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* [👑 후반 4개 씬] */}
            {stage === 'late' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-bold text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> 씬 01: 강남 테헤란로 프라임 오피스 랜드 분양
                      </span>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">등기 완료</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">취득 가격</span>
                        <span className="text-white font-bold">15,000,000 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Cap Rate (연 순수익률)</span>
                        <span className="text-emerald-400 font-bold">연 8.4% (공실률 0%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">소유권</span>
                        <span className="text-indigo-300 font-bold">계정 영구 등기 등록</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [공간] → [랜드 분양] 원클릭</span>
                      <span className="text-indigo-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 건물주 자격 획득
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                        <Coins className="w-4 h-4" /> 씬 02: 매일 자정 패시브 임대료 자동 정산
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">자동 입금</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">일일 월세 수입</span>
                        <span className="text-emerald-400 font-bold">+125,000 WLD / 매일 자정</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">월 환산 패시브 수익</span>
                        <span className="text-amber-400 font-bold">+3,750,000 WLD / 월</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: 가만히 있어도 매일 자정에 자동 지급</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% 무노동 패시브 인컴
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-cyan-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> 씬 03: 프레스티지 환생으로 영구 배율 부스트
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">환생 1회차</Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">영구 수익 배율</span>
                        <span className="text-emerald-400 font-bold">모든 수익 +25% 영구 증가</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">VIP 골든 체스트</span>
                        <span className="text-amber-400 font-bold">매일 특별 보상 상자 해금</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>조작 팁: [성장] → [프레스티지 환생] 진행</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 골든 아우라 획득
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-zinc-900 border-2 border-amber-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-sans">
                      ★ 3단계 완결: 머니버스 금융 제국 완성 ★
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      100,000,000 WLD+
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      축하합니다! 매일 가만히 있어도 수백만 WLD의 임대료와 복리가 들어오는 최고 칭호 [금융 제국 건물주]에 등극했습니다.
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('early')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        1단계(초반 시드 모으기) 다시보기 ↺
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 하단 비디오 프로그레스 바 & 스텝 인디케이터 */}
          <div className="border-t border-zinc-800 pt-3.5 space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-300 font-bold">ACTION STEP 0{actionStep + 1} / 04</span>
              <span>{progress}% {isPlaying ? 'AUTO-PLAYING' : 'PAUSED'} ({playbackSpeed}x)</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 📈 [2단계 가이드] 복리 예금 + 주식 분할 매수로 1,000만 WLD 굴리기 */}
      <section className="space-y-6 rounded-3xl border border-cyan-800/40 bg-zinc-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-bold">
                2단계 · 4~14일차
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                📈 중반: 복리 예금 + 주식 분할 매수로 1,000만 WLD 굴리기
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              목표: 10,000,000 WLD 달성 | 필수 활동: 30일 복리 포켓 예치 + WDX 10-Depth 호가 매수 + 직업 승진
            </p>
          </div>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-cyan-950/50">
            <Link href="/bank">
              2단계 시작: 복리 예금 넣기
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Landmark className="w-4 h-4" /> Action 01. 30일 복리 포켓
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">연 7.2%</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              모은 시드 10만 WLD 중 50%를 중앙은행 30일 복리 포켓에 넣어두면 매일 자정에 자동으로 원금+이자에 복리 이자가 계속 붙습니다.
            </p>
            <Link href="/bank" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              복리 포켓 개설하기 →
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="w-4 h-4" /> Action 02. WDX 대장주 매수
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">10호가 지정가</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              나머지 50% 자금으로 침팬지 반도체(WDX-TEC)나 AI 대장주를 10단계 호가창에서 분할 매수하여 +10~20% 시세 차익을 노립니다.
            </p>
            <Link href="/stocks" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              주식 호가창 가기 →
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Calculator className="w-4 h-4" /> Action 03. 계산기 진단 & 승진
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">급여 5배</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              물타기/복리 계산기로 손익분기점을 확인하고, 직업 레벨업을 통해 주니어/시니어로 승진하여 일일 급여를 5배로 증폭시킵니다.
            </p>
            <Link href="/tools" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              계산기 진단하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 인아티클 광고 지면 */}
      <InArticleAdvertisement className="my-8" />

      {/* 5. 👑 [3단계 가이드] 가상 부동산 건물주 & 억대 패시브 인컴 */}
      <section className="space-y-6 rounded-3xl border border-amber-800/40 bg-zinc-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold">
                3단계 · 15~30일차+
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                👑 후반: 가상 부동산 건물주 & 억대 패시브 인컴
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              목표: 100,000,000 WLD+ 달성 | 필수 활동: 강남/판교 랜드 분양 + 매일 월세 수령 + 프레스티지 환생
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-amber-950/50">
            <Link href="/spaces/real-estate">
              3단계 시작: 랜드 분양소 가기
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Building2 className="w-4 h-4" /> Action 01. 강남/판교 랜드 분양
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">영구 소유</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              강남 테헤란로, 여의도, 판교 8대 상권의 가상 토지 및 오피스를 분양받아 내 계정으로 영구 등기 등록합니다.
            </p>
            <Link href="/spaces/real-estate" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              랜드 맵 살펴보기 →
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-4 h-4" /> Action 02. 매일 패시브 임대료 수령
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">매일 자정 입금</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              아무것도 하지 않아도 입주 기업과 세입자로부터 매일 자정에 수십만~수백만 WLD의 월세가 지갑으로 자동 정산 입금됩니다.
            </p>
            <Link href="/spaces" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              내 공간 관리하기 →
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4" /> Action 03. 프레스티지 환생
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">+25% 영구 배율</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              최고 등급 달성 후 프레스티지 환생을 진행하여 모든 급여, 배당, 이자 수익을 영구적으로 +25% 증폭시키는 골든 특권을 획득합니다.
            </p>
            <Link href="/progression/prestige" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              프레스티지 환생하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. 💡 1분 요약 데일리 필수 루틴 치트시트 */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-5 rounded-3xl">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              💡 1분 요약: 매일 들어와서 해야 할 3가지 루틴
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-zinc-400">
            하루 딱 1분만 투자하면 자동으로 자산이 불어나는 머니버스 데일리 루틴입니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-emerald-400 font-bold text-sm">1. 무료 룰렛 돌리기 (10초)</span>
            <p className="text-xs text-zinc-300 font-sans">카지노 메뉴에서 룰렛 스핀 눌러 공짜 WLD 즉시 수령</p>
          </div>
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-cyan-400 font-bold text-sm">2. 복리 이자 & 임대료 수령 (10초)</span>
            <p className="text-xs text-zinc-300 font-sans">은행과 부동산 메뉴에서 [이자 수령] 원클릭 청구</p>
          </div>
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-amber-400 font-bold text-sm">3. 직업 업무 1회 시작 (10초)</span>
            <p className="text-xs text-zinc-300 font-sans">직업 메뉴에서 업무 시작 누르고 창 닫아두면 자동 완료</p>
          </div>
        </CardContent>
      </Card>

      {/* 7. 🎯 AI 맞춤형 투자 성향 진단기 (하단 심화 코너) */}
      <section id="quiz" className="pt-4">
        <InvestorProfileQuiz />
      </section>

      {/* 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="mt-12" />
    </div>
  );
}
