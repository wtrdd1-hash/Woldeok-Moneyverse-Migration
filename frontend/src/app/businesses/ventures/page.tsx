'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Building,
  TrendingUp,
  Coins,
  ShieldCheck,
  Award,
  Vote,
  Clock,
  Sparkles,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
  ArrowUpRight,
  Filter,
  Users,
  PieChart,
  Flame,
} from 'lucide-react';
import {
  VENTURE_SECTOR_INFO,
  INITIAL_VENTURE_COMPANIES,
  INITIAL_IPO_CAMPAIGNS,
  MIN_STARTUP_CAPITAL,
  IPO_PUBLIC_SHARE_RATIO,
  CORPORATE_TAX_RATE,
  ANGEL_INVESTOR_THRESHOLD_PCT,
  calculateCompanyValuation,
  calculateIpoAllocation,
  calculateShareholderDividend,
  calculateCorporateTaxAndBurn,
  type VentureSector,
  type StartupCompany,
  type IpoCampaign,
  type ShareholderHolding,
  type GovernanceProposal,
} from '@moneyverse/contract';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';

export default function VenturesPage() {
  const [selectedSector, setSelectedSector] = useState<VentureSector | 'ALL'>('ALL');
  const [companies, setCompanies] = useState<StartupCompany[]>(INITIAL_VENTURE_COMPANIES);
  const [ipoCampaigns, setIpoCampaigns] = useState<IpoCampaign[]>(INITIAL_IPO_CAMPAIGNS);
  
  // 유저 자산 및 보유 지분 상태
  const [userWldBalance, setUserWldBalance] = useState<number>(60000000); // 6천만 WLD
  const [holdings, setHoldings] = useState<ShareholderHolding[]>([
    {
      id: 'hold-1',
      companyId: 'vc-1',
      companyName: '뉴럴마인드 AI',
      symbol: 'NMI',
      sector: 'AI_FINTECH',
      shares: 60000,
      shareRatioPct: 6.0, // 6.0% (엔젤 주주)
      isAngelInvestor: true,
      totalClaimedDividend: 18900000,
      unclaimedDividend: 630000,
      lastClaimedAt: '2026-09-27',
    },
    {
      id: 'hold-2',
      companyId: 'vc-5',
      companyName: '에코그리드 파워',
      symbol: 'EGP',
      sector: 'GREEN_GRID',
      shares: 20000,
      shareRatioPct: 2.0, // 2.0%
      isAngelInvestor: false,
      totalClaimedDividend: 7600000,
      unclaimedDividend: 380000,
      lastClaimedAt: '2026-09-27',
    },
  ]);

  // 활성 탭
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'IPO' | 'MY_PORTFOLIO'>('DIRECTORY');

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedIpoForSubscribe, setSelectedIpoForSubscribe] = useState<IpoCampaign | null>(null);
  const [selectedProposalForVote, setSelectedProposalForVote] = useState<{
    company: StartupCompany;
    proposal: GovernanceProposal;
  } | null>(null);

  // 창업 폼 상태
  const [newName, setNewName] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newSector, setNewSector] = useState<VentureSector>('AI_FINTECH');
  const [newCapital, setNewCapital] = useState<string>('15000000'); // 1,500만 WLD
  const [newPayoutRatio, setNewPayoutRatio] = useState<number>(30); // 30%
  const [newDescription, setNewDescription] = useState<string>('');

  // 청약 폼 상태
  const [subscriptionSharesInput, setSubscriptionSharesInput] = useState<string>('1000');

  // 피드백 메시지
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 실시간 매출 & 미수령 배당금 누적 시뮬레이터 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setHoldings((prev) =>
        prev.map((h) => {
          const comp = companies.find((c) => c.id === h.companyId);
          if (!comp) return h;
          // 5초 단위 미세 배당 누적
          const tickDividend = Math.max(
            100,
            Math.floor(
              calculateShareholderDividend(comp.dailyRevenue, comp.dividendPayoutRatio, h.shareRatioPct) * 0.005
            )
          );
          return {
            ...h,
            unclaimedDividend: h.unclaimedDividend + tickDividend,
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [companies]);

  // 1. 배당금 일괄 수령 (Claim All)
  const handleClaimAllDividends = () => {
    const totalUnclaimed = holdings.reduce((acc, h) => acc + h.unclaimedDividend, 0);
    if (totalUnclaimed <= 0) {
      setActionMessage('현재 수령 가능한 미수령 배당금이 없습니다.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    setUserWldBalance((prev) => prev + totalUnclaimed);
    setHoldings((prev) =>
      prev.map((h) => ({
        ...h,
        totalClaimedDividend: h.totalClaimedDividend + h.unclaimedDividend,
        unclaimedDividend: 0,
        lastClaimedAt: new Date().toLocaleDateString('ko-KR'),
      }))
    );

    setActionMessage(
      `보유 스타트업 배당금 총 +${groupDigits(totalUnclaimed)} WLD가 지갑으로 즉시 입고되었습니다! (법인세 3% 자동 소각 완결)`
    );
    setTimeout(() => setActionMessage(null), 4500);
  };

  // 2. 신규 스타트업 설립(창업) 핸들러
  const handleCreateStartup = (e: React.FormEvent) => {
    e.preventDefault();
    const capitalNum = parseInt(newCapital.replace(/,/g, ''), 10) || 0;

    if (!newName.trim() || !newSymbol.trim()) {
      setActionMessage('사명과 종목 심볼을 올바르게 입력해주세요.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    if (capitalNum < MIN_STARTUP_CAPITAL) {
      setActionMessage(`최소 창업 자본금은 ${groupDigits(MIN_STARTUP_CAPITAL)} WLD 이상이어야 합니다.`);
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    if (capitalNum > userWldBalance) {
      setActionMessage('지갑의 WLD 잔고가 부족합니다.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const totalShares = 1000000;
    const founderShares = totalShares * (1 - IPO_PUBLIC_SHARE_RATIO);
    const publicShares = totalShares * IPO_PUBLIC_SHARE_RATIO;
    const sharePrice = Math.round(capitalNum / totalShares);
    const valuation = calculateCompanyValuation(capitalNum, capitalNum * 0.2);

    const newCompany: StartupCompany = {
      id: `vc-${Date.now()}`,
      name: newName.trim(),
      symbol: newSymbol.trim().toUpperCase(),
      sector: newSector,
      founderId: 'me',
      founderName: '나 (창업자)',
      foundedAt: new Date().toISOString().split('T')[0]!,
      capital: capitalNum,
      valuation,
      totalShares,
      founderShares,
      publicShares,
      sharePrice,
      dailyRevenue: Math.round(capitalNum * 0.3),
      dividendPayoutRatio: newPayoutRatio / 100,
      dailyDividendPerShare: Number(((capitalNum * 0.3 * (newPayoutRatio / 100)) / totalShares).toFixed(2)),
      description: newDescription.trim() || `${VENTURE_SECTOR_INFO[newSector].label} 분야 혁신 가상 스타트업`,
      ipoStatus: 'ACTIVE',
    };

    const newIpo: IpoCampaign = {
      id: `ipo-${Date.now()}`,
      companyId: newCompany.id,
      companyName: newCompany.name,
      symbol: newCompany.symbol,
      sector: newCompany.sector,
      targetAmount: publicShares * sharePrice,
      offeredShares: publicShares,
      sharePrice,
      currentSubscribedAmount: 0,
      subscriptionRate: 0,
      minSubscriptionShares: 100,
      endsAt: '2026-10-05 23:59:59',
      status: 'ACTIVE',
    };

    const myFounderHolding: ShareholderHolding = {
      id: `hold-${Date.now()}`,
      companyId: newCompany.id,
      companyName: newCompany.name,
      symbol: newCompany.symbol,
      sector: newCompany.sector,
      shares: founderShares,
      shareRatioPct: 70.0,
      isAngelInvestor: true,
      totalClaimedDividend: 0,
      unclaimedDividend: 0,
    };

    setUserWldBalance((prev) => prev - capitalNum);
    setCompanies((prev) => [newCompany, ...prev]);
    setIpoCampaigns((prev) => [newIpo, ...prev]);
    setHoldings((prev) => [myFounderHolding, ...prev]);
    setIsCreateModalOpen(false);

    // 폼 리셋
    setNewName('');
    setNewSymbol('');
    setNewDescription('');

    setActionMessage(
      `스타트업 [${newCompany.name}] 설립 완료! 자본금 ${groupDigits(capitalNum)} WLD 납입 및 30% IPO 공모주 청약이 개시되었습니다.`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  // 3. 공모주 청약 신청 핸들러
  const handleSubscribeIpo = (campaign: IpoCampaign) => {
    const sharesNum = parseInt(subscriptionSharesInput.replace(/,/g, ''), 10) || 0;
    if (sharesNum < campaign.minSubscriptionShares) {
      setActionMessage(`최소 청약 단위는 ${campaign.minSubscriptionShares}주 이상입니다.`);
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const requiredWld = sharesNum * campaign.sharePrice;
    if (requiredWld > userWldBalance) {
      setActionMessage('지갑의 WLD 잔고가 부족합니다.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const target = campaign.targetAmount;
    const nextSubscribed = campaign.currentSubscribedAmount + requiredWld;
    const allocation = calculateIpoAllocation(
      requiredWld,
      target,
      nextSubscribed,
      campaign.offeredShares,
      campaign.sharePrice
    );

    setUserWldBalance((prev) => prev - allocation.spentAmount);

    // 청약 캠페인 갱신
    setIpoCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? {
              ...c,
              currentSubscribedAmount: nextSubscribed,
              subscriptionRate: Number(((nextSubscribed / c.targetAmount) * 100).toFixed(1)),
            }
          : c
      )
    );

    // 보유 지분 추가/합산
    const shareRatio = Number(((allocation.allocatedShares / 1000000) * 100).toFixed(2));
    const isAngel = shareRatio >= ANGEL_INVESTOR_THRESHOLD_PCT;

    setHoldings((prev) => {
      const existing = prev.find((h) => h.companyId === campaign.companyId);
      if (existing) {
        const nextShares = existing.shares + allocation.allocatedShares;
        const nextRatio = Number(((nextShares / 1000000) * 100).toFixed(2));
        return prev.map((h) =>
          h.companyId === campaign.companyId
            ? {
                ...h,
                shares: nextShares,
                shareRatioPct: nextRatio,
                isAngelInvestor: nextRatio >= ANGEL_INVESTOR_THRESHOLD_PCT,
              }
            : h
        );
      } else {
        return [
          ...prev,
          {
            id: `hold-${Date.now()}`,
            companyId: campaign.companyId,
            companyName: campaign.companyName,
            symbol: campaign.symbol,
            sector: campaign.sector,
            shares: allocation.allocatedShares,
            shareRatioPct: shareRatio,
            isAngelInvestor: isAngel,
            totalClaimedDividend: 0,
            unclaimedDividend: 0,
          },
        ];
      }
    });

    setSelectedIpoForSubscribe(null);
    setActionMessage(
      `[${campaign.companyName}] 공모주 ${groupDigits(allocation.allocatedShares)}주 배정 완료! (청약 집행: ${groupDigits(allocation.spentAmount)} WLD, 환불: ${groupDigits(allocation.refundAmount)} WLD)`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  // 4. 엔젤 거버넌스 투표 핸들러
  const handleVoteProposal = (type: 'YES' | 'NO') => {
    if (!selectedProposalForVote) return;
    const { company, proposal } = selectedProposalForVote;

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === company.id && c.proposals) {
          return {
            ...c,
            proposals: c.proposals.map((p) =>
              p.id === proposal.id
                ? {
                    ...p,
                    votesYes: type === 'YES' ? p.votesYes + 5000 : p.votesYes,
                    votesNo: type === 'NO' ? p.votesNo + 5000 : p.votesNo,
                  }
                : p
            ),
          };
        }
        return c;
      })
    );

    setSelectedProposalForVote(null);
    setActionMessage(`[${company.name}] 주주 안건에 ${type === 'YES' ? '찬성' : '반대'} 5,000표를 성공적으로 행사하였습니다!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const filteredCompanies =
    selectedSector === 'ALL' ? companies : companies.filter((c) => c.sector === selectedSector);

  const totalValuationAll = companies.reduce((acc, c) => acc + c.valuation, 0);
  const totalDailyRevenueAll = companies.reduce((acc, c) => acc + c.dailyRevenue, 0);
  const totalUnclaimedDividends = holdings.reduce((acc, h) => acc + h.unclaimedDividend, 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
      {/* 1. HERO BENTO GRID HEADER */}
      <section className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 p-5 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK VENTURE CAPITAL · 5대 테크 가상 스타트업 & 크라우드펀딩
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>30% IPO 공모 & 매출 기반 주주 배당 분배 엔진</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: 헤더 브리핑 & 4대 주요 지표 */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                가상 스타트업 VC & 엔젤투자
              </h1>
              <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs">
                5대 테크 유니콘
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI 핀테크, 양자 컴퓨팅, 우주 로보틱스, 바이오 헬스케어, 친환경 스마트 그리드 법인을 설립하고 30% 지분 공모주 청약(IPO)을 통해 자금을 조달하세요. 주주는 매일 자정 기업 매출의 10%~50%를 WLD 배당금으로 수령합니다.
            </p>

            {/* 4대 핵심 VC 지표 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">총 상장 스타트업</span>
                <span className="font-mono text-base font-black text-foreground block mt-0.5">
                  {companies.length}개 법인
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">5대 산업군 포괄</span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">전체 기업가치 합산</span>
                <span className="font-mono text-base font-black text-cyan-400 block mt-0.5">
                  {groupDigits(totalValuationAll)} WLD
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">유니콘 클러스터</span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">일일 총 매출 규모</span>
                <span className="font-mono text-base font-black text-emerald-400 block mt-0.5">
                  {groupDigits(totalDailyRevenueAll)} WLD
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">법인세 3% 소각</span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">진행 중인 IPO 청약</span>
                <span className="font-mono text-base font-black text-amber-400 block mt-0.5">
                  {ipoCampaigns.filter((c) => c.status === 'ACTIVE').length}개 라운드
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">비례 배정 시스템</span>
              </div>
            </div>
          </div>

          {/* Right: 내 투자 지갑 & 원스톱 배당금 수령 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-background/60 p-4 sm:p-6 lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">내 투자 가용 WLD</span>
                <Badge variant="secondary" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-none">
                  실시간 원장
                </Badge>
              </div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-foreground">
                {groupDigits(userWldBalance)}{' '}
                <span className="text-xs sm:text-sm font-bold text-muted-foreground">WLD</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">보유 지분 법인 수</span>
                <span className="font-mono font-bold text-foreground">{holdings.length}개사</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수령 가능한 미수령 배당금</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{groupDigits(totalUnclaimedDividends)} WLD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleClaimAllDividends}
                className="w-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Coins className="size-3.5 mr-1.5" />
                미수령 배당금 일괄 수령 (Claim All)
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="outline"
                className="w-full text-xs font-bold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
              >
                <PlusCircle className="size-3.5 mr-1.5" />
                신규 가상 스타트업 창업 설립
              </Button>
            </div>
          </div>
        </div>

        {/* 3대 도메인 탭 내비게이션 */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'DIRECTORY'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'border border-zinc-800 bg-background/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Building className="size-3.5" />
            스타트업 디렉토리 & 기업가치 랭킹 ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('IPO')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'IPO'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'border border-zinc-800 bg-background/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Rocket className="size-3.5" />
            공모주 청약(IPO) 크라우드펀딩 ({ipoCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_PORTFOLIO')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'MY_PORTFOLIO'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'border border-zinc-800 bg-background/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Award className="size-3.5" />
            내 보유 지분 & 엔젤 거버넌스 ({holdings.length})
          </button>
        </div>
      </section>

      {/* 알림 토스트 배너 */}
      {actionMessage && (
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 text-xs sm:text-sm font-semibold text-cyan-300 shadow-md backdrop-blur-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-cyan-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
            <XCircle className="size-4" />
          </button>
        </div>
      )}

      {/* 2. TAB CONTENT 1: 스타트업 디렉토리 & 기업가치 랭킹 */}
      {activeTab === 'DIRECTORY' && (
        <section className="space-y-6">
          {/* 산업군 필터 칩 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSector('ALL')}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedSector === 'ALL'
                  ? 'bg-zinc-200 text-zinc-900'
                  : 'border border-zinc-800 bg-background/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              전체 산업 ({companies.length})
            </button>
            {(Object.keys(VENTURE_SECTOR_INFO) as VentureSector[]).map((sec) => {
              const info = VENTURE_SECTOR_INFO[sec];
              const count = companies.filter((c) => c.sector === sec).length;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedSector === sec
                      ? 'bg-cyan-600 text-white'
                      : 'border border-zinc-800 bg-background/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {info.label} ({count})
                </button>
              );
            })}
          </div>

          {/* 스타트업 카드 그리드 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((comp) => {
              const sectorInfo = VENTURE_SECTOR_INFO[comp.sector];
              const myHolding = holdings.find((h) => h.companyId === comp.id);

              return (
                <Card
                  key={comp.id}
                  className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`font-mono text-[10px] font-bold ${sectorInfo.tagColor}`}>
                        {sectorInfo.label}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[10px] border-zinc-700">
                        {comp.ipoStatus === 'COMPLETED' ? 'IPO 완료' : comp.ipoStatus === 'ACTIVE' ? 'IPO 진행중' : '설립 준비'}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                        {comp.name}
                        <span className="font-mono text-xs font-bold text-muted-foreground">({comp.symbol})</span>
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {comp.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="rounded-xl border border-zinc-800/60 bg-background/50 p-3 space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-sans">기업가치 (Valuation)</span>
                        <span className="font-bold text-cyan-400">{groupDigits(comp.valuation)} WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-sans">일일 매출 규모</span>
                        <span className="font-bold text-emerald-400">+{groupDigits(comp.dailyRevenue)} WLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-sans">배당 성향 (Payout)</span>
                        <span className="font-bold text-foreground">{Math.round(comp.dividendPayoutRatio * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-sans">설립자</span>
                        <span className="font-bold text-foreground font-sans">{comp.founderName}</span>
                      </div>
                    </div>

                    {myHolding && (
                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Award className="size-3.5 text-amber-400" />
                          <span className="font-bold text-cyan-300">
                            내 지분 {myHolding.shareRatioPct}% ({groupDigits(myHolding.shares)}주)
                          </span>
                        </div>
                        {myHolding.isAngelInvestor && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px]">
                            엔젤 주주
                          </Badge>
                        )}
                      </div>
                    )}

                    {comp.proposals && comp.proposals.length > 0 && (
                      <div className="pt-1">
                        <Button
                          onClick={() => setSelectedProposalForVote({ company: comp, proposal: comp.proposals![0]! })}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        >
                          <Vote className="size-3.5 mr-1.5" />
                          주주 거버넌스 투표 참여 (1건)
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. TAB CONTENT 2: 공모주 청약(IPO) 크라우드펀딩 센터 */}
      {activeTab === 'IPO' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ipoCampaigns.map((camp) => {
              const sectorInfo = VENTURE_SECTOR_INFO[camp.sector];
              const isOverSubscribed = camp.subscriptionRate > 100;

              return (
                <Card
                  key={camp.id}
                  className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`font-mono text-xs font-bold ${sectorInfo.tagColor}`}>
                        {sectorInfo.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-bold border-amber-500/30 text-amber-400 bg-amber-500/10 flex items-center gap-1"
                      >
                        <Clock className="size-3" />
                        마감: {camp.endsAt.split(' ')[0]}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <CardTitle className="text-xl font-black text-foreground">
                        {camp.companyName} ({camp.symbol})
                      </CardTitle>
                      <CardDescription className="text-xs">
                        총 발행 주식의 30%({groupDigits(camp.offeredShares)}주)를 일반 유저 공모주 형태로 조달합니다.
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 프로그레스 바 & 모집률 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground font-sans">청약 모집 달성률</span>
                        <span className={`font-black ${isOverSubscribed ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {camp.subscriptionRate}% {isOverSubscribed && '(초과 청약 비례 배정)'}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isOverSubscribed ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, camp.subscriptionRate)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                        <span>현재 모집: {groupDigits(camp.currentSubscribedAmount)} WLD</span>
                        <span>목표: {groupDigits(camp.targetAmount)} WLD</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono rounded-xl border border-zinc-800/60 bg-background/50 p-3">
                      <div>
                        <span className="text-muted-foreground font-sans block text-[11px]">주당 공모가</span>
                        <span className="font-bold text-foreground block mt-0.5">{groupDigits(camp.sharePrice)} WLD</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-sans block text-[11px]">최소 청약 단위</span>
                        <span className="font-bold text-foreground block mt-0.5">{camp.minSubscriptionShares}주</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedIpoForSubscribe(camp)}
                      className="w-full font-black bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20"
                    >
                      <Rocket className="size-4 mr-1.5" />
                      공모주 청약 신청하기
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. TAB CONTENT 3: 내 보유 지분 & 엔젤 거버넌스 콘솔 */}
      {activeTab === 'MY_PORTFOLIO' && (
        <section className="space-y-6">
          <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Award className="size-5 text-amber-400" />
                  내 보유 스타트업 포트폴리오 ({holdings.length})
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs border-zinc-700">
                  지분율 5% 이상: 엔젤 주주 의결권 부여
                </Badge>
              </div>
              <CardDescription className="text-xs">
                현재 지분을 보유 중인 가상 법인 목록과 실시간 누적 배당금입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-zinc-800 rounded-xl">
                  현재 보유 중인 스타트업 지분이 없습니다. 공모주 청약(IPO)에 참여해보세요.
                </div>
              ) : (
                <div className="space-y-4">
                  {holdings.map((hold) => (
                    <div
                      key={hold.id}
                      className="rounded-xl border border-zinc-800/80 bg-background/60 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground text-sm sm:text-base">
                            {hold.companyName}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">({hold.symbol})</span>
                          {hold.isAngelInvestor && (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold">
                              👑 황금 엔젤 주주
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-muted-foreground font-sans">미수령 배당금:</span>
                          <span className="font-black text-emerald-400">+{groupDigits(hold.unclaimedDividend)} WLD</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1 border-t border-border/30">
                        <div>
                          <span className="text-muted-foreground font-sans text-[11px] block">보유 주식수</span>
                          <span className="font-bold text-foreground block mt-0.5">{groupDigits(hold.shares)} 주</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-sans text-[11px] block">총 지분율</span>
                          <span className="font-bold text-cyan-400 block mt-0.5">{hold.shareRatioPct}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-sans text-[11px] block">누적 수령 배당금</span>
                          <span className="font-bold text-foreground block mt-0.5">
                            {groupDigits(hold.totalClaimedDividend)} WLD
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-sans text-[11px] block">마지막 정산</span>
                          <span className="font-bold text-muted-foreground block mt-0.5">
                            {hold.lastClaimedAt || '미정산'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 5. 신규 가상 스타트업 설립(창업) 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Rocket className="size-5 text-cyan-400" />
                가상 스타트업 법인 설립 (창업)
              </h2>
              <p className="text-xs text-muted-foreground">
                설립 자본금을 예치하고 30% 지분 공모주 청약(IPO)을 개시합니다.
              </p>
            </div>

            <form onSubmit={handleCreateStartup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">법인 사명</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 알파퀀텀 랩스"
                    className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">종목 심볼 (3~4자)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder="예: AQL"
                    className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 text-xs font-mono font-bold text-foreground uppercase focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">테크 산업군</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value as VentureSector)}
                  className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-cyan-500 focus:outline-none"
                >
                  {(Object.keys(VENTURE_SECTOR_INFO) as VentureSector[]).map((sec) => (
                    <option key={sec} value={sec}>
                      {VENTURE_SECTOR_INFO[sec].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground">초기 설립 자본금 (WLD)</span>
                  <span className="text-muted-foreground text-[11px]">잔고: {groupDigits(userWldBalance)} WLD</span>
                </div>
                <input
                  type="text"
                  required
                  value={newCapital}
                  onChange={(e) => setNewCapital(e.target.value)}
                  placeholder="10,000,000"
                  className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 font-mono text-xs font-bold text-foreground focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground">매출 배당 성향 (Payout Ratio)</span>
                  <span className="font-mono font-bold text-cyan-400">{newPayoutRatio}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={newPayoutRatio}
                  onChange={(e) => setNewPayoutRatio(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  일일 매출 중 설정된 비율만큼 매일 자정 주주들에게 지분율대로 WLD 배당됩니다.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">사업 비전 및 한 줄 소개</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="차세대 기술 개발 비전을 입력하세요"
                  className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-background/50 p-3 text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>총 발행 주식수:</span>
                  <span className="font-mono font-bold text-foreground">1,000,000 주</span>
                </div>
                <div className="flex justify-between">
                  <span>창업자 보유 지분 (70%):</span>
                  <span className="font-mono font-bold text-cyan-400">700,000 주</span>
                </div>
                <div className="flex justify-between">
                  <span>IPO 일반 공모 지분 (30%):</span>
                  <span className="font-mono font-bold text-amber-400">300,000 주</span>
                </div>
              </div>

              <Button type="submit" className="w-full font-black bg-cyan-600 hover:bg-cyan-700 text-white">
                스타트업 설립 및 IPO 청약 개시
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 6. 공모주 청약 신청 모달 */}
      {selectedIpoForSubscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedIpoForSubscribe(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground">
                {selectedIpoForSubscribe.companyName} IPO 청약
              </h2>
              <p className="text-xs text-muted-foreground">
                주당 공모가: {groupDigits(selectedIpoForSubscribe.sharePrice)} WLD
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  청약 신청 주식수 (최소 {selectedIpoForSubscribe.minSubscriptionShares}주)
                </label>
                <input
                  type="text"
                  value={subscriptionSharesInput}
                  onChange={(e) => setSubscriptionSharesInput(e.target.value)}
                  placeholder="1,000"
                  className="w-full rounded-xl border border-zinc-800 bg-background px-3 py-2 font-mono text-sm font-bold text-foreground focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSubscriptionSharesInput(amt.toString())}
                    className="rounded-lg border border-zinc-800 bg-background/40 py-1 text-[11px] font-mono font-bold text-muted-foreground hover:bg-muted"
                  >
                    {amt}주
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-background/50 p-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">필요 청약 증거금</span>
                  <span className="font-bold text-cyan-400">
                    {groupDigits(
                      (parseInt(subscriptionSharesInput.replace(/,/g, ''), 10) || 0) *
                        selectedIpoForSubscribe.sharePrice
                    )}{' '}
                    WLD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">예상 획득 지분율</span>
                  <span className="font-bold text-foreground">
                    {(
                      ((parseInt(subscriptionSharesInput.replace(/,/g, ''), 10) || 0) / 1000000) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSubscribeIpo(selectedIpoForSubscribe)}
                className="w-full font-black bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                청약 증거금 결제 및 공모주 신청
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 엔젤 주주 거버넌스 투표 모달 */}
      {selectedProposalForVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedProposalForVote(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-5" />
            </button>

            <div className="space-y-1">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold">
                👑 엔젤 주주 거버넌스 의결권
              </Badge>
              <h2 className="text-lg font-black text-foreground mt-1">
                {selectedProposalForVote.proposal.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedProposalForVote.company.name} ({selectedProposalForVote.company.symbol})
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-background/50 p-3 text-xs text-muted-foreground">
              {selectedProposalForVote.proposal.description}
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-emerald-400">찬성: {groupDigits(selectedProposalForVote.proposal.votesYes)}표</span>
                <span className="text-rose-400">반대: {groupDigits(selectedProposalForVote.proposal.votesNo)}표</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleVoteProposal('YES')}
                className="font-black bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                찬성 투표 (5,000표)
              </Button>
              <Button
                onClick={() => handleVoteProposal('NO')}
                variant="destructive"
                className="font-black bg-rose-600 hover:bg-rose-700 text-white"
              >
                반대 투표 (5,000표)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
