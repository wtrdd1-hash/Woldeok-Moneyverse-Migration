import { describe, expect, it } from 'vitest';
import {
  acknowledgeMessage,
  adjustmentDirection,
  alertKindLabel,
  autoPolicyRunMessage,
  blockedLabel,
  compareDecimalText,
  knobRangeLabel,
  knobSettingMessage,
  knobValueLabel,
  memberCount,
  parseMemberIds,
  payoutMessage,
  percentFromRatio,
  plainCount,
  previewMessage,
  proposalState,
  reconciliationState,
  ruleLabel,
  severityLabel,
  trimDecimalText,
  unpayableCount,
} from './economy';
import type { BulkPayoutPreview, PolicyKnob } from './economy';

/**
 * The economy console's vocabulary is where this feature is written in
 * Korean -- every noun it renders arrives from a database function in English
 * -- and where the two figures an operator confirms against are computed.
 * These are the tests that say an operator reads a sentence rather than a
 * slug, and that a count of members nobody can pay is arrived at without a
 * balance ever becoming a number.
 */

function preview(overrides: Partial<BulkPayoutPreview> = {}): BulkPayoutPreview {
  return {
    target_count: '10',
    payable_count: '10',
    total_amount: '10000',
    policy_version: 'auto-2026-W35',
    ...overrides,
  };
}

function knob(overrides: Partial<PolicyKnob> = {}): PolicyKnob {
  return {
    knob_key: 'work.daily_cap',
    title: '작업 일일 보상 한도',
    unit: 'amount',
    current_value: '400',
    baseline_value: '400',
    min_value: '320',
    max_value: '480',
    auto_adjustable: true,
    paused_reason: '',
    updated_at: '2026-08-30T00:00:00.000Z',
    ...overrides,
  };
}

describe('compareDecimalText', () => {
  it('orders values whose fractions have different lengths', () => {
    expect(compareDecimalText('100.5', '100.50')).toBe(0);
    expect(compareDecimalText('100.5', '100.51')).toBe(-1);
    expect(compareDecimalText('100.51', '100.5')).toBe(1);
  });

  it('orders across zero', () => {
    expect(compareDecimalText('-2', '1')).toBe(-1);
    expect(compareDecimalText('0', '-0.0')).toBe(0);
  });

  // A bound an operator widened by hand can carry more digits than a double
  // holds, and `Number(a) - Number(b) === 0` is the failure this avoids.
  it('separates two values a double would call equal', () => {
    const left = '1.00000000000000001';
    const right = '1.00000000000000002';
    expect(compareDecimalText(left, right)).toBe(-1);
    expect(Number(left) - Number(right)).toBe(0);
  });

  it('refuses a value that is not a decimal rather than calling it equal', () => {
    expect(compareDecimalText('kinda', '1')).toBeNull();
    expect(compareDecimalText('1', '1e3')).toBeNull();
  });
});

describe('trimDecimalText', () => {
  it('drops digits that carry nothing', () => {
    expect(trimDecimalText('100.00')).toBe('100');
    expect(trimDecimalText('0100')).toBe('100');
    expect(trimDecimalText('20.500')).toBe('20.5');
  });

  // A minus sign in front of nothing states a direction the value does not
  // have, and `-0%` reads as a cut that never happened.
  it('does not keep a sign on a zero', () => {
    expect(trimDecimalText('-0.00')).toBe('0');
  });
});

describe('percentFromRatio', () => {
  it('shifts the decimal point rather than multiplying', () => {
    expect(percentFromRatio('0.123456')).toBe('12.35%');
    expect(percentFromRatio('1')).toBe('100.00%');
    expect(percentFromRatio('0')).toBe('0.00%');
  });

  // Rounding up to 100.00% would say one wallet holds everything, which is a
  // different claim from holding all but a millionth of it.
  it('does not round a near-total share up to the whole', () => {
    expect(percentFromRatio('0.999949')).toBe('99.99%');
  });

  it('groups a share that somehow exceeded a thousand percent', () => {
    expect(percentFromRatio('12.5')).toBe('1,250.00%');
  });

  it('declines a value that is not a ratio', () => {
    expect(percentFromRatio('')).toBeNull();
    expect(percentFromRatio('NaN')).toBeNull();
  });
});

describe('knobValueLabel', () => {
  it('writes a percentage knob with its sign left off', () => {
    expect(knobValueLabel('100.00', 'percent')).toBe('100%');
  });

  it('writes an amount knob with the currency mark', () => {
    expect(knobValueLabel('2200', 'amount')).toBe('2,200 WLD');
  });

  // The basis-point knob is a delta on the deposit rate rather than the rate
  // itself, so `2bp` and `+2bp` are the same number saying different things.
  it('keeps the sign on a basis-point delta', () => {
    expect(knobValueLabel('2', 'bps')).toBe('+2bp');
    expect(knobValueLabel('-2', 'bps')).toBe('−2bp');
    expect(knobValueLabel('0', 'bps')).toBe('0bp');
  });

  it('says nothing rather than NaN for a value it cannot read', () => {
    expect(knobValueLabel('', 'percent')).toBe('—');
  });
});

describe('knobRangeLabel', () => {
  it('writes the approved range in the unit the knob declares', () => {
    expect(knobRangeLabel(knob())).toBe('320 WLD ~ 480 WLD');
    expect(knobRangeLabel(knob({ unit: 'percent', min_value: '80', max_value: '120' }))).toBe(
      '80% ~ 120%',
    );
  });
});

describe('adjustmentDirection', () => {
  const adjustment = {
    knob: 'shop.supply_percent',
    title: '상점 공급량 배율',
    unit: 'percent',
    from: 100,
    to: 110,
    rules: ['shop_short'],
  };

  it('reads a raise and a cut from the two values', () => {
    expect(adjustmentDirection(adjustment)).toBe('up');
    expect(adjustmentDirection({ ...adjustment, from: 110, to: 100 })).toBe('down');
  });

  // The proposer only emits an entry whose `to` differs from its `from`, but
  // a badge saying 상향 on a move of nothing would be worse than no badge.
  it('has no direction for a move of nothing', () => {
    expect(adjustmentDirection({ ...adjustment, from: 100, to: 100 })).toBeNull();
  });
});

describe('severityLabel and alertKindLabel', () => {
  it('names the three severities in Korean', () => {
    expect(severityLabel('info')).toBe('정보');
    expect(severityLabel('warning')).toBe('주의');
    expect(severityLabel('critical')).toBe('심각');
  });

  it('names the seeded alert kinds in Korean', () => {
    expect(alertKindLabel('economy.reconciliation.failed')).toBe('원장 대사 실패');
    expect(alertKindLabel('economy.policy.auto_applied')).toBe('자동 정책 적용');
  });

  // A migration may raise a kind long before this build hears about it. An
  // alert an operator cannot name is still one they have to act on, which a
  // blank cell would hide.
  it('keeps a kind it has not been taught rather than dropping it', () => {
    expect(alertKindLabel('economy.casino.rigged')).toBe('economy.casino.rigged');
    expect(severityLabel('fatal')).toBe('fatal');
  });
});

describe('ruleLabel', () => {
  it('names the rules of 15.3 in Korean', () => {
    expect(ruleLabel('burn_below_50')).toContain('소각');
    expect(ruleLabel('one_job_dominates')).toContain('직업');
  });

  it('keeps a rule it has not been taught', () => {
    expect(ruleLabel('moon_phase')).toBe('moon_phase');
  });
});

describe('blockedLabel', () => {
  it('reads the two blockers that carry a value inside them', () => {
    expect(blockedLabel('the economy_auto_policy switch reads paused')).toBe(
      "자동 조정 기능 스위치가 'paused' 상태예요.",
    );
    expect(blockedLabel('the last automatic policy is younger than 7 days')).toBe(
      '마지막 자동 정책이 적용된 지 7일이 지나지 않았어요.',
    );
  });

  it('reads the fixed blockers', () => {
    expect(blockedLabel('the ledger failed to reconcile inside the window')).toContain('대사');
    expect(blockedLabel('this week already has an automatic policy')).toContain('이번 주');
  });

  // A blocker an operator cannot read is still the reason nothing happened,
  // so a sentence this build has not met is shown as it stands.
  it('keeps a blocker it has not been taught', () => {
    expect(blockedLabel('the moon is in the wrong house')).toBe('the moon is in the wrong house');
  });
});

describe('reconciliationState', () => {
  // Null is "never checked", which is not the same fact as "checked and
  // wrong" and must not render as the same red badge.
  it('keeps never-checked apart from failed', () => {
    expect(reconciliationState(null, null)).toBe('never');
    expect(reconciliationState(true, null)).toBe('never');
    expect(reconciliationState(false, '2026-08-30T00:00:00.000Z')).toBe('failed');
    expect(reconciliationState(true, '2026-08-30T00:00:00.000Z')).toBe('passed');
  });
});

describe('proposalState', () => {
  it('calls an empty document unreadable rather than an idle engine', () => {
    expect(proposalState({})).toBe('unreadable');
  });

  it('reports a blocked run before it reports an empty one', () => {
    expect(
      proposalState({ eligible: false, blockedBy: ['whatever'], adjustments: [] }),
    ).toBe('blocked');
  });

  // Blocked and "nothing to do" are both `eligible: false`, and folding them
  // together is how somebody looks for a switch that was never off.
  it('separates nothing to do from blocked', () => {
    expect(proposalState({ eligible: false, blockedBy: [], adjustments: [] })).toBe(
      'nothing_to_do',
    );
  });

  it('is ready when a knob would move and nothing blocks it', () => {
    expect(
      proposalState({
        eligible: true,
        blockedBy: [],
        adjustments: [
          {
            knob: 'shop.supply_percent',
            title: '',
            unit: 'percent',
            from: 100,
            to: 110,
            rules: [],
          },
        ],
      }),
    ).toBe('ready');
  });
});

describe('unpayableCount', () => {
  it('subtracts the two counts without either becoming a number', () => {
    expect(unpayableCount(preview({ target_count: '120', payable_count: '97' }))).toBe('23');
  });

  // Both counts are bigint columns. A batch is capped at five thousand, but
  // the target set that fed the count is not, and Number stops being exact
  // long before a bigint does.
  it('stays exact past a safe integer', () => {
    expect(
      unpayableCount(
        preview({ target_count: '9007199254740993', payable_count: '9007199254740992' }),
      ),
    ).toBe('1');
  });

  it('declines a pair it cannot subtract rather than reporting zero', () => {
    expect(unpayableCount(preview({ target_count: 'many' }))).toBeNull();
    expect(unpayableCount(preview({ target_count: '1', payable_count: '2' }))).toBeNull();
  });
});

describe('memberCount and plainCount', () => {
  it('groups a count and gives it its unit so the Korean reads', () => {
    expect(memberCount('12000')).toBe('12,000명');
    expect(plainCount('3', '건')).toBe('3건');
  });

  it('says nothing rather than NaN for a figure it cannot read', () => {
    expect(memberCount('')).toBe('—');
    expect(plainCount('n/a', '건')).toBe('—');
  });
});

describe('previewMessage', () => {
  it('says everybody can be paid when nobody is missing', () => {
    expect(previewMessage(preview())).toBe('대상 10명 모두에게 지급할 수 있어요.');
  });

  // The gap between the two counts is the whole reason the preview exists,
  // so it is named before the operator confirms rather than after.
  it('names the members who cannot be paid', () => {
    expect(previewMessage(preview({ target_count: '10', payable_count: '7' }))).toBe(
      '대상 10명 중 3명은 지급할 수 없어요.',
    );
  });
});

describe('payoutMessage', () => {
  const receipt = {
    payout_id: '00000000-0000-4000-8000-000000000001',
    target_count: 10,
    paid_count: 10,
    skipped_count: 0,
    failed_count: 0,
    replayed: false,
  };

  it('reports the counts the database returned', () => {
    expect(payoutMessage(receipt)).toBe('지급을 실행했어요. 10명에게 지급했어요.');
  });

  it('sends the operator to the report when anybody was missed', () => {
    const message = payoutMessage({ ...receipt, paid_count: 8, skipped_count: 1, failed_count: 1 });
    expect(message).toContain('8명에게 지급했고');
    expect(message).toContain('2명은 지급되지 않았어요');
  });

  // Re-sending the batch key is how a batch that died halfway is finished
  // rather than repeated, so a replay must read as reassurance and not as a
  // second payment.
  it('says a replayed batch did not pay twice', () => {
    const message = payoutMessage({ ...receipt, replayed: true });
    expect(message).toContain('이미 실행된 지급');
    expect(message).toContain('두 번 지급되지 않아요');
  });
});

describe('acknowledgeMessage', () => {
  it('confirms a first acknowledgement', () => {
    expect(acknowledgeMessage(true)).toBe('확인 처리했어요.');
  });

  // False is two facts at once and `admin_acknowledge_alert` draws no line
  // between them, so neither may be claimed on its own.
  it('does not choose between already-acknowledged and no-such-alert', () => {
    const message = acknowledgeMessage(false);
    expect(message).toContain('이미 확인됐거나 없는 알림');
  });
});

describe('autoPolicyRunMessage', () => {
  it('names the version and how many values moved', () => {
    expect(
      autoPolicyRunMessage({
        applied: true,
        version: 'auto-2026-W35',
        adjustments: [
          { knob: 'work.daily_cap', title: '', unit: 'amount', from: 400, to: 432, rules: [] },
        ],
      }),
    ).toBe('auto-2026-W35을(를) 적용했어요. 1개 값이 바뀌었습니다.');
  });

  it('reads the blockers back in Korean when nothing was applied', () => {
    expect(
      autoPolicyRunMessage({
        applied: false,
        blockedBy: ['this week already has an automatic policy'],
      }),
    ).toContain('이번 주에는 이미 자동 정책이 적용됐어요.');
  });

  it('says so when nothing blocked the run and no value moved', () => {
    expect(autoPolicyRunMessage({ applied: false, blockedBy: [] })).toBe(
      '적용하지 않았어요. 지금 지표로는 바꿀 값이 없습니다.',
    );
  });
});

describe('knobSettingMessage', () => {
  it('reports what the API answered rather than what the form sent', () => {
    expect(
      knobSettingMessage(
        {
          knob_key: 'shop.supply_percent',
          auto_adjustable: false,
          min_value: '50',
          max_value: '200',
        },
        'percent',
      ),
    ).toBe('shop.supply_percent: 자동 조정을 껐어요. 허용 범위는 50% ~ 200%입니다.');
  });
});

describe('parseMemberIds', () => {
  it('accepts the three ways an operator pastes a list', () => {
    expect(parseMemberIds('a, b\nc  d')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('has nothing to send for an empty field', () => {
    expect(parseMemberIds('   \n ')).toEqual([]);
  });

  // Nothing here decides what a member id looks like. The API's DTO and
  // `admin_bulk_payout_targets` both refuse a value that is not a UUID, and a
  // second quietly different rule in front of the first is worse than none.
  it('does not decide for itself which entries are member ids', () => {
    expect(parseMemberIds('not-a-uuid')).toEqual(['not-a-uuid']);
  });
});
