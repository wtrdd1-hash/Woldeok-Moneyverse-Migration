import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { copyProblems } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { BANK_COPY } from './copy';
import { CompoundInterestCard, DepositWithdrawCard, SmartLoanCard, VirtualBondsCard } from './bank-forms';
import { BankLiquidityCard } from './bank-liquidity-card';
import { CreditScoreCard } from './credit-score-card';
import { SavingGoalCertificateDialog } from './saving-goal-certificate-dialog';
import { SavingPocketCustomizeDialog } from './saving-pocket-customize-dialog';
import { SavingPocketsCard } from './saving-pockets-card';
import { SavingsGoalProgressRing } from './savings-progress-ring';
import { TossBankHeroCard } from './toss-bank-hero-card';
import { VirtualBondSimulatorDialog } from './virtual-bond-simulator-dialog';
import type { BankBond, BankLoan, SavingPocket } from './types';

// Server actions never run here; the components only need a callable reference for useActionState.
vi.mock('./actions', () => ({
  archivePocketAction: vi.fn(),
  borrowAction: vi.fn(),
  claimInterestAction: vi.fn(),
  createPocketAction: vi.fn(),
  customizePocketAction: vi.fn(),
  depositAction: vi.fn(),
  previewRepayAction: vi.fn(),
  purchaseBondAction: vi.fn(),
  redeemBondAction: vi.fn(),
  repayAction: vi.fn(),
  transferPocketAction: vi.fn(),
  withdrawAction: vi.fn(),
}));
vi.mock('@/lib/audio-effects', () => ({ playCoinCollectSound: vi.fn(), playStockTickSound: vi.fn() }));

const HANGUL = /[가-힣]/;

// Every piece of member data below is ASCII on purpose, so any Hangul on screen is product copy.
const pocket: SavingPocket = {
  pocket_id: 'abcdef12-1111-4111-8111-111111111111',
  name: 'Travel fund',
  balance: '12000',
  target_amount: '10000',
  target_date: '2026-12-31',
  theme_color: 'emerald',
  icon_code: 'piggy-bank',
  is_archived: false,
  created_at: '2026-09-20T00:00:00Z',
  updated_at: '2026-09-26T00:00:00Z',
};
const loan: BankLoan = {
  loan_id: 'a0000000-0000-4000-8000-000000000001',
  principal_amount: '50000',
  interest_amount: '2500',
  outstanding_amount: '52500',
  issued_at: '2026-11-01T00:00:00Z',
  status: 'active',
};
const bonds: BankBond[] = [
  {
    id: 'bond-1', bond_code: 'BOND_7D', bond_name: 'BOND 7D', principal_amount: '10000', yield_bps: 300,
    maturity_amount: '10300', purchased_at: '2026-11-01T00:00:00Z', maturity_at: '2026-11-08T00:00:00Z',
    is_matured: true, status: 'holding',
  },
];

function renderIn(locale: Locale, ui: ReactElement) {
  return render(ui, { wrapper: ({ children }) => <LocaleProvider initialLocale={locale}>{children}</LocaleProvider> });
}

/** Visible text plus the attributes a member reads or hears: placeholders, labels and tooltips. */
function hangulOnScreen(): string[] {
  const found: string[] = [];
  // The shared shadcn dialog's close button (components/ui/dialog.tsx) carries its own Korean
  // screen-reader label; it is app-wide, not /bank copy, so it is excluded here and localised separately.
  const scanned = document.body.cloneNode(true) as HTMLElement;
  for (const close of Array.from(scanned.querySelectorAll('[data-slot="dialog-close"]'))) close.remove();
  const text = scanned.textContent ?? '';
  for (const line of text.split(/(?<=[.!?])\s+|\n/)) if (HANGUL.test(line)) found.push(line.trim());
  for (const element of Array.from(document.body.querySelectorAll('[placeholder],[aria-label],[title]'))) {
    for (const attribute of ['placeholder', 'aria-label', 'title']) {
      const value = element.getAttribute(attribute);
      if (value && HANGUL.test(value)) found.push(`${attribute}=${value}`);
    }
  }
  return found;
}

describe('bank copy table', () => {
  it('has every locale filled and no Korean outside the Korean column', () => {
    expect(copyProblems(BANK_COPY)).toEqual([]);
  });
});

describe('bank client components outside Korean', () => {
  afterEach(() => cleanup());

  for (const locale of ['en', 'ja', 'zh', 'vi'] as const) {
    it(`renders the deposit, interest, loan and bond cards without Korean in ${locale}`, () => {
      renderIn(locale, (
        <>
          <DepositWithdrawCard cashBalance="1000" bankBalance="2000" dailyRatePct={0.1} />
          <CompoundInterestCard bankBalance="2000" unclaimedInterest="12" dailyRatePct={0.1} annualYieldPct={44} />
          <SmartLoanCard creditLimit="100000" creditGrade="B" loanInterestBps={500} loanTermDays={30} loanMinimumRepayment="1000" activeLoan={null} cashBalance="1000" />
          <SmartLoanCard creditLimit="100000" creditGrade="B" loanInterestBps={500} loanTermDays={30} loanMinimumRepayment="1000" activeLoan={loan} cashBalance="1000" />
          <VirtualBondsCard bonds={bonds} cashBalance="1000" />
          <VirtualBondsCard bonds={[]} cashBalance="1000" />
        </>
      ));
      fireEvent.click(screen.getAllByRole('button', { name: BANK_COPY.formsWithdrawTab[locale] })[0]!);
      expect(hangulOnScreen()).toEqual([]);
    });

    it(`renders the hero card and its dialogs without Korean in ${locale}`, () => {
      renderIn(locale, <TossBankHeroCard bankBalance="2000" cashBalance="1000" unclaimedInterest="3" dailyRatePct={0.1} annualYieldPct={44} />);
      expect(hangulOnScreen()).toEqual([]);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.heroDepositButton[locale] }));
      expect(hangulOnScreen()).toEqual([]);
      cleanup();
      renderIn(locale, <TossBankHeroCard bankBalance="2000" cashBalance="1000" unclaimedInterest="3" dailyRatePct={0.1} annualYieldPct={44} />);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.heroWithdrawButton[locale] }));
      expect(hangulOnScreen()).toEqual([]);
    });

    it(`renders the savings goal ring and calculator without Korean in ${locale}`, () => {
      renderIn(locale, <SavingsGoalProgressRing bankBalance="1000" cashBalance="10" bondsTotal="0" />);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.ringCalculatorOpen[locale] }));
      expect(hangulOnScreen()).toEqual([]);
    });

    it(`renders saving pockets and their dialogs without Korean in ${locale}`, () => {
      renderIn(locale, <SavingPocketsCard pockets={[pocket]} cashBalance="1000" bankBalance="2000" />);
      expect(hangulOnScreen()).toEqual([]);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.pocketsNew[locale] }));
      expect(hangulOnScreen()).toEqual([]);
      cleanup();
      renderIn(locale, <SavingPocketsCard pockets={[pocket]} cashBalance="1000" bankBalance="2000" />);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.pocketsTransfer[locale] }));
      expect(hangulOnScreen()).toEqual([]);
      cleanup();
      renderIn(locale, <SavingPocketsCard pockets={[pocket]} cashBalance="1000" bankBalance="2000" />);
      fireEvent.click(screen.getByTitle(BANK_COPY.pocketsArchiveTitle[locale]));
      expect(hangulOnScreen()).toEqual([]);
      cleanup();
      renderIn(locale, <SavingPocketsCard pockets={[pocket]} cashBalance="1000" bankBalance="2000" />);
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.pocketsCertificate[locale] }));
      expect(hangulOnScreen()).toEqual([]);
    });

    it(`renders the customize and certificate dialogs without Korean in ${locale}`, () => {
      renderIn(locale, <SavingPocketCustomizeDialog pocket={pocket} cashBalance="10" open onOpenChange={() => {}} />);
      fireEvent.click(screen.getByTitle(BANK_COPY.themeRose[locale]));
      expect(hangulOnScreen()).toEqual([]);
      cleanup();
      renderIn(locale, <SavingGoalCertificateDialog pocket={pocket} open onOpenChange={() => {}} />);
      expect(hangulOnScreen()).toEqual([]);
    });

    it(`renders the bond simulator, credit report and liquidity card without Korean in ${locale}`, () => {
      renderIn(locale, (
        <>
          <VirtualBondSimulatorDialog onApply={() => {}} />
          <CreditScoreCard
            initialRating={{ score: 610, tier: 5, tierNameKo: 'Normal 1', creditLimitWld: 200000, interestRateBps: 600, maxInstallments: 12 }}
            standingCreditLimit="50000"
            standingCreditGrade="C"
            standingLoanInterestBps="800"
            standingLoanTermDays={30}
          />
          <CreditScoreCard />
          <BankLiquidityCard bankBalance="1000" loanDebt="0" creditLimit="0" />
          <BankLiquidityCard bankBalance="bad" loanDebt="0" creditLimit="100" />
        </>
      ));
      fireEvent.click(screen.getByRole('button', { name: BANK_COPY.bondSimTrigger[locale] }));
      expect(hangulOnScreen()).toEqual([]);
    });
  }
});
