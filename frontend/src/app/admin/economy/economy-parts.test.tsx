import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import {
  AlertItem,
  HealthFigures,
  KnobItem,
  PayoutReportTable,
  PreviewPanel,
  ProposalPanel,
  ReconciliationBadge,
  SupplyFigures,
} from './economy-parts';
import type { BulkPayoutPreview, EconomyAlert, EconomyDashboard, PolicyKnob } from './economy';

function dashboard(overrides: Partial<EconomyDashboard> = {}): EconomyDashboard {
  return {
    m2_amount: '90000000000000000000000000000000000000',
    member_cash_amount: '1000',
    member_bank_amount: '2000',
    escrow_amount: '0',
    net_mint_issuance_amount: '5000',
    sink_absorbed_amount: '1000',
    issued_1h: '10',
    issued_24h: '240',
    issued_7d: '1680',
    burned_24h: '120',
    net_issued_24h: '120',
    top_holder_share: '0.123456',
    member_count: '1200',
    reconciliation_ok: true,
    reconciliation_at: '2026-08-30T00:00:00.000Z',
    failed_outbox_count: '0',
    open_alert_count: '3',
    running_job_count: '1',
    ...overrides,
  };
}

function alert(overrides: Partial<EconomyAlert> = {}): EconomyAlert {
  return {
    alert_id: '00000000-0000-4000-8000-000000000001',
    kind: 'economy.reconciliation.failed',
    severity: 'critical',
    summary: 'the ledger did not balance on 2026-08-29',
    detail: {},
    raised_at: '2026-08-30T00:00:00.000Z',
    acknowledged_at: null,
    ...overrides,
  };
}

function knob(overrides: Partial<PolicyKnob> = {}): PolicyKnob {
  return {
    knob_key: 'shop.supply_percent',
    title: '상점 공급량 배율',
    unit: 'percent',
    current_value: '100',
    baseline_value: '100',
    min_value: '50',
    max_value: '200',
    auto_adjustable: true,
    paused_reason: '',
    updated_at: '2026-08-30T00:00:00.000Z',
    ...overrides,
  };
}

function preview(overrides: Partial<BulkPayoutPreview> = {}): BulkPayoutPreview {
  return {
    target_count: '120',
    payable_count: '97',
    total_amount: '97000',
    policy_version: 'auto-2026-W35',
    ...overrides,
  };
}

describe('SupplyFigures', () => {
  // `m2_amount` is a numeric(38,0) and the whole reason money is a string in
  // this product. A screen that rounded the top of that range would be
  // reporting a money supply nobody has.
  it('keeps every digit of a supply far beyond a safe integer', () => {
    const huge = '9' + '0'.repeat(37);
    render(<SupplyFigures dashboard={dashboard({ m2_amount: huge })} />);
    const rendered = screen.getByText(/^90(,000){12}$/);
    // The mark travels in a child span, so the digits are the rest of it.
    expect(rendered.textContent?.replace(/[^0-9]/g, '')).toBe(huge);
  });
});

describe('HealthFigures', () => {
  it('reads the concentration ratio as a percentage', () => {
    render(<HealthFigures dashboard={dashboard()} />);
    expect(screen.getByText('12.35%')).toBeDefined();
  });

  // A count of open alerts with a currency mark after it is a different
  // claim from three alerts.
  it('does not put a currency mark on a count of things', () => {
    const { container } = render(<HealthFigures dashboard={dashboard()} />);
    expect(screen.getByText('1,200명')).toBeDefined();
    expect(container.textContent).not.toContain('WLD');
  });
});

describe('ReconciliationBadge', () => {
  it('says the ledger balanced, with the moment it was checked', () => {
    render(<ReconciliationBadge ok at="2026-08-30T00:00:00.000Z" />);
    expect(screen.getByText('정합성 정상')).toBeDefined();
  });

  it('says the ledger did not balance', () => {
    render(<ReconciliationBadge ok={false} at="2026-08-30T00:00:00.000Z" />);
    expect(screen.getByText('정합성 불일치')).toBeDefined();
  });

  // Null is "no snapshot has ever been taken". A red badge there sends an
  // operator looking for a break that nothing has claimed exists.
  it('does not report a check that never ran as a failed one', () => {
    const { container } = render(<ReconciliationBadge ok={null} at={null} />);
    expect(screen.getByText('대사 기록 없음')).toBeDefined();
    expect(container.textContent).not.toContain('정합성 불일치');
    expect(container.textContent).toContain('정합성이 깨졌다는 뜻은 아닙니다');
  });
});

describe('AlertItem', () => {
  it('names the kind in Korean and keeps the raised summary as it stands', () => {
    render(<AlertItem alert={alert()} />);
    expect(screen.getByText('원장 대사 실패')).toBeDefined();
    expect(screen.getByText('심각')).toBeDefined();
    // The summary carries the figure that made somebody care, so it is not
    // flattened into a Korean category.
    expect(screen.getByText('the ledger did not balance on 2026-08-29')).toBeDefined();
  });

  it('offers the control it is given while the alert is unacknowledged', () => {
    render(
      <AlertItem alert={alert()}>
        <button type="button">확인 처리</button>
      </AlertItem>,
    );
    expect(screen.getByRole('button', { name: '확인 처리' })).toBeDefined();
  });

  // Acknowledging is a one-way step and the row already says who saw it, so
  // offering the button again would invite a second reason on a settled row.
  it('withdraws the control once somebody has acknowledged it', () => {
    render(
      <AlertItem alert={alert({ acknowledged_at: '2026-08-30T01:00:00.000Z' })}>
        <button type="button">확인 처리</button>
      </AlertItem>,
    );
    expect(screen.queryByRole('button', { name: '확인 처리' })).toBeNull();
    expect(screen.getByText('확인함')).toBeDefined();
  });
});

describe('KnobItem', () => {
  it('shows the value in force, the reference and the approved range', () => {
    const { container } = render(<KnobItem knob={knob()} />);
    expect(screen.getByText('상점 공급량 배율')).toBeDefined();
    expect(container.textContent).toContain('50% ~ 200%');
    expect(screen.getByText('자동 조정')).toBeDefined();
  });

  // A knob off automatic without the reason beside it looks exactly like a
  // knob nobody has looked at.
  it('carries the reason a knob was taken off automatic', () => {
    const { container } = render(
      <KnobItem
        knob={knob({ auto_adjustable: false, paused_reason: '공급 실험 기간 동안 고정합니다' })}
      />,
    );
    expect(screen.getByText('자동 조정 해제')).toBeDefined();
    expect(container.textContent).toContain('공급 실험 기간 동안 고정합니다');
  });

  it('shows the proposed move and the rules that asked for it', () => {
    const { container } = render(
      <KnobItem
        knob={knob()}
        adjustment={{
          knob: 'shop.supply_percent',
          title: '상점 공급량 배율',
          unit: 'percent',
          from: 100,
          to: 110,
          rules: ['shop_short'],
        }}
      />,
    );
    expect(container.textContent).toContain('100% → 110%');
    expect(screen.getByText('상향')).toBeDefined();
    expect(container.textContent).toContain('상점 품목이 자주 품절됐어요');
  });
});

describe('ProposalPanel', () => {
  // An empty document means the function returned no row, which is not an
  // engine with nothing to do.
  it('says the proposal could not be read rather than showing an idle engine', () => {
    const { container } = render(<ProposalPanel proposal={{}} />);
    expect(screen.getByText('엔진 제안을 읽지 못했어요.')).toBeDefined();
    expect(container.textContent).not.toContain('바꿀 값이 없어요');
  });

  it('reads each blocker back in Korean', () => {
    const { container } = render(
      <ProposalPanel
        proposal={{
          eligible: false,
          blockedBy: ['the economy_auto_policy switch reads disabled'],
          adjustments: [],
        }}
      />,
    );
    expect(container.textContent).toContain("자동 조정 기능 스위치가 'disabled' 상태예요.");
  });

  it('separates an unblocked week with nothing to change', () => {
    render(<ProposalPanel proposal={{ eligible: false, blockedBy: [], adjustments: [] }} />);
    expect(screen.getByText('이번 주 지표로는 바꿀 값이 없어요.')).toBeDefined();
  });

  // 15.1 watches two indicators that 15.3 gives no lever, and the engine
  // says them rather than acting on them. A screen that hid them would drop
  // the only trace they left.
  it('shows the indicators nothing acts on, and says nobody acts on them', () => {
    const { container } = render(
      <ProposalPanel
        proposal={{
          eligible: false,
          blockedBy: [],
          adjustments: [],
          observations: ['the top tenth holds 62% of member money, above the 55% target'],
        }}
      />,
    );
    expect(container.textContent).toContain('the top tenth holds 62%');
    expect(container.textContent).toContain('자동으로 조정하지 않습니다');
  });
});

describe('PreviewPanel', () => {
  // The gap between the two counts is what the operator confirms against,
  // and 084 returns counts and no identities -- so the screen states the gap
  // and says plainly where the names can be found.
  it('states the members who cannot be paid before anything is confirmed', () => {
    const { container } = render(<PreviewPanel preview={preview()} />);
    expect(screen.getByText('120명')).toBeDefined();
    expect(screen.getByText('97명')).toBeDefined();
    expect(screen.getByText('23명')).toBeDefined();
    expect(container.textContent).toContain('실행 뒤 보고서에서만');
  });

  it('names the policy version the batch would post under', () => {
    render(<PreviewPanel preview={preview()} />);
    expect(screen.getByText('auto-2026-W35')).toBeDefined();
  });

  it('says so when the filter matches nobody who can be paid', () => {
    const { container } = render(
      <PreviewPanel preview={preview({ target_count: '4', payable_count: '0' })} />,
    );
    expect(container.textContent).toContain('아무에게도 지급되지 않아요');
  });

  it('does not warn about missing members when there are none', () => {
    const { container } = render(
      <PreviewPanel preview={preview({ target_count: '10', payable_count: '10' })} />,
    );
    expect(container.textContent).not.toContain('실행 뒤 보고서에서만');
  });
});

describe('PayoutReportTable', () => {
  it('reads each outcome in Korean and keeps the member on the row', () => {
    render(
      <PayoutReportTable
        items={[
          {
            user_id: '00000000-0000-4000-8000-000000000001',
            outcome: 'paid',
            detail: '',
            transaction_id: '00000000-0000-4000-8000-0000000000ff',
          },
          {
            user_id: '00000000-0000-4000-8000-000000000002',
            outcome: 'skipped',
            detail: 'no active cash account',
            transaction_id: null,
          },
        ]}
      />,
    );
    expect(screen.getByText('지급')).toBeDefined();
    expect(screen.getByText('건너뜀')).toBeDefined();
    expect(screen.getByText('사용 중인 현금 계좌가 없어요.')).toBeDefined();
    expect(screen.getByText('00000000-0000-4000-8000-000000000002')).toBeDefined();
  });

  // A failed row carries SQLERRM from whatever refused the posting. It is
  // English and unpredictable, and flattening it into one Korean apology
  // would hide which member hit what.
  it('shows a failure reason it has no translation for', () => {
    render(
      <PayoutReportTable
        items={[
          {
            user_id: '00000000-0000-4000-8000-000000000003',
            outcome: 'failed',
            detail: 'insufficient balance in the mint account',
            transaction_id: null,
          },
        ]}
      />,
    );
    expect(screen.getByText('실패')).toBeDefined();
    expect(screen.getByText('insufficient balance in the mint account')).toBeDefined();
  });
});
