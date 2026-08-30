import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import { GoalCard, NextUnlock, NpcCard } from './quest-parts';

describe('GoalCard', () => {
  it('reads a seeded goal in Korean and keeps its code visible', () => {
    render(<GoalCard goal={{ code: 'first_wage', title: 'First wage', progress: 2 }} />);
    expect(screen.getByText('첫 급여')).toBeDefined();
    // The code is what the write is addressed to, so it stays on screen for a
    // member reporting that a button did not work.
    expect(screen.getByText('first_wage')).toBeDefined();
  });

  it('shows the recorded count and nothing that looks like a target', () => {
    const { container } = render(
      <GoalCard goal={{ code: 'first_wage', title: 'First wage', progress: 12000 }} />,
    );
    expect(screen.getByText('12,000회')).toBeDefined();
    // No denominator: the dashboard sends the count and not the requirement,
    // and a "2 / 3" drawn against a guessed target would state a rule the
    // database has not agreed to.
    expect(container.textContent).not.toContain('/');
  });

  it('renders the control it is given', () => {
    render(
      <GoalCard goal={{ code: 'first_wage', title: 'First wage', progress: 0 }}>
        <button type="button">진행 1회 기록</button>
      </GoalCard>,
    );
    expect(screen.getByRole('button', { name: '진행 1회 기록' })).toBeDefined();
  });
});

describe('NpcCard', () => {
  it('names the NPC and the errand they hand out', () => {
    render(
      <NpcCard npc={{ code: 'courier', name: '배달원', errand: '짐을 옮겨 달라고 해요.' }} />,
    );
    expect(screen.getByText('배달원')).toBeDefined();
    expect(screen.getByText('짐을 옮겨 달라고 해요.')).toBeDefined();
  });

  // The affinity already standing cannot be read: `npc_relationships` is
  // revoked from the application role and 082 grants no reader. A card that
  // showed one would be showing a number nobody sent.
  it('claims no affinity figure it cannot have been told', () => {
    const { container } = render(
      <NpcCard npc={{ code: 'courier', name: '배달원', errand: '짐을 옮겨 달라고 해요.' }} />,
    );
    expect(container.textContent).not.toContain('점');
  });
});

describe('NextUnlock', () => {
  it('writes the next stage and its conditions in Korean', () => {
    const { container } = render(
      <NextUnlock unlock={{ stage: 'early', requirements: { workCompletions: 10 } }} />,
    );
    expect(screen.getByText('성장 초기')).toBeDefined();
    expect(screen.getByText('완료한 작업')).toBeDefined();
    expect(container.textContent).toContain('10회');
  });

  it('says so when the next stage asks for nothing', () => {
    render(<NextUnlock unlock={{ stage: 'early', requirements: {} }} />);
    expect(screen.getByText('다음 단계에 필요한 조건이 따로 없어요.')).toBeDefined();
  });

  // Null carries two facts at once -- the top stage, or no `user_progression`
  // row for the function's subquery to find -- and this screen cannot tell
  // them apart. Claiming the member has finished the ladder would be the
  // flattering half of a guess.
  it('does not claim the last stage when it cannot tell that from never assessed', () => {
    const { container } = render(<NextUnlock unlock={null} />);
    expect(container.textContent).toContain('아직 알 수 없어요');
    expect(container.textContent).toContain('마지막 단계일 수 있어요');
  });
});
