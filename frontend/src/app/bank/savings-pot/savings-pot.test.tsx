import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SavingsChallengePotPage from './page';

/** QA 2026-11-25: the page listed invented members (파이낸스덕, 월가고래) and simulated deposits. */
describe('savings challenge pot', () => {
  it('states it is not open and lists no invented members', () => {
    const html = renderToStaticMarkup(<SavingsChallengePotPage />);
    expect(html).toContain('아직 열리지 않았');
    expect(html).not.toContain('파이낸스덕');
    expect(html).not.toContain('월가고래');
  });
});
