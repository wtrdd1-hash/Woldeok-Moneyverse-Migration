import { describe, expect, it, vi } from 'vitest';
import { MintService } from './mint.service';
import { SinkCategory } from './mint.dto';
import { CentralBankService } from '../central-bank/central-bank.service';

const hold = { status: 503, response: { code: 'MINT_LEDGER_EVIDENCE_UNAVAILABLE' } };
const batch = { amountWld: '50000', denomination: '10000', mintReason: 'test', productionCostWld: '100' };
const burn = { amountWld: '100', sinkCategory: SinkCategory.TAX, burnReason: 'test' };

describe('mint and central-bank ledger provenance boundary', () => {
  it('refuses in-memory issuance requests without durable ledger evidence', async () => {
    const alert = { sendDiscordEmbed: vi.fn().mockResolvedValue(undefined) };
    const mint = new MintService(alert as never);
    await expect(mint.createMintBatch(batch, 'actor')).rejects.toMatchObject(hold);
    expect(alert.sendDiscordEmbed).not.toHaveBeenCalled();
  });

  it('refuses purported burns and never emits a false settlement alert', async () => {
    const alert = { sendDiscordEmbed: vi.fn().mockResolvedValue(undefined) };
    const mint = new MintService(alert as never);
    await expect(mint.burnCurrency(burn, 'actor')).rejects.toMatchObject(hold);
    expect(alert.sendDiscordEmbed).not.toHaveBeenCalled();
  });

  it('refuses acceptance through the internal mint service', async () => {
    await expect(new MintService().markBatchAccepted('mint-batch-001', 'CB-FAKE')).rejects.toMatchObject(hold);
  });

  it('never serves fabricated genesis batches or unverified burn certificates', async () => {
    const mint = new MintService();
    await expect(mint.getBatches()).rejects.toMatchObject(hold);
    await expect(mint.getBatchById('mint-batch-001')).rejects.toMatchObject(hold);
    await expect(mint.getAuditCertificates()).rejects.toMatchObject(hold);
  });

  it('never labels in-memory totals as audited monetary supply', async () => {
    await expect(new MintService().getSeigniorageLedger()).rejects.toMatchObject(hold);
  });

  it('rejects central-bank acceptance even when a caller supplies a fake pending batch', async () => {
    const mint = new MintService();
    const getBatchById = vi.spyOn(mint, 'getBatchById').mockResolvedValue({ status: 'PENDING_CENTRAL_BANK_ACCEPTANCE' } as never);
    const markBatchAccepted = vi.spyOn(mint, 'markBatchAccepted');
    const bank = new CentralBankService(mint);
    await expect(bank.acceptMintBatch('fake', { acceptanceReason: 'test' }, 'actor')).rejects.toMatchObject(hold);
    expect(getBatchById).not.toHaveBeenCalled();
    expect(markBatchAccepted).not.toHaveBeenCalled();
  });

  it('rejects derived M0/M1/M2 aggregates even when supplied with fabricated totals', async () => {
    const mint = new MintService();
    const getSeigniorageLedger = vi.spyOn(mint, 'getSeigniorageLedger').mockResolvedValue({ totalMintedM0Wld: '500000000', totalBurnedDestroyedWld: '0' } as never);
    await expect(new CentralBankService(mint).getMonetaryAggregates()).rejects.toMatchObject(hold);
    expect(getSeigniorageLedger).not.toHaveBeenCalled();
  });
});
