// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const {refresh}=vi.hoisted(()=>({refresh:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({refresh})}));
import { AdminTreasuryFundingCard } from './admin-treasury-funding-card';
afterEach(()=>{cleanup();vi.unstubAllGlobals();refresh.mockReset();});

describe('administrator own WLD donation with existing ledger-backed member route',()=>{
  it('debits signed-in administrator OWN cash and requires real signed receipt',async()=>{
    vi.stubGlobal('confirm',vi.fn(()=>true));vi.stubGlobal('crypto',{randomUUID:()=> '33333333-3333-4333-8333-333333333333'});
    const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({
      success:true,donated_amount_wld:'1000',vault_balance_after:'1000',
      ledger_transaction_id:'55555555-5555-4555-8555-555555555555',
    })});vi.stubGlobal('fetch',fetchMock);
    render(<AdminTreasuryFundingCard/>);
    fireEvent.click(screen.getByRole('button',{name:'내 실제 보유금 국고에 기부'}));
    await waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/treasury/donate',expect.objectContaining({method:'POST'}));
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({amountWld:'1000',
      idempotencyKey:'33333333-3333-4333-8333-333333333333'});
    expect(screen.getByRole('status').textContent).toContain('원장');
    expect(screen.getByRole('status').textContent).toContain('55555555-5555-4555-8555-555555555555');
  });
  it('retries with the original idempotency UUID if response was ambiguous',async()=>{
    vi.stubGlobal('confirm',vi.fn(()=>true));vi.stubGlobal('crypto',{randomUUID:()=> '33333333-3333-4333-8333-333333333333'});
    const fetchMock=vi.fn().mockRejectedValueOnce(Error('timeout'))
      .mockResolvedValueOnce({ok:true,json:async()=>({success:true,donated_amount_wld:'1000',
        vault_balance_after:'1000',ledger_transaction_id:'55555555-5555-4555-8555-555555555555'})});
    vi.stubGlobal('fetch',fetchMock);
    render(<AdminTreasuryFundingCard/>);
    fireEvent.click(screen.getByRole('button',{name:'내 실제 보유금 국고에 기부'}));
    await waitFor(()=>expect(screen.getByRole('alert')).toBeTruthy());
    fireEvent.click(screen.getByRole('button',{name:'내 실제 보유금 국고에 기부'}));
    await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
    const ids=fetchMock.mock.calls.map(call=>JSON.parse(call[1]?.body).idempotencyKey);
    expect(ids[0]).toBe(ids[1]);
  });
});
