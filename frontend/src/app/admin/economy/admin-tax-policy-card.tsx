'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Sliders, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface TaxPolicyConfig {
  id: string;
  tax_type: string;
  name: string;
  base_rate_bps: number;
  current_rate_bps: number;
  min_rate_bps: number;
  max_rate_bps: number;
  auto_adjust_enabled: boolean;
  tier_multipliers: Record<string, number>;
  last_adjusted_at: string;
}

interface TaxSummary {
  tax_type: string;
  tx_count: string;
  total_tax_wld: string;
  vault_main_wld: string;
  vault_welfare_wld: string;
}

export function AdminTaxPolicyCard() {
  const [configs, setConfigs] = useState<TaxPolicyConfig[]>([]);
  const [summary, setSummary] = useState<TaxSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchTaxPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/economy/tax-policy');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setSummary(data.summary || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxPolicies();
  }, []);

  const handleUpdate = async (config: TaxPolicyConfig, newRateBps: number, autoAdjust: boolean) => {
    try {
      setUpdating(config.tax_type);
      const res = await fetch('/api/admin/economy/tax-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxType: config.tax_type,
          baseRateBps: config.base_rate_bps,
          currentRateBps: newRateBps,
          autoAdjust,
        }),
      });

      if (res.ok) {
        setNotice(`${config.name} 세율이 ${(newRateBps / 100).toFixed(2)}%로 변경되었습니다.`);
        await fetchTaxPolicies();
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const handleTriggerAutoAdjust = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/economy/tax-policy/auto-adjust', {
        method: 'POST',
      });
      if (res.ok) {
        setNotice('거시경제 지표 연동 자동 세율 조절이 성공적으로 집행되었습니다.');
        await fetchTaxPolicies();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            실시간 거시경제 세금 정책 & 직업 소득세 관제탑
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerAutoAdjust}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            자동 세율 동적 갱신 집행
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 직업 소득세 국고 귀속 요약 카드 */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="text-[11px] font-medium text-zinc-400">직업 세수 총 누적액</div>
          <div className="mt-1 font-mono text-lg font-bold text-zinc-100">
            {summary.find((s) => s.tax_type === 'WORK_INCOME')?.total_tax_wld || '0'} <span className="text-xs text-zinc-400 font-normal">WLD</span>
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            총 {summary.find((s) => s.tax_type === 'WORK_INCOME')?.tx_count || '0'}건 원천징수 집행
          </div>
        </div>

        <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-3">
          <div className="text-[11px] font-medium text-blue-400">중앙 국고 귀속분 (50%)</div>
          <div className="mt-1 font-mono text-lg font-bold text-blue-200">
            {summary.find((s) => s.tax_type === 'WORK_INCOME')?.vault_main_wld || '0'} <span className="text-xs text-zinc-400 font-normal">WLD</span>
          </div>
          <div className="mt-1 text-[10px] text-blue-400/80">VAULT_MAIN 통화 안정 재원</div>
        </div>

        <div className="rounded-lg border border-purple-900/30 bg-purple-950/20 p-3">
          <div className="text-[11px] font-medium text-purple-400">시민 복지기금 귀속분 (50%)</div>
          <div className="mt-1 font-mono text-lg font-bold text-purple-200">
            {summary.find((s) => s.tax_type === 'WORK_INCOME')?.vault_welfare_wld || '0'} <span className="text-xs text-zinc-400 font-normal">WLD</span>
          </div>
          <div className="mt-1 text-[10px] text-purple-400/80">VAULT_WELFARE 선별 지원 재원</div>
        </div>
      </div>

      {/* 세율 리스트 & 제어 패널 */}
      <div className="mt-5 space-y-4">
        {configs.length === 0 && !loading && (
          <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
            등록된 세금 정책 설정이 없습니다.
          </div>
        )}

        {configs.map((config) => {
          const currentPct = (config.current_rate_bps / 100).toFixed(2);
          const basePct = (config.base_rate_bps / 100).toFixed(2);

          return (
            <div
              key={config.id}
              className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-200">{config.name}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      {config.tax_type}
                    </span>
                    {config.auto_adjust_enabled ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="h-3 w-3" />
                        거시경제 자동 조절 활성
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        수동 고정
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    기본 기준세율: {basePct}% | 범위: {(config.min_rate_bps / 100).toFixed(1)}% ~ {(config.max_rate_bps / 100).toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-zinc-400">현재 세율: </span>
                    <span className="font-mono text-base font-bold text-emerald-400">{currentPct}%</span>
                  </div>
                </div>
              </div>

              {/* 제어 인터페이스 */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 pt-3">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-zinc-400">세율 조절:</label>
                  <input
                    type="range"
                    min={config.min_rate_bps}
                    max={config.max_rate_bps}
                    step={25}
                    value={config.current_rate_bps}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setConfigs((prev) =>
                        prev.map((c) => (c.id === config.id ? { ...c, current_rate_bps: val } : c)),
                      );
                    }}
                    className="h-1.5 w-36 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-zinc-300">
                    {(config.current_rate_bps / 100).toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdate(config, config.current_rate_bps, !config.auto_adjust_enabled)
                    }
                    disabled={updating === config.tax_type}
                    className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      config.auto_adjust_enabled
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {config.auto_adjust_enabled ? '자동 조절 끄기 (수동 전환)' : '자동 조절 켜기'}
                  </button>

                  <button
                    onClick={() =>
                      handleUpdate(config, config.current_rate_bps, config.auto_adjust_enabled)
                    }
                    disabled={updating === config.tax_type}
                    className="rounded bg-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {updating === config.tax_type ? '저장 중...' : '세율 확정 저장'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
