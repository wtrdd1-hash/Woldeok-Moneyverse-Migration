// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelpPublicationDate } from './help-publication-date';

describe('verified help publication evidence', () => {
  const published = '2026-10-29T01:15:00.000Z';
  it('shows a real accessible Korean publication date in KST', () => {
    render(<HelpPublicationDate publishedAt={published} locale="ko" />);
    const time = screen.getByText(/2026/).closest('time');
    expect(time?.getAttribute('dateTime')).toBe(published);
    expect(time?.textContent).toMatch(/게시일/);
    expect(time?.textContent).toMatch(/KST/);
  });
  it('shows an English publication date without claiming a source-review date', () => {
    render(<HelpPublicationDate publishedAt={published} locale="en" />);
    const time = screen.getByText(/2026/).closest('time');
    expect(time?.textContent).toMatch(/Published/);
    expect(time?.textContent).not.toMatch(/Reviewed|Verified on/);
  });
  it.each([undefined, '', 'not-a-date', '2026-02-30T01:15:00.000Z', '2026-10-29', '2026-10-29T01:15:00.000Z<script>'])(
    'never fabricates or renders malformed publication evidence: %s', publishedAt => {
      const { container } = render(<HelpPublicationDate publishedAt={publishedAt} locale="ko" />);
      expect(container.querySelector('time')).toBeNull();
    },
  );
});
