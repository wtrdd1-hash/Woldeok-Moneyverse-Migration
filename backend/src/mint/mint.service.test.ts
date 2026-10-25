import { describe, expect, it } from 'vitest';
import { MintService } from './mint.service';
import { SinkCategory } from './mint.dto';

const hold = { status: 503, response: { code: 'MINT_LEDGER_EVIDENCE_UNAVAILABLE' } };

describe('MintService - verified ledger evidence required', () => {
  it('rejects an unjournaled M0 issuance request', async () => {
    await expect(new MintService().createMintBatch({
      amountWld: '10000000', denomination: '10000', mintReason: 'test', productionCostWld: '5000',
    }, 'actor')).rejects.toMatchObject(hold);
  });

  it('rejects an unjournaled permanent WLD burn', async () => {
    await expect(new MintService().burnCurrency({
      amountWld: '50000', sinkCategory: SinkCategory.TAX, burnReason: 'test',
    }, 'actor')).rejects.toMatchObject(hold);
  });

  it('does not accept a mint batch or synthesize a seigniorage ledger', async () => {
    const service = new MintService();
    await expect(service.markBatchAccepted('batch', 'CB-UNVERIFIED')).rejects.toMatchObject(hold);
    await expect(service.getSeigniorageLedger()).rejects.toMatchObject(hold);
  });
});
