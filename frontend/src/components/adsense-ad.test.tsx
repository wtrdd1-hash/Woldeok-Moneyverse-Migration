import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { AdSenseAd } from './adsense-ad';
import * as viewerHook from '@/lib/use-viewer';

describe('AdSenseAd', () => {
  it('renders ad element for regular non-admin viewers', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: true,
      consentCurrent: true,
      adminRoles: [],
    });

    const { container } = render(
      <AdSenseAd
        publisherId="ca-pub-5220225531544323"
        slot="2118692561"
      />
    );

    expect(screen.getByText('SPONSORED ADVERTISEMENT')).toBeDefined();
    expect(container.querySelector('ins.adsbygoogle')).toBeDefined();
  });

  it('completely hides and returns null when viewed by an administrator account', () => {
    vi.spyOn(viewerHook, 'useViewer').mockReturnValue({
      signedIn: true,
      consentCurrent: true,
      adminRoles: ['superadmin'],
    });

    const { container } = render(
      <AdSenseAd
        publisherId="ca-pub-5220225531544323"
        slot="2118692561"
      />
    );

    expect(screen.queryByText('SPONSORED ADVERTISEMENT')).toBeNull();
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
  });
});
