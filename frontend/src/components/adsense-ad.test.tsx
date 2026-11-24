import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { AdSenseAd } from './adsense-ad';
import * as viewerHook from '@/lib/use-viewer';

const route = vi.hoisted(() => ({pathname: '/tools'}));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

describe('AdSenseAd', () => {
  it('renders ad element on an approved public page for non-admin viewers', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: true, consentCurrent: true, adminRoles: [],
    });
    route.pathname = '/tools';
    const { container } = render(<AdSenseAd publisherId="ca-pub-5220225531544323" slot="2118692561" />);
    expect(screen.getByText(/Advertisement.*Sponsored advertisement/)).toBeDefined();
    expect(container.querySelector('ins.adsbygoogle')).not.toBeNull();
  });

  it('labels Korean ads visibly without implying that inventory is filled', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: false, consentCurrent: true, adminRoles: [],
    });
    route.pathname = '/ko/blog/educational-post';
    const { container } = render(<AdSenseAd publisherId="ca-pub-5220225531544323" slot="6000051656" />);
    expect(screen.getByText(/광고.*Sponsored advertisement/)).toBeDefined();
    expect(container.querySelector('section[data-testid="sponsored-ad-container"]')).not.toBeNull();
    expect(container.querySelector('ins.adsbygoogle')).not.toBeNull();
  });

  it('fails closed before viewer identity is resolved', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue(null);
    route.pathname = '/blog/long-article';
    const { container } = render(<AdSenseAd publisherId="ca-pub-5220225531544323" slot="2118692561" />);
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('hides ads on protected/transaction pages even for regular members', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: true, consentCurrent: true, adminRoles: [],
    });
    route.pathname = '/stocks/CHIPS';
    const { container } = render(<AdSenseAd publisherId="ca-pub-5220225531544323" slot="2118692561" />);
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('completely hides ad elements for administrators even on allowed content', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: true, consentCurrent: true, adminRoles: ['superadmin'],
    });
    route.pathname = '/tools';
    const { container } = render(<AdSenseAd publisherId="ca-pub-5220225531544323" slot="2118692561" />);
    expect(screen.queryByText(/Sponsored advertisement/)).toBeNull();
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
  });
});
