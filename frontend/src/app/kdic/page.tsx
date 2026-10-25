'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { parseKdicPortal, type KdicPortalData } from './kdic-contract';

type Tab = 'calculator' | 'institutions' | 'safetynet' | 'faq';
const tabs: readonly { id: Tab; label: string }[] = [
  { id: 'calculator', label: '가상 보호한도 계산기' },
  { id: 'institutions', label: '금융기관 조회' },
  { id: 'safetynet', label: '가상 안전망 안내' },
  { id: 'faq', label: '자주 묻는 질문' },
];
const number = (value: number) => value.toLocaleString('ko-KR');

export default function KdicPortalPage() {
  const [tab, setTab] = useState<Tab>('calculator');
  const [data, setData] = useState<KdicPortalData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [principal, setPrincipal] = useState('350000');
  const [interest, setInterest] = useState('15000');
  const [result, setResult] = useState<{ total: number; capped: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/kdic/portal', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('upstream unavailable');
        const parsed = parseKdicPortal(await response.json());
        if (!parsed) throw new Error('invalid snapshot');
        if (!controller.signal.aborted) { setData(parsed); setState('ready'); }
      } catch {
        if (!controller.signal.aborted) { setData(null); setState('unavailable'); }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  function calculate() {
    const p = Number(principal);
    const i = Number(interest);
    if (!data || !Number.isSafeInteger(p) || !Number.isSafeInteger(i) || p < 0 || i < 0 ||
      !Number.isSafeInteger(p + i) || p + i === 0) {
      setResult(null);
      setError('0보다 큰 안전한 정수 금액을 입력하고 서버 자료를 확인해 주세요.');
      return;
    }
    setError('');
    setResult({ total: p + i, capped: Math.min(p + i, data.fund.protectionLimitPerUser) });
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="rounded-2xl border border-blue-700/30 bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-blue-200">WOLDEOK VIRTUAL ECONOMY · READ ONLY</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">월덕 가상 예금보호기금</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
          게임 내부 WLD 기금 및 금융기관의 서버 기록을 조회하는 화면입니다.
          WLD는 현금이 아니며, 이 화면은 현실의 예금보험이나 법적 보장과 무관합니다.
          표시된 한도는 가상경제 내부 규칙의 참고값일 뿐 실제 지급 약속이 아닙니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">서버 확인 기금 잔액</p>
            <p className="mt-1 text-xl font-bold" data-testid="kdic-reserve">
              {data ? `${number(data.fund.totalFundWld)} WLD` : '조회 불가'}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">등록된 가상 기관</p>
            <p className="mt-1 text-xl font-bold">{data ? `${data.institutions.length}곳` : '조회 불가'}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">자료 기준 시각</p>
            <p className="mt-1 text-sm font-semibold">
              {data ? new Date(data.fund.updatedAt).toLocaleString('ko-KR') : '확인되지 않음'}
            </p>
          </div>
        </div>
      </header>

      <div role="status" aria-live="polite" className="rounded-xl border border-border bg-card p-4 text-sm">
        {state === 'loading' && '가상기금 서버 기록을 조회하고 있습니다.'}
        {state === 'unavailable' && '현재 서버 기록을 조회할 수 없습니다. 임의의 기금 잔액이나 기관 정보를 표시하지 않습니다.'}
        {state === 'ready' && (result
          ? `예시 계산: 입력액 ${number(result.total)} WLD 중 가상 규칙상 한도 이내 ${number(result.capped)} WLD. 실제 지급 보장이 아닙니다.`
          : `서버 조회 완료 · ${data?.fund.isEmergencyMode ? '비상 상태 표시됨' : '비상 상태 표시 없음'} · 실시간 보장 아님`)}
      </div>

      <div role="tablist" aria-label="가상 예금보호기금 메뉴" className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id}
            aria-controls={`kdic-panel-${id}`} id={`kdic-tab-${id}`}
            onClick={() => setTab(id)}
            className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${tab === id ? 'border-blue-600 bg-blue-600 text-white' : 'border-border bg-card text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      <section id={`kdic-panel-${tab}`} role="tabpanel" aria-labelledby={`kdic-tab-${tab}`} className="rounded-2xl border bg-card p-5 sm:p-7">
        {tab === 'calculator' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">가상 보호한도 시뮬레이션</h2>
            <p className="text-sm text-muted-foreground">본 계산기는 실제 계좌를 조회하거나 지급을 실행하지 않습니다. 가상 기금에 설정된 한도로 예시 금액을 비교합니다.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">예시 원금 (WLD)
                <input type="number" min="0" step="1" value={principal} onChange={e => { setPrincipal(e.target.value); setResult(null); }} className="min-h-11 rounded-lg border bg-background px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">예시 이자 (WLD)
                <input type="number" min="0" step="1" value={interest} onChange={e => { setInterest(e.target.value); setResult(null); }} className="min-h-11 rounded-lg border bg-background px-3" />
              </label>
            </div>
            <button type="button" disabled={!data} onClick={calculate}
              className="min-h-11 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
              시뮬레이션 계산
            </button>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {data && <p className="text-sm text-muted-foreground">서버에 설정된 가상 한도: {number(data.fund.protectionLimitPerUser)} WLD</p>}
            {result && <p className="rounded-xl bg-muted p-4 text-sm">예시 계산 결과: {number(result.capped)} WLD (한도 초과 {number(result.total - result.capped)} WLD). 실제 보험·법적 보호·자동 지급을 의미하지 않습니다.</p>}
            <Link href="/bank" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-600 underline underline-offset-4">가상 은행 화면으로 이동 →</Link>
          </div>
        )}
        {tab === 'institutions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">서버에 등록된 가상 금융기관</h2>
            <p className="text-sm text-muted-foreground">실제 금융기관 인증이나 법정 보호기관 지정 목록이 아닙니다.</p>
            {data && data.institutions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.institutions.map(inst => (
                  <article key={inst.id} className="rounded-xl border p-4">
                    <h3 className="font-bold">{inst.institutionName}</h3>
                    <p className="mt-2 text-sm">시스템 상태: {inst.status} · 내부 등급: {inst.soundnessGrade}</p>
                    <p className="mt-2 text-sm">등록 BIS 지표: {inst.bisRatioPct.toFixed(2)}%</p>
                    <p className="mt-2 text-sm">서버 등록 예금 수탁액: {number(inst.totalDepositsWld)} WLD</p>
                    <p className="mt-2 text-sm">내부 보험료율: {inst.premiumRatePct}%</p>
                  </article>
                ))}
              </div>
            ) : <p className="text-sm" role="note">{data ? '등록된 가상 금융기관이 없습니다.' : '기관 목록을 확인할 수 없습니다.'}</p>}
          </div>
        )}
        {tab === 'safetynet' && (
          <div className="space-y-3 text-sm leading-6">
            <h2 className="text-xl font-bold">가상경제 금융안정 정책 안내</h2>
            <p>서버에 기록된 기금 잔액·기관 상태는 참고용입니다. 비상 유동성 지원이나 회원 보상은 이 화면에서 실행하지 않습니다.</p>
            <p>실제 원장에 반영된 지급 영수증이 없는 거래를 완료로 표시하지 않습니다. 법적 예금자보호와 동일한 제도도 아닙니다.</p>
          </div>
        )}
        {tab === 'faq' && (
          <div className="space-y-3 text-sm leading-6">
            <h2 className="text-xl font-bold">자주 묻는 질문</h2>
            <h3 className="font-bold">WLD는 원화로 환급되나요?</h3>
            <p>아니요. WLD는 서비스 내부 가상 단위로 현금이나 법정 예금이 아닙니다.</p>
            <h3 className="font-bold">한도 이내 금액은 무조건 지급되나요?</h3>
            <p>아니요. 계산기는 가상 규칙에 따른 예시일 뿐, 지급 확정이나 법적 보증을 의미하지 않습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
