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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/components/locale-provider';
import { playWinSound, playCoinCollectSound } from '@/lib/audio-effects';

export interface JobMeta {
  id: string;
  nameKo: string;
  nameEn: string;
  nameJa: string;
  nameZh: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  fieldKo: string;
  fieldEn: string;
  fieldJa: string;
  fieldZh: string;
  descKo: string;
  descEn: string;
  descJa: string;
  descZh: string;
  sampleTaskKo: string;
  sampleTaskEn: string;
  sampleTaskJa: string;
  sampleTaskZh: string;
  baseSalary: string;
  strategyKo: string;
  strategyEn: string;
  strategyJa: string;
  strategyZh: string;
}

export const CAREER_GUIDE_JOBS: JobMeta[] = [
  {
    id: 'FINTECH_DEVELOPER',
    nameKo: '핀테크 개발자',
    nameEn: 'Fintech Developer',
    nameJa: 'フィンテック開発者',
    nameZh: '金融科技开发者',
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    fieldKo: '알고리즘 & 스마트 컨트랙트',
    fieldEn: 'Algorithms & Smart Contracts',
    fieldJa: 'アルゴリズム & スマートコントラクト',
    fieldZh: '算法与智能合约',
    descKo: '거래 시스템 백엔드 API 최적화 및 스마트 컨트랙트 단위 테스트를 수행합니다.',
    descEn: 'Optimize trading backend APIs and conduct smart contract unit tests.',
    descJa: '取引所バックエンドAPIの最適化およびスマートコントラクト単体テストを実施します。',
    descZh: '优化交易系统后端API并执行智能合约单元测试。',
    sampleTaskKo: '스마트 컨트랙트 단위 테스트 & 가스비 최적화',
    sampleTaskEn: 'Smart Contract Unit Testing & Gas Optimization',
    sampleTaskJa: 'スマートコントラクト単体テスト＆ガス代最適化',
    sampleTaskZh: '智能合约单元测试与Gas费优化',
    baseSalary: '1,500 ~ 4,500 WLD',
    strategyKo: '가장 안정적인 기본급을 제공하며, 초보자 무자본 시드머니 모으기에 가장 적합합니다.',
    strategyEn: 'Provides the most stable base salary, ideal for beginners building zero-capital seed money.',
    strategyJa: '最も安定した基本給を提供し、初心者のゼロ資本シード資金作りに最適です。',
    strategyZh: '提供最稳定的基础薪资，非常适合新手零成本积攒初始本金。',
  },
  {
    id: 'QUANT_TRADER',
    nameKo: '퀀트 트레이더',
    nameEn: 'Quant Trader',
    nameJa: 'クオンツトレーダー',
    nameZh: '量化交易员',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    fieldKo: '주식 & 호가창 파생상품',
    fieldEn: 'Equities & Order Book Derivatives',
    fieldJa: '株式 ＆ 板情報デリバティブ',
    fieldZh: '股票与订单簿衍生品',
    descKo: 'WDX 10대 종목의 호가창 유동성을 공급하고 차트 변동성 알고리즘을 분석합니다.',
    descEn: 'Provide order book liquidity for Top 10 WDX equities and analyze volatility algorithms.',
    descJa: 'WDX主要10銘柄の板情報流動性を供給し、ボラティリティアルゴリズムを分析します。',
    descZh: '为WDX前10大标的提供买卖盘流动性，分析量化波动率算法。',
    sampleTaskKo: 'WDX-20 인덱스 10-Depth 호가 분석 및 유동성 공급',
    sampleTaskEn: 'WDX-20 Index 10-Depth Order Book Liquidity Provision',
    sampleTaskJa: 'WDX-20指数 10本気配値分析と流動性供給',
    sampleTaskZh: 'WDX-20指数 10档买卖盘深度分析与流动性做市',
    baseSalary: '2,000 ~ 6,000 WLD',
    strategyKo: '주식 거래 수수료 할인 혜택과 연계되며, 주식 매매와 함께 진행 시 수익이 극대화됩니다.',
    strategyEn: 'Tied to equity fee discounts, maximizing returns when combined with active stock trading.',
    strategyJa: '株式取引手数料割引と連動し、実際の株式売買と併用することで収益が最大化します。',
    strategyZh: '享受股票交易手续费减免特权，配合现货实盘交易可实现收益最大化。',
  },
  {
    id: 'CENTRAL_BANKER',
    nameKo: '중앙은행가',
    nameEn: 'Central Banker',
    nameJa: '中央銀行総裁・金融官',
    nameZh: '中央银行家',
    icon: <Landmark className="w-5 h-5 text-amber-400" />,
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    fieldKo: '금리 정책 & 통화 유동성',
    fieldEn: 'Interest Policy & Money Supply',
    fieldJa: '金利政策 ＆ 通貨供給量管理',
    fieldZh: '利率政策与货币流动性',
    descKo: '국채 발행 심사, 통화량 공급 조절 및 중앙은행 예적금 금리 정책을 입안합니다.',
    descEn: 'Review sovereign bond issuances, regulate money supply, and structure deposit rates.',
    descJa: '国債発行審査、マネーサプライ調整、中央銀行預金金利ポリシーを策定します。',
    descZh: '审批国债发行规模，调控市场货币供给并制定央行智能储蓄利率。',
    sampleTaskKo: '월덕 국채 30년물 발행 심사 및 유동성 감사',
    sampleTaskEn: '30-Year Sovereign Bond Issuance Audit & Liquidity Review',
    sampleTaskJa: '30年物国債発行審査および流動性監査',
    sampleTaskZh: '30年期国债发行审核与市场流动性清算',
    baseSalary: '2,500 ~ 7,500 WLD',
    strategyKo: '중앙은행 스마트 복리 포켓 예금과 결합하면 일일 수령 급여가 복리로 증식됩니다.',
    strategyEn: 'Pair with the Central Bank Compound Savings Pot to auto-compound daily earnings.',
    strategyJa: '中央銀行のスマート複利預金と組み合わせることで、受取給与が複利で雪だるま式に増殖します。',
    strategyZh: '结合央行智能复利口袋储蓄，可将每日薪水自动以复利形式几何级增殖。',
  },
  {
    id: 'REAL_ESTATE_TYCOON',
    nameKo: '부동산 재벌',
    nameEn: 'Real Estate Tycoon',
    nameJa: '不動産オーナー・メガ大家',
    nameZh: '地产大亨',
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    fieldKo: '가상 부동산 & 임대 관리',
    fieldEn: 'Virtual Real Estate & Rent Management',
    fieldJa: '仮想不動産 ＆ 家賃収入管理',
    fieldZh: '虚拟房产与租金管理',
    descKo: '월덕 특별시 상가 임대차 계약 관리 및 랜드마크 시세를 감정평가합니다.',
    descEn: 'Manage commercial lease contracts and evaluate landmark appraisal pricing.',
    descJa: '商業ビルの賃貸借契約管理および主要ランドマークの不動産鑑定評価を行います。',
    descZh: '管理商业地产租赁合约，评估核心地段虚拟物业的公允估值。',
    sampleTaskKo: '여의도 핀테크 타워 10층 임대차 계약 갱신',
    sampleTaskEn: '10th Floor Commercial Lease Agreement Renewal',
    sampleTaskJa: 'フィンテックタワー10階 商業賃貸借契約更新',
    sampleTaskZh: '金融科技大厦10层商业租赁合同续签',
    baseSalary: '2,200 ~ 6,800 WLD',
    strategyKo: '가상 부동산 매입 후 임대 수익을 받는 건물주 테크트리의 필수 선행 직업입니다.',
    strategyEn: 'Essential prerequisite career for the passive rental landlord tech tree.',
    strategyJa: '仮想不動産を購入して毎晩家賃収入を得る「不労所得オーナー」への必須キャリアです。',
    strategyZh: '购置虚拟地块并坐享每日被动租金分红的终极包租公必经之路。',
  },
  {
    id: 'AI_RESEARCHER',
    nameKo: 'AI 연구원',
    nameEn: 'AI Researcher',
    nameJa: 'AIエコノミー研究員',
    nameZh: 'AI经济研究员',
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
    color: 'border-pink-500/40 bg-pink-950/20 text-pink-300',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    fieldKo: 'AI Council & 경제 추론',
    fieldEn: 'AI Council & Economic Reasoning',
    fieldJa: 'AI評議会 ＆ 経済推論モデル',
    fieldZh: 'AI经济理事会与宏观推理',
    descKo: 'AI 경제 위원회의 통화 정책 시나리오를 시뮬레이션하고 추론 파라미터를 검증합니다.',
    descEn: 'Simulate AI Council monetary policy scenarios and validate inference parameters.',
    descJa: 'AI経済評議会の政策シナリオをシミュレーションし、推論パラメータを検証します。',
    descZh: '模拟AI经济理事会宏观政策情景，校准量化推理模型参数。',
    sampleTaskKo: 'AI Council 금리 정책 몬테카를로 시뮬레이션',
    sampleTaskEn: 'AI Council Monte Carlo Interest Rate Simulation',
    sampleTaskJa: 'AI評議会 金利政策モンテカルロシミュレーション',
    sampleTaskZh: 'AI理事会 利率政策蒙特卡洛压力测试',
    baseSalary: '2,400 ~ 7,200 WLD',
    strategyKo: '정책 토론 및 AI 여론 예측 베팅과 연계하여 높은 부가 보너스를 노릴 수 있습니다.',
    strategyEn: 'Synergizes with policy debates and AI market predictions for high bonus yields.',
    strategyJa: '政策ディベートやAI予測イベントと連動し、高い追加インセンティブを獲得できます。',
    strategyZh: '深度联动宏观政策辩论与AI预测事件，获取超额附加奖金。',
  },
  {
    id: 'VENTURE_CAPITALIST',
    nameKo: '벤처 투자가',
    nameEn: 'Venture Capitalist',
    nameJa: 'ベンチャーキャピタリスト',
    nameZh: '风险投资家',
    icon: <Coins className="w-5 h-5 text-blue-400" />,
    color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    fieldKo: '스타트업 펀딩 & 비즈니스',
    fieldEn: 'Startup Funding & Dealflow',
    fieldJa: 'スタートアップ投資 ＆ 事業査定',
    fieldZh: '初创企业融资与股权估值',
    descKo: '유망 가상 비즈니스의 시드 투자를 심사하고 비상장 지분을 밸류에이션합니다.',
    descEn: 'Audit early-stage business seed deals and value unlisted equity shares.',
    descJa: '有望な仮想ビジネスのシード投資を審査し、未公開株式のバリュエーションを算定します。',
    descZh: '审核早期创新商业项目种子轮融资，对非公开权益进行估值建模。',
    sampleTaskKo: '시리즈 A 핀테크 스타트업 실사 및 지분 배분',
    sampleTaskEn: 'Series A Fintech Due Diligence & Cap Table Audit',
    sampleTaskJa: 'シリーズA フィンテック企業デューデリジェンス＆株式査定',
    sampleTaskZh: 'A轮金融科技初创企业尽职调查与股权配置',
    baseSalary: '2,300 ~ 7,000 WLD',
    strategyKo: '비즈니스 창업 및 클럽 자금 조달에 특화된 고소득 직업군입니다.',
    strategyEn: 'Specialized in business creation and investment syndicates with premium payouts.',
    strategyJa: '起業やギルド資金調達に特化した、高収入トップティアの職種です。',
    strategyZh: '专精于商业孵化与联合投资财团，享有顶级薪资回报。',
  },
  {
    id: 'SECURITY_AUDITOR',
    nameKo: '보안 감사관',
    nameEn: 'Security Auditor',
    nameJa: 'セキュリティ監査官',
    nameZh: '网络安全审计官',
    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
    color: 'border-teal-500/40 bg-teal-950/20 text-teal-300',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    fieldKo: '트랜잭션 무결성 & 보안',
    fieldEn: 'Transaction Integrity & Security',
    fieldJa: '取引整合性 ＆ セキュリティ防御',
    fieldZh: '交易完整性与安全防御',
    descKo: '비정상적인 다중 계정 트랜잭션 및 악성 취약점 공격 패턴을 분석하여 차단합니다.',
    descEn: 'Detect abnormal multi-account exploits and patch smart contract vulnerability patterns.',
    descJa: '不正な多重アカウント取引や脆弱性攻撃パターンを分析・ブロックします。',
    descZh: '实时分析拦截异常多账号套利及智能合约恶意漏洞攻击。',
    sampleTaskKo: '스마트 컨트랙트 재진입 공격 취약점 긴급 패치 감사',
    sampleTaskEn: 'Smart Contract Reentrancy Vulnerability Security Audit',
    sampleTaskJa: 'スマートコントラクト リエントランシー脆弱性緊急パッチ監査',
    sampleTaskZh: '智能合约重入漏洞紧急安全补丁审计',
    baseSalary: '2,100 ~ 6,500 WLD',
    strategyKo: '보안 퀘스트 및 무결성 감사 보너스가 지속적으로 적립됩니다.',
    strategyEn: 'Continuously stacks integrity audit bounties and security quest bonuses.',
    strategyJa: 'セキュリティクエストや監査ボーナスが継続的に蓄積されます。',
    strategyZh: '可持续获得网络安全任务奖励与系统完整性审计津贴。',
  },
  {
    id: 'MEDIA_JOURNALIST',
    nameKo: '언론 기자',
    nameEn: 'Media Journalist',
    nameJa: '経済ジャーナリスト',
    nameZh: '财经特派记者',
    icon: <Newspaper className="w-5 h-5 text-orange-400" />,
    color: 'border-orange-500/40 bg-orange-950/20 text-orange-300',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    fieldKo: '가상 공시 & 특파원 보도',
    fieldEn: 'Financial Disclosure & News Coverage',
    fieldJa: '企業開示 ＆ 特派員ニュース速報',
    fieldZh: '公司信息披露与深度快讯',
    descKo: '월덕 머니버스 신문 1면에 실릴 속보 기사를 취재하고 기업 공시를 발행합니다.',
    descEn: 'Report breaking headlines for the front page and publish corporate disclosure filings.',
    descJa: 'マネーバース新聞の1面を飾る速報記事を取材し、企業適時開示を発行します。',
    descZh: '采访采写头条即时新闻快报，发布上市公司重大信息披露。',
    sampleTaskKo: 'WDX-01 월덕전자 3분기 실적 어닝 서프라이즈 속보 보도',
    sampleTaskEn: 'WDX-01 Tech Giant Q3 Earnings Surprise Breaking Report',
    sampleTaskJa: 'WDX-01 主要銘柄 第3四半期決算サプライズ速報報道',
    sampleTaskZh: 'WDX-01 科技龙头Q3财报超预期大捷深度快讯',
    baseSalary: '1,800 ~ 5,500 WLD',
    strategyKo: '신문 발행 및 여론 형성 시 추가 원고료 인센티브가 지급됩니다.',
    strategyEn: 'Earn extra manuscript royalties when publishing newspapers and driving market sentiment.',
    strategyJa: '新聞発行および世論形成時に追加原稿料インセンティブが付与されます。',
    strategyZh: '发行报纸与引导市场情绪时可获得丰厚的稿酬版税激励。',
  },
];

export const MASTERY_TIERS_GUIDE = [
  {
    level: 1,
    code: 'APPRENTICE',
    nameKo: '견습 (Apprentice)',
    nameEn: 'Apprentice',
    nameJa: '見習い (Apprentice)',
    nameZh: '见习学徒 (Apprentice)',
    mult: '1.0x',
    descKo: '기본 업무 수행 가능, 일일 급여 50,000 WLD 한도',
    descEn: 'Perform basic tasks, daily cap of 50,000 WLD',
    descJa: '基本タスク実行可能、1日あたり給与上限 50,000 WLD',
    descZh: '可执行基础任务，单日薪资上限 50,000 WLD',
  },
  {
    level: 5,
    code: 'JOURNEYMAN',
    nameKo: '숙련 (Journeyman)',
    nameEn: 'Journeyman',
    nameJa: '熟練者 (Journeyman)',
    nameZh: '熟练技工 (Journeyman)',
    mult: '1.2x',
    descKo: '업무 보상 +20% 가산, 중급 업무 목록 자동 해금',
    descEn: 'Task rewards +20%, intermediate tasks unlocked automatically',
    descJa: '報酬 +20% 加算、中級タスクリスト自動解放',
    descZh: '任务基础报酬 +20%，自动解锁中级职业任务列表',
  },
  {
    level: 10,
    code: 'PROFESSIONAL',
    nameKo: '프로 (Professional)',
    nameEn: 'Professional',
    nameJa: 'プロ (Professional)',
    nameZh: '专业从业者 (Professional)',
    mult: '1.5x',
    descKo: '업무 보상 +50% 가산, 일일 급여 한도 100,000 WLD 확장',
    descEn: 'Task rewards +50%, daily salary limit expanded to 100,000 WLD',
    descJa: '報酬 +50% 加算、1日給与上限が 100,000 WLD に拡大',
    descZh: '任务基础报酬 +50%，单日薪水上限大幅扩充至 100,000 WLD',
  },
  {
    level: 20,
    code: 'SPECIALIST',
    nameKo: '전문가 (Specialist)',
    nameEn: 'Specialist',
    nameJa: 'スペシャリスト (Specialist)',
    nameZh: '资深专家 (Specialist)',
    mult: '1.8x',
    descKo: '고급 엘리트 업무 배정, 자격증 시험 응시 자격 부여',
    descEn: 'Assigned to high-tier elite tasks, certification exam eligible',
    descJa: '上級エリートタスク配属、プロ資格試験の受験資格付与',
    descZh: '分配高级精英专属任务，解锁专业资质认证考试资格',
  },
  {
    level: 30,
    code: 'EXPERT',
    nameKo: '엑스퍼트 (Expert)',
    nameEn: 'Expert',
    nameJa: 'エキスパート (Expert)',
    nameZh: '首席专家 (Expert)',
    mult: '2.1x',
    descKo: '업무 쿨다운 시간 15% 단축, 마스터 퀘스트 오픈',
    descEn: 'Task cooldown reduced by 15%, Master Quests unlocked',
    descJa: 'タスク待機時間 15% 短縮、マスタークエスト開放',
    descZh: '任务冷却CD缩短15%，开放终极宗师专属任务线',
  },
  {
    level: 40,
    code: 'MASTER',
    nameKo: '마스터 (Master)',
    nameEn: 'Master',
    nameJa: 'マスター (Master)',
    nameZh: '行业宗师 (Master)',
    mult: '2.5x',
    descKo: '최고 난이도 업무 상시 배정, 주간 보너스 지급',
    descEn: 'Highest difficulty tasks always available, weekly dividend bonus',
    descJa: '最高難度タスク常時割当、週次ボーナス配当支給',
    descZh: '常驻最高收益顶级任务，每周自动发放分红奖金津贴',
  },
  {
    level: 50,
    code: 'LEGACY',
    nameKo: '레거시 명예 (Grandmaster)',
    nameEn: 'Grandmaster (Legacy)',
    nameJa: 'レガシー名誉 (Grandmaster)',
    nameZh: '传奇殿堂 (Grandmaster)',
    mult: '3.0x',
    descKo: '전 서버 명예의 전당 헌액, 영구 3배 급여 배율 적용',
    descEn: 'Inducted into Global Hall of Fame, permanent 3.0x salary boost',
    descJa: '殿堂入り達成、永久3.0倍給与ブースト適用',
    descZh: '载入全服名人堂荣耀殿堂，终身永久享受3.0倍薪资加成',
  },
];

export function CareerStepByStepGuide() {
  const { locale } = useLocale();
  const [selectedJob, setSelectedJob] = useState<JobMeta>(CAREER_GUIDE_JOBS[0] as JobMeta);
  const [activeTab, setActiveTab] = useState<'flow' | 'jobs' | 'mastery' | 'simulator'>('flow');

  // 다국어 헬퍼
  const t = (ko: string, en: string, ja: string, zh: string) => {
    switch (locale) {
      case 'en':
        return en;
      case 'ja':
        return ja;
      case 'zh':
        return zh;
      default:
        return ko;
    }
  };

  const getJobName = (job: JobMeta) => {
    switch (locale) {
      case 'en':
        return job.nameEn;
      case 'ja':
        return job.nameJa;
      case 'zh':
        return job.nameZh;
      default:
        return job.nameKo;
    }
  };

  const getJobField = (job: JobMeta) => {
    switch (locale) {
      case 'en':
        return job.fieldEn;
      case 'ja':
        return job.fieldJa;
      case 'zh':
        return job.fieldZh;
      default:
        return job.fieldKo;
    }
  };

  const getJobDesc = (job: JobMeta) => {
    switch (locale) {
      case 'en':
        return job.descEn;
      case 'ja':
        return job.descJa;
      case 'zh':
        return job.descZh;
      default:
        return job.descKo;
    }
  };

  const getJobSampleTask = (job: JobMeta) => {
    switch (locale) {
      case 'en':
        return job.sampleTaskEn;
      case 'ja':
        return job.sampleTaskJa;
      case 'zh':
        return job.sampleTaskZh;
      default:
        return job.sampleTaskKo;
    }
  };

  const getJobStrategy = (job: JobMeta) => {
    switch (locale) {
      case 'en':
        return job.strategyEn;
      case 'ja':
        return job.strategyJa;
      case 'zh':
        return job.strategyZh;
      default:
        return job.strategyKo;
    }
  };

  const getTierName = (tier: (typeof MASTERY_TIERS_GUIDE)[0]) => {
    switch (locale) {
      case 'en':
        return tier.nameEn;
      case 'ja':
        return tier.nameJa;
      case 'zh':
        return tier.nameZh;
      default:
        return tier.nameKo;
    }
  };

  const getTierDesc = (tier: (typeof MASTERY_TIERS_GUIDE)[0]) => {
    switch (locale) {
      case 'en':
        return tier.descEn;
      case 'ja':
        return tier.descJa;
      case 'zh':
        return tier.descZh;
      default:
        return tier.descKo;
    }
  };

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
          <span>
            {t(
              '1. 4단계 수행 절차',
              '1. 4-Step Flow',
              '1. 4ステップ手順',
              '1. 4步工作流程'
            )}
          </span>
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
          <span>
            {t(
              '2. 8대 직업군 도감',
              '2. 8 Career Directory',
              '2. 8大職業図鑑',
              '2. 8大职业图鉴'
            )}
          </span>
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
          <span>
            {t(
              '3. 7대 승진 티어',
              '3. 7 Mastery Tiers',
              '3. 7段階昇進ティア',
              '3. 7大晋升段位'
            )}
          </span>
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
          <span>
            {t(
              '4. 실전 모의 체험',
              '4. Interactive Simulator',
              '4. 実践シミュレーター',
              '4. 实战模拟体验'
            )}
          </span>
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
                <CardTitle className="text-sm font-bold text-white mt-2">
                  {t('직업 선택 및 전직', 'Select Job & Switch', '職業選択・転職', '选择职业与自由转职')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  {t(
                    '/work 페이지 상단에서 원하는 전문 직업을 1클릭으로 선택합니다.',
                    'Select your desired profession with 1-click on top of the /work page.',
                    '/work ページ上部から希望の専門職を1クリックで選択します。',
                    '在 /work 页面顶部一键选择并切换为您中意的专属职业。'
                  )}
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  💡 <b>{t('자유 전직 보장', 'Free Job Switching', '自由転職保証', '自由转职保障')}</b>: {t(
                    '직업을 바꿔도 기존 레벨과 경험치는 100% 보존됩니다.',
                    'Switching jobs preserves 100% of your accumulated levels and EXP.',
                    '職種を変更しても、これまでのレベルと経験値は100%保持されます。',
                    '任意更换职业后，原有的等级与累计经验值将100%完整保留。'
                  )}
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
                <CardTitle className="text-sm font-bold text-white mt-2">
                  {t('업무 수락 (Claim)', 'Accept Task (Claim)', '業務受諾 (Claim)', '认领任务 (Claim)')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  {t(
                    '난이도별(초급/중급/고급) 업무 중 원하는 업무의 [수락하기]를 누릅니다.',
                    'Choose a task by difficulty (Tier 1/2/3) and click [Claim Task].',
                    '難易度別（初級/中級/上級）タスクの中から希望の[受諾する]をクリックします。',
                    '根据难度层级（初级/中级/高级）挑选任务并点击【认领接单】。'
                  )}
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  ⏱️ {t(
                    '업무가 배정되면 최소 소요시간 카운트다운이 시작됩니다.',
                    'A cooldown countdown begins once the task is dispatched.',
                    '業務が割り当てられると、所要時間のカウントダウンが開始されます。',
                    '成功派发任务后将自动启动工作冷却倒计时。'
                  )}
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
                <CardTitle className="text-sm font-bold text-white mt-2">
                  {t('수행 및 쿨다운 대기', 'Execution & Cooldown', '業務実行 ＆ 待機', '执行与冷却等待')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  {t(
                    '업무 시간(30초~300초) 동안 다른 탭을 보거나 주식 시세를 확인해도 안전합니다.',
                    'Feel free to multitask or browse stock quotes during the duration (30s~300s).',
                    '所要時間（30秒〜300秒）の間、他のタブや株価チャートを閲覧していても安全です。',
                    '在任务执行期间（30秒~300秒）可随意切换标签页或浏览股票现货行情。'
                  )}
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  📊 {t(
                    '백그라운드 타이머가 유지되어 편하게 멀티태스킹이 가능합니다.',
                    'Background timer preserves state for seamless multitasking.',
                    'バックグラウンドタイマーが動作するため並行作業も快適です。',
                    '后台自动同步计时状态，支持多任务无缝流畅切换。'
                  )}
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
                <CardTitle className="text-sm font-bold text-white mt-2">
                  {t('제출 & WLD 입금', 'Submit & Payout', '提出 ＆ 給与受取', '提交验收与薪资到账')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>
                  {t(
                    '시간 완료 후 [업무 완료 제출]을 누르면 WLD와 EXP가 즉시 지갑에 입금됩니다.',
                    'Click [Submit Task] upon completion to receive instant WLD and EXP.',
                    'カウント完了後に[完了提出]を押すと、WLDとEXPがウォレットに即時入金されます。',
                    '倒计时结束后点击【提交验收】，WLD薪资与EXP经验值将秒级自动入账。'
                  )}
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300">
                  🧾 {t(
                    '투명한 WorkReceipt 거래 영수증이 발급됩니다.',
                    'A transparent WorkReceipt cryptographic receipt is generated.',
                    '透明なWorkReceipt取引レシートが発行されます。',
                    '系统将自动签发透明可查验的WorkReceipt交易电子凭单。'
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 실제 UI 구조 시각화 다이어그램 */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              {t(
                '실제 직업 화면(/work) UI 배치 가이드',
                'Live Work Dashboard (/work) Layout Blueprint',
                '実際の職業画面(/work) UIレイアウトガイド',
                '实盘职业控制台 (/work) UI界面交互布局指南'
              )}
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {t(
                        '현재 활성 직업: 핀테크 개발자 (Lv.12 프로)',
                        'Active Career: Fintech Developer (Lv.12 Professional)',
                        '現在の職業: フィンテック開発者 (Lv.12 プロ)',
                        '当前就任职位: 金融科技开发者 (Lv.12 专业从业者)'
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {t(
                        '숙련도 보너스: +50% 배율 적용 중 | 다음 승진까지 45/200 EXP',
                        'Mastery Bonus: +50% Multiplier Active | 45/200 EXP to Next Tier',
                        '熟練度ボーナス: +50% 適用中 | 次の昇進まで 45/200 EXP',
                        '段位熟练度加成: +50% 乘数生效中 | 距离下次晋升 45/200 EXP'
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit text-emerald-400 border-emerald-500/40 bg-emerald-950/30">
                  {t(
                    '일일 잔여 한도: 87,500 WLD',
                    'Daily Remainder Cap: 87,500 WLD',
                    '本日残余上限: 87,500 WLD',
                    '今日剩余额度: 87,500 WLD'
                  )}
                </Badge>
              </div>

              {/* 가상 업무 카드 목업 */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                      {t('초급 1단계', 'Tier 1 Basic', '初級 1段階', '初级 1阶')}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {t(
                        '스마트 컨트랙트 단위 테스트 작성',
                        'Author Smart Contract Unit Tests',
                        'スマートコントラクト単体テスト作成',
                        '编写智能合约单元测试用例'
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {t(
                      '소요시간: 30초 | 기본 보상: +1,500 WLD | 경험치: +25 EXP',
                      'Duration: 30s | Base Reward: +1,500 WLD | EXP: +25 EXP',
                      '所要時間: 30秒 | 基本報酬: +1,500 WLD | 経験値: +25 EXP',
                      '耗时: 30秒 | 基础薪资: +1,500 WLD | 经验值: +25 EXP'
                    )}
                  </div>
                </div>

                <Button size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-default">
                  {t('수락하기 (Claim)', 'Claim Task', '受諾する (Claim)', '认领接单 (Claim)')}
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
            {CAREER_GUIDE_JOBS.map((job) => {
              const jobName = getJobName(job);
              const jobField = getJobField(job);
              return (
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
                  <div className="font-bold text-xs text-white">{jobName}</div>
                  <div className="text-[10px] text-zinc-400 font-mono line-clamp-1">{jobField}</div>
                </button>
              );
            })}
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
                        {getJobName(selectedJob)}
                      </CardTitle>
                      <Badge className={selectedJob.badgeColor}>
                        {getJobField(selectedJob)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-zinc-400 font-mono mt-0.5">
                      {selectedJob.nameEn}
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">
                    {t('기본 일일 급여 범위', 'Base Daily Salary Range', '基本日給レンジ', '基础日薪范围')}
                  </div>
                  <div className="text-sm font-bold font-mono text-emerald-400">{selectedJob.baseSalary}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    {t('직무 설명 & 주요 업무', 'Job Description & Duties', '職務概要 ＆ 主な業務', '岗位职责与核心任务')}
                  </div>
                  <p className="text-zinc-400">{getJobDesc(selectedJob)}</p>
                  <div className="pt-2 text-[11px] text-zinc-300 font-mono">
                    {t('대표 업무', 'Key Task', '代表タスク', '典型任务')}: <span className="text-emerald-400 font-bold">{getJobSampleTask(selectedJob)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t('최적 공략 & 연계 시너지', 'Optimal Strategy & Synergies', '最適戦略 ＆ シナジー', '最优攻略与生态协同')}
                  </div>
                  <p className="text-zinc-400">{getJobStrategy(selectedJob)}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Link href="/work">
                    {t(
                      `${getJobName(selectedJob)} 업무 시작하러 가기`,
                      `Start Work as ${getJobName(selectedJob)}`,
                      `${getJobName(selectedJob)} の業務を始める`,
                      `前往就职 ${getJobName(selectedJob)} 开始接单`
                    )} <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                {t(
                  '직업 숙련도(Mastery) 승진 로드맵 & 영구 보상 배수',
                  'Career Mastery Promotion Roadmap & Multiplier Matrix',
                  '職業熟練度(Mastery) 昇進ロードマップ ＆ 永久報酬倍率',
                  '职业熟练度 (Mastery) 晋升成长阶梯与终身永久收益乘数'
                )}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                {t(
                  '업무를 반복 수행하여 경험치를 쌓으면 직급이 자동으로 승진하며, 급여가 최대 3배까지 증폭됩니다.',
                  'Accumulate EXP by completing daily assignments to unlock automated promotions and up to 3.0x salary boost.',
                  '日々の業務でEXPを蓄積すると自動的に昇進し、給料が最大3.0倍まで永久増幅されます。',
                  '完成日常工作累积经验值即可自动晋升段位，薪资乘数最高可解锁至3.0倍。'
                )}
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
                        <span>{getTierName(tier)}</span>
                        <span className="text-[10px] font-mono text-zinc-500">Lv.{tier.level}+</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{getTierDesc(tier)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="font-mono text-xs font-bold border-amber-500/40 bg-amber-500/10 text-amber-300">
                      {t('급여 배율', 'Multiplier', '給与倍率', '收益乘数')}: {tier.mult}
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
                    {t(
                      '실전 직업 업무 수행 & 급여 수령 3초 시뮬레이터',
                      'Interactive Career Task & Salary Payout 3s Simulator',
                      '実践 業務実行 ＆ 給与受取 3秒シミュレーター',
                      '实盘职业任务接单与薪资清算 3秒互动模拟器'
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    {t(
                      '직접 버튼을 클릭하여 수락부터 대기, 제출, 급여 입금까지의 전 과정을 3초 만에 체험해보세요!',
                      'Click through the buttons to experience task claiming, waiting, submission, and instant payout in 3 seconds!',
                      'ボタンをクリックして受託、待機、提出、給与即時入金までの全工程を3秒で体験しましょう！',
                      '点击交互按钮，仅需3秒即可完整体验从认领接单、等待冷却、提交验收至薪资秒级到账全流程！'
                    )}
                  </CardDescription>
                </div>

                <Button size="sm" variant="ghost" onClick={resetSim} className="text-zinc-400 hover:text-white h-7 px-2 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {t('리셋', 'Reset', 'リセット', '重置')}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* 시뮬레이터 옵션 설정 */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-zinc-300 flex justify-between">
                    <span>{t('직업 숙련도 레벨 설정', 'Career Mastery Level', '職業熟練度レベル設定', '设定职业熟练度等级')}</span>
                    <span className="text-emerald-400 font-mono font-bold">Lv.{simLevel} ({getTierName(currentTier)})</span>
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
                    <span>Lv.1 {t('견습', 'Apprentice', '見習い', '学徒')}</span>
                    <span>Lv.20 {t('전문가', 'Specialist', 'スペシャリスト', '专家')}</span>
                    <span>Lv.50 {t('레거시', 'Grandmaster', 'レガシー', '传奇')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-zinc-300">
                    {t('전문 자격증 보유 여부', 'Professional Certificate Status', '専門資格保有ステータス', '专业从业执照持有状态')}
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={hasCert}
                        onChange={(e) => setHasCert(e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      <span>
                        {t(
                          '1급 공인 핀테크 자격증 (+25% 보너스)',
                          'Class 1 Certified Fintech License (+25% Bonus)',
                          '1級公認フィンテック資格 (+25% ボーナス)',
                          '1级注册金融科技资质认证 (+25% 额外奖励)'
                        )}
                      </span>
                    </label>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {t('예상 수령액', 'Estimated Earnings', '予想受取額', '预估单次收益')}: <b className="text-amber-400 font-mono text-xs">+{estimatedWld.toLocaleString()} WLD</b> / {t('회당', 'task', '回', '次')}
                  </div>
                </div>
              </div>

              {/* 인터랙티브 업무 카드 */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-inner space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-cyan-400 border-cyan-500/40 bg-cyan-950/30 mb-1">
                      {t('모의 실습 업무', 'Simulation Task', '模擬タスク', '实战演练任务')}
                    </Badge>
                    <h4 className="text-sm font-bold text-white">
                      {t(
                        '스마트 컨트랙트 최적화 및 보안 감사',
                        'Smart Contract Optimization & Security Audit',
                        'スマートコントラクト最適化 ＆ セキュリティ監査',
                        '智能合约性能优化与安全合规审计'
                      )}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {t(
                        '실시간 트랜잭션 수수료를 절감하고 코드를 배포합니다.',
                        'Reduce real-time gas fees and deploy production code.',
                        'リアルタイムの手数料を削減し、コードをデプロイします。',
                        '降低链上实时交易Gas费并部署投产合约代码。'
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase">
                      {t('예상 보상', 'Estimated Payout', '予想報酬', '预计报酬')}
                    </div>
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
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {t(
                        '1단계: 업무 수락하기 (Claim)',
                        'Step 1: Claim Task',
                        'ステップ1: 業務を受諾する (Claim)',
                        '第1步：认领接单 (Claim)'
                      )}
                    </Button>
                  </div>
                )}

                {simState === 'working' && (
                  <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        {t(
                          '업무 수행 중... (쿨다운 타이머)',
                          'Task in Progress... (Cooldown Timer)',
                          '業務実行中... (クールダウンタイマー)',
                          '任务执行中... (冷却倒计时)'
                        )}
                      </span>
                      <span className="text-white font-bold">
                        {timeLeft}
                        {t('초 남음', 's remaining', '秒残り', '秒后完成')}
                      </span>
                    </div>
                    <Progress value={((3 - timeLeft) / 3) * 100} className="h-2.5 bg-zinc-800" />
                  </div>
                )}

                {simState === 'ready' && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {t('업무 완료!', 'Task Completed!', '業務完了！', '任务已完成！')}
                      </div>
                      <div className="text-[11px] text-zinc-300">
                        {t(
                          '이제 제출 버튼을 눌러 지갑으로 급여를 수령하세요.',
                          'Click submit to claim your salary into your wallet now.',
                          '提出ボタンを押してウォレットに給料を入金してください。',
                          '请点击提交验收按钮，薪水将立即结算至您的钱包。'
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={claimReward}
                      className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg animate-pulse cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {t(
                        '2단계: 업무 완료 제출 & 급여 수령',
                        'Step 2: Submit & Claim Payout',
                        'ステップ2: 完了提出 ＆ 給与受取',
                        '第2步：提交验收并领取薪水'
                      )}
                    </Button>
                  </div>
                )}

                {simState === 'claimed' && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-400/60 text-center space-y-2 animate-in zoom-in-95 duration-200">
                    <Sparkles className="w-6 h-6 text-amber-300 mx-auto animate-bounce" />
                    <div className="text-sm font-bold text-white">
                      🎉 {t('급여', 'Salary', '給料', '薪资')} +{estimatedWld.toLocaleString()} WLD {t('입금 완료!', 'Paid Out!', '入金完了！', '秒级到账！')}
                    </div>
                    <div className="text-xs text-emerald-200 font-mono">
                      {t(
                        '+35 직업 경험치(EXP) 획득 | WorkReceipt #WR-2026-0929 발급',
                        '+35 Career EXP Earned | WorkReceipt #WR-2026-0929 Issued',
                        '+35 職業経験値(EXP) 獲得 | WorkReceipt #WR-2026-0929 発行',
                        '+35 职业经验(EXP) 已获取 | 已签发电子凭单 WorkReceipt #WR-2026-0929'
                      )}
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetSim}
                        className="h-8 px-4 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950 text-xs cursor-pointer"
                      >
                        {t('한 번 더 실습하기', 'Practice Again', 'もう一度シミュレーション', '再次演练体验')}
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
