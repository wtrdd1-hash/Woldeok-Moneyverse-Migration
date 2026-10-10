'use client';

import Link from 'next/link';
import { Brand } from '@/components/brand';
import { useLocale } from '@/components/locale-provider';
import { useCurrency } from '@/components/currency-context';
import { localeLabel, type Locale } from '@/lib/locale';
import { LanguageSwitcher, DEFAULT_CURRENCY_FOR_LOCALE } from '@/components/language-switcher';
import { Globe2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * The standing footer with 4-language support, compliance disclaimer, and global language switcher.
 */
export function SiteFooter() {
  const { locale, setLocale } = useLocale();
  const { setCurrency } = useCurrency();
  const linkClass = 'inline-flex min-h-11 items-center px-1.5 sm:px-2 hover:text-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const footerAria = localeLabel(locale, '하단 메뉴', 'Footer menu', 'フッターメニュー', '页脚菜单');
  const searchLabel = localeLabel(locale, '통합 검색', 'Search', '統合検索', '综合搜索');
  const termsLabel = localeLabel(locale, '이용약관', 'Terms of Service', '利用規約', '服务条款');
  const privacyLabel = localeLabel(locale, '개인정보처리방침', 'Privacy Policy', 'プライバシーポリシー', '隐私政策');
  const statusLabel = localeLabel(locale, '서비스 상태', 'Service Status', 'サービス状態', '服务状态');
  const updatesLabel = localeLabel(locale, '운영 소식', 'Announcements', '運営ニュース', '官方公告');
  const seoAuditLabel = localeLabel(locale, 'SEO 수집 감사', 'SEO Audit', 'SEO監査', 'SEO审计');
  const disclaimer = localeLabel(
    locale,
    '모든 화폐와 보상은 게임 안에서만 쓰는 가상 데이터입니다.',
    'All currency and rewards are virtual data used only in the game.',
    'すべての通貨と報酬はゲーム内でのみ使用される仮想データです。',
    '所有货币与奖励均为仅在游戏内使用的虚拟数据。',
  );

  const handleSelectLang = (newLocale: Locale) => {
    setLocale(newLocale);
    const suggested = DEFAULT_CURRENCY_FOR_LOCALE[newLocale];
    if (suggested) {
      setCurrency(suggested);
    }
  };

  const languages: Array<{ code: Locale; label: string }> = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '简体中文' },
  ];

  return (
    <footer className="moneyverse-site-footer mt-16 text-muted-foreground sm:mt-24 pb-24 lg:pb-8 border-t border-border/60 bg-muted/10 w-full max-w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1320px] min-w-0 px-3 sm:px-6 lg:px-8">
        {/* 모바일 & 데스크톱 4개 국어 퀵 선택 바 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-5 pb-3 border-b border-border/40 w-full min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground shrink-0">
            <Globe2 className="size-4 text-amber-500" />
            <span>{localeLabel(locale, '글로벌 언어 설정', 'Global Language', 'グローバル言語設定', '全球语言设置')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLang(item.code)}
                className={cn(
                  'min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0',
                  locale === item.code
                    ? 'bg-amber-500 text-amber-950 font-black shadow-xs'
                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEO 크롤링 버짓 극대화 및 사용자 탐색용 대규모 에코시스템 내부 링크 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-border/50 text-xs">
          {/* 컬럼 1: 실전 금융 계산기 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              {localeLabel(locale, '실전 금융 계산기', 'Financial Calculators', '実践金融計算機', '实用金融计算器')}
            </h3>
            <ul className="flex flex-col gap-1.5 pt-1">
              <li>
                <Link href="/tools/loan-interest-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '대출이자 & 상환 계산기', 'Loan Interest Calculator', 'ローン利息計算機', '贷款利息计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/dividend-tax-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '배당소득세 & 15.4% 계산기', 'Dividend Tax Calculator', '配当所得税計算機', '股息所得税计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/isa-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, 'ISA 계좌 비과세 계산기', 'ISA Tax-Free Calculator', 'ISA非課税計算機', 'ISA免税计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/pension-tax-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '연금저축 & IRP 세액공제', 'Pension & IRP Tax Credit', '年金貯蓄・IRP税額控除', '养老储蓄IRP税额扣除')}
                </Link>
              </li>
              <li>
                <Link href="/tools/retirement-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '은퇴 & 퇴직소득세 계산기', 'Retirement & Severance Tax', '退職所得税計算機', '退休所得税计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/salary-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '연봉 실수령액 계산기', 'Salary Take-Home Pay', '年収手取り計算機', '年薪实到手计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/youth-leap-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '청년도약계좌 5천만원 비과세', 'Youth Leap Account Calculator', '青年跳躍口座計算機', '青年跃升账户计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/compound-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '복리 예금·적금 계산기', 'Compound Interest Calculator', '複利預金・積立計算機', '复利储蓄计算器')}
                </Link>
              </li>
              <li>
                <Link href="/tools/stock-calculator" className="hover:text-emerald-400 transition-colors">
                  {localeLabel(locale, '주식 물타기·평단가 계산기', 'Stock DCA Calculator', '株式ナンピン平均単価計算機', '股票加仓平摊成本计算器')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 컬럼 2: 가상 주식 거래소 10대 상장 종목 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              {localeLabel(locale, '가상 주식 거래소 (10대 종목)', 'Virtual Stock Exchange', '仮想株式取引所 (10銘柄)', '虚拟股票交易所 (10大股票)')}
            </h3>
            <ul className="flex flex-col gap-1.5 pt-1">
              <li>
                <Link href="/stocks/CHIMU314" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '치무전자 (CHIMU314)', 'Chimu Electronics (CHIMU314)', 'チム電子 (CHIMU314)', '奇武电子 (CHIMU314)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/CHIPS" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '치무 초전도 (CHIPS)', 'Chimu Superconductor (CHIPS)', 'チム超伝導 (CHIPS)', '奇武超导 (CHIPS)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/DUCK" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '덕덕 물산 (DUCK)', 'Duck Duck Corp (DUCK)', 'ダックダック物産 (DUCK)', '鸭鸭物产 (DUCK)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/MYUY" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '뮤야 엔터테인먼트 (MYUY)', 'Myuya Entertainment (MYUY)', 'ミュヤエンターテインメント (MYUY)', '缪亚娱乐 (MYUY)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/SPACE" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 우주항공 (SPACE)', 'Woldeok Aerospace (SPACE)', 'ウォルドック航空宇宙 (SPACE)', '月德航天航空 (SPACE)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/WDB" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 바이오 (WDB)', 'Woldeok Bio (WDB)', 'ウォルドックバイオ (WDB)', '月德生物 (WDB)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/WDG" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 게임즈 (WDG)', 'Woldeok Games (WDG)', 'ウォルドックゲームズ (WDG)', '月德游戏 (WDG)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/WDM" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 모빌리티 (WDM)', 'Woldeok Mobility (WDM)', 'ウォルドックモビリティ (WDM)', '月德出行 (WDM)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/WDT" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 테크 (WDT)', 'Woldeok Tech (WDT)', 'ウォルドックテック (WDT)', '月德科技 (WDT)')}
                </Link>
              </li>
              <li>
                <Link href="/stocks/WFIN" className="hover:text-amber-400 transition-colors">
                  {localeLabel(locale, '월덱 파이낸셜 (WFIN)', 'Woldeok Financial (WFIN)', 'ウォルドックフィナンシャル (WFIN)', '月德金融 (WFIN)')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 컬럼 3: 가상 경제 & 실전 가이드 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500 shrink-0" />
              {localeLabel(locale, '가상 경제 & 실전 가이드', 'Guides & Economy', '仮想経済・実践ガイド', '虚拟经济与实战指南')}
            </h3>
            <ul className="flex flex-col gap-1.5 pt-1">
              <li>
                <Link href="/guide/stock-trading" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '가상 주식 실전 매매 가이드', 'Stock Trading Guide', '株式取引実践ガイド', '股票实战交易指南')}
                </Link>
              </li>
              <li>
                <Link href="/guide/virtual-banking" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '가상 금융 & 복리 예금 가이드', 'Virtual Banking Guide', '仮想金融・複利預金ガイド', '虚拟金融与复利储蓄指南')}
                </Link>
              </li>
              <li>
                <Link href="/guide/career-mastery" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '직업 & 일일 파밍 루틴 가이드', 'Career Mastery Guide', '職業・ファーミングガイド', '职业与每日搬砖指南')}
                </Link>
              </li>
              <li>
                <Link href="/guide/glossary" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '핀테크 & 가상경제 용어사전', 'Fintech Glossary', '金融・仮想経済用語辞典', '金融科技与经济词典')}
                </Link>
              </li>
              <li>
                <Link href="/guide/dopamine-system" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '도파민 보상 & 확률 가이드', 'Dopamine Reward Guide', '報酬・確率ガイド', '多巴胺奖励与概率指南')}
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '성장 로드맵 & 마일스톤', 'Growth Roadmap', '成長ロードマップ', '成长路线图与里程碑')}
                </Link>
              </li>
              <li>
                <Link href="/newspaper" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, 'AI 경제 브리프 & 시황 뉴스', 'Economy Newspaper', 'AI経済新聞', 'AI经济简报与行情新闻')}
                </Link>
              </li>
              <li>
                <Link href="/enterprises" className="hover:text-blue-400 transition-colors">
                  {localeLabel(locale, '국가 공기업 알리오(ALIO) 공시', 'Public Enterprises ALIO', '公企業ALIO情報公開', '国家公立企业信息公示')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 컬럼 4: 글로벌 다국어 허브 & 커뮤니티 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-violet-500 shrink-0" />
              {localeLabel(locale, '글로벌 포털 & 허브', 'Global Portals', 'グローバルポータル', '全球门户与中心')}
            </h3>
            <ul className="flex flex-col gap-1.5 pt-1">
              <li>
                <Link href="/en/tools" className="hover:text-violet-400 transition-colors">
                  English Tools Hub (/en/tools)
                </Link>
              </li>
              <li>
                <Link href="/en/tools/stock-calculator" className="hover:text-violet-400 transition-colors">
                  English DCA Stock Calculator
                </Link>
              </li>
              <li>
                <Link href="/zh/tools" className="hover:text-violet-400 transition-colors">
                  简体中文 金融工具中心 (/zh/tools)
                </Link>
              </li>
              <li>
                <Link href="/zh/tools/stock-calculator" className="hover:text-violet-400 transition-colors">
                  简体中文 股票补仓平摊计算器
                </Link>
              </li>
              <li>
                <Link href="/ja/tools" className="hover:text-violet-400 transition-colors">
                  日本語 ツールハブ (/ja/tools)
                </Link>
              </li>
              <li>
                <Link href="/ja/tools/compound-calculator" className="hover:text-violet-400 transition-colors">
                  日本語 複利計算シミュレーター
                </Link>
              </li>
              <li>
                <Link href="/bonds" className="hover:text-violet-400 transition-colors">
                  {localeLabel(locale, '기획재정국채 (KTB) 거래소', 'Gov Treasury Bonds (KTB)', '企画財政国債取引所', '企划财政国债交易所')}
                </Link>
              </li>
              <li>
                <Link href="/fx" className="hover:text-violet-400 transition-colors">
                  {localeLabel(locale, '서울외환시장 (FX) 실시간 환전', 'FX Currency Exchange', 'ソウル外国為替市場', '首尔外汇市场实时兑换')}
                </Link>
              </li>
              <li>
                <Link href="/marketplace/auction" className="hover:text-violet-400 transition-colors">
                  {localeLabel(locale, 'P2P 실시간 경매장', 'P2P Auction Market', 'P2Pリアルタイム競売場', 'P2P实时拍卖行')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 border-b border-border/70 py-6 sm:flex-row sm:items-center w-full min-w-0">
          <Brand />
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <nav aria-label={footerAria} className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold sm:gap-x-3 w-full sm:w-auto min-w-0">
              <Link href="/search" className={linkClass}>
                {searchLabel}
              </Link>
              <Link href="/terms" className={linkClass}>
                {termsLabel}
              </Link>
              <Link href="/privacy" className={linkClass}>
                {privacyLabel}
              </Link>
              <Link href="/status" className={linkClass}>
                {statusLabel}
              </Link>
              <Link href="/announcements" className={linkClass}>
                {updatesLabel}
              </Link>
              <Link href="/admin/seo-audit" className={cn(linkClass, 'text-emerald-500 hover:text-emerald-400')}>
                {seoAuditLabel}
              </Link>
            </nav>
            <div className="pl-2 border-l border-border/60 shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start sm:items-center gap-3 py-4 pb-6 text-[10px] sm:flex-row w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-full min-w-0">
            <p className="break-words text-zinc-400">{disclaimer}</p>
            <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold w-fit">
              <ShieldCheck className="w-3 h-3" />
              IndexNow 100% Active
            </span>
          </div>
          <p className="shrink-0 text-zinc-500">© 2026 Woldeok Moneyverse</p>
        </div>
      </div>
    </footer>
  );
}
