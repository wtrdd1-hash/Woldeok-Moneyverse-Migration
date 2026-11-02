import { beforeEach, describe, expect, it, vi } from 'vitest';
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { ApiError } from '@/lib/api';
import { POST } from './route';
const key='11111111-1111-4111-8111-111111111111';
const origin='https://example.test';
function req(body:unknown, crossOrigin=false){
 return new Request(origin+'/api/treasury/donate',{ method:'POST',headers:{
  'content-type':'application/json',origin:crossOrigin?'https://evil.test':origin,
  'sec-fetch-site':crossOrigin?'cross-site':'same-origin'}, body:JSON.stringify(body) });
}
const receipt={success:true,donation_id:key,ledger_transaction_id:key,
 donated_amount_wld:'1000',vault_balance_after:'1000',user_balance_after:'2000',
 honor_title:'Citizen',total_donated_wld:'1000'};
describe('v1626 public Treasury donation CSRF and canonical receipt boundary',()=>{
 beforeEach(()=>mutate.mockReset());
 it('forwards exact eligible WLD and stable key via CSRF-bound mutate',async()=>{
  mutate.mockResolvedValueOnce(receipt); const response=await POST(req({amountWld:'1000',idempotencyKey:key,memo:'Donation'}));
  expect(response.status).toBe(200); expect((await response.json()).ledger_transaction_id).toBe(key);
  expect(mutate).toHaveBeenCalledExactlyOnceWith('/api/v1/treasury/donate',{method:'POST',body:{amountWld:'1000',memo:'Donation',idempotencyKey:key}});
 });
 it('denies cross-site before calling an underlying financial API',async()=>{
  const response=await POST(req({amountWld:'1000',idempotencyKey:key},true));
  expect(response.status).toBe(403); expect(mutate).not.toHaveBeenCalled();
 });
 it.each([{amountWld:1000,idempotencyKey:key},{amountWld:'-1000',idempotencyKey:key},
  {amountWld:'1000',idempotencyKey:'not-a-key'}])('rejects unsafe WLD or key',async body=>{
  expect((await POST(req(body))).status).toBe(400); expect(mutate).not.toHaveBeenCalled();
 });
 it('never claims success for an unverified receipt',async()=>{
  mutate.mockResolvedValueOnce({success:true,donated_amount_wld:'1000'});
  const response=await POST(req({amountWld:'1000',idempotencyKey:key}));
  expect(response.status).toBe(503); expect((await response.json()).code).toBe('TREASURY_DONATION_RECEIPT_UNVERIFIED');
 });
 it.each([401,403,400])('preserves safe HTTP error %s',async status=>{
  mutate.mockRejectedValueOnce(new ApiError(status,'Sensitive error'));
  const response=await POST(req({amountWld:'1000',idempotencyKey:key}));
  expect(response.status).toBe(status); expect(JSON.stringify(await response.json())).not.toContain('Sensitive error');
 });
});
