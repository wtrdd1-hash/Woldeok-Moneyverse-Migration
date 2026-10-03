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
import { useLocale } from '@/components/locale-provider';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { InvestorProfileQuiz } from '@/components/investor-profile-quiz';

type RoadmapStage = 'early' | 'mid' | 'late';

export function RoadmapView() {
  const { locale } = useLocale();
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

  // 4개 국어 텍스트 번역 헬퍼
  const t = (ko: string, en: string, ja: string, zh: string) => {
    if (locale === 'en') return en;
    if (locale === 'ja') return ja;
    if (locale === 'zh') return zh;
    return ko;
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
            <span>
              {t(
                '2026 머니버스 3단계 실전 공략 가이드 & 비디오 시뮬레이터',
                '2026 Moneyverse 3-Stage Strategy Roadmap & Video Simulator',
                '2026 マネーバース 3段階 実戦成長ロードマップ＆ビデオシミュレーター',
                '2026 Moneyverse 3阶段实战成长攻略与视频模拟器'
              )}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl font-sans">
            <span className="text-emerald-400">
              {t('초반 · 중반 · 후반', 'Early · Mid · Late Game', '序盤・中盤・終盤', '初盘·中盘·后盘')}
            </span>{' '}
            <br className="hidden sm:inline" />
            {t(
              '실전 플레이 완벽 마스터 가이드',
              'Master Gameplay Strategy Guide',
              '実戦プレイ完全マスターガイド',
              '实战游玩进阶大师指南'
            )}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            {t(
              '처음 접속해서 무엇부터 시작해야 할지 막막하셨나요?',
              'Just started and wondering where to begin?',
              '初めてログインして何から始めるべきか迷っていませんか？',
              '刚进入游戏不知从何开始？'
            )}{' '}
            <br className="hidden sm:inline" />
            <strong className="text-white font-semibold">
              {t('1일차 무자본 10만 WLD 시드 모으기', 'Day 1: 100k WLD Zero-Capital Seed', '1日目：ゼロ資本10万WLDシード形成', '第1天：零本金积攒10万WLD')}
            </strong>
            {t('부터 ', ' to ', 'から', '到')}
            <strong>
              {t('7일차 복리·주식 굴리기', 'Day 7: Compounding & Stocks', '7日目：複利＆株式投資', '第7天：复利与股票增值')}
            </strong>
            {t(', ', ', ', '、', '，')}
            <strong>
              {t('30일차 부동산 건물주', 'Day 30: Virtual Real Estate Tycoon', '30日目：仮想不動産オーナー', '第30天：虚拟地产大亨')}
            </strong>
            {t(
              '까지 실제 작동 화면과 인터랙티브 영상으로 따라하며 3분 만에 마스터하세요!',
              ' - master everything in 3 minutes with live interactive simulated video walk-throughs!',
              'まで実際のUI動画シミュレーターで3分で完全マスター！',
              '，跟随动态实景视频模拟器，3分钟轻松掌握！'
            )}
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
              {t('🌱 1단계: 초반 시드 모으기 (1~3일)', '🌱 Stage 1: Seed Building (Day 1–3)', '🌱 第1段階：シード形成（1〜3日）', '🌱 第1阶段：初始本金（第1~3天）')}
            </Button>
            <Button
              onClick={() => handleStageChange('mid')}
              className={`h-11 px-5 font-semibold text-xs sm:text-sm rounded-xl transition-all ${
                stage === 'mid'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              {t('📈 2단계: 중반 복리 & 주식 (4~14일)', '📈 Stage 2: Compounding & Stocks (Day 4–14)', '📈 第2段階：複利＆株式（4〜14日）', '📈 第2阶段：复利与股票（第4~14天）')}
            </Button>
            <Button
              onClick={() => handleStageChange('late')}
              className={`h-11 px-5 font-semibold text-xs sm:text-sm rounded-xl transition-all ${
                stage === 'late'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              {t('👑 3단계: 후반 부동산 건물주 (15일+)', '👑 Stage 3: Real Estate Tycoon (Day 15+)', '👑 第3段階：不動産オーナー（15日+）', '👑 第3阶段：地产包租公（第15天+）')}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-4 font-semibold text-xs rounded-xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-950/20"
            >
              <a href="#early-guide">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {t('🚀 초보자 3분 퀵스타트', '🚀 3-Minute Quickstart', '🚀 3分クイックスタート', '🚀 3分钟极速入门')}
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
                {t('1단계 · 1~3일차 무자본', 'Stage 1 · Day 1–3 Zero Capital', '第1段階 · 1〜3日目 ゼロ資本', '第1阶段 · 第1~3天 零本金')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t(
                  '🌱 초반: 무자본 10만 WLD 시드머니 모으기',
                  '🌱 Early Game: Accumulate 100,000 WLD Seed with Zero Capital',
                  '🌱 序盤：ゼロ資本10万WLDシード形成',
                  '🌱 初盘：零本金快速累积10万WLD初始本金'
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t(
                '투자금 0원으로 3분 만에 종잣돈 100,000 WLD를 만드는 4가지 필수 실전 루틴입니다.',
                '4 essential zero-capital routines to create a 100,000 WLD nest egg in just 3 minutes.',
                '初期投資0円で3分で10万WLDの種銭を作る4つの必須デイリールーティンです。',
                '0成本在3分钟内打造10万WLD启动资金的4项必做日常操作。'
              )}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-emerald-950/50">
            <Link href="/casino">
              {t('1단계 시작: 무료 룰렛 돌리기', 'Start Stage 1: Spin Free Roulette', '第1段階開始：無料ルーレットを回す', '开始第1阶段：转动免费转盘')}
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
                  <Sparkles className="w-4 h-4" /> {t('01. 럭키 룰렛', '01. Lucky Roulette', '01. ラッキールーレット', '01. 幸运转盘')}
                </span>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 bg-amber-500/10">
                  {t('24시간 1회 무료', 'Free Daily', '24時間1回無料', '每日免费1次')}
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🎰</div>
                <div className="text-xs font-bold text-amber-300 font-mono">+5,000 ~ 100,000 WLD</div>
                <div className="text-[10px] text-zinc-400">
                  {t('꽝 없는 100% 당첨 휠', '100% Guaranteed Win', 'ハズレなし当選ホイール', '100%必中轮盘')}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {t(
                  '카지노 메뉴에서 매일 24시간마다 1회 주어지는 무료 룰렛을 돌려 즉시 기초 자금을 확보합니다.',
                  'Spin the daily free roulette in Casino menu once every 24h to instantly secure starting capital.',
                  'カジノメニューで毎日24時間ごとに1回もらえる無料ルーレットを回して軍資金を獲得します。',
                  '在游戏菜单中每24小时免费转动一次转盘，即刻到账启动资金。'
                )}
              </p>
            </div>
            <Link
              href="/casino"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>{t('룰렛 돌리러 가기', 'Spin Roulette Now', 'ルーレットへ', '前往转盘')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 2: 덕이 펫 돌보기 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-pink-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
                  <Heart className="w-4 h-4" /> {t('02. 덕이 펫 돌보기', '02. Deoki Pet Care', '02. ドギペットのお世話', '02. 德克宠物抚育')}
                </span>
                <Badge variant="outline" className="text-[10px] border-pink-500/40 text-pink-300 bg-pink-500/10">
                  {t('매일 보너스', 'Daily Bonus', '毎日ボーナス', '每日福利')}
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🦆</div>
                <div className="text-xs font-bold text-pink-300 font-mono">
                  {t('+5,000 WLD + 호감도', '+5,000 WLD + Love', '+5,000 WLD + 親密度', '+5,000 WLD + 好感度')}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {t('쓰다듬기 & 먹이주기', 'Pet & Feed', '撫でる＆餌やり', '抚摸与喂食')}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {t(
                  '마스코트 덕이 펫을 쓰다듬고 먹이를 주면 친밀도가 올라가며 일일 케어 지원금을 지급합니다.',
                  'Pet and feed mascot Deoki to increase affection level and receive daily care subsidies.',
                  'マスコットのドギを撫でて餌をあげると親密度が上がり、毎日のケア支援金が支給されます。',
                  '抚摸吉祥物小德克并喂食，提升好感度即可领取每日专属抚育补贴。'
                )}
              </p>
            </div>
            <Link
              href="/pet"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>{t('덕이 펫 돌보러 가기', 'Care for Deoki', 'ペットのお世話へ', '去照顾小德克')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 3: 핀테크 인턴 첫 업무 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Briefcase className="w-4 h-4" /> {t('03. 인턴 직업 업무', '03. Daily Career Shift', '03. インターン業務', '03. 实习工作任务')}
                </span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                  {t('30초 파밍', '30s Yield', '30秒ファーミング', '30秒领薪')}
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">💻</div>
                <div className="text-xs font-bold text-emerald-300 font-mono">+15,000 WLD + 50 XP</div>
                <div className="text-[10px] text-zinc-400">
                  {t('직업 선택 & 업무 수락', 'Select Job & Clock In', '職業選択＆業務開始', '选职打卡上岗')}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {t(
                  '[직업] 메뉴에서 핀테크 개발자를 선택하고 [업무 시작]을 누른 뒤 30초 후 제출하면 급여가 즉시 입금됩니다.',
                  'Select Fintech Developer in Career menu, click Start Shift, and submit after 30s to deposit salary.',
                  '[職業]メニューでフィンテック開発者を選択し、業務開始後30秒で提出して給与を即座に受給します。',
                  '在职业菜单中选择金融科技工程师，点击开始工作，30秒后提交即可即刻领薪到账。'
                )}
              </p>
            </div>
            <Link
              href="/work"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>{t('직업 업무 시작하기', 'Start Daily Work', '業務を開始する', '开始打卡上班')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action 4: 웰컴 퀘스트 3종 */}
          <div className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Award className="w-4 h-4" /> {t('04. 웰컴 퀘스트', '04. Welcome Quests', '04. ウェルカムクエスト', '04. 新手欢迎任务')}
                </span>
                <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-300 bg-cyan-500/10">
                  {t('원클릭 일괄 수령', 'One-Click Claim', 'ワンクリック一括受取', '一键全领')}
                </Badge>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center space-y-1">
                <div className="text-2xl">🎁</div>
                <div className="text-xs font-bold text-cyan-300 font-mono">
                  {t('+50,000 WLD 보너스', '+50,000 WLD Bonus', '+50,000 WLD ボーナス', '+50,000 WLD 奖金')}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {t('출석 + 프로필 + 첫 업무', 'Attendance + Profile + Shift', '出席＋プロフィール＋初業務', '签到 + 资料 + 首份工作')}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {t(
                  '퀘스트 메뉴에서 완료된 초보자 퀘스트 3종의 [보상 받기]를 눌러 총 10만 WLD 시드를 최종 완성합니다.',
                  'Claim 3 beginner quests in Quest menu to complete your initial 100,000 WLD seed milestone.',
                  'クエストメニューで完了した初心者クエスト3種の[報酬受取]を押し、10万WLDの種銭を完成させます。',
                  '在任务中心领取已完成的3项新手任务奖励，完成10万WLD初始本金的里程碑。'
                )}
              </p>
            </div>
            <Link
              href="/quests"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-2 border-t border-zinc-800/60"
            >
              <span>{t('퀘스트 보상 받기', 'Claim Quest Rewards', 'クエスト報酬を受取', '领取任务奖励')}</span>
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
                {t(
                  '실제 사이트 UI 실시간 모션 비디오 시뮬레이터',
                  'Live Interactive UI Motion Video Simulator',
                  '実サイトUIリアルタイムモーション動画シミュレーター',
                  '实景UI动态视频演示模拟器'
                )}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              {stage === 'early' &&
                t(
                  '🌱 초반 시뮬레이션: 무료 룰렛 회전 ➔ 덕이 펫 ➔ 인턴 업무 급여 ➔ 10만 WLD 완성 시연',
                  '🌱 Early Simulator: Free Roulette Spin ➔ Deoki Pet ➔ Salary Payout ➔ 100k Seed Reached',
                  '🌱 序盤シミュレーター：無料ルーレット ➔ ペット育成 ➔ 給与即時受給 ➔ 10万WLD達成',
                  '🌱 初盘模拟：免费转盘 ➔ 宠物互动 ➔ 工作领薪 ➔ 达成10万WLD'
                )}
              {stage === 'mid' &&
                t(
                  '📈 중반 시뮬레이션: 30일 복리 포켓 예치 ➔ 침팬지 반도체 10호가 매수 ➔ 5대 계산기 ➔ 1,000만 WLD 돌파 시연',
                  '📈 Mid Simulator: 30-Day Compound Pot ➔ WDX 10-Depth Limit Order ➔ DCA Calc ➔ 10M WLD Reached',
                  '📈 中盤シミュレーター：30日複利預金 ➔ 10段階気配値指値買い ➔ 損益計算機 ➔ 1,000万WLD突破',
                  '📈 中盘模拟：30天复利存款 ➔ 10档买盘限价挂单 ➔ 保本计算 ➔ 突破1000万WLD'
                )}
              {stage === 'late' &&
                t(
                  '👑 후반 시뮬레이션: 강남 테헤란로 랜드 분양 ➔ 매일 자정 패시브 월세 ➔ 프레스티지 환생 ➔ 1억 건물주 등극 시연',
                  '👑 Late Simulator: Prime Land Purchase ➔ Midnight Passive Rent ➔ Prestige Rebirth ➔ 100M Tycoon',
                  '👑 終盤シミュレーター：テヘラン路オフィス分譲 ➔ 午前0時不労所得 ➔ プレステージ転生 ➔ 1億WLDオーナー',
                  '👑 后盘模拟：认购核心地段写字楼 ➔ 零点自动被动租金 ➔ 飞升觉醒 ➔ 晋级1亿地产大亨'
                )}
            </p>
          </div>

          {/* 컨트롤 버튼 그룹 (속도/이전/재생/다음/리셋) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevStep}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs gap-1 rounded-lg"
              title={t('이전 씬', 'Previous Scene', '前のシーン', '上一幕')}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('이전', 'Prev', '前へ', '上一步')}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 h-9 px-3.5 text-xs gap-1.5 rounded-lg font-bold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? t('일시정지', 'Pause', '一時停止', '暂停') : t('시연 재생', 'Play', '再生', '播放')}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextStep}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs gap-1 rounded-lg"
              title={t('다음 씬', 'Next Scene', '次のシーン', '下一幕')}
            >
              <span className="hidden sm:inline">{t('다음', 'Next', '次へ', '下一步')}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleSpeed}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-2.5 text-xs font-mono rounded-lg"
              title={t('재생 속도 조절', 'Playback Speed', '再生速度', '播放倍速')}
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
              title={t('처음부터 다시보기', 'Restart', '最初から再生', '重新播放')}
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
                {stage === 'early' &&
                  [
                    t('1. 무료 룰렛', '1. Free Roulette', '1. 無料ルーレット', '1. 免费转盘'),
                    t('2. 덕이 펫', '2. Deoki Pet', '2. ドギペット', '2. 宠物养成'),
                    t('3. 인턴 업무', '3. Daily Work', '3. インターン業務', '3. 实习打卡'),
                    t('4. 10만 달성', '4. 100k Seed', '4. 10万WLD達成', '4. 达成10万'),
                  ][stepIdx]}
                {stage === 'mid' &&
                  [
                    t('1. 복리 포켓', '1. Compound Pot', '1. 複利ポケット', '1. 复利口袋'),
                    t('2. 주식 호가', '2. Stock Order', '2. 株式指値注文', '2. 股票限价'),
                    t('3. 계산기 진단', '3. DCA Calculator', '3. 損益計算機', '3. 保本计算'),
                    t('4. 1천만 돌파', '4. 10M Milestone', '4. 1,000万突破', '4. 突破千万'),
                  ][stepIdx]}
                {stage === 'late' &&
                  [
                    t('1. 랜드 분양', '1. Land Purchase', '1. ランド分譲', '1. 地产认购'),
                    t('2. 패시브 월세', '2. Passive Rent', '2. 不労所得家賃', '2. 被动租金'),
                    t('3. 프레스티지', '3. Prestige Rebirth', '3. プレステージ転生', '3. 飞升觉醒'),
                    t('4. 1억 제국', '4. 100M Empire', '4. 1億WLD帝国', '4. 亿级帝国'),
                  ][stepIdx]}
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
                        <Sparkles className="w-4 h-4" />{' '}
                        {t('씬 01: 24시간 일일 무료 럭키 룰렛 스핀', 'Scene 01: Daily Free Lucky Roulette Spin', 'シーン01：24時間無料ラッキールーレット', '第1幕：24小时每日免费幸运转盘')}
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                        {t('무료 1회', '1 Free Spin', '無料1回', '免费1次')}
                      </Badge>
                    </div>
                    <div className="text-center py-6 bg-zinc-950 rounded-xl border border-zinc-800 relative overflow-hidden">
                      <div className="text-4xl font-extrabold text-amber-300 mb-2 animate-bounce">🎰</div>
                      <div className="text-lg font-bold text-white font-sans">
                        {t('럭키 룰렛 회전 완료!', 'Roulette Spin Completed!', 'ルーレット当選確定！', '转盘抽奖完成！')}
                      </div>
                      <p className="text-xs text-emerald-400 font-bold mt-1">
                        {t('+20,000 WLD 잭팟 당첨 (지갑 즉시 입금)', '+20,000 WLD Jackpot Won (Deposited to Wallet)', '+20,000 WLD 当選（ウォレット即時入金）', '+20,000 WLD 大奖入账 (已存入钱包)')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [룰렛 돌리기] 원클릭', 'Tip: 1-click [Spin]', '操作：[スピン]をワンクリック', '操作提示：一键点击[转动]')}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5 animate-pulse" />{' '}
                        {t('클릭 시뮬레이션 중', 'Simulating Click', 'クリック実演中', '模拟点击中')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-pink-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-pink-400 font-bold text-sm flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />{' '}
                        {t('씬 02: 마스코트 덕이 펫 케어 & 보너스 수령', 'Scene 02: Mascot Deoki Pet Care & Subsidy', 'シーン02：ドギペット育成＆ボーナス受取', '第2幕：德克宠物互动抚育与福利领取')}
                      </span>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/40">
                        {t('호감도 Lv.2', 'Affection Lv.2', '親密度 Lv.2', '好感度 Lv.2')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">🦆</div>
                          <div>
                            <div className="font-bold text-white text-xs font-sans">
                              {t('부자 덕이 (Lv.2)', 'Rich Deoki (Lv.2)', 'リッチ・ドギ (Lv.2)', '大富豪德克 (Lv.2)')}
                            </div>
                            <div className="text-[11px] text-pink-400">
                              {t('포만도 100% · 기분 최고', 'Fullness 100% · Feeling Great', '満腹度100% · ご機嫌最高', '饱食度100% · 心情绝佳')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-sm">+5,000 WLD</div>
                          <div className="text-[10px] text-zinc-400">
                            {t('일일 돌봄 지원금', 'Daily Care Allowance', 'デイリー育成支援金', '每日抚育补贴')}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full w-[85%] transition-all duration-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [쓰다듬기] & [먹이주기]', 'Tip: [Pet] & [Feed]', '操作：[撫でる]＆[餌やり]', '操作提示：[抚摸]与[喂食]')}</span>
                      <span className="text-pink-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('친밀도 +15% 상승', '+15% Affection Gain', '親密度+15%アップ', '好感度+15%提升')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />{' '}
                        {t('씬 03: 핀테크 인턴 개발자 업무 수락 & 제출', 'Scene 03: Fintech Developer Shift Submission', 'シーン03：フィンテック開発者の業務提出', '第3幕：金融科技开发工作提交与领薪')}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                        {t('업무 완료', 'Shift Complete', '業務完了', '工作完成')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300 font-sans">
                          {t('직무: 핀테크 인턴 코딩 테스트', 'Task: Fintech Code Verification', '職務：フィンテックコーディング検証', '任务：金融科技代码审核')}
                        </span>
                        <span className="text-emerald-400 font-bold">+15,000 WLD</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[100%] transition-all duration-500" />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{t('쿨다운: 30초 완료', 'Cooldown: 30s Met', 'クールダウン：30秒満了', '倒计时：30秒已完成')}</span>
                        <span className="text-emerald-400 font-bold">{t('경험치 +50 XP 획득', '+50 XP Gained', '経験値+50 XP獲得', '获得经验+50 XP')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [업무 시작] 누르고 30초 후 [제출]', 'Tip: Clock in and submit in 30s', '操作：[業務開始]後30秒で[提出]', '操作：打卡开始30秒后点击[提交]')}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('WorkReceipt 영수증 발행', 'WorkReceipt Issued', '給与領収書発行', '电子领薪收据已开具')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border-2 border-emerald-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block font-sans">
                      {t('★ 1단계 목표 완성: 종잣돈 10만 WLD 달성 ★', '★ Stage 1 Milestone: 100k WLD Seed Reached ★', '★ 第1段階目標達成：種銭10万WLD形成 ★', '★ 第1阶段里程碑：积攒10万WLD初始本金达成 ★')}
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      100,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      {t(
                        '축하합니다! 무자본 3분 만에 초기 시드가 완성되었습니다. 이제 2단계(중반 복리 예금 & WDX 주식 투자)로 자산을 1,000만 단위로 굴릴 준비가 끝났습니다.',
                        'Congratulations! Your zero-capital seed is ready in 3 minutes. You are now prepared to scale into Stage 2 (Compounding & Stocks) up to 10M WLD.',
                        'おめでとうございます！ゼロ資本3分で種銭が完成しました。第2段階（複利預金＆株式投資）で資産を1,000万単位に拡大しましょう。',
                        '恭喜！零本金3分钟内初始资金已就绪。现在准备进入第2阶段（复利与股票建仓），迈向千万财富。'
                      )}
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('mid')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        {t('2단계(중반 복리 & 주식) 시뮬레이터 보기 →', 'Explore Stage 2 Simulator →', '第2段階シミュレーターへ →', '查看第2阶段模拟器 →')}
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
                        <Landmark className="w-4 h-4" />{' '}
                        {t('씬 01: 중앙은행 30일 스마트 복리 포켓 예치', 'Scene 01: Central Bank 30-Day Compound Pot', 'シーン01：中央銀行30日スマート複利預金', '第1幕：中央银行30天智能复利储蓄')}
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                        {t('연 7.2% 복리', '7.2% APY Compounding', '年利7.2% 複利', '年化7.2% 复利')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">{t('예치 원금', 'Principal Amount', '預入元本', '存入本金')}</span>
                        <span className="text-white font-bold">50,000 WLD ({t('시드의 50%', '50% of Seed', 'シードの50%', '初始资金的50%')})</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">{t('매일 자정 복리 이자', 'Midnight Daily Compounding', '毎日午前0時 複利利息', '每日零点复利利息')}</span>
                        <span className="text-emerald-400 font-bold">+295 WLD / {t('일 누적', 'Day', '日', '天')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">{t('30일 만기 세후 총액', '30-Day Maturity Value', '30日満期予想総額', '30天到期本息总额')}</span>
                        <span className="text-cyan-300 font-bold">58,850 WLD ({t('자동 지갑 입금', 'Auto-Deposited', '自動入金', '自动到账')})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [중앙은행] → [30일 포켓] 예치', 'Tip: [Bank] → [30-Day Pot]', '操作：[中央銀行] ➔ [30日ポケット]', '操作提示：[中央银行] ➔ [30天复利口袋]')}</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('원금 100% 보장', '100% Principal Safe', '元本100%保証', '100%保本')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />{' '}
                        {t('씬 02: WDX 침팬지 반도체 10-Depth 호가창 매수', 'Scene 02: WDX Semiconductor 10-Depth Limit Buy', 'シーン02：WDX半導体 10段階気配値指値買い', '第2幕：WDX芯片半导体10档买盘限价挂单')}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                        {t('지정가 체결', 'Limit Executed', '指値約定', '限价已成交')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">{t('종목: WDX-TEC (침팬지 반도체)', 'Ticker: WDX-TEC (Chimp Semi)', '銘柄：WDX-TEC (半導体)', '标的：WDX-TEC (芯片半导体)')}</span>
                        <span className="text-emerald-400 font-bold">{t('10주 매수 완료', '10 Shares Filled', '10株購入完了', '10股买入成功')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('체결 단가', 'Execution Price', '約定単価', '成交均价')}</span>
                        <span className="text-white font-bold">74,200 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('실시간 평가 손익', 'Unrealized P&L', '評価損益', '浮动盈亏')}</span>
                        <span className="text-emerald-400 font-bold">+12.4% (+92,000 WLD)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: 10단계 호가창 클릭 후 매수', 'Tip: Click orderbook depth to buy', '操作：気配値板クリックで注文', '操作提示：点击买卖盘深度快速挂单')}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5" />{' '}
                        {t('실시간 호가 체결', 'Live Execution', 'リアルタイム約定', '实时撮合成交')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-rose-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                        <Calculator className="w-4 h-4" />{' '}
                        {t('씬 03: 5대 계산기 목표가 역산 & SNS 공유 카드', 'Scene 03: 5 Financial Calculators & Viral Share Card', 'シーン03：5大金融計算機＆SNS共有カード', '第3幕：5大金融计算器保本逆算与分享卡')}
                      </span>
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40">
                        {t('0.1초 진단', '0.1s Scan', '0.1秒診断', '0.1秒极速诊断')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('목표 익절가', 'Target Exit Price', '目標利確価格', '目标止盈价')}</span>
                        <span className="text-emerald-400 font-bold">85,000 WLD (+14.5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('물타기 손익분기', 'DCA Break-even', 'ナンピン損益分岐点', '加仓保本点')}</span>
                        <span className="text-cyan-400 font-bold">71,500 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('바이럴 카드 공유', 'Viral Share Card', 'SNSカード共有', '一键生成分享卡')}</span>
                        <span className="text-amber-400 font-bold">{t('카카오톡/디스코드 1초 복사', '1-Click Discord/X Copy', '1クリック共有', '微信/Discord一秒复制')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [금융 계산기]로 리스크 관리', 'Tip: Manage risk with Calculators', '操作：[金融計算ツール]でリスク管理', '操作提示：使用[计算工具]进行风险管理')}</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('포트폴리오 안전 진단', 'Safe Allocation', 'ポートフォリオ安全診断', '投资组合安全诊断')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-zinc-900 border-2 border-cyan-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-sans">
                      {t('★ 2단계 목표 완성: 1,000만 WLD 돌파 ★', '★ Stage 2 Milestone: 10,000,000 WLD Reached ★', '★ 第2段階目標達成：1,000万WLD突破 ★', '★ 第2阶段里程碑：突破1000万WLD达成 ★')}
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      10,000,000 WLD
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      {t(
                        '복리 이자와 주식 시세 차익, 직업 승진 급여로 천만 단위 자산가가 되었습니다! 이제 3단계(부동산 건물주)로 진입하여 잠자는 동안에도 돈이 들어오는 제국을 만듭니다.',
                        'Scaled into an 8-figure portfolio through compounding, stock yields, and career mastery! Advance to Stage 3 (Real Estate Tycoon) for continuous passive rent.',
                        '複利利息と株式売買益、昇格給与で1,000万単位の資産家に！第3段階（不動産オーナー）で寝ている間も入る不労所得帝国を築きましょう。',
                        '通过复利利息、股票交易差价及职位升迁薪水，已成为千万级资产拥有者！进入第3阶段（地产包租公），构建睡后收入帝国。'
                      )}
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('late')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        {t('3단계(후반 부동산 건물주) 시뮬레이터 보기 →', 'Explore Stage 3 Simulator →', '第3段階シミュレーターへ →', '查看第3阶段模拟器 →')}
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
                        <Building2 className="w-4 h-4" />{' '}
                        {t('씬 01: 강남 테헤란로 프라임 오피스 랜드 분양', 'Scene 01: Teheran-ro Prime Office Land Purchase', 'シーン01：江南テヘラン路オフィス分譲・登記', '第1幕：认购江南德黑兰路核心地段写字楼')}
                      </span>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                        {t('등기 완료', 'Title Registered', '登記完了', '产权登记完毕')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('취득 가격', 'Acquisition Cost', '取得価格', '认购价格')}</span>
                        <span className="text-white font-bold">15,000,000 WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Cap Rate ({t('연 순수익률', 'Net Yield', '年間利回り', '年化净租金率')})</span>
                        <span className="text-emerald-400 font-bold">{t('연 8.4% (공실률 0%)', '8.4% APY (0% Vacancy)', '年8.4% (空室率0%)', '年化8.4% (0空置率)')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('소유권', 'Ownership', '所有権', '所有权')}</span>
                        <span className="text-indigo-300 font-bold">{t('계정 영구 등기 등록', 'Permanent Title Deed', 'アカウント永久登記', '账号永久所有权')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [공간] → [랜드 분양] 원클릭', 'Tip: [Spaces] → [Buy Land]', '操作：[空間] ➔ [ランド分譲]', '操作提示：[空间] ➔ [地产认购]')}</span>
                      <span className="text-indigo-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('건물주 자격 획득', 'Landlord Status', 'オーナー資格獲得', '获得房东资质')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 1 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                        <Coins className="w-4 h-4" />{' '}
                        {t('씬 02: 매일 자정 패시브 임대료 자동 정산', 'Scene 02: Midnight Automated Passive Rent Payout', 'シーン02：毎日午前0時 不労所得家賃自動振込', '第2幕：每晚零点自动被动租金结息到账')}
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                        {t('자동 입금', 'Auto-Paid', '自動入金', '自动结付')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">{t('일일 월세 수입', 'Daily Rent Income', '日次家賃収入', '每日租金收入')}</span>
                        <span className="text-emerald-400 font-bold">+125,000 WLD / {t('매일 자정', 'Midnight', '午前0時', '每日零点')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('월 환산 패시브 수익', 'Monthly Passive Yield', '月換算不労所得', '月度折算被动收益')}</span>
                        <span className="text-amber-400 font-bold">+3,750,000 WLD / {t('월', 'Month', '月', '月')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: 가만히 있어도 매일 자정에 자동 지급', 'Tip: 100% automated payouts every midnight', '操作：ログイン不要で毎日0時自動受給', '提示：无需操作，每日零点自动分账')}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('100% 무노동 패시브 인컴', '100% Passive Wealth', '100%不労所得', '100%被动睡后收入')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 2 && (
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-cyan-500/50 space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />{' '}
                        {t('씬 03: 프레스티지 환생으로 영구 배율 부스트', 'Scene 03: Prestige Rebirth Global Multiplier Boost', 'シーン03：プレステージ転生で全収益永久ブースト', '第3幕：飞升觉醒永久全局收益倍率增益')}
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                        {t('환생 1회차', 'Prestige 1', '転生1回目', '1阶转世')}
                      </Badge>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{t('영구 수익 배율', 'Global Yield Multiplier', '永久収益倍率', '永久收益倍数')}</span>
                        <span className="text-emerald-400 font-bold">{t('모든 수익 +25% 영구 증가', '+25% Boost on All Yields', '全収益+25%永久増加', '所有收益永久提升+25%')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">VIP {t('골든 체스트', 'Golden Chest', 'ゴールデンチェスト', '黄金宝箱')}</span>
                        <span className="text-amber-400 font-bold">{t('매일 특별 보상 상자 해금', 'Daily Premium Chest Unlocked', '毎日特別報酬ボックス解禁', '每日专属黄金宝箱解锁')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800 text-zinc-400">
                      <span>{t('조작 팁: [성장] → [프레스티지 환생] 진행', 'Tip: [Progression] → [Prestige]', '操作：[成長] ➔ [プレステージ転生]', '操作提示：[进阶] ➔ [飞升觉醒]')}</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                        {t('골든 아우라 획득', 'Golden Aura Acquired', 'ゴールデンオーラ獲得', '获得专属金色光环')}
                      </span>
                    </div>
                  </div>
                )}

                {actionStep === 3 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-zinc-900 border-2 border-amber-500 space-y-3 text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-sans">
                      {t('★ 3단계 완결: 머니버스 금융 제국 완성 ★', '★ Stage 3 Mastered: Financial Empire Complete ★', '★ 第3段階完結：マネーバース金融帝国完成 ★', '★ 第3阶段完结：商业金融帝国完全体达成 ★')}
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      100,000,000 WLD+
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-md mx-auto">
                      {t(
                        '축하합니다! 매일 가만히 있어도 수백만 WLD의 임대료와 복리가 들어오는 최고 칭호 [금융 제국 건물주]에 등극했습니다.',
                        'Congratulations! You have attained the highest title [Empire Tycoon], generating millions of WLD daily in passive dividends and rent.',
                        'おめでとうございます！何もしなくても毎日数百万WLDの家賃と複利が入る最高称号[金融帝国オーナー]に登極しました。',
                        '恭喜！您已加冕最高称号[金融帝国地产大亨]，每日坐享数百万WLD被动分红与租金收入。'
                      )}
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStageChange('early')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-4 rounded-lg"
                      >
                        {t('1단계(초반 시드 모으기) 다시보기 ↺', 'Replay Stage 1 (Seed Building) ↺', '第1段階（シード形成）を再視聴 ↺', '重温第1阶段（初始本金） ↺')}
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
                {t('2단계 · 4~14일차', 'Stage 2 · Day 4–14', '第2段階 · 4〜14日目', '第2阶段 · 第4~14天')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t(
                  '📈 중반: 복리 예금 + 주식 분할 매수로 1,000만 WLD 굴리기',
                  '📈 Mid Game: Compounding & Stock Scaling up to 10,000,000 WLD',
                  '📈 中盤：複利預金＆株式分割買いで1,000万WLD形成',
                  '📈 中盘：复利储蓄与股票分批建仓冲击1000万WLD'
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t(
                '목표: 10,000,000 WLD 달성 | 필수 활동: 30일 복리 포켓 예치 + WDX 10-Depth 호가 매수 + 직업 승진',
                'Goal: Reach 10,000,000 WLD | Key Actions: 30-Day Pot Deposit + 10-Depth Limit Buy + Career Mastery',
                '目標：1,000万WLD達成 | 必須活動：30日複利預金 ＋ WDX気配値指値買い ＋ 昇格試験',
                '目标：达成10,000,000 WLD | 核心操作：存入30天复利口袋 + 10档买盘限价挂单 + 职位晋升'
              )}
            </p>
          </div>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-cyan-950/50">
            <Link href="/bank">
              {t('2단계 시작: 복리 예금 넣기', 'Start Stage 2: Deposit Compound Pot', '第2段階開始：複利預金へ', '开始第2阶段：存入复利存款')}
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Landmark className="w-4 h-4" /> {t('Action 01. 30일 복리 포켓', 'Action 01. 30-Day Pot', 'Action 01. 30日複利預金', 'Action 01. 30天复利口袋')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">7.2% APY</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '모은 시드 10만 WLD 중 50%를 중앙은행 30일 복리 포켓에 넣어두면 매일 자정에 자동으로 원금+이자에 복리 이자가 계속 붙습니다.',
                'Deposit 50% of your 100k seed into Central Bank 30-Day Pot for continuous midnight compounding.',
                'シード10万WLDの50%を中央銀行30日複利ポケットに預け、毎日午前0時に利息を自動複利運用します。',
                '将10万启动资金的50%存入中央银行30天复利口袋，每日零点自动滚存复利。'
              )}
            </p>
            <Link href="/bank" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('복리 포켓 개설하기 →', 'Open Compound Pot →', '複利ポケットを開設 →', '开设复利口袋 →')}
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="w-4 h-4" /> {t('Action 02. WDX 대장주 매수', 'Action 02. WDX Blue-Chip Buy', 'Action 02. WDX主要銘柄購入', 'Action 02. 买入WDX龙头股')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{t('10호가 지정가', '10-Depth Limit', '10段階指値', '10档限价')}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '나머지 50% 자금으로 침팬지 반도체(WDX-TEC)나 AI 대장주를 10단계 호가창에서 분할 매수하여 +10~20% 시세 차익을 노립니다.',
                'Use remaining 50% funds to scale into WDX-TEC (Chimp Semi) via 10-Depth orderbook for +10-20% gains.',
                '残り50%の資金でWDX半導体や主要AI銘柄を10段階気配値板で分割購入し、+10〜20%の利確を狙います。',
                '用剩余50%资金在10档买卖盘中分批建仓芯片龙头股，锁定+10~20%价差收益。'
              )}
            </p>
            <Link href="/stocks" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('주식 호가창 가기 →', 'Go to Orderbook →', '株式気配値板へ →', '前往股票交易盘 →')}
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Calculator className="w-4 h-4" /> {t('Action 03. 계산기 진단 & 승진', 'Action 03. Calculator & Promotion', 'Action 03. 計算機診断＆昇格', 'Action 03. 计算器诊断与升职')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{t('급여 5배', '5x Salary', '日給5倍', '薪资5倍')}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '물타기/복리 계산기로 손익분기점을 확인하고, 직업 레벨업을 통해 주니어/시니어로 승진하여 일일 급여를 5배로 증폭시킵니다.',
                'Check break-even targets via DCA Calculator, then promote to Senior level to multiply daily salary by 5x.',
                'ナンピン・複利計算機で損益分岐点を診断し、昇格試験に合格して日給を5倍に増幅させます。',
                '使用补仓及复利计算器掌握保本点，通过职位晋升考核让每日薪资提升5倍。'
              )}
            </p>
            <Link href="/tools" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('계산기 진단하기 →', 'Diagnose with Calculators →', '計算機で診断 →', '前往计算器诊断 →')}
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
                {t('3단계 · 15~30일차+', 'Stage 3 · Day 15–30+', '第3段階 · 15〜30日目+', '第3阶段 · 第15~30天+')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t(
                  '👑 후반: 가상 부동산 건물주 & 억대 패시브 인컴',
                  '👑 Late Game: Real Estate Tycoon & 100M+ Passive Cash Flow',
                  '👑 終盤：仮想不動産オーナー＆億単位の不労所得',
                  '👑 后盘：虚拟地产包租公与亿级被动财富'
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t(
                '목표: 100,000,000 WLD+ 달성 | 필수 활동: 강남/판교 랜드 분양 + 매일 월세 수령 + 프레스티지 환생',
                'Goal: 100,000,000 WLD+ | Key Actions: Prime Land Purchase + Automated Daily Rent + Prestige Rebirth',
                '目標：1億WLD+達成 | 必須活動：江南・板橋ランド分譲 ＋ 毎日家賃自動受給 ＋ プレステージ転生',
                '目标：达成100,000,000 WLD+ | 核心操作：认购核心地段写字楼 + 每日租金自动到账 + 飞升觉醒'
              )}
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-amber-950/50">
            <Link href="/spaces/real-estate">
              {t('3단계 시작: 랜드 분양소 가기', 'Start Stage 3: Visit Land Agency', '第3段階開始：ランド分譲所へ', '开始第3阶段：前往地产认购处')}
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Building2 className="w-4 h-4" /> {t('Action 01. 강남/판교 랜드 분양', 'Action 01. Prime Land Purchase', 'Action 01. 江南・板橋ランド分譲', 'Action 01. 认购江南/板桥地块')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{t('영구 소유', 'Permanent Title', '永久所有', '永久产权')}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '강남 테헤란로, 여의도, 판교 8대 상권의 가상 토지 및 오피스를 분양받아 내 계정으로 영구 등기 등록합니다.',
                'Acquire and permanently register prime commercial plots in Teheran-ro, Yeouido, and Pangyo.',
                '江南テヘラン路、汝矣島、板橋の8大商圏の仮想土地・オフィスを取得し、アカウントへ永久登記します。',
                '认购德黑兰路、汝矣岛、板桥等核心商圈的虚拟地产，完成账号永久产权登记。'
              )}
            </p>
            <Link href="/spaces/real-estate" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('랜드 맵 살펴보기 →', 'Explore Land Map →', 'ランドマップを見る →', '查看地产地图 →')}
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-4 h-4" /> {t('Action 02. 매일 패시브 임대료 수령', 'Action 02. Midnight Passive Rent', 'Action 02. 毎日不労所得家賃受取', 'Action 02. 每日被动租金入账')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{t('매일 자정 입금', 'Midnight Payout', '午前0時自動入金', '每日零点结付')}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '아무것도 하지 않아도 입주 기업과 세입자로부터 매일 자정에 수십만~수백만 WLD의 월세가 지갑으로 자동 정산 입금됩니다.',
                'Earn hundreds of thousands to millions of WLD automatically deposited to your wallet every midnight.',
                '何もしなくても入居企業やテナントから毎夜0時に数十万〜数百万WLDの家賃が自動振込されます。',
                '无需任何额外操作，每晚零点自动收到入驻企业与租户支付的数十万至数百万WLD租金。'
              )}
            </p>
            <Link href="/spaces" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('내 공간 관리하기 →', 'Manage My Spaces →', 'マイスペース管理 →', '管理我的空间 →')}
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between font-bold text-zinc-200">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4" /> {t('Action 03. 프레스티지 환생', 'Action 03. Prestige Rebirth', 'Action 03. プレステージ転生', 'Action 03. 飞升觉醒')}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">+25% {t('영구 배율', 'Multiplier', '永久倍率', '永久增益')}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {t(
                '최고 등급 달성 후 프레스티지 환생을 진행하여 모든 급여, 배당, 이자 수익을 영구적으로 +25% 증폭시키는 골든 특권을 획득합니다.',
                'Prestige after reaching max milestones to permanently boost all salary, dividend, and interest yields by +25%.',
                '最高ランク到達後にプレステージ転生を実行し、全給与・配当・利息収益を+25%永久増幅させます。',
                '达到最高段位后执行飞升觉醒，永久提升所有薪资、分红及利息收益+25%。'
              )}
            </p>
            <Link href="/progression/prestige" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1">
              {t('프레스티지 환생하기 →', 'Perform Prestige Rebirth →', 'プレステージ転生を実行 →', '执行飞升觉醒 →')}
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
              {t(
                '💡 1분 요약: 매일 들어와서 해야 할 3가지 루틴',
                '💡 1-Minute Daily Cheat Sheet: 3 Core Routines',
                '💡 1分要約：毎日ログインして行う3つのルーティン',
                '💡 1分钟秘籍：每日必做3大核心日常'
              )}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-zinc-400">
            {t(
              '하루 딱 1분만 투자하면 자동으로 자산이 불어나는 머니버스 데일리 루틴입니다.',
              'Spend just 1 minute a day to let your Moneyverse virtual wealth grow automatically.',
              '1日わずか1分の投資で自動的に資産が増え続けるデイリールーティンです。',
              '每天仅需1分钟，让您的Moneyverse虚拟财富自动滚雪球增长。'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-emerald-400 font-bold text-sm">
              {t('1. 무료 룰렛 돌리기 (10초)', '1. Spin Free Roulette (10s)', '1. 無料ルーレットを回す (10秒)', '1. 免费转动转盘 (10秒)')}
            </span>
            <p className="text-xs text-zinc-300 font-sans">
              {t('카지노 메뉴에서 룰렛 스핀 눌러 공짜 WLD 즉시 수령', 'Spin in Casino menu to claim free WLD immediately', 'カジノメニューでルーレットを回して無料WLD受取', '在游戏菜单点击转盘即刻领取免费WLD')}
            </p>
          </div>
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-cyan-400 font-bold text-sm">
              {t('2. 복리 이자 & 임대료 수령 (10초)', '2. Claim Interest & Rent (10s)', '2. 複利利息＆家賃受取 (10秒)', '2. 领取利息与租金 (10秒)')}
            </span>
            <p className="text-xs text-zinc-300 font-sans">
              {t('은행과 부동산 메뉴에서 [이자 수령] 원클릭 청구', '1-click claim in Bank and Real Estate menus', '銀行と不動産メニューで[利息受取]をワンクリック', '在银行与地产菜单中一键结算')}
            </p>
          </div>
          <div className="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-amber-400 font-bold text-sm">
              {t('3. 직업 업무 1회 시작 (10초)', '3. Start 1 Career Shift (10s)', '3. 職業業務を1回開始 (10秒)', '3. 开启1次工作打卡 (10秒)')}
            </span>
            <p className="text-xs text-zinc-300 font-sans">
              {t('직업 메뉴에서 업무 시작 누르고 창 닫아두면 자동 완료', 'Clock in at Career menu, auto-completes in background', '職業メニューで業務開始を押せば自動完了', '在职业菜单打卡上岗，后台自动计时完成')}
            </p>
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
