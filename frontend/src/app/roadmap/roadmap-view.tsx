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
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Coins,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';

type RoadmapStage = 'early' | 'mid' | 'late';

export function RoadmapView() {
  const [stage, setStage] = useState<RoadmapStage>('early');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [actionStep, setActionStep] = useState<number>(0);

  // 모션 비디오 시뮬레이터 타이머
  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActionStep((step) => (step + 1) % 4);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const handleStageChange = (nextStage: RoadmapStage) => {
    setStage(nextStage);
    setProgress(0);
    setActionStep(0);
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. 히어로 헤더 */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2026 머니버스 3단계 실전 성장 로드맵 & 비디오 시뮬레이터</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl font-sans">
            <span className="text-emerald-400">초반 · 중반 · 후반</span> <br className="hidden sm:inline" />
            실전 플레이 완벽 마스터 가이드
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            처음 시작해서 무엇부터 해야 할지 막막하셨나요?
            1일차 무자본 시드머니 모으기부터 7일차 복리·주식 굴리기, 30일차 가상 부동산 건물주까지
            실제 작동하는 화면과 영상 시뮬레이터로 따라하며 3분 만에 마스터하세요!
          </p>

          {/* 3단계 탭 버튼 */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              onClick={() => handleStageChange('early')}
              className={`h-11 px-5 font-semibold text-xs transition-all ${
                stage === 'early'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              🌱 1단계: 초반 시드 모으기 (1~3일)
            </Button>
            <Button
              onClick={() => handleStageChange('mid')}
              className={`h-11 px-5 font-semibold text-xs transition-all ${
                stage === 'mid'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              📈 2단계: 중반 복리 & 주식 (4~14일)
            </Button>
            <Button
              onClick={() => handleStageChange('late')}
              className={`h-11 px-5 font-semibold text-xs transition-all ${
                stage === 'late'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              👑 3단계: 후반 부동산 건물주 (15일+)
            </Button>
          </div>
        </div>
      </div>

      {/* 2. 인터랙티브 라이브 비디오 & 모션 튜토리얼 플레이어 */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Play className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                실제 화면 실시간 모션 비디오 시뮬레이터
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              {stage === 'early' && '초반: 무료 럭키 룰렛 스핀 → 인턴 직업 업무 → 10만 WLD 시드머니 달성 시연'}
              {stage === 'mid' && '중반: 중앙은행 30일 복리 포켓 예치 → 침팬지 반도체 10-Depth 호가창 매수 시연'}
              {stage === 'late' && '후반: 강남 오피스 랜드 분양 → 매일 패시브 임대료 자동 수령 시연'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 h-9 px-3 text-xs gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? '일시정지' : '시연 재생'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setProgress(0);
                setActionStep(0);
              }}
              className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white h-9 px-3 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 가상 브라우저 프레임 튜토리얼 뷰어 */}
        <div className="relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
          {/* 브라우저 탑바 */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-400">
                easy-scraping.com
                {stage === 'early' && '/casino & /work'}
                {stage === 'mid' && '/bank & /stocks'}
                {stage === 'late' && '/spaces/real-estate'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SIMULATING ACTION 0{actionStep + 1}/04
              </span>
            </div>
          </div>

          {/* 중앙 시뮬레이션 인터페이스 모션 */}
          <div className="my-6">
            {stage === 'early' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> 1단계: 일일 무료 럭키 룰렛 돌리기
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300">무료 1회</Badge>
                    </div>
                    <div className="text-center py-4 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div className="text-3xl font-extrabold text-amber-300 mb-1">🎰 룰렛 스핀 회전 중...</div>
                      <p className="text-[11px] text-zinc-400">당첨 보너스: +20,000 WLD 지급 완료!</p>
                    </div>
                    <div className="flex justify-end items-center gap-2 text-emerald-400 font-bold text-xs">
                      <MousePointer className="w-3.5 h-3.5 animate-bounce" />
                      <span>[룰렛 돌리기] 클릭 시뮬레이션</span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> 2단계: 핀테크 인턴 개발자 첫 업무 시작
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300">업무 수행 중</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-300">기본 시급 급여</span>
                        <span className="text-emerald-400 font-bold">+15,000 WLD</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[100%] transition-all duration-500" />
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>업무 완료 & 급여 즉시 지갑 입금</span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> 3단계: 신규 웰컴 퀘스트 3종 보상 수령
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300">퀘스트 클리어</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-zinc-300">
                        <span>✔ 첫 출석 체크 완료</span> <span className="text-emerald-400 font-bold">+10,000 WLD</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>✔ 첫 직업 업무 완수</span> <span className="text-emerald-400 font-bold">+20,000 WLD</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>✔ 지갑 잔액 확인</span> <span className="text-emerald-400 font-bold">+35,000 WLD</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500 space-y-2 text-center animate-in fade-in zoom-in duration-300">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                      ★ 1단계 목표 달성 완료 ★
                    </span>
                    <div className="text-3xl font-bold text-white font-mono">
                      총 보유 자산: 100,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300">
                      종잣돈 10만 WLD가 모였습니다! 이제 2단계(중반 복리 & 주식 투자)로 넘어갈 준비가 끝났습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {stage === 'mid' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5" /> 1단계: 중앙은행 30일 스마트 복리 포켓 예치
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300">연 7.2% 복리</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">예치 원금</span>
                        <span className="text-white font-bold">50,000 WLD (시드의 50%)</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">매일 자정 복리 이자</span>
                        <span className="text-emerald-400 font-bold">+295 WLD/일 누적</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> 2단계: WDX 침팬지 반도체 10-Depth 호가창 매수
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300">지정가 체결</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">매수 단가: 74,200 WLD</span>
                        <span className="text-emerald-400 font-bold">체결 수량: 10주</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">실시간 평가 손익</span>
                        <span className="text-emerald-400 font-bold">+12.4% 수익 중 (+92,000 WLD)</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-rose-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" /> 3단계: 5대 계산기로 탈출 목표가 역산
                      </span>
                      <Badge className="bg-rose-500/20 text-rose-300">0.1초 진단</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">목표 익절가</span>
                        <span className="text-emerald-400 font-bold">85,000 WLD (+14.5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">SNS 바이럴 카드</span>
                        <span className="text-cyan-400 font-bold">카카오톡 원터치 공유</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-zinc-900 border border-cyan-500 space-y-2 text-center animate-in fade-in zoom-in duration-300">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                      ★ 2단계 목표 달성 완료 ★
                    </span>
                    <div className="text-3xl font-bold text-white font-mono">
                      총 보유 자산: 10,000,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300">
                      복리 이자와 주식 수익으로 천만 단위를 돌파했습니다! 이제 3단계(부동산 건물주)로 진입합니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {stage === 'late' && (
              <div className="space-y-4 max-w-xl mx-auto font-mono text-xs">
                {actionStep === 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-indigo-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-bold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> 1단계: 강남 테헤란로 프라임 오피스 랜드 분양
                      </span>
                      <Badge className="bg-indigo-500/20 text-indigo-300">소유권 획득</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">취득 가격</span>
                        <span className="text-white font-bold">15,000,000 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Cap Rate (연 순수익률)</span>
                        <span className="text-emerald-400 font-bold">연 8.4% (공실률 0%)</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> 2단계: 매일 자정 패시브 임대료 자동 수령
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300">자동 정산</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">일일 월세 수입</span>
                        <span className="text-emerald-400 font-bold">+125,000 WLD / 매일 자정</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">월 환산 패시브 수익</span>
                        <span className="text-amber-400 font-bold">+3,750,000 WLD / 월</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 3단계: 프레스티지 환생으로 영구 배율 부스트
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300">환생 1회차</Badge>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">영구 수익 배율</span>
                        <span className="text-emerald-400 font-bold">모든 수익 +25% 영구 증가</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">VIP 골든 체스트</span>
                        <span className="text-amber-400 font-bold">매일 특별 보상 상자 해금</span>
                      </div>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-zinc-900 border border-amber-500 space-y-2 text-center animate-in fade-in zoom-in duration-300">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                      ★ 3단계 머니버스 금융 제국 완성 ★
                    </span>
                    <div className="text-3xl font-bold text-white font-mono">
                      총 보유 자산: 100,000,000 WLD+
                    </div>
                    <p className="text-xs text-zinc-300">
                      축하합니다! 매일 가만히 있어도 수백만 WLD의 임대료와 복리가 들어오는 최고 칭호 [금융 제국 건물주]에 등극했습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 하단 비디오 프로그레스 바 & 스텝 인디케이터 */}
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>ACTION STEP {actionStep + 1} / 04</span>
              <span>{progress}% AUTO-PLAYING</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 3단계 상세 실행 가이드 (초반 / 중반 / 후반 카드) */}
      <div className="space-y-12">
        {/* [🌱 초반 가이드] */}
        <section className="space-y-5 rounded-2xl border border-emerald-900/40 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">1단계 · 1~3일차</Badge>
                <h2 className="text-2xl font-bold text-white">🌱 초반: 무자본 10만 WLD 시드머니 모으기</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                목표: 100,000 WLD 달성 | 소요 시간: 약 3~5분 | 필수 활동: 룰렛 + 인턴 직업 + 퀘스트
              </p>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 px-4">
              <Link href="/casino">
                1단계 시작: 무료 룰렛 돌리기
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" /> Action 01. 럭키 룰렛
                </span>
                <span className="text-[10px] text-zinc-400">1분 소요</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                매일 24시간마다 1회 무료로 주어지는 럭키 룰렛을 돌립니다. 꽝 없이 최소 5,000 WLD에서 최대 100,000 WLD까지 즉시 획득합니다.
              </p>
              <Link href="/casino" className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                룰렛 돌리러 가기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Briefcase className="w-4 h-4" /> Action 02. 인턴 업무
                </span>
                <span className="text-[10px] text-zinc-400">2분 소요</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                [직업] 메뉴에서 &apos;핀테크 개발자&apos; 또는 &apos;트레이더&apos;를 선택하고 [업무 시작]을 누릅니다. 세션이 완료되면 기본 급여와 경험치를 받습니다.
              </p>
              <Link href="/work" className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                직업 선택하기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Award className="w-4 h-4" /> Action 03. 웰컴 퀘스트
                </span>
                <span className="text-[10px] text-zinc-400">즉시 수령</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                출석 체크, 프로필 확인, 첫 업무 완수 등 초보자 퀘스트 3종의 [보상 받기] 버튼을 눌러 50,000 WLD 보너스를 한 번에 수령합니다.
              </p>
              <Link href="/quests" className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                퀘스트 보상 받기 →
              </Link>
            </div>
          </div>
        </section>

        {/* [📈 중반 가이드] */}
        <section className="space-y-5 rounded-2xl border border-cyan-900/40 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">2단계 · 4~14일차</Badge>
                <h2 className="text-2xl font-bold text-white">📈 중반: 복리 예금 + 주식 분할 매수로 1,000만 WLD 굴리기</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                목표: 10,000,000 WLD 달성 | 필수 활동: 30일 복리 포켓 예치 + WDX 10-Depth 호가 매수 + 승진
              </p>
            </div>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold h-10 px-4">
              <Link href="/bank">
                2단계 시작: 복리 예금 넣기
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Landmark className="w-4 h-4" /> Action 01. 30일 복리 포켓
                </span>
                <span className="text-[10px] text-zinc-400">연 7.2%</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                모은 시드 10만 WLD 중 50%를 중앙은행 30일 복리 포켓에 넣어두면 매일 자정에 자동으로 원금+이자에 복리 이자가 계속 붙습니다.
              </p>
              <Link href="/bank" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                복리 포켓 개설하기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <TrendingUp className="w-4 h-4" /> Action 02. WDX 대장주 매수
                </span>
                <span className="text-[10px] text-zinc-400">호가창 주문</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                나머지 50% 자금으로 침팬지 반도체(WDX-TEC)나 AI 대장주를 10단계 호가창에서 분할 매수하여 +10~20% 시세 차익을 노립니다.
              </p>
              <Link href="/stocks" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                주식 호가창 가기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Calculator className="w-4 h-4" /> Action 03. 계산기 진단 & 승진
                </span>
                <span className="text-[10px] text-zinc-400">급여 5배</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
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

        {/* [👑 후반 가이드] */}
        <section className="space-y-5 rounded-2xl border border-amber-900/40 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">3단계 · 15~30일차+</Badge>
                <h2 className="text-2xl font-bold text-white">👑 후반: 가상 부동산 건물주 & 억대 패시브 인컴</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                목표: 100,000,000 WLD+ 달성 | 필수 활동: 강남/판교 랜드 분양 + 매일 월세 수령 + 프레스티지 환생
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white font-semibold h-10 px-4">
              <Link href="/spaces/real-estate">
                3단계 시작: 랜드 분양소 가기
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Building2 className="w-4 h-4" /> Action 01. 강남/판교 랜드 분양
                </span>
                <span className="text-[10px] text-zinc-400">영구 소유</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                강남 테헤란로, 여의도, 판교 8대 상권의 가상 토지 및 오피스를 분양받아 내 계정으로 영구 등기 등록합니다.
              </p>
              <Link href="/spaces/real-estate" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                랜드 맵 살펴보기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Coins className="w-4 h-4" /> Action 02. 매일 패시브 임대료 수령
                </span>
                <span className="text-[10px] text-zinc-400">매일 자정 입금</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                아무것도 하지 않아도 입주 기업과 세입자로부터 매일 자정에 수십만~수백만 WLD의 월세가 지갑으로 자동 정산 입금됩니다.
              </p>
              <Link href="/spaces" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                내 공간 관리하기 →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <ShieldCheck className="w-4 h-4" /> Action 03. 프레스티지 환생
                </span>
                <span className="text-[10px] text-zinc-400">+25% 영구 배율</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                최고 등급 달성 후 프레스티지 환생을 진행하여 모든 급여, 배당, 이자 수익을 영구적으로 +25% 증폭시키는 골든 특권을 획득합니다.
              </p>
              <Link href="/progression/prestige" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
                프레스티지 환생하기 →
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 4. 핵심 요약 치트시트 */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-4">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <CardTitle className="text-xl font-bold text-white">
              💡 1분 요약: 매일 들어와서 해야 할 3가지 루틴
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-400">
            하루 1분만 투자하면 자동으로 자산이 불어나는 머니버스 데일리 루틴입니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-emerald-400 font-bold">1. 무료 룰렛 돌리기 (10초)</span>
            <p className="text-[11px] text-zinc-400">카지노 메뉴에서 룰렛 스핀 눌러 공짜 WLD 수령</p>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-cyan-400 font-bold">2. 복리 이자 & 임대료 수령 (10초)</span>
            <p className="text-[11px] text-zinc-400">은행과 부동산 메뉴에서 [이자 수령] 원클릭 청구</p>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-amber-400 font-bold">3. 직업 업무 1회 시작 (10초)</span>
            <p className="text-[11px] text-zinc-400">직업 메뉴에서 업무 시작 누르고 창 닫아두면 자동 완료</p>
          </div>
        </CardContent>
      </Card>

      {/* 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="mt-12" />
    </div>
  );
}
