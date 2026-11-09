// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TreasuryMintExecutionDialog } from './treasury-mint-execution-dialog';
import type { PolicyOrderSummary } from './mint-dialogs';

const policy: PolicyOrderSummary = {
  id:'44444444-4444-4444-8444-444444444444',order_type:'MINT',
  target_envelope:'TREASURY_ISSUANCE',status:'APPROVED',reason:'국고 발행 정책 감사지원',
  max_amount_wld:'1000000',executed_amount_wld:'0',expires_at:'2099-01-01T00:00:00.000Z',
};
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

describe('v1949 Treasurer Mint UI',()=>{
  it('never lets a frozen issuer execute even with valid policy',()=>{
    const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    render(<TreasuryMintExecutionDialog isOpen frozen activeOrders={[policy]} onClose={vi.fn()} onSuccess={vi.fn()}/>);
    expect(screen.getByRole('alert').textContent).toContain('동결');
    expect((screen.getByRole('button',{name:'승인된 새 화폐를 국고에 발행·입금'}) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows canonical ledger transaction receipt, never treats only a mint certificate as settlement',async()=>{
    const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({
      success:true,code:'TREASURY_MINT_SETTLED',amount_wld:'100000',vault_after_wld:'100000',
      ledger_transaction_id:'55555555-5555-4555-8555-555555555555',
      mint_certificate_id:'66666666-6666-4666-8666-666666666666',
    })});vi.stubGlobal('fetch',fetchMock);vi.stubGlobal('confirm',vi.fn(()=>true));
    vi.stubGlobal('crypto',{randomUUID:()=> '33333333-3333-4333-8333-333333333333'});
    const onSuccess=vi.fn();
    render(<TreasuryMintExecutionDialog isOpen frozen={false} activeOrders={[policy]} onClose={vi.fn()} onSuccess={onSuccess}/>);
    fireEvent.click(screen.getByRole('button',{name:'승인된 새 화폐를 국고에 발행·입금'}));
    await waitFor(()=>expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/admin/mint/treasury-issue', expect.objectContaining({method:'POST'}));
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({
      policy_order_id:policy.id,amount_wld:'100000',request_key:'33333333-3333-4333-8333-333333333333'});
    expect(screen.getByRole('status').textContent).toContain('100,000 WLD');
    expect(screen.getByRole('status').textContent).toContain('55555555-5555-4555-8555-555555555555');
  });

  it('keeps the same request key on failed/ambiguous HTTP response for safe retry',async()=>{
    const fetchMock=vi.fn().mockResolvedValueOnce({ok:false,json:async()=>({error:'연결 불확실'})})
      .mockResolvedValueOnce({ok:true,json:async()=>({success:true,code:'TREASURY_MINT_SETTLED',amount_wld:'100000',
        vault_after_wld:'100000',ledger_transaction_id:'55555555-5555-4555-8555-555555555555'})});
    vi.stubGlobal('fetch',fetchMock);vi.stubGlobal('confirm',vi.fn(()=>true));
    vi.stubGlobal('crypto',{randomUUID:()=> '33333333-3333-4333-8333-333333333333'});
    render(<TreasuryMintExecutionDialog isOpen frozen={false} activeOrders={[policy]} onClose={vi.fn()} onSuccess={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'승인된 새 화폐를 국고에 발행·입금'}));
    await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('연결 불확실'));
    fireEvent.click(screen.getByRole('button',{name:'승인된 새 화폐를 국고에 발행·입금'}));
    await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
    const keys=fetchMock.mock.calls.map(call=>JSON.parse(call[1]?.body).request_key);
    expect(keys[0]).toBe(keys[1]);
  });
});
