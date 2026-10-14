import { describe, expect, it } from 'vitest';
import { VenturesController } from '../business/ventures.controller';
import { QuantController } from '../economy/quant.controller';
import { WarfareController } from '../club/warfare.controller';
import { DerivativesController } from '../stock/derivatives.controller';

const fakeRequest = {} as never;
const fakeBody = {} as never;

describe('unbacked financial/game command endpoints are fail-closed (v629)', () => {
  it('ventures never fabricate an invested equity, payout or incorporation receipt', async () => {
    const controller = new VenturesController();
    await expect(controller.investVenture(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.claimDividend(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.applyFounderPitch(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
  });

  it('quant does not claim bot deployment or active execution', async () => {
    const controller = new QuantController();
    await expect(controller.createStrategy(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.toggleStrategy(fakeRequest, 'sample')).rejects.toMatchObject({ status: 503 });
  });

  it('club warfare does not claim tax or simulated battle execution', async () => {
    const controller = new WarfareController();
    await expect(controller.declareWar(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.attackStronghold(fakeRequest, 'sample', fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.claimStrongholdTax(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
  });

  it('derivatives never settle a synthetic leveraged WLD position', async () => {
    const controller = new DerivativesController();
    await expect(controller.openPosition(fakeRequest, fakeBody)).rejects.toMatchObject({ status: 503 });
    await expect(controller.closePosition(fakeRequest, 'sample', fakeBody)).rejects.toMatchObject({ status: 503 });
  });
});
