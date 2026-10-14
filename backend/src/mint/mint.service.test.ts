import { describe, expect, it } from 'vitest';
import { MintService } from './mint.service';
import { SinkCategory } from './mint.dto';

describe('MintService - 국가조폐국 화폐 주조 및 소각 원장 단위 테스트', () => {
  it('신규 M0 본원통화 주조 요청을 생성하고 시뇨리지를 정확히 계산해야 한다', async () => {
    const service = new MintService();
    const batch = await service.createMintBatch(
      {
        amountWld: '10000000', // 1,000만 WLD
        denomination: '10000',
        mintReason: '통화 유동성 공급 주조',
        productionCostWld: '5000',
      },
      'ADMIN_MINTER',
    );

    expect(batch.id).toBeTruthy();
    expect(batch.amountWld).toBe('10000000');
    expect(batch.status).toBe('PENDING_CENTRAL_BANK_ACCEPTANCE');
    expect(batch.seigniorageWld).toBe('9995000'); // 10,000,000 - 5,000
    expect(batch.verificationHash.startsWith('sha256:')).toBe(true);
  });

  it('통화 영구 소각(Destroy/Sinks)을 수행하고 공인 증적 인증서를 발급해야 한다', async () => {
    const service = new MintService();
    const cert = await service.burnCurrency(
      {
        amountWld: '50000',
        sinkCategory: SinkCategory.TAX,
        burnReason: '시스템 수수료 영구 소각',
      },
      'SYSTEM_BURNER',
    );

    expect(cert.id).toBeTruthy();
    expect(cert.amountWld).toBe('50000');
    expect(cert.sinkCategory).toBe(SinkCategory.TAX);
    expect(cert.cryptographicProof.startsWith('sha256:')).toBe(true);
  });

  it('중앙은행 인수 완료 시 시뇨리지 원장에 반영되어야 한다', async () => {
    const service = new MintService();
    const batch = await service.createMintBatch(
      {
        amountWld: '20000000',
        denomination: '50000',
        mintReason: '특별 주조',
        productionCostWld: '10000',
      },
      'ADMIN_MINTER',
    );

    await service.markBatchAccepted(batch.id, 'CB-TX-12345');
    const updated = await service.getBatchById(batch.id);
    expect(updated.status).toBe('ACCEPTED_BY_CENTRAL_BANK');
    expect(updated.centralBankTxId).toBe('CB-TX-12345');

    const ledger = await service.getSeigniorageLedger();
    expect(BigInt(ledger.totalMintedM0Wld) >= BigInt(20000000)).toBe(true);
  });
});
