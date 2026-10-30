'use client';

import { useState } from 'react';
import { parseKdicOverview } from './kdic-evidence';
import { parseKdicLedgerIntegrity, type KdicLedgerEvidence } from './kdic-ledger-evidence';
import { toast } from 'sonner';

export interface KdicOverviewData {
  fund: {
    id: string;
    fundName: string;
    totalFundWld: number;
    protectionLimitPerUser: number;
    totalInsuredDepositsWld: number;
    cumulativePremiumsCollectedWld: number;
    cumulativePayoutsWld: number;
    isEmergencyMode: boolean;
    updatedAt: string;
  };
  institutions: Array<{
    id: string;
    institutionName: string;
    institutionType: string;
    bisRatioPct: number;
    soundnessGrade: string;
    totalDepositsWld: number;
    premiumRatePct: number;
    status: string;
    updatedAt: string;
  }>;
  summary: {
    totalInsuredInstitutions: number;
    totalDepositsWld: number;
    averageBisRatioPct: number;
    reserveCoverageRatioPct: number;
  };
  recentPremiums: Array<{
    id: string;
    institutionId: string;
    institutionName: string;
    quarter: string;
    assessedDepositBase: number;
    premiumAmountWld: number;
    status: string;
    createdAt: string;
  }>;
  recentPayouts: Array<{
    id: string;
    institutionId: string;
    institutionName: string;
    userId: string;
    displayName?: string;
    originalDepositWld: number;
    payoutAmountWld: number;
    status: string;
    reason: string;
    createdAt: string;
  }>;
}

export function KdicControlTower({ initialData, initialLedger = null }: { initialData: KdicOverviewData | null; initialLedger?: KdicLedgerEvidence | null }) {
  const [data, setData] = useState<KdicOverviewData | null>(initialData);
  const [ledger, setLedger] = useState<KdicLedgerEvidence | null>(initialLedger);
  const [loading, setLoading] = useState(false);
  const refreshData = async () => {
    setLoading(true);
    setData(null); // Never present stale monetary observations as fresh while refreshing.
    setLedger(null);
    try {
      const [response, ledgerResponse] = await Promise.all([
        fetch('/api/admin/kdic/overview', { cache: 'no-store' }),
        fetch('/api/admin/kdic/ledger-integrity', { cache: 'no-store' }),
      ]);
      const verified = response.ok ? parseKdicOverview(await response.json()) : null;
      const verifiedLedger = ledgerResponse.ok ? parseKdicLedgerIntegrity(await ledgerResponse.json()) : null;
      setData(verified);
      setLedger(verifiedLedger);
      if (!verified) toast.error('KDIC 관제 데이터 검증에 실패했습니다.');
      if (!verifiedLedger) toast.error('KDIC 원장 대조 결과를 확인하지 못했습니다.');
    } catch {
      setData(null);
      setLedger(null);
      toast.error('KDIC 관제 데이터를 다시 조회하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fund = data?.fund;
  const institutions = data?.institutions ?? [];
  const summary = data?.summary;
  const recentPremiums = data?.recentPremiums ?? [];
  const recentPayouts = data?.recentPayouts ?? [];

  return (
    <div className="space-y-6">
      {!data && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          KDIC 조회 결과를 확인할 수 없습니다. 미확인 금액을 0 WLD 또는 정상 상태로 판단하지 마세요.
        </div>
      )}
      <p role="status" className="text-xs text-amber-300">금융 집행 기능 보류: 서버에서도 집행 요청을 HTTP 503으로 차단합니다. DB 권한·원장 안전성 검증 전까지 조회만 가능합니다.</p>
      <section aria-label="KDIC 원장 검증" className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-4 space-y-3">
        <h3 className="font-semibold text-white">관리자 원장 진단 · 읽기 전용</h3>
        {!ledger ? (
          <p role="status" className="text-sm text-amber-300">실시간 원장 증거를 확인하지 못했습니다. 원장 상태를 정상으로 판단하지 마세요.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div><span className="block text-slate-400">원장 거래</span><strong className="text-white">{BigInt(ledger.transactionCount).toLocaleString('ko-KR')}건</strong></div>
              <div><span className="block text-slate-400">불균형 거래</span><strong className="text-white">{BigInt(ledger.unbalancedTransactionCount).toLocaleString('ko-KR')}건</strong></div>
              <div><span className="block text-slate-400">잔액 불일치</span><strong className="text-white">{BigInt(ledger.mismatchedAccountCount).toLocaleString('ko-KR')} / {BigInt(ledger.accountCount).toLocaleString('ko-KR')}계좌</strong></div>
              <div><span className="block text-slate-400">원장 차이</span><strong className="text-white">{BigInt(ledger.absoluteDifferenceWld).toLocaleString('ko-KR')} WLD</strong></div>
              <div><span className="block text-slate-400">국고 거래 미연결</span><strong className="text-amber-300">{BigInt(ledger.unlinkedTreasuryCount).toLocaleString('ko-KR')} / {BigInt(ledger.treasuryRecordCount).toLocaleString('ko-KR')}건</strong></div>
              <div><span className="block text-slate-400">조회 시각</span><span className="text-slate-200">{new Date(ledger.checkedAt).toLocaleString('ko-KR')}</span></div>
            </div>
            <p role="status" className="text-xs text-amber-300">
              {ledger.numericBalanced ? '현재 계좌·전표 수치 일치' : '원장 차이 또는 전표 불균형 감지'} · 금융 집행 승인 아님. 기존 KDIC 정산 경로의 원장·멱등성 검증과 국고 지급 증빙이 완료되기 전까지 집행은 차단됩니다.
            </p>
          </>
        )}
      </section>
      {/* 1. 상단 브리핑 헤더 & 정기 징수 액션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              가상 예금보험 제도 · 실물 법적 보호 아님
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              머니버스 내 가상 보호 한도
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            🏛️ 예금보험공사(KDIC) & 금융안정기금 종합 관제탑
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            가상 금융기관 상태와 보험료·지급 이력을 조회합니다. 금융 집행은 별도 보안 검증 전까지 보류합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all"
          >
            새로고침
          </button>
          <button
            disabled
            title="금융 집행은 인증·원장 무결성 검증 완료 전 보류됩니다"
            className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
          >
            분기별 예보료 징수 (보류)
          </button>
        </div>
      </div>

      {/* 2. 핵심 4대 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 예금보험기금 총액 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            예금보험기금 총자산 (가상 KDIC Vault)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {fund ? fund.totalFundWld.toLocaleString() : '—'} <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            부보예금 대비 기금적립률: {summary ? `${summary.reserveCoverageRatioPct}%` : '—'} (원장 무결성 별도 확인 필요)
          </div>
        </div>

        {/* 1인당 법정 보호 한도 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            가상 1인당 보호 한도
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {fund ? fund.protectionLimitPerUser.toLocaleString() : '—'} <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            머니버스 가상 예금자보호 기준 · 실제 금융상품 아님
          </div>
        </div>

        {/* 금융기관 평균 BIS 비율 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            부보 금융기관 평균 BIS 비율
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            {summary ? `${summary.averageBisRatioPct}%` : '—'} <span className="text-sm font-sans text-slate-400">자기자본비율</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            가상 금융기관 상태 · 실물 금융 건전성 인증 아님
          </div>
        </div>

        {/* 누적 대위변제 및 예보료 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            누적 징수 예보료 / 대위변제
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-slate-200">
            +{fund ? fund.cumulativePremiumsCollectedWld.toLocaleString() : '—'} <span className="text-xs font-sans text-emerald-400">징수</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            누적 대위변제 집행액: {fund ? fund.cumulativePayoutsWld.toLocaleString() : '—'} WLD
          </div>
        </div>
      </div>

      {/* 3. 부보 금융기관 건전성 및 긴급 유동성 대여(Bailout) 그리드 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🏦</span> 부보 금융기관(시중은행 · 증권사) 건전성 감독 및 긴급 유동성 대여
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            가상 금융기관의 보고된 BIS 비율과 예금 잔액을 표시합니다. 대여 집행은 비활성화되어 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{inst.institutionName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">유형: {inst.institutionType}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    inst.bisRatioPct >= 10.5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    BIS {inst.bisRatioPct.toFixed(2)}% ({inst.soundnessGrade})
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">수신 잔액 (예금고)</div>
                    <div className="font-mono font-bold text-slate-200">{inst.totalDepositsWld.toLocaleString()} WLD</div>
                  </div>
                  <div>
                    <div className="text-slate-500">가상 예보료율</div>
                    <div className="font-mono font-bold text-cyan-400">연 {inst.premiumRatePct}%</div>
                  </div>
                </div>
              </div>
              <button
                disabled
                title="원장·권한 검증 완료 전 대여 집행 보류"
                className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
              >
                긴급 유동성 대여 (보류)
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 부실 금융기관 피해 예금자 대위변제(Insurance Payout) 집행 콘솔 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🛡️</span> 가상 부실 금융기관 피해 예금자 지급 기록
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            파산 또는 영업정지된 금융기관의 예금자에 대해 1인당 최고 50만 WLD 한도 내에서 즉각 대위변제금을 지급합니다.
            실제 원장 체결 여부는 별도 무결성 검사로 확인해야 합니다.
          </p>
        </div>

        <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          대위변제 집행은 인증·CSRF·원장 무결성 및 DB 권한 검증이 완료될 때까지 보류됩니다.
          조회 결과만 확인할 수 있습니다.
          <button type="button" disabled className="mt-3 block min-h-11 rounded-lg border border-amber-500/40 px-4 opacity-60">
            대위변제금 즉시 환급 (보류)
          </button>
        </div>
      </div>

      {/* 5. 최근 대위변제 및 예보료 징수 원장 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 예보료 징수 원장 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">📋 분기별 예금보험료 징수 원장</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              가상 예보료 기록
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2">분기</th>
                  <th className="p-2">금융기관</th>
                  <th className="p-2">수신고 기준</th>
                  <th className="p-2">납부 보험료</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentPremiums.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">{data ? '징수 이력이 없습니다.' : '징수 이력을 확인할 수 없습니다.'}</td>
                  </tr>
                ) : (
                  recentPremiums.map(p => (
                    <tr key={p.id}>
                      <td className="p-2 font-mono">{p.quarter}</td>
                      <td className="p-2 font-medium">{p.institutionName}</td>
                      <td className="p-2 font-mono text-slate-400">{p.assessedDepositBase.toLocaleString()} WLD</td>
                      <td className="p-2 font-mono font-bold text-emerald-400">+{p.premiumAmountWld.toLocaleString()} WLD</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 대위변제 원장 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">🛡️ 피해 예금자 대위변제 집행 원장</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              원자적 복식부기 (MINT → CASH)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2">시간</th>
                  <th className="p-2">부실기관</th>
                  <th className="p-2">예금자</th>
                  <th className="p-2">원예금고</th>
                  <th className="p-2">대위변제금</th>
                  <th className="p-2">원장상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">{data ? '대위변제 이력이 없습니다.' : '대위변제 이력을 확인할 수 없습니다.'}</td>
                  </tr>
                ) : (
                  recentPayouts.map(py => (
                    <tr key={py.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-2 font-mono text-slate-400">{new Date(py.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{py.institutionName}</td>
                      <td className="p-2 font-mono text-slate-300" title={py.userId}>{py.displayName || py.userId.substring(0, 8)}</td>
                      <td className="p-2 font-mono text-slate-400">{Number(py.originalDepositWld).toLocaleString()} WLD</td>
                      <td className="p-2 font-mono font-bold text-cyan-400">+{Number(py.payoutAmountWld).toLocaleString()} WLD</td>
                      <td className="p-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          지급 기록 · 원장 별도 검증
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
