import { describe, expect, it } from 'vitest';
import { parseFxStatusResponse } from './fx-evidence';

const ID = '11111111-1111-4111-8111-111111111111';
const TS = '2026-10-28T00:00:00.000Z';
const status = {
  reserves: {
    id: ID, reserveName: 'Virtual FX reserve', currency: 'USD', totalReservesUsd: 1000,
    targetAnchorRate: 1350, currentRate: 1352.5, isHalted: false,
    totalInterventionsCount: 0, totalIntervenedUsd: 0, updatedAt: TS,
  },
  history: [{ id: ID, rate: 1352.5, changePct: 0.1, volumeUsd: 20, interventionType: 'NONE', note: null, createdAt: TS }],
  txs: [], sdrAllocations: [], swapAgreements: [], forwardContracts: [],
  ews: { fsiScore: 12, stage: 'NORMAL', triggerReason: 'Model-based indicator', currentSpotRate: 1352.5 },
};

describe('FX administrator status evidence', () => {
  it('accepts only a verified NestJS status envelope', () => {
    expect(parseFxStatusResponse({ success: true, data: status })).toEqual(status);
    expect(parseFxStatusResponse(status)).toBeNull();
    expect(parseFxStatusResponse({ success: false, data: status })).toBeNull();
  });

  it('rejects missing data instead of fabricating reserves or a healthy market', () => {
    expect(parseFxStatusResponse(null)).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, reserves: null } })).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, ews: undefined } })).toBeNull();
  });

  it('rejects unsafe or inconsistent financial telemetry', () => {
    expect(parseFxStatusResponse({ success: true, data: { ...status, reserves: { ...status.reserves, totalReservesUsd: Infinity } } })).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, reserves: { ...status.reserves, currentRate: -1 } } })).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, ews: { ...status.ews, fsiScore: 101 } } })).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, history: [{ ...status.history[0], rate: NaN }] } })).toBeNull();
  });

  it('rejects duplicate financial row identifiers and malformed dates', () => {
    expect(parseFxStatusResponse({ success: true, data: { ...status, history: [...status.history, ...status.history] } })).toBeNull();
    expect(parseFxStatusResponse({ success: true, data: { ...status, reserves: { ...status.reserves, updatedAt: 'not-a-date' } } })).toBeNull();
  });

  it('rejects malformed transaction and swap evidence', () => {
    const badTx = { id: ID, userId: ID, transactionType: 'BUY_USD', fromCurrency: 'WLD', toCurrency: 'USD', fromAmount: -10, toAmount: 1, appliedRate: 1350, feeWld: 0, createdAt: TS };
    expect(parseFxStatusResponse({ success: true, data: { ...status, txs: [badTx] } })).toBeNull();
    const badSwap = { id: ID, counterparty: 'Example', totalFacilityUsd: 100, drawnAmountUsd: 101, availableFacilityUsd: -1, status: 'ACTIVE', interestRatePct: 2, effectiveDate: TS, expiryDate: TS, updatedAt: TS };
    expect(parseFxStatusResponse({ success: true, data: { ...status, swapAgreements: [badSwap] } })).toBeNull();
  });
});
