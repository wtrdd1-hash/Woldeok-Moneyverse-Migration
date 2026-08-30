import { describe, expect, it } from 'vitest';
import {
  affinityLabel,
  goalTitle,
  npcName,
  npcOrderMessage,
  preferenceMessage,
  progressLabel,
  progressMessage,
  stageLabel,
  unlockLines,
} from './quests';

/**
 * The engagement vocabulary is the only place this feature is written in
 * Korean -- the dashboard's titles come out of `engagement_catalog` and they
 * are English -- so these are the tests that say a member reads a goal rather
 * than a slug.
 */
describe('goalTitle', () => {
  it('names each seeded goal in Korean', () => {
    expect(goalTitle({ code: 'first_wage', title: 'First wage', progress: 0 })).toBe('첫 급여');
    expect(goalTitle({ code: 'weekly_variety', title: 'Weekly variety', progress: 0 })).toBe(
      '이번 주 다양하게',
    );
  });

  // A migration may add a sixth goal long before this page hears about it.
  // The catalogue's own title is worse than Korean and far better than
  // nothing, which is what a lookup returning undefined would render.
  it('keeps the catalogue title for a goal it has not been taught', () => {
    expect(goalTitle({ code: 'moonlight_run', title: 'Moonlight run', progress: 0 })).toBe(
      'Moonlight run',
    );
  });

  it('falls back to the code when the catalogue title is blank', () => {
    expect(goalTitle({ code: 'moonlight_run', title: '   ', progress: 0 })).toBe('moonlight_run');
  });
});

describe('npcName', () => {
  it('names each seeded NPC in Korean', () => {
    expect(npcName('market_keeper')).toBe('시장 상인');
    expect(npcName('courier')).toBe('배달원');
  });

  it('falls back to the code itself for an NPC it has not been taught', () => {
    expect(npcName('harbour_master')).toBe('harbour_master');
  });
});

describe('progressLabel', () => {
  it('groups a large count the way every other figure on the screen is grouped', () => {
    expect(progressLabel(12000)).toBe('12,000회');
  });

  it('says zero rather than saying nothing', () => {
    expect(progressLabel(0)).toBe('0회');
  });

  // A missing figure rendered as `NaN회` claims the member did NaN of
  // something, which is worse than declining to answer.
  it('refuses a count that is not a whole number of things', () => {
    expect(progressLabel(Number.NaN)).toBe('—');
    expect(progressLabel(1.5)).toBe('—');
    expect(progressLabel(-1)).toBe('—');
  });
});

describe('affinityLabel', () => {
  // The unit is what keeps the Korean grammatical: "2가" and "3이" would have
  // to be chosen per digit, while "2점이" and "3점이" never change.
  it('writes affinity with a unit, so the particle after it never changes', () => {
    expect(affinityLabel(2)).toBe('2점');
    expect(affinityLabel(3)).toBe('3점');
    expect(affinityLabel(1200)).toBe('1,200점');
  });

  it('refuses a figure that is not a whole number of points', () => {
    expect(affinityLabel(Number.NaN)).toBe('—');
  });
});

describe('stageLabel', () => {
  it('names each seeded stage in Korean', () => {
    expect(stageLabel('starter')).toBe('첫걸음');
    expect(stageLabel('advanced')).toBe('성장 후기');
  });

  it('falls back to the code itself for a stage it has not been taught', () => {
    expect(stageLabel('legendary')).toBe('legendary');
  });
});

describe('unlockLines', () => {
  it('has nothing to show when there is no next stage', () => {
    expect(unlockLines(null)).toEqual([]);
  });

  it('writes each known requirement with its Korean label and unit', () => {
    expect(unlockLines({ workCompletions: 10, jobLevel: 3 })).toEqual([
      { key: 'workCompletions', label: '완료한 작업', value: '10회' },
      { key: 'jobLevel', label: '직업 레벨', value: '3레벨' },
    ]);
  });

  it('drops a requirement of zero, which asks for nothing', () => {
    expect(unlockLines({ workCompletions: 0, businesses: 1 })).toEqual([
      { key: 'businesses', label: '보유한 사업', value: '1개' },
    ]);
  });

  // A condition the member cannot see is one they cannot meet, so a key added
  // to the payload later is shown under its own name.
  it('keeps a requirement it does not recognise', () => {
    expect(unlockLines({ tradesSettled: 5 })).toEqual([
      { key: 'tradesSettled', label: 'tradesSettled', value: '5' },
    ]);
  });
});

describe('progressMessage', () => {
  it('reports a recorded step with the count the database returned', () => {
    expect(
      progressMessage({ code: 'first_wage', progress: 2, completed: false, replayed: false }),
    ).toBe('진행을 기록했어요. 지금까지 2회 기록했어요.');
  });

  it('says the goal is finished when the receipt says so', () => {
    expect(
      progressMessage({ code: 'first_wage', progress: 1, completed: true, replayed: false }),
    ).toBe('목표를 달성했어요. 지금까지 1회 기록했어요.');
  });

  // A replay is not a failure and not a second step: the member pressed the
  // button twice and the first press is what stands.
  it('tells a member a repeat was already recorded rather than counting it again', () => {
    expect(
      progressMessage({ code: 'first_wage', progress: 3, completed: false, replayed: true }),
    ).toBe('이미 기록된 진행이에요. 지금까지 3회 기록되어 있어요.');
  });

  it('still reports completion on a replay, which is what the member is asking', () => {
    expect(
      progressMessage({ code: 'first_wage', progress: 3, completed: true, replayed: true }),
    ).toBe('이미 기록된 진행이에요. 이 목표는 달성했고, 지금까지 3회 기록되어 있어요.');
  });
});

describe('npcOrderMessage', () => {
  it('names the NPC in Korean and reports the affinity the order left behind', () => {
    expect(npcOrderMessage({ npc_code: 'market_keeper', affinity: 3, replayed: false })).toBe(
      '시장 상인에게서 주문을 받았어요. 친밀도가 3점이 되었어요.',
    );
  });

  it('tells a member a repeated order was already taken', () => {
    expect(npcOrderMessage({ npc_code: 'courier', affinity: 5, replayed: true })).toBe(
      '이미 받아 둔 주문이에요. 배달원에게 쌓은 친밀도는 5점이에요.',
    );
  });

  // The replay path of `engagement_record_npc_order` reads the relationship
  // for the key it was given, and a key spent on something else leaves none.
  // That is not the same fact as an affinity of zero, so it must not be
  // reported as one.
  it('does not report an unreadable affinity as zero', () => {
    const message = npcOrderMessage({ npc_code: 'courier', affinity: null, replayed: true });
    expect(message).toBe('이미 처리된 요청이에요. 배달원에게 쌓은 친밀도는 지금 확인할 수 없어요.');
    expect(message).not.toContain('0점');
  });
});

describe('preferenceMessage', () => {
  // Written from what the API answered, never from what the form sent: a
  // preference that did not change must not claim to have.
  it('says which way the preference was saved', () => {
    expect(preferenceMessage(true)).toContain('받도록');
    expect(preferenceMessage(false)).toContain('받지 않도록');
  });
});
