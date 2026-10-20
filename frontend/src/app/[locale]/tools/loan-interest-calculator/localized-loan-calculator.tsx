'use client';

import { useMemo, useState } from 'react';
import { LOAN_LOCALES, type LoanLocale } from './loan-locales';
import { MONEY_COUNTRIES, formatCountryMoney, moneyCountryForLocale, type MoneyCountry } from '@/lib/country-money';

type Method = 'fixed' | 'principal' | 'bullet';

export function calculateLoan(amount: number, annualRate: number, years: number, method: Method) {
  const months = years * 12;
  if (!Number.isFinite(amount) || !Number.isFinite(annualRate) || !Number.isInteger(months)
      || amount <= 0 || amount > 1e12 || annualRate < 0 || annualRate > 30 || months < 12 || months > 480) {
    return null;
  }
  const r = annualRate / 1200;
  if (method === 'bullet') {
    const interest = amount * r;
    return { first: interest, last: amount + interest, totalInterest: interest * months };
  }
  if (method === 'fixed') {
    const payment = r === 0 ? amount / months : amount * r / (1 - (1 + r) ** (-months));
    return { first: payment, last: payment, totalInterest: payment * months - amount };
  }
  const principalPart = amount / months;
  const interestTotal = r * amount * (months + 1) / 2;
  return { first: principalPart + amount * r, last: principalPart * (1 + r), totalInterest: interestTotal };
}

export function LocalizedLoanCalculator({ locale }: { locale: LoanLocale }) {
  const t = LOAN_LOCALES[locale];
  const [country, setCountry] = useState<MoneyCountry>(() => moneyCountryForLocale(locale));
  const [amount, setAmount] = useState<number>(() => MONEY_COUNTRIES[moneyCountryForLocale(locale)].principal);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(30);
  const [method, setMethod] = useState<Method>('fixed');
  const result = useMemo(() => calculateLoan(amount, rate, years, method), [amount, rate, years, method]);
  const results = useMemo(() => ([
    ['fixed', t.equalPayment],
    ['principal', t.equalPrincipal],
    ['bullet', t.bullet],
  ] as const).map(([id, label]) => ({ id, label, value: calculateLoan(amount, rate, years, id)?.totalInterest ?? null })),
  [amount, rate, years, t]);
  const number = (value: number) => formatCountryMoney(value, country);
  const methods = { fixed: t.equalPayment, principal: t.equalPrincipal, bullet: t.bullet };

  return (
    <section aria-label={t.heading} className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-6">
      <label className="grid gap-2 text-sm font-medium max-w-xs">
        {t.country}
        <select value={country} onChange={e => {
          const next = e.currentTarget.value as MoneyCountry;
          setCountry(next);
          setAmount(MONEY_COUNTRIES[next].principal);
        }} className="rounded-lg border border-border bg-background p-3">
          <option value="KR">대한민국 · KRW (₩)</option>
          <option value="US">United States · USD ($)</option>
          <option value="JP">日本 · JPY (¥)</option>
          <option value="CN">中国 · CNY (¥)</option>
        </select>
      </label>
      <div role="group" aria-label={t.comparison} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(Object.keys(methods) as Method[]).map(key => (
          <button key={key} type="button" aria-pressed={key === method} onClick={() => setMethod(key)}
            className={`rounded-lg border p-3 text-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${key === method ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
            {methods[key]}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <label htmlFor="loan-amount" className="text-sm font-medium grid gap-2">
          {t.amount} ({MONEY_COUNTRIES[country].currency})
          <input id="loan-amount" type="number" min={1} max={1e12} step={10000} value={amount}
            onChange={e => setAmount(Number(e.currentTarget.value))}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono" />
        </label>
        <label htmlFor="loan-rate" className="text-sm font-medium grid gap-2">
          {t.rate}
          <input id="loan-rate" type="number" min={0} max={30} step={0.1} value={rate}
            onChange={e => setRate(Number(e.currentTarget.value))}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono" />
        </label>
        <label htmlFor="loan-years" className="text-sm font-medium grid gap-2">
          {t.term}
          <input id="loan-years" type="number" min={1} max={40} step={1} value={years}
            onChange={e => setYears(Number(e.currentTarget.value))}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono" />
        </label>
      </div>
      <div aria-live="polite" className="rounded-xl bg-muted/40 p-5 space-y-3">
        <h2 className="font-semibold">{t.result}</h2>
        {result ? (
          <dl className="grid sm:grid-cols-2 gap-4">
            {([
              [t.monthly, result.first],
              [t.last, result.last],
              [t.totalInterest, result.totalInterest],
              [t.total, amount + result.totalInterest],
            ] as const).map(([label, value]) => (
              <div key={label} className="space-y-1">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums">{number(value)}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="text-sm text-muted-foreground">{t.assumptions}</p>}
      </div>
      {result && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t.comparison}</h3>
          <ul className="grid gap-2">
            {results.map(item => (
              <li key={item.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm">
                <span>{item.label}</span>
                <strong className="tabular-nums whitespace-nowrap">{number(item.value ?? 0)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
