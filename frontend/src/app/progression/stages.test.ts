import { describe, expect, it } from 'vitest';
import { STAGES, requirementLines, stageIndex, stageLabel } from './stages';

/**
 * The stage vocabulary is the only place the growth ladder is written in
 * Korean -- the API sends codes and the database's own names are English -- so
 * these are the tests that say a member reads a stage rather than a slug.
 */
describe('stageLabel', () => {
  it('names each seeded stage in Korean', () => {
    expect(stageLabel('starter')).toBe('첫걸음');
    expect(stageLabel('advanced')).toBe('성장 후기');
  });

  // A migration may add a fifth stage long before this page hears about it.
  // Showing the code is worse than showing a name and better than showing
  // nothing, which is what a lookup returning undefined would render.
  it('falls back to the code itself for a stage it has not been taught', () => {
    expect(stageLabel('legendary')).toBe('legendary');
  });
});

describe('stageIndex', () => {
  it('places a stage on the ladder in the seeded order', () => {
    expect(stageIndex('starter')).toBe(0);
    expect(stageIndex('middle')).toBe(2);
    expect(stageIndex(STAGES[STAGES.length - 1]?.code ?? '')).toBe(STAGES.length - 1);
  });

  // -1 is what tells the page to hide the ladder. Drawing four steps with
  // none of them marked would read as "before the first one", which is a
  // different statement and a false one.
  it('answers -1 for an unknown stage and for no stage at all', () => {
    expect(stageIndex('legendary')).toBe(-1);
    expect(stageIndex(null)).toBe(-1);
  });
});

describe('requirementLines', () => {
  it('has nothing to show at the last stage, where there are no requirements', () => {
    expect(requirementLines(null)).toEqual([]);
  });

  it('writes each known requirement with its Korean label and unit', () => {
    expect(requirementLines({ workCompletions: 10, jobLevel: 3 })).toEqual([
      { key: 'workCompletions', label: '완료한 작업', value: '10회' },
      { key: 'jobLevel', label: '직업 레벨', value: '3레벨' },
    ]);
  });

  it('drops a requirement of zero, which asks for nothing', () => {
    expect(requirementLines({ workCompletions: 0, businesses: 1 })).toEqual([
      { key: 'businesses', label: '보유한 사업', value: '1개' },
    ]);
  });

  // An unmet condition the member cannot see is one they cannot meet, so a
  // key added to the payload later is shown under its own name.
  it('keeps a requirement it does not recognise', () => {
    expect(requirementLines({ tradesSettled: 5 })).toEqual([
      { key: 'tradesSettled', label: 'tradesSettled', value: '5' },
    ]);
  });

  it('groups a large count the way every other figure on the screen is grouped', () => {
    expect(requirementLines({ workCompletions: 12000 })[0]?.value).toBe('12,000회');
  });
});
