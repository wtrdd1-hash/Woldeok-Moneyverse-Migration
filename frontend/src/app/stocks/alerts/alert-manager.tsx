'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { createStockAlert, deleteStockAlert } from './actions';

export interface AlertStock { readonly id: string; readonly symbol: string; readonly name: string }
export interface AlertRule {
  readonly alert_id: string; readonly stock_id: string; readonly symbol: string; readonly name: string;
  readonly condition_kind: string; readonly threshold_amount: string | null; readonly threshold_bps: number | null;
  readonly cooldown_seconds: number; readonly current_price: string; readonly current_day_change_bps: number;
  readonly condition_met: boolean; readonly last_triggered_at: string | null;
}
export interface AlertEvent {
  readonly event_id: string; readonly symbol: string; readonly name: string; readonly condition_kind: string;
  readonly threshold_amount: string | null; readonly threshold_bps: number | null;
  readonly trigger_price: string; readonly trigger_day_change_bps: number; readonly triggered_at: string;
}

const conditionLabel: Record<string, string> = {
  price_at_or_above: '가격 이상', price_at_or_below: '가격 이하',
  day_change_at_or_above: '일일 변동률 이상', day_change_at_or_below: '일일 변동률 이하',
};

function thresholdText(rule: Pick<AlertRule, 'condition_kind' | 'threshold_amount' | 'threshold_bps'>): string {
  if (rule.condition_kind.startsWith('price_')) return `${rule.threshold_amount ?? '-'} WLD`;
  const bps = rule.threshold_bps ?? 0;
  return `${bps >= 0 ? '+' : ''}${(bps / 100).toFixed(2)}%`;
}

export function AlertManager({ stocks, alerts, events, isEn }: { readonly stocks: readonly AlertStock[]; readonly alerts: readonly AlertRule[]; readonly events: readonly AlertEvent[]; readonly isEn: boolean }) {
  const [createState, createAction] = useActionState(createStockAlert, IDLE);
  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{isEn ? 'Create conditional alert' : '조건부 알림 만들기'}</CardTitle>
          <CardDescription>{isEn ? 'Price thresholds use WLD. Daily-change thresholds use basis points (100 bp = 1%). Alerts are evaluated by the server market ticker.' : '가격 조건은 WLD, 일일 변동 조건은 bp(100bp = 1%)로 입력합니다. 조건은 서버 시장 ticker가 평가합니다.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span>{isEn ? 'Stock' : '종목'}</span><select name="stockId" required className="min-h-11 rounded-md border bg-background px-3"><option value="">{isEn ? 'Select a stock' : '종목 선택'}</option>{stocks.map((stock) => <option key={stock.id} value={stock.id}>{stock.symbol} · {stock.name}</option>)}</select></label>
            <label className="grid gap-1 text-sm"><span>{isEn ? 'Condition' : '조건'}</span><select name="conditionKind" required className="min-h-11 rounded-md border bg-background px-3"><option value="price_at_or_above">{isEn ? 'Price at or above' : '가격 이상'}</option><option value="price_at_or_below">{isEn ? 'Price at or below' : '가격 이하'}</option><option value="day_change_at_or_above">{isEn ? 'Daily change at or above' : '일일 변동률 이상'}</option><option value="day_change_at_or_below">{isEn ? 'Daily change at or below' : '일일 변동률 이하'}</option></select></label>
            <label className="grid gap-1 text-sm"><span>{isEn ? 'Threshold (WLD or bp)' : '기준값 (WLD 또는 bp)'}</span><input name="threshold" required inputMode="numeric" className="min-h-11 rounded-md border bg-background px-3" placeholder={isEn ? 'e.g. 10000 or -500' : '예: 10000 또는 -500'} /></label>
            <label className="grid gap-1 text-sm"><span>{isEn ? 'Cooldown (minutes)' : '재알림 대기 (분)'}</span><input name="cooldownMinutes" type="number" min="5" max="10080" defaultValue="60" required className="min-h-11 rounded-md border bg-background px-3" /></label>
            <div className="md:col-span-2 grid gap-2"><SubmitButton className="w-fit">{isEn ? 'Create alert' : '알림 만들기'}</SubmitButton><ActionAlert state={createState} /></div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-3" aria-labelledby="active-alerts"><h2 id="active-alerts" className="text-lg font-semibold">{isEn ? 'Active alerts' : '활성 알림'}</h2>{alerts.length === 0 ? <p className="text-sm text-muted-foreground">{isEn ? 'No conditional alerts yet.' : '아직 조건부 알림이 없습니다.'}</p> : <div className="grid gap-3 md:grid-cols-2">{alerts.map((rule) => <AlertRuleCard key={rule.alert_id} rule={rule} isEn={isEn} />)}</div>}</section>

      <Card><CardHeader><CardTitle>{isEn ? 'Recent triggers' : '최근 발생 알림'}</CardTitle><CardDescription>{isEn ? 'Stored server-side trigger history. Repeated triggers are suppressed until the condition resets; cooldown also protects rapid re-entry.' : '서버에서 발생한 조건 기록입니다. 조건이 해제되기 전에는 반복 발생하지 않으며 재진입에도 cooldown이 적용됩니다.'}</CardDescription></CardHeader><CardContent className="grid gap-3">{events.length === 0 ? <p className="text-sm text-muted-foreground">{isEn ? 'No alerts have triggered yet.' : '아직 발생한 알림이 없습니다.'}</p> : events.map((event) => <div key={event.event_id} className="rounded-md border p-3 text-sm"><div className="font-medium">{event.symbol} · {event.name}</div><div className="text-muted-foreground">{conditionLabel[event.condition_kind] ?? event.condition_kind} {thresholdText(event as AlertRule)} · {isEn ? 'trigger price' : '발생 가격'} {event.trigger_price} WLD · {event.trigger_day_change_bps >= 0 ? '+' : ''}{(event.trigger_day_change_bps / 100).toFixed(2)}%</div><time className="text-xs text-muted-foreground" dateTime={event.triggered_at}>{new Date(event.triggered_at).toLocaleString()}</time></div>)}</CardContent></Card>
    </div>
  );
}

function AlertRuleCard({ rule, isEn }: { readonly rule: AlertRule; readonly isEn: boolean }) {
  const [state, action] = useActionState(deleteStockAlert, IDLE);
  return <Card><CardHeader><div className="flex items-start justify-between gap-2"><div><CardTitle className="text-base">{rule.symbol} · {rule.name}</CardTitle><CardDescription>{conditionLabel[rule.condition_kind] ?? rule.condition_kind} {thresholdText(rule)}</CardDescription></div><Badge variant={rule.condition_met ? 'default' : 'secondary'}>{rule.condition_met ? (isEn ? 'Condition met' : '조건 충족') : (isEn ? 'Watching' : '감시 중')}</Badge></div></CardHeader><CardContent className="grid gap-2 text-sm"><p>{isEn ? 'Current price' : '현재가'} {rule.current_price} WLD · {isEn ? 'daily change' : '일일 변동'} {rule.current_day_change_bps >= 0 ? '+' : ''}{(rule.current_day_change_bps / 100).toFixed(2)}%</p><p className="text-muted-foreground">{isEn ? 'Cooldown' : '재알림 대기'} {Math.round(rule.cooldown_seconds / 60)}{isEn ? ' min' : '분'}{rule.last_triggered_at ? ` · ${isEn ? 'last trigger' : '최근 발생'} ${new Date(rule.last_triggered_at).toLocaleString()}` : ''}</p><form action={action} className="grid gap-2"><input type="hidden" name="alertId" value={rule.alert_id} /><SubmitButton variant="outline" size="sm" className="w-fit">{isEn ? 'Delete alert' : '알림 삭제'}</SubmitButton><ActionAlert state={state} /></form></CardContent></Card>;
}
