import { describe, expect, it } from 'vitest';
import { projectEconomyScenario } from './economy-scenario';

describe('projectEconomyScenario', () => {
  it('projects constant daily net issuance without converting WLD to Number', () => {
    const result = projectEconomyScenario({
      m2Amount: '900719925474099300000',
      issued24h: '1200',
      burned24h: '200',
      days: 30,
      issuanceChangeBps: 0,
      sinkChangeBps: 0,
    });
    expect(result.projected_net_per_day).toBe('1000');
    expect(result.projected_m2_amount).toBe('900719925474099330000');
  });

  it('applies independent issuance and sink basis-point changes', () => {
    const result = projectEconomyScenario({
      m2Amount: '100000',
      issued24h: '1000',
      burned24h: '500',
      days: 10,
      issuanceChangeBps: -2500,
      sinkChangeBps: 5000,
    });
    expect(result.projected_issued_per_day).toBe('750');
    expect(result.projected_burned_per_day).toBe('750');
    expect(result.projected_m2_amount).toBe('100000');
  });

  it('floors impossible negative supply and marks the model boundary', () => {
    const result = projectEconomyScenario({
      m2Amount: '100',
      issued24h: '0',
      burned24h: '200',
      days: 2,
      issuanceChangeBps: 0,
      sinkChangeBps: 0,
    });
    expect(result.projected_m2_amount).toBe('0');
    expect(result.supply_floor_reached).toBe(true);
    expect(result.advisory.some((line) => line.includes('floored'))).toBe(true);
  });

  it('rejects unsafe horizons and multipliers', () => {
    expect(() =>
      projectEconomyScenario({
        m2Amount: '1',
        issued24h: '1',
        burned24h: '1',
        days: 366,
        issuanceChangeBps: 0,
        sinkChangeBps: 0,
      }),
    ).toThrow('days');
    expect(() =>
      projectEconomyScenario({
        m2Amount: '1',
        issued24h: '1',
        burned24h: '1',
        days: 1,
        issuanceChangeBps: -10001,
        sinkChangeBps: 0,
      }),
    ).toThrow('issuanceChangeBps');
  });
});
