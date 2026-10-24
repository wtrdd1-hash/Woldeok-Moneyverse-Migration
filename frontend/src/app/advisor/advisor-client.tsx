'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bot, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AssetSummary = {
  cash: number; savings: number; stocks: number; bonds: number; total: number;
  stockCount: number; topStockSymbol: string | null; topStockRatio: number;
};
type Diagnosis = {
  id: string; prIndex: number; riskLevel: string; assetSummary: AssetSummary;
  diagnosticNotes: string[];
  rebalanceSuggestions: Array<{ assetClass: string; currentRatio: number; targetRatio: number; action: string; advice: string }>;
  createdAt: string;
};
const format = (value: number) => Number.isFinite(value) ? value.toLocaleString('ko-KR') : '—';

export function AdvisorClient() {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    setDiagnosis(null);
    try {
      const res = await fetch('/api/advisor/deoki/diagnose', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body.success || !body.diagnosis?.assetSummary || !Number.isFinite(body.diagnosis.prIndex)) {
        throw new Error('unverified diagnosis');
      }
      setDiagnosis(body.diagnosis as Diagnosis);
    } catch {
      setError('실제 포트폴리오 진단을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const submitQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setAnswer('');
    try {
      const res = await fetch('/api/advisor/deoki/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const body = await res.json();
      if (!res.ok || !body.success || typeof body.answer !== 'string' || !body.answer.trim()) throw new Error('unverified answer');
      setAnswer(body.answer);
    } catch {
      setAnswer('서버에서 확인된 상담 답변을 받지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="grid gap-6" data-page="advisor">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>서버 확인 포트폴리오 진단</CardTitle>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading} className="min-h-11 focus-visible:ring-2">
            <RefreshCw aria-hidden="true" className="size-4" /> 새로고침
          </Button>
        </CardHeader>
        <CardContent className="space-y-4" aria-live="polite" aria-busy={loading}>
          {loading && <p role="status">서버 진단을 확인하고 있습니다.</p>}
          {!loading && error && <p role="alert" className="flex items-start gap-2 text-destructive"><AlertTriangle aria-hidden="true" className="size-5 shrink-0" />{error}</p>}
          {!loading && diagnosis && (
            <>
              <p className="text-sm text-muted-foreground">마지막 진단: {new Date(diagnosis.createdAt).toLocaleString('ko-KR')}</p>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-3"><dt>안전 점수 (PR-Index)</dt><dd className="text-xl font-bold">{diagnosis.prIndex} / 100</dd></div>
                <div className="rounded-lg border p-3"><dt>위험 등급</dt><dd className="text-xl font-bold">{diagnosis.riskLevel}</dd></div>
                <div className="rounded-lg border p-3"><dt>총 가상 자산</dt><dd className="text-xl font-bold">{format(diagnosis.assetSummary.total)} WLD</dd></div>
                <div className="rounded-lg border p-3"><dt>현금·예금</dt><dd>{format(diagnosis.assetSummary.cash + diagnosis.assetSummary.savings)} WLD</dd></div>
                <div className="rounded-lg border p-3"><dt>가상 주식</dt><dd>{format(diagnosis.assetSummary.stocks)} WLD</dd></div>
                <div className="rounded-lg border p-3"><dt>가상 국채</dt><dd>{format(diagnosis.assetSummary.bonds)} WLD</dd></div>
              </dl>
              <h3 className="font-semibold">서버 진단 의견</h3>
              <ul className="list-disc space-y-2 pl-5">{diagnosis.diagnosticNotes.map((note, index) => <li key={index}>{note}</li>)}</ul>
              <h3 className="font-semibold">참고용 자산 비중 제안 (자동 주문 아님)</h3>
              <ul className="grid gap-2">{diagnosis.rebalanceSuggestions.map((suggestion, index) => (
                <li key={index} className="rounded-lg border p-3">
                  <strong>{suggestion.assetClass}</strong>: 현재 {suggestion.currentRatio}% / 목표 {suggestion.targetRatio}% — {suggestion.advice}
                </li>
              ))}</ul>
            </>
          )}
          <p className="rounded-lg border border-amber-500/40 p-3 text-sm text-muted-foreground">
            자동 리밸런싱 체결은 제공되지 않습니다. 서버 주문·원장 영수증이 확인되지 않는 가상 체결 내역은 발급하지 않습니다.
            실제 거래는 <Link className="underline underline-offset-4 focus-visible:ring-2" href="/stocks">가상 주식 거래소</Link>에서 직접 확인하세요.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot aria-hidden="true" className="size-5" /> 덕이와의 1:1 상담실</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={(event) => void submitQuestion(event)} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="advisor-question" className="sr-only">가상 자산 상담 질문</label>
            <Input id="advisor-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="가상 자산에 관해 질문하세요" className="min-h-11" />
            <Button type="submit" disabled={asking || !question.trim()} className="min-h-11 focus-visible:ring-2">{asking ? '확인 중...' : '질문 전송'}</Button>
          </form>
          <div role="status" aria-live="polite" className="whitespace-pre-wrap break-words text-sm">{answer}</div>
        </CardContent>
      </Card>
    </div>
  );
}
