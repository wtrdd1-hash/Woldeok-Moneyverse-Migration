'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { cancelMarketEvent, publishMarketEvent } from '../actions';
import type { AdminStock } from '../types';

/** What each strength does, in the words an operator decides by. */
/**
 * The three strengths, in what they do. The step is what 152 added: news
 * moves the price when it lands and leans it afterwards, so both figures
 * belong beside the label an operator picks.
 */
export const STRENGTHS = [
  { value: 1, label: '소폭', detail: '즉시 ±0.8 % · 하루 ±3 % 기울기 · 변동성 1.2배' },
  { value: 2, label: '보통', detail: '즉시 ±2.5 % · 하루 ±8 % 기울기 · 변동성 1.5배' },
  { value: 3, label: '강력', detail: '즉시 ±6 % · 하루 ±20 % 기울기 · 변동성 2배' },
] as const;

/**
 * Publishes news.
 *
 * A dialog rather than an inline form because a headline that leans a
 * market for a day is worth a second look before it goes out, and because
 * the strength vocabulary needs room to say what each word does.
 */
export function PublishMarketEventDialog({ stocks }: { readonly stocks: readonly AdminStock[] }) {
  const [state, action] = useActionState(publishMarketEvent, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="min-h-11">소식 내기</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <form action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>시장 소식 내기</DialogTitle>
            <DialogDescription>
              낸 순간부터 정한 기간 동안 대상 종목(또는 시장 전체)의 적정가가 그 방향으로 기울고
              변동성이 커져요. 회원 거래소 화면에 그대로 보입니다.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="event-stock">대상</FieldLabel>
            <select
              id="event-stock"
              name="stockId"
              defaultValue=""
              className="min-h-11 rounded-[10px] border bg-card px-3 text-sm"
            >
              <option value="">시장 전체</option>
              {stocks
                .filter((stock) => stock.active)
                .map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.symbol} · {stock.name}
                  </option>
                ))}
            </select>
          </Field>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-bold">방향</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm has-[:checked]:border-rise has-[:checked]:bg-rise/10">
                <input type="radio" name="direction" value="up" defaultChecked required />
                호재 · 오른다
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm has-[:checked]:border-fall has-[:checked]:bg-fall/10">
                <input type="radio" name="direction" value="down" />
                악재 · 내린다
              </label>
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-bold">강도</legend>
            <div className="grid gap-2">
              {STRENGTHS.map((strength) => (
                <label
                  key={strength.value}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <input
                    type="radio"
                    name="strength"
                    value={strength.value}
                    defaultChecked={strength.value === 2}
                  />
                  <span className="font-bold">{strength.label}</span>
                  <span className="text-xs text-muted-foreground">{strength.detail}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field>
            <FieldLabel htmlFor="event-hours">기간 (시간)</FieldLabel>
            <Input
              id="event-hours"
              name="hours"
              type="number"
              inputMode="numeric"
              min={1}
              max={168}
              defaultValue={6}
              required
            />
            <FieldDescription>1시간부터 일주일(168시간)까지. 끝나면 시장은 원래 흐름으로 돌아가요.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="event-headline">제목</FieldLabel>
            <Input id="event-headline" name="headline" minLength={2} maxLength={120} required />
          </Field>

          <Field>
            <FieldLabel htmlFor="event-body">본문</FieldLabel>
            <Textarea id="event-body" name="body" rows={4} maxLength={2000} />
            <FieldDescription>회원에게 그대로 보이는 글이에요. 비워 두어도 됩니다.</FieldDescription>
          </Field>

          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton>소식 내기</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CancelMarketEventButton({ eventId }: { readonly eventId: string }) {
  const [state, action] = useActionState(cancelMarketEvent, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="eventId" value={eventId} />
        <SubmitButton variant="outline" size="sm" className="min-h-11">
          지금 끝내기
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
