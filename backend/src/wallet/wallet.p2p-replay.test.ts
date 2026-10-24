import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { MarketBroadcast } from '../stock/market-broadcast';
const sender = '11111111-1111-4111-8111-111111111111';
const receiver = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';
const tx = '44444444-4444-4444-8444-444444444444';
function setup() {
 const legacyTransfer = vi.fn(async () => ({ transactionId: tx }));
 const legacyRecord = vi.fn(async () => undefined);
 const durable = vi.fn().mockResolvedValueOnce({ transactionId: tx, replayed: false }).mockResolvedValue({ transactionId: tx, replayed: true });
 const repository = { balancesForUser: async () => [], recentTransactionsForUser: async () => [], activeRecipientById: async (id: string) => ({ userId: id }), transfer: legacyTransfer, recordP2PTransfer: legacyRecord, p2pTransfer: durable, claimDaily: async () => ({ transaction_id: tx, amount: '1', replayed: false }) } as unknown as WalletRepositoryLike;
 const publish = vi.fn();
 return { service: new WalletService(repository, { broadcast: { publishUserNotification: publish } as unknown as MarketBroadcast }), legacyTransfer, legacyRecord, durable, publish };
}
describe('P2P durable idempotency boundary', () => {
 it('uses a single database operation and never separate legacy writes on retries', async () => {
  const { service, legacyTransfer, legacyRecord, durable } = setup();
  const input = { recipientUserId: receiver, amount: '900719925474099312345', idempotencyKey: key, message: 'hello', sticker: 'heart' };
  expect((await service.p2pTransfer(sender, input)).transactionId).toBe(tx);
  expect((await service.p2pTransfer(sender, input)).transactionId).toBe(tx);
  expect(legacyTransfer).not.toHaveBeenCalled();
  expect(legacyRecord).not.toHaveBeenCalled();
  expect(durable).toHaveBeenCalledTimes(2);
  expect(durable).toHaveBeenCalledWith({ actorUserId: sender, recipientUserId: receiver, amount: input.amount, idempotencyKey: key, message: 'hello', sticker: 'heart' });
 });
 it('publishes realtime events only on initial commit, never replay', async () => {
  const { service, publish } = setup();
  const input = { recipientUserId: receiver, amount: '100', idempotencyKey: key };
  await service.p2pTransfer(sender, input);
  await service.p2pTransfer(sender, input);
  expect(publish).toHaveBeenCalledTimes(2);
  expect(publish.mock.calls[0]?.[1]?.id).toContain(tx);
 });
 it('does not emit duplicate websocket events for replayed ordinary transfers', async () => {
  const { service, publish } = setup();
  (service.repository as unknown as { transfer: unknown }).transfer = async () => ({ transactionId: tx, replayed: true });
  await service.transfer(sender, { recipientUserId: receiver, amount: '100', idempotencyKey: key });
  expect(publish).not.toHaveBeenCalled();
 });
 it('fails closed if atomic database command is unavailable', async () => {
  const { service, legacyTransfer } = setup();
  (service.repository as unknown as { p2pTransfer?: unknown }).p2pTransfer = undefined;
  await expect(service.p2pTransfer(sender, { recipientUserId: receiver, amount: '1', idempotencyKey: key })).rejects.toThrow(/unavailable/);
  expect(legacyTransfer).not.toHaveBeenCalled();
 });
});
