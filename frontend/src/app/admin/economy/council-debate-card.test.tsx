import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CouncilDebateCard } from './council-debate-card';

afterEach(cleanup);

describe('CouncilDebateCard evidence boundary', () => {
  it('shows a screenreader-accessible unavailable state instead of invented votes', () => {
    render(<CouncilDebateCard />);

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('검증된');
    expect(status.textContent).toContain('제공할 수 없습니다');
    expect(screen.queryByText(/판정 결과:/)).toBeNull();
    expect(screen.queryByText(/BOUNDED_AUTO/)).toBeNull();
    expect(screen.queryByText(/89\.0%/)).toBeNull();
  });
});
