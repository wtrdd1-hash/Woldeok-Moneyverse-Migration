import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import { CatalogCard, HoldingCard } from './catalog-parts';
import type { CatalogItem, HeldItem } from './catalog';

function item(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    catalog_id: '11111111-1111-4111-8111-111111111111',
    code: 'used_bicycle',
    name: '중고 자전거',
    description: '배달 작업용 이동수단입니다.',
    category: 'vehicle',
    price: '5000',
    quantity: null,
    purchase_limit: 'account_one',
    effect_kind: 'convenience',
    maintenance_cost: '100',
    sale_ends_at: null,
    ...overrides,
  };
}

function held(overrides: Partial<HeldItem> = {}): HeldItem {
  return {
    catalog_id: '11111111-1111-4111-8111-111111111111',
    code: 'energy_drink',
    name: '작업 에너지 음료',
    quantity: 3,
    acquired_at: '2026-08-01T00:00:00.000Z',
    expires_at: null,
    effect_kind: 'convenience',
    durable: false,
    weekly_cost: '0',
    effect_expires_at: null,
    unpaid_weeks: 0,
    arrears_due: '0',
    arrears_cap: '0',
    suspended: false,
    ...overrides,
  };
}

describe('CatalogCard', () => {
  it('names the item in Korean and keeps its code visible', () => {
    render(<CatalogCard item={item()} held={0} />);
    expect(screen.getByText('중고 자전거')).toBeDefined();
    // The code is what the write is addressed against, so it stays on screen
    // for a member reporting that a button did not work.
    expect(screen.getByText('used_bicycle')).toBeDefined();
  });

  it('groups the price the way every other figure in this product is grouped', () => {
    const { container } = render(<CatalogCard item={item({ price: '80000' })} held={0} />);
    expect(container.textContent).toContain('80,000');
  });

  // The price is a bigint. Rendering it through a number would round it long
  // before a member noticed, so every digit has to survive to the DOM.
  it('keeps every digit of a price far beyond a safe integer', () => {
    const huge = `9${'0'.repeat(37)}`;
    const { container } = render(<CatalogCard item={item({ price: huge })} held={0} />);
    const rendered = screen.getByText(/^90(,000){12}$/);
    // The unit label sits in the same element, so the digits are what is
    // compared -- the property under test is that none of them was lost.
    expect(rendered.textContent?.replace(/[^0-9]/g, '')).toBe(huge);
    expect(container.textContent).not.toContain('e+');
  });

  it('shows the weekly upkeep for an item that carries one', () => {
    const { container } = render(
      <CatalogCard item={item({ maintenance_cost: '1500' })} held={0} />,
    );
    expect(screen.getByText('주간 관리비')).toBeDefined();
    expect(container.textContent).toContain('1,500');
  });

  // Every general item carries a zero here. A "주간 관리비 0 WLD" row would
  // read as a charge that exists and happens to be free.
  it('says nothing about upkeep for an item that carries none', () => {
    const { container } = render(<CatalogCard item={item({ maintenance_cost: '0' })} held={0} />);
    expect(container.textContent).not.toContain('주간 관리비');
  });

  it('shows the stock left when the catalogue names a number', () => {
    const { container } = render(<CatalogCard item={item({ quantity: 4 })} held={0} />);
    expect(container.textContent).toContain('재고');
    expect(container.textContent).toContain('4개');
  });

  // 073 seeded every allocation as NULL and said why. A card claiming 무제한
  // would state a decision nobody has made.
  it('claims no stock figure for an item whose allocation was never set', () => {
    const { container } = render(<CatalogCard item={item({ quantity: null })} held={0} />);
    expect(container.textContent).not.toContain('재고');
    expect(container.textContent).not.toContain('무제한');
  });

  it('writes the purchase limit the database enforces', () => {
    const { container } = render(<CatalogCard item={item({ purchase_limit: 'daily_2' })} held={0} />);
    expect(container.textContent).toContain('하루에 2개까지 살 수 있어요');
  });

  // `shop_assert_purchase_limit` accepts `business_owned` and returns without
  // checking anything, so a sentence promising a gate would be false.
  it('claims no gate for a limit the database does not apply', () => {
    const { container } = render(
      <CatalogCard item={item({ purchase_limit: 'business_owned' })} held={0} />,
    );
    expect(container.textContent).not.toContain('살 수 있어요');
    expect(container.textContent).not.toContain('가질 수 있어요');
  });

  it('says how many the member already holds', () => {
    const { container } = render(<CatalogCard item={item()} held={3} />);
    expect(container.textContent).toContain('3개 보유 중');
  });

  it('says nothing about holdings for an item the member does not own', () => {
    const { container } = render(<CatalogCard item={item()} held={0} />);
    expect(container.textContent).not.toContain('보유 중');
  });

  it('renders the control it is given', () => {
    render(
      <CatalogCard item={item()} held={0}>
        <button type="button">구입하기</button>
      </CatalogCard>,
    );
    expect(screen.getByRole('button', { name: '구입하기' })).toBeDefined();
  });
});

describe('HoldingCard', () => {
  it('names the held item and how many of it there are', () => {
    const { container } = render(<HoldingCard item={held()} />);
    expect(screen.getByText('작업 에너지 음료')).toBeDefined();
    expect(container.textContent).toContain('3개');
    expect(container.textContent).toContain('에 받았어요');
  });

  it('offers the use control for an item shop_use_item accepts', () => {
    render(
      <HoldingCard item={held({ effect_kind: 'convenience' })}>
        <button type="button">1개 사용하기</button>
      </HoldingCard>,
    );
    expect(screen.getByRole('button', { name: '1개 사용하기' })).toBeDefined();
  });

  // 074 refuses a decoration with 22023. Offering a button that can only be
  // refused would teach a member that the screen is broken.
  it('withholds the use control from an item that cannot be consumed', () => {
    const { container } = render(
      <HoldingCard item={held({ effect_kind: 'decoration', name: '프로필 이름표' })}>
        <button type="button">1개 사용하기</button>
      </HoldingCard>,
    );
    expect(screen.queryByRole('button', { name: '1개 사용하기' })).toBeNull();
    expect(container.textContent).toContain('장식·전시 아이템은 사용하지 않고');
  });

  it('says when a held item runs out', () => {
    const { container } = render(<HoldingCard item={held({ expires_at: '2026-12-31T00:00:00.000Z' })} />);
    expect(container.textContent).toContain('까지');
  });

  // 104 refuses a durable holding with 22023. Every useful item in the
  // catalogue is `convenience`, vehicles included, so without this the button
  // that destroys 45,000 WLD sits on the card of a 소형 화물차.
  it('withholds the use control from a durable holding and names its upkeep', () => {
    const { container } = render(
      <HoldingCard item={held({ durable: true, weekly_cost: '900', name: '소형 화물차' })}>
        <button type="button">1개 사용하기</button>
      </HoldingCard>,
    );
    expect(screen.queryByRole('button', { name: '1개 사용하기' })).toBeNull();
    expect(container.textContent).toContain('주간 관리비');
    expect(container.textContent).toContain('900');
  });

  // Paying is the one thing a member can do about a suspended holding, so the
  // card has to draw the control it was given and state what is owed.
  it('shows what a suspended holding owes and keeps its control', () => {
    const { container } = render(
      <HoldingCard
        item={held({
          durable: true,
          weekly_cost: '900',
          arrears_due: '3600',
          arrears_cap: '3600',
          unpaid_weeks: 4,
          suspended: true,
        })}
      >
        <button type="button">밀린 관리비 내기</button>
      </HoldingCard>,
    );
    expect(screen.getByRole('button', { name: '밀린 관리비 내기' })).toBeDefined();
    expect(container.textContent).toContain('3,600');
    expect(container.textContent).toContain('4주');
    // The badge states the debt and not a consequence. Nothing is actually
    // withheld from a member in arrears yet -- 104 leaves item effects without
    // a mechanical consequence -- so a badge reading 정지 would claim a lock
    // this build does not keep.
    expect(container.textContent).toContain('관리비 4주 밀림');
    expect(container.textContent).not.toContain('정지');
  });

  // Chapter 20's 중복 방지: 104 answers 23505 for a second use while the
  // first is still running, so the control comes off and the date goes on.
  it('withholds the use control while an effect is still running', () => {
    const { container } = render(
      <HoldingCard item={held({ effect_expires_at: '2026-12-31T00:00:00.000Z' })}>
        <button type="button">1개 사용하기</button>
      </HoldingCard>,
    );
    expect(screen.queryByRole('button', { name: '1개 사용하기' })).toBeNull();
    expect(container.textContent).toContain('적용 중');
  });

  // `shop_my_items` sends no price and the paid amount lives on the purchase
  // receipt. A figure here would be the current list price wearing the
  // clothes of what the member actually paid.
  it('claims no price it was never sent', () => {
    const { container } = render(<HoldingCard item={held()} />);
    expect(container.textContent).not.toContain('WLD');
  });
});
