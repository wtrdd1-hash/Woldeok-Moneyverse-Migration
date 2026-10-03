'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Building2,
  Landmark,
  Zap,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Share2,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { markOnboardingActionComplete } from '@/lib/onboarding-tracker';
import { playWinSound } from '@/lib/audio-effects';
import { useLocale } from '@/components/locale-provider';

export type InvestorType = 'conservative' | 'balanced' | 'aggressive' | 'cashflow';

interface LocalizedString {
  ko: string;
  en: string;
  ja: string;
  zh: string;
}

interface QuizOption {
  readonly text: LocalizedString;
  readonly subtext: LocalizedString;
  readonly type: InvestorType;
}

interface QuizQuestion {
  readonly id: number;
  readonly title: LocalizedString;
  readonly subtitle: LocalizedString;
  readonly options: readonly QuizOption[];
}

const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    title: {
      ko: '당신의 주된 자산 증식 목표는 무엇인가요?',
      en: 'What is your primary wealth-building objective?',
      ja: 'あなたの主な資産形成目標は何ですか？',
      zh: '您最主要的资产增值核心目标是什么？',
    },
    subtitle: {
      ko: '가장 중요하게 생각하는 투자 철학을 선택하세요.',
      en: 'Choose the investment philosophy that matters most to you.',
      ja: '最も重視する投資哲学を選択してください。',
      zh: '请选择您最认可的核心投资哲学。',
    },
    options: [
      {
        text: {
          ko: '원금 100% 안전 보장과 복리 이자',
          en: '100% Principal Protection & Compound Interest',
          ja: '元本100%保証と複利利息',
          zh: '100%保本安全与稳健复利利息',
        },
        subtext: {
          ko: '자산 하락 걱정 없이 매일 확실한 복리 이자만 수령',
          en: 'Earn predictable compound interest daily without market downside stress',
          ja: '相場下落の不安なく、毎日の確実な複利利息のみを受給',
          zh: '无需担忧市场波动，每晚稳定收获确定的复利收益',
        },
        type: 'conservative',
      },
      {
        text: {
          ko: '은행 금리를 뛰어넘는 균형 있는 성장',
          en: 'Balanced Growth Outpacing Bank Rates',
          ja: '銀行金利を上回るバランス成長',
          zh: '超越银行基准利率的平衡稳健增长',
        },
        subtext: {
          ko: '안정적인 예금과 우량 주식을 분산하여 꾸준한 우상향',
          en: 'Diversify across high-yield deposits and blue-chip equities for steady growth',
          ja: 'スマート預金と優良株を分散し、着実に右肩上がりの成長を実現',
          zh: '分散配置高息储蓄与优质蓝筹标的，实现平稳长期复利',
        },
        type: 'balanced',
      },
      {
        text: {
          ko: '고변동성 텐배거 대박과 초고속 자산 증식',
          en: 'High-Volatility 10-Bagger Alpha & Fast Capital Growth',
          ja: 'テンバガー級の急騰狙い＆超高速資産拡大',
          zh: '高波动十倍黑马标的与超高速资本膨胀',
        },
        subtext: {
          ko: 'AI 테크/반도체 주식 및 공격적인 기회 포착',
          en: 'Capture aggressive swings in AI tech & semiconductor momentum stocks',
          ja: 'AI・半導体などの成長株で積極的なチャンスを掴む',
          zh: '果断出击AI科技与半导体高弹性标的，捕捉超额收益',
        },
        type: 'aggressive',
      },
      {
        text: {
          ko: '일하지 않아도 매일 들어오는 패시브 임대료/배당',
          en: 'Automated Daily Passive Rent & Dividends',
          ja: '寝ていても毎日振り込まれる不労所得・家賃収入',
          zh: '无须劳作每晚自动结算的被动租金与分红',
        },
        subtext: {
          ko: '가상 랜드/오피스를 보유하고 자고 있어도 월세 수령',
          en: 'Hold virtual land and commercial offices for continuous daily cash flow',
          ja: '仮想ビルやランドを所有し、完全自動で家賃収入を構築',
          zh: '持有虚拟核心地产与地块，坐享源源不断的每日现金流',
        },
        type: 'cashflow',
      },
    ],
  },
  {
    id: 2,
    title: {
      ko: '보유 자산이 일시적으로 -10% 하락했을 때 당신의 행동은?',
      en: 'How do you react if your portfolio drops -10% temporarily?',
      ja: '保有資産が一時的に -10% 下落した場合の行動は？',
      zh: '当持仓组合短线下跌 -10% 时，您的第一反应是？',
    },
    subtitle: {
      ko: '시장 변동성에 대처하는 심리적 태도를 파악합니다.',
      en: 'Evaluating your psychological resilience to market volatility.',
      ja: '市場のボラティリティに対する心理的耐久度を測定します。',
      zh: '评估您应对短期市场波动的心理承受力与交易纪律。',
    },
    options: [
      {
        text: {
          ko: '너무 불안해서 즉시 전액 인출 및 예금 이동',
          en: 'Panic sell immediately and move to zero-risk deposits',
          ja: '不安のため即座に全額引き出して安全預金へ避難',
          zh: '极度焦虑并立即全额撤出转入零风险银行储蓄',
        },
        subtext: {
          ko: '원금 손실 스트레스를 극도로 기피하는 성향',
          en: 'Strict risk aversion with zero tolerance for drawdowns',
          ja: '元本割れのストレスを極力避けたい完全防衛志向',
          zh: '对本金亏损零容忍的绝对防御型偏好',
        },
        type: 'conservative',
      },
      {
        text: {
          ko: '장기 분산 포트폴리오를 믿고 차분히 관망',
          en: 'Stay calm and trust the long-term diversified portfolio',
          ja: '長期分散投資を信じて冷静に静観する',
          zh: '坚守长期多元化资产配置，冷静泰然处之',
        },
        subtext: {
          ko: '단기 노이즈에 흔들리지 않는 원칙주의 성향',
          en: 'Disciplined approach immune to short-term market noise',
          ja: '短期ノイズに惑わされない原則重視スタイル',
          zh: '不被短期杂音干扰的严格纪律投资风格',
        },
        type: 'balanced',
      },
      {
        text: {
          ko: '저가 줍줍 바겐세일 찬스로 판단하고 추가 매수',
          en: 'Treat it as a fire-sale discount and aggressively buy the dip',
          ja: 'バーゲンセールと判断して積極的に買い増し（押し目買い）',
          zh: '视为绝佳打折黄金买点，果断加仓倒金字塔补仓',
        },
        subtext: {
          ko: '조정장을 수익 극대화의 기회로 전환하는 공격 성향',
          en: 'Opportunistic mindset turning pullbacks into massive profit catalysts',
          ja: '調整局面を利益最大化のチャンスに変える攻撃型スタイル',
          zh: '将市场回调转化为利润爆发催化剂的进取交易风格',
        },
        type: 'aggressive',
      },
      {
        text: {
          ko: '매일 자정에 입금되는 임대료/배당만 유지되면 무관심',
          en: 'Unbothered as long as daily midnight rental income keeps flowing',
          ja: '午前0時の家賃・配当さえ継続すれば相場変動は気にしない',
          zh: '只要每晚零点的被动租金分红准时到账，便毫不在意短期波动',
        },
        subtext: {
          ko: '시세 차익보다 현금흐름(Cashflow)을 최우선시하는 성향',
          en: 'Prioritizing recurring yield and cash flow over market price swings',
          ja: 'キャピタルゲインより持続的なインカムゲインを最優先',
          zh: '比起资本利得更注重持续稳定现金流收益的领主思维',
        },
        type: 'cashflow',
      },
    ],
  },
  {
    id: 3,
    title: {
      ko: '하루에 투자 및 자산 관리에 할애할 수 있는 시간은?',
      en: 'How much time can you dedicate daily to portfolio management?',
      ja: '1日に資産管理に充てられる時間はどのくらいですか？',
      zh: '您每天愿意投入多少时间在投资与资产管理上？',
    },
    subtitle: {
      ko: '자신의 라이프스타일에 맞는 운용 주기를 선택하세요.',
      en: 'Select the management frequency fitting your daily lifestyle.',
      ja: 'ご自身のライフスタイルに合った運用ペースを選択してください。',
      zh: '请选择最契合您日常生活节奏的管理频率。',
    },
    options: [
      {
        text: {
          ko: '하루 10초 복리 이자 확인 및 룰렛만 돌리기',
          en: '10 seconds daily to claim interest and spin the lucky roulette',
          ja: '1日10秒、複利利息確認とルーレットを回すだけ',
          zh: '每天仅需10秒查看利息与旋转每日幸运转盘',
        },
        subtext: {
          ko: '완전 자동화된 무신경 패시브 관리 선호',
          en: 'Prefers fully automated hands-off set-and-forget management',
          ja: '完全自動化された手間のいらないパッシブ運用',
          zh: '偏好全自动、省心省力的被动式管理',
        },
        type: 'conservative',
      },
      {
        text: {
          ko: '하루 1~3분 시세 점검 및 일일 직업 업무 완수',
          en: '1~3 minutes daily to check quotes and finish work quests',
          ja: '1日1〜3分、相場チェックと日課タスクの完了',
          zh: '每天1~3分钟浏览市场行情并完成日常工作任务',
        },
        subtext: {
          ko: '일일 루틴과 주간 리밸런싱의 조화',
          en: 'Harmonious balance of daily quick routine and weekly rebalancing',
          ja: '日々のルーティンと週次リバランスの調和',
          zh: '日常轻量化打卡与周期性资产再平衡的完美结合',
        },
        type: 'balanced',
      },
      {
        text: {
          ko: '실시간 호가창 10-Depth 확인 및 스캘핑/단타',
          en: 'Real-time 10-depth order book tracking and dynamic day trading',
          ja: 'リアルタイム10本気配値の分析とスキャルピング・短期売買',
          zh: '实时盯盘10档深度买卖盘，参与高频短线日内交易',
        },
        subtext: {
          ko: '급등락 종목을 실시간으로 추적하며 적극 운용',
          en: 'Active intraday trading targeting high-beta momentum stocks',
          ja: '急変動銘柄をリアルタイムで追跡するアクティブ運用',
          zh: '实时捕捉超高弹性热门标的并主动出击',
        },
        type: 'aggressive',
      },
      {
        text: {
          ko: '주 1회 부동산 임대 수익 정산 및 건물 증축 관리',
          en: 'Weekly check-in on real estate yield and landmark expansion',
          ja: '週1回、不動産家賃収入の集計とビル拡張管理',
          zh: '每周定期清算地产租金收益与大厦物业升级管理',
        },
        subtext: {
          ko: '묵직한 실물 자산 위주의 주기적 점검',
          en: 'Periodic macro review centered on heavy physical yield assets',
          ja: '手堅い実物資産を中心とした定期的な資産点検',
          zh: '以核心实体资产为依托的定期低频宏观检视',
        },
        type: 'cashflow',
      },
    ],
  },
];

interface ProfileResult {
  readonly type: InvestorType;
  readonly title: LocalizedString;
  readonly badge: LocalizedString;
  readonly description: LocalizedString;
  readonly tag: LocalizedString;
  readonly expectedApr: string;
  readonly allocations: readonly {
    readonly name: LocalizedString;
    readonly ratio: number;
    readonly color: string;
    readonly bgClass: string;
    readonly href: string;
    readonly actionLabel: LocalizedString;
  }[];
}

const PROFILES: Record<InvestorType, ProfileResult> = {
  conservative: {
    type: 'conservative',
    title: {
      ko: '🛡️ 철통 방어 복리 수호자',
      en: '🛡️ Conservative Compound Sentinel',
      ja: '🛡️ 元本防衛・複利ガーディアン',
      zh: '🛡️ 稳健防守型·复利守门人',
    },
    badge: {
      ko: '안정형 (Conservative Sentinel)',
      en: 'Conservative Strategy',
      ja: '安定型 (Conservative)',
      zh: '稳健防御型 (Conservative)',
    },
    tag: {
      ko: '원금 보장 & 무손실',
      en: '100% Principal Protection',
      ja: '元本保証 ＆ ゼロリスク',
      zh: '保本优先 零风险',
    },
    expectedApr: '연 7.2% ~ 12.0%',
    description: {
      ko: '원금 손실 리스크를 0%에 가깝게 통제하며, 중앙은행 스마트 복리 포켓과 무위험 가상 국채를 통해 매일 밤 확실한 이자를 수확하는 가장 견고한 투자 전략입니다.',
      en: 'Controls downside risk near 0%, harvesting predictable daily interest via the Central Bank Compound Pot and risk-free sovereign bonds.',
      ja: '元本割れリスクを極限まで抑え、中央銀行スマート複利預金と仮想国債を通じて毎晩確実な利息を収穫する堅牢な戦略です。',
      zh: '将本金亏损风险严格控制在趋近于0%，依托中央银行智能复利口袋与虚拟国债，每晚稳定获取确定的复利利息收益。',
    },
    allocations: [
      {
        name: {
          ko: '중앙은행 스마트 복리 포켓 (30일/90일)',
          en: 'Central Bank Smart Compound Pot (30D/90D)',
          ja: '中央銀行スマート複利預金 (30日/90日)',
          zh: '中央银行智能复利储蓄口袋 (30天/90天)',
        },
        ratio: 70,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: {
          ko: '복리 금고 예치하기',
          en: 'Deposit in Vault',
          ja: '複利金庫に預金する',
          zh: '存入复利金库',
        },
      },
      {
        name: {
          ko: '가상 국채 & 안정 통화 포트폴리오',
          en: 'Virtual Sovereign Bonds & Stable Reserve',
          ja: '仮想国債 ＆ 安定通貨ポートフォリオ',
          zh: '虚拟国债与稳定资产组合',
        },
        ratio: 20,
        color: '#06b6d4',
        bgClass: 'bg-cyan-500',
        href: '/bank',
        actionLabel: {
          ko: '국채 매수하기',
          en: 'Buy Sovereign Bonds',
          ja: '国債を購入する',
          zh: '申购虚拟国债',
        },
      },
      {
        name: {
          ko: 'WDX 고배당 가치주',
          en: 'WDX High-Dividend Value Equities',
          ja: 'WDX 高配当バリュー株',
          zh: 'WDX 高股息价值标的',
        },
        ratio: 10,
        color: '#8b5cf6',
        bgClass: 'bg-purple-500',
        href: '/stocks',
        actionLabel: {
          ko: '배당주 포트폴리오 보기',
          en: 'View Dividend Stocks',
          ja: '高配当株一覧を見る',
          zh: '查看高股息组合',
        },
      },
    ],
  },
  balanced: {
    type: 'balanced',
    title: {
      ko: '⚖️ 스마트 올라운드 다이나모',
      en: '⚖️ Smart All-Round Dynamo',
      ja: '⚖️ スマートバランス・ダイナモ',
      zh: '⚖️ 智能全能型·平衡发电机',
    },
    badge: {
      ko: '균형성장형 (Balanced Dynamo)',
      en: 'Balanced Growth Strategy',
      ja: 'バランス成長型 (Balanced)',
      zh: '平衡成长型 (Balanced)',
    },
    tag: {
      ko: '우량주 + 복리 황금비',
      en: 'Blue-Chips + Compound Golden Ratio',
      ja: '優良株 ＋ 複利黄金比',
      zh: '蓝筹标的 + 黄金复利比',
    },
    expectedApr: '연 18.5% ~ 28.0%',
    description: {
      ko: '안정적인 복리 이자로 하방을 방어하면서, WDX 대표 우량주와 메가시티 랜드에 분산 투자하여 시장 평균을 압도하는 복리 우상향을 달성하는 정석적인 전략입니다.',
      en: 'Defends the downside with compound savings while capturing market upside across WDX blue chips and virtual commercial real estate.',
      ja: 'スマート預金で下落を防ぎつつ、WDX代表銘柄と仮想メガシティ不動産に分散投資して市場平均を上回る資産成長を目指す王道戦略です。',
      zh: '以稳健复利储蓄锁定下行安全垫，同时分散配置WDX核心蓝筹与虚拟大都会地产，实现超越市场基准的复合复利曲线。',
    },
    allocations: [
      {
        name: {
          ko: 'WDX 대표 우량주 (침팬지반도체, AI테크)',
          en: 'WDX Blue-Chip Equities (Chimp Semi, AI Tech)',
          ja: 'WDX 代表優良株 (Chimp半導体、AIテック)',
          zh: 'WDX 代表性优质蓝筹 (黑猩猩半导体、AI科技)',
        },
        ratio: 40,
        color: '#f59e0b',
        bgClass: 'bg-amber-500',
        href: '/stocks',
        actionLabel: {
          ko: '10-Depth 호가 거래소 입장',
          en: 'Enter 10-Depth Exchange',
          ja: '10本気配値取引所へ',
          zh: '进入10档买卖盘交易大厅',
        },
      },
      {
        name: {
          ko: '중앙은행 스마트 복리 포켓',
          en: 'Central Bank Smart Compound Pot',
          ja: '中央銀行スマート複利預金',
          zh: '中央银行智能复利储蓄',
        },
        ratio: 40,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: {
          ko: '복리 포켓 열기',
          en: 'Open Compound Pot',
          ja: '複利預金を開設する',
          zh: '开启复利金库',
        },
      },
      {
        name: {
          ko: '가상 부동산 메가시티 리츠',
          en: 'Virtual Real Estate Megacity REITs',
          ja: '仮想メガシティ不動産REIT',
          zh: '虚拟大都会地产信托 REITs',
        },
        ratio: 20,
        color: '#3b82f6',
        bgClass: 'bg-blue-500',
        href: '/spaces/real-estate',
        actionLabel: {
          ko: '부동산 랜드 확인',
          en: 'Explore Land Parcels',
          ja: '不動産ランドを確認する',
          zh: '查验地产物业',
        },
      },
    ],
  },
  aggressive: {
    type: 'aggressive',
    title: {
      ko: '🚀 폭풍 성장 공격형 알파',
      en: '🚀 High-Growth Aggressive Alpha',
      ja: '🚀 ハイグロース・アグレッシブアルファ',
      zh: '🚀 进取开拓型·高增长Alpha',
    },
    badge: {
      ko: '공격투자형 (Aggressive Alpha)',
      en: 'Aggressive Alpha Strategy',
      ja: '積極投資型 (Aggressive)',
      zh: '进取进攻型 (Aggressive)',
    },
    tag: {
      ko: '텐배거 급등주 & 고수익',
      en: '10-Bagger Momentum & Alpha',
      ja: 'テンバガー級急騰株 ＆ 高収益',
      zh: '十倍高成长标的 爆发收益',
    },
    expectedApr: '연 45.0% ~ 120%+',
    description: {
      ko: '단기 급등 잠재력을 지닌 신성장 WDX 종목에 집중 투자하며, 5대 계산기의 정밀 물타기/익절가 분석과 아케이드 럭키 스핀을 전략적으로 활용해 초고속 자산 팽창을 노립니다.',
      en: 'Focuses heavily on high-growth WDX momentum stocks, leveraging precise DCA/take-profit calculators and arcade spins for aggressive expansion.',
      ja: '急成長するWDXモメンタム銘柄に集中投資し、ナンピン計算機やアーケードスピンを戦略的に活用して爆発的な資産拡大を狙います。',
      zh: '聚焦高弹性新锐成长标的，依托精算法华智能摊平/止盈计算工具与娱乐转盘，全力捕捉资本几何级爆发裂变机会。',
    },
    allocations: [
      {
        name: {
          ko: 'WDX 고변동성 급등 성장주 & 테마주',
          en: 'WDX High-Beta Growth & Thematic Equities',
          ja: 'WDX 高ボラティリティ急騰株 ＆ テーマ株',
          zh: 'WDX 高弹性暴涨成长标的与热门概念',
        },
        ratio: 60,
        color: '#ef4444',
        bgClass: 'bg-rose-500',
        href: '/stocks',
        actionLabel: {
          ko: '급등주 호가창 실시간 매수',
          en: 'Trade High-Beta Stocks',
          ja: '急騰銘柄をリアルタイム買い付け',
          zh: '闪电下单暴涨标的',
        },
      },
      {
        name: {
          ko: '비상금 복리 포켓 (익절 수익금 안착)',
          en: 'Emergency Compound Pot (Profit Vault)',
          ja: '緊急複利金庫 (利益確定金の保管)',
          zh: '应急复利口袋 (锁定止盈利润)',
        },
        ratio: 20,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: {
          ko: '수익금 금고 이체',
          en: 'Transfer Profits to Vault',
          ja: '利益を金庫へ移動する',
          zh: '利润归集入库',
        },
      },
      {
        name: {
          ko: '도파민 아케이드 & 럭키 룰렛',
          en: 'Arcade Arena & Daily Lucky Spin',
          ja: 'アーケード ＆ ラッキールーレット',
          zh: '娱乐互动竞技场与每日幸运大转盘',
        },
        ratio: 20,
        color: '#ec4899',
        bgClass: 'bg-pink-500',
        href: '/casino',
        actionLabel: {
          ko: '아케이드 행운 도전',
          en: 'Spin Lucky Roulette',
          ja: 'ラッキーチャレンジ',
          zh: '开启幸运转盘挑战',
        },
      },
    ],
  },
  cashflow: {
    type: 'cashflow',
    title: {
      ko: '👑 패시브 인컴 캐시플로우 제국',
      en: '👑 Passive Income Cashflow Sovereign',
      ja: '👑 不労所得・キャッシュフロー主権者',
      zh: '👑 被动现金流·地产领主',
    },
    badge: {
      ko: '현금흐름형 (Cashflow Sovereign)',
      en: 'Cashflow Sovereign Strategy',
      ja: 'キャッシュフロー型 (Cashflow)',
      zh: '现金流领主型 (Cashflow)',
    },
    tag: {
      ko: '매일 자정 월세 수령',
      en: 'Daily Midnight Rent Payout',
      ja: '毎晩0時の自動家賃受取',
      zh: '每晚零点自动结算租金',
    },
    expectedApr: '일 0.3% (연 109.5% 복리)',
    description: {
      ko: '시세 차익의 불확실성을 배제하고, 강남/판교의 알짜 가상 랜드 및 오피스를 보유하여 매일 자정 계좌로 꽂히는 무한 패시브 임대료를 구축하는 건물주 전략입니다.',
      en: 'Eliminates equity speculation by acquiring prime Gangnam/Pangyo virtual real estate to generate recurring midnight passive rental cash flow.',
      ja: '相場変動リスクを排除し、一等地ランド・ビルを所有して毎日0時に自動入金される不労所得を築くメガ大家戦略です。',
      zh: '剔除二级市场波动的随机性，稳健持有核心地段虚拟地块与商业楼宇，构建每晚零点全自动到账的终极被动租金收益帝国。',
    },
    allocations: [
      {
        name: {
          ko: '강남/판교 가상 메가시티 랜드 & 오피스',
          en: 'Prime Landmark Virtual Land & Commercial Offices',
          ja: '一等地 仮想メガシティランド ＆ オフィス',
          zh: '核心地段虚拟大都会地块与甲级写字楼',
        },
        ratio: 50,
        color: '#8b5cf6',
        bgClass: 'bg-purple-500',
        href: '/spaces/real-estate',
        actionLabel: {
          ko: '강남 빌딩/랜드 분양받기',
          en: 'Acquire Prime Properties',
          ja: '一等地物件を取得する',
          zh: '认购核心地产地块',
        },
      },
      {
        name: {
          ko: '중앙은행 30일/90일 확정 복리 포켓',
          en: 'Central Bank 30D/90D Compound Pot',
          ja: '中央銀行 30日/90日 定期複利預金',
          zh: '中央银行30天/90天定期复利金库',
        },
        ratio: 30,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: {
          ko: '임대료 복리 재투자',
          en: 'Auto-Reinvest Rent',
          ja: '家賃収入を複利再投資',
          zh: '租金复利再投资',
        },
      },
      {
        name: {
          ko: 'WDX 고배당 가치주 & 리츠',
          en: 'WDX High-Yield Dividend Stocks & REITs',
          ja: 'WDX 高配当銘柄 ＆ 不動産REIT',
          zh: 'WDX 高股息价值标的与地产信托',
        },
        ratio: 20,
        color: '#f59e0b',
        bgClass: 'bg-amber-500',
        href: '/stocks',
        actionLabel: {
          ko: '배당주 매수하기',
          en: 'Buy Dividend Equities',
          ja: '配当株を購入する',
          zh: '买入高股息标的',
        },
      },
    ],
  },
};

export function InvestorProfileQuiz() {
  const { locale } = useLocale();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<InvestorType[]>([]);
  const [resultType, setResultType] = useState<InvestorType | null>(null);
  const [simulatedSeed, setSimulatedSeed] = useState<number>(100000);

  const t = (localized: LocalizedString) => {
    switch (locale) {
      case 'en':
        return localized.en;
      case 'ja':
        return localized.ja;
      case 'zh':
        return localized.zh;
      default:
        return localized.ko;
    }
  };

  const handleSelectOption = (type: InvestorType) => {
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // 3문항 완료 -> 최빈값 계산
      const counts: Record<InvestorType, number> = {
        conservative: 0,
        balanced: 0,
        aggressive: 0,
        cashflow: 0,
      };
      nextAnswers.forEach((ans) => {
        counts[ans] = (counts[ans] || 0) + 1;
      });

      let topType: InvestorType = 'balanced';
      let maxCount = -1;
      (Object.keys(counts) as InvestorType[]).forEach((tType) => {
        const count = counts[tType] ?? 0;
        if (count > maxCount) {
          maxCount = count;
          topType = tType;
        }
      });

      setResultType(topType);

      // 온보딩 트래커 보너스 연동 (+20,000 WLD)
      const res = markOnboardingActionComplete('take_quiz');
      if (res.isNewlyCompleted) {
        playWinSound();
        const toastTitle = {
          ko: '🎉 AI 투자 성향 진단 완료! 온보딩 퀘스트 보너스 획득!',
          en: '🎉 AI Investment Persona Diagnosed! Onboarding Bonus Unlocked!',
          ja: '🎉 AI投資スタイル診断完了！オンボーディングボーナス獲得！',
          zh: '🎉 AI投资偏好诊断完成！新手任务奖励已解锁！',
        };
        const toastDesc = {
          ko: '퀘스트 서랍에서 20,000 WLD 보너스를 즉시 수령하세요.',
          en: 'Claim your 20,000 WLD bonus from the quest drawer now.',
          ja: 'クエストドロワーから 20,000 WLD ボーナスを今すぐお受け取りください。',
          zh: '请前往任务抽屉立即领取 20,000 WLD 奖励。',
        };
        toast.success(t(toastTitle), {
          description: t(toastDesc),
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultType(null);
  };

  const handleShare = () => {
    if (!resultType) return;
    const profile = PROFILES[resultType];
    const textKo = `[머니버스 AI 투자 성향 진단 결과]\n나의 투자 페르소나: ${t(profile.title)} (${t(profile.badge)})\n예상 기대 수익률: ${profile.expectedApr}\n지금 무료로 진단받고 20,000 WLD 받으세요: https://easy-scraping.com/roadmap#quiz`;
    const textEn = `[Moneyverse AI Investment Persona Result]\nMy Persona: ${t(profile.title)} (${t(profile.badge)})\nExpected Yield: ${profile.expectedApr}\nTake the free diagnostic & claim 20,000 WLD: https://easy-scraping.com/roadmap#quiz`;
    const textJa = `[マネーバース AI投資タイプ診断結果]\n投資ペルソナ: ${t(profile.title)} (${t(profile.badge)})\n期待利回り: ${profile.expectedApr}\n無料で診断して 20,000 WLD を獲得: https://easy-scraping.com/roadmap#quiz`;
    const textZh = `[Moneyverse AI投资偏好诊断报告]\n专属投资画像: ${t(profile.title)} (${t(profile.badge)})\n预期年化回报率: ${profile.expectedApr}\n立即免费诊断并领取 20,000 WLD: https://easy-scraping.com/roadmap#quiz`;

    const sharePayload = locale === 'en' ? textEn : locale === 'ja' ? textJa : locale === 'zh' ? textZh : textKo;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(sharePayload);
      const copySuccessTitle = {
        ko: '📋 진단 결과가 클립보드에 복사되었습니다!',
        en: '📋 Diagnostic result copied to clipboard!',
        ja: '📋 診断結果がクリップボードにコピーされました！',
        zh: '📋 诊断结果已成功复制到剪贴板！',
      };
      const copySuccessDesc = {
        ko: '친구들에게 공유하고 나의 투자 성향을 자랑하세요.',
        en: 'Share with friends and show off your investment persona.',
        ja: '友達にシェアして投資スタイルを共有しましょう。',
        zh: '快分享给好友展示您的专属投资组合偏好。',
      };
      toast.success(t(copySuccessTitle), {
        description: t(copySuccessDesc),
      });
    }
  };

  return (
    <Card id="quiz" className="relative overflow-hidden border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-md">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t({
                ko: 'AI 맞춤형 투자 성향 진단기 & 1초 포트폴리오',
                en: 'AI Investment Persona Diagnostic & Instant Portfolio',
                ja: 'AIオーダーメイド投資タイプ診断 ＆ 1秒ポートフォリオ',
                zh: 'AI量身定制投资偏好诊断器与即时资产配置',
              })}
            </span>
          </div>

          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            {t({
              ko: '🎁 진단 완료 시 +20,000 WLD 퀘스트 지급',
              en: '🎁 Complete Quiz for +20,000 WLD Quest Bonus',
              ja: '🎁 診断完了で +20,000 WLD クエスト報酬',
              zh: '🎁 完成诊断即享 +20,000 WLD 专属任务奖励',
            })}
          </Badge>
        </div>

        <CardTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-2">
          {resultType
            ? t({
                ko: '나만의 맞춤형 핀테크 자산 배분 포트폴리오',
                en: 'Your Tailored Fintech Asset Allocation Blueprint',
                ja: 'あなた専用のフィンテック資産配分ポートフォリオ',
                zh: '为您量身定制的金融科技资产配置全景蓝图',
              })
            : t({
                ko: '30초 만에 찾는 나의 최적 머니버스 투자 페르소나',
                en: 'Discover Your Optimal Moneyverse Persona in 30 Seconds',
                ja: '30秒で見つける最適なマネーバース投資ペルソナ',
                zh: '只需30秒即刻测出您的最佳Moneyverse投资画像',
              })}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-zinc-400">
          {resultType
            ? t({
                ko: '당신의 성향에 맞춰 수학적으로 계산된 최적의 자산 배분 비중입니다. 버튼을 눌러 즉시 시작하세요.',
                en: 'Mathematically optimized asset weights tailored to your profile. Click to deploy now.',
                ja: 'あなたの投資スタイルに合わせて最適化された資産配分です。ボタンを押して今すぐ始めましょう。',
                zh: '根据您的个人偏好通过数学建模精准优化的资产配比。点击按钮即刻部署开启。',
              })
            : t({
                ko: '어떤 기능부터 시작해야 할지 고민되시나요? 3가지 질문에 답하면 당신에게 꼭 맞는 공략법을 즉시 설계해 드립니다.',
                en: 'Unsure where to begin? Answer 3 quick questions to build your personalized mastery plan.',
                ja: 'どこから始めるべきか迷っていますか？3つの質問に答えるだけで、最適な攻略法を設計します。',
                zh: '不确定从哪个功能开始体验？只需回答3个简短问题，即刻为您量身定制实操进阶路线图。',
              })}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-2">
        {!resultType ? (
          <div className="space-y-6">
            {/* 프로그레스 바 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>
                  {t({
                    ko: `질문 ${currentStep + 1} / ${QUIZ_QUESTIONS.length}`,
                    en: `Question ${currentStep + 1} / ${QUIZ_QUESTIONS.length}`,
                    ja: `質問 ${currentStep + 1} / ${QUIZ_QUESTIONS.length}`,
                    zh: `题目 ${currentStep + 1} / ${QUIZ_QUESTIONS.length}`,
                  })}
                </span>
                <span>{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 현재 질문 */}
            {(() => {
              const activeQuestion = (QUIZ_QUESTIONS[currentStep] ?? QUIZ_QUESTIONS[0]) as QuizQuestion;
              return (
                <>
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      Q{activeQuestion.id}. {t(activeQuestion.title)}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {t(activeQuestion.subtitle)}
                    </p>
                  </div>

                  {/* 보기 리스트 */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt.type)}
                        className="group relative flex flex-col items-start justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-left transition-all hover:border-primary/50 hover:bg-zinc-850 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 group-hover:bg-primary group-hover:text-black">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm font-semibold text-zinc-100 group-hover:text-primary">
                              {t(opt.text)}
                            </span>
                          </div>
                          <p className="pl-7 text-xs text-zinc-400 leading-relaxed">
                            {t(opt.subtext)}
                          </p>
                        </div>
                        <div className="mt-3 flex w-full items-center justify-end text-[11px] font-medium text-zinc-500 group-hover:text-primary">
                          <span>
                            {t({
                              ko: '선택하기',
                              en: 'Select',
                              ja: '選択する',
                              zh: '点击选择',
                            })}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          /* 진단 결과 화면 */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 결과 헤더 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-400">
                    {t(PROFILES[resultType].badge)}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {t(PROFILES[resultType].title)}
                  </h3>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1 font-mono">
                  {t({
                    ko: '기대 수익률',
                    en: 'Target Yield',
                    ja: '期待利回り',
                    zh: '预期年化收益率',
                  })}: {PROFILES[resultType].expectedApr}
                </Badge>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(PROFILES[resultType].description)}
              </p>
            </div>

            {/* 자산 배분 비중 시각화 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-200">
                  📊 {t({
                    ko: '추천 자산 배분 비율 (Asset Allocation)',
                    en: 'Target Asset Allocation Matrix',
                    ja: '推奨資産配分比率 (Asset Allocation)',
                    zh: '推荐投资组合权重 (Asset Allocation)',
                  })}
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{t({ ko: '시드머니:', en: 'Seed Capital:', ja: 'シード資金:', zh: '初始本金:' })}</span>
                  <select
                    value={simulatedSeed}
                    onChange={(e) => setSimulatedSeed(Number(e.target.value))}
                    className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-primary font-mono"
                  >
                    <option value={100000}>100,000 WLD</option>
                    <option value={1000000}>1,000,000 WLD</option>
                    <option value={10000000}>10,000,000 WLD</option>
                    <option value={100000000}>100,000,000 WLD</option>
                  </select>
                </div>
              </div>

              {/* 멀티 컬러 프로그레스 바 */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                {PROFILES[resultType].allocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${alloc.bgClass} transition-all`}
                    style={{ width: `${alloc.ratio}%` }}
                    title={`${t(alloc.name)}: ${alloc.ratio}%`}
                  />
                ))}
              </div>

              {/* 배분 상세 카드 그리드 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PROFILES[resultType].allocations.map((alloc, idx) => {
                  const allocatedAmount = Math.round((simulatedSeed * alloc.ratio) / 100);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-300">
                            {t(alloc.name)}
                          </span>
                          <span className="font-mono text-xs font-bold" style={{ color: alloc.color }}>
                            {alloc.ratio}%
                          </span>
                        </div>
                        <div className="font-mono text-lg font-extrabold text-white">
                          {allocatedAmount.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">WLD</span>
                        </div>
                      </div>

                      <Link href={alloc.href} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold border-zinc-700 hover:border-primary hover:text-primary transition-colors"
                        >
                          <span>{t(alloc.actionLabel)}</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 하단 리셋 및 공유 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {t({
                    ko: '성향 다시 진단하기',
                    en: 'Retake Diagnostic Quiz',
                    ja: '診断をやり直す',
                    zh: '重新测试诊断',
                  })}
                </span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-zinc-800 text-xs font-semibold hover:border-primary cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>
                    {t({
                      ko: '진단 결과 공유하기',
                      en: 'Share Result',
                      ja: '結果をシェアする',
                      zh: '分享诊断结果',
                    })}
                  </span>
                </Button>

                <Link href="/roadmap">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 cursor-pointer"
                  >
                    <span>
                      {t({
                        ko: '실전 3단계 로드맵 따라하기',
                        en: 'Follow 3-Step Live Roadmap',
                        ja: '実践3ステップロードマップへ',
                        zh: '前往体验3阶段实操路线图',
                      })}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
