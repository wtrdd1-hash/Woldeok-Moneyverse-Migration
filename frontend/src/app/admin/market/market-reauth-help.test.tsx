import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MarketEventReauthHelp } from './market-reauth-help';

describe('market event recent-auth recovery', () => {
  it('links to the existing account reauthentication flow before a market-moving write', () => {
    const html = renderToStaticMarkup(<MarketEventReauthHelp state={{ status: 'idle' }} />);
    expect(html).toContain('/account/security#reauthentication');
    expect(html).toContain('본인 확인');
    expect(html).toContain('다시');
  });

  it('keeps an accessible actionable recovery link after a stale-auth rejection', () => {
    const html = renderToStaticMarkup(<MarketEventReauthHelp state={{ status: 'error', reauthenticationRequired: true }} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('min-h-11');
    expect(html).toContain('/account/security#reauthentication');
    expect(html).toContain('다시');
  });

  it('does not falsely attribute unrelated API failures to expired identity verification', () => {
    const html = renderToStaticMarkup(<MarketEventReauthHelp state={{ status: 'error', message: '서버 오류' }} />);
    expect(html).not.toContain('role="alert"');
  });
});
