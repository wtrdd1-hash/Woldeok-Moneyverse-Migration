/**
 * The three strengths a piece of market news can have, in what they do.
 *
 * A plain module rather than a constant inside `market-events.tsx`, and that
 * is the whole point of the file. `market-events.tsx` is a client component;
 * everything a `'use client'` module exports reaches a server component as a
 * client *reference*, not as the value -- so the server saw a proxy where the
 * array should be and `STRENGTHS.find` was not a function. The console's
 * market page rendered that call only once there was an event to label, so
 * the screen worked until the first headline was published and then answered
 * every load with the error boundary.
 *
 * Both figures belong beside the label an operator picks: the step the price
 * takes when the news lands (152) and the lean it leaves behind (124).
 */
export const STRENGTHS = [
  { value: 1, label: '소폭', detail: '즉시 ±0.8 % · 하루 ±3 % 기울기 · 변동성 1.2배' },
  { value: 2, label: '보통', detail: '즉시 ±2.5 % · 하루 ±8 % 기울기 · 변동성 1.5배' },
  { value: 3, label: '강력', detail: '즉시 ±6 % · 하루 ±20 % 기울기 · 변동성 2배' },
] as const;

/** The word for a strength, for a reader who should not have to know the number. */
export function strengthLabel(value: number): string {
  return STRENGTHS.find((strength) => strength.value === value)?.label ?? String(value);
}
