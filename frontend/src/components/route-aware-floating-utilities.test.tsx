import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RouteAwareFloatingUtilities } from './route-aware-floating-utilities';

const state = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => state.pathname,
}));
vi.mock('./admin-support-dock', () => ({
  AdminSupportDock: () => <div data-testid="admin-safe-dock">Admin support only</div>,
}));
vi.mock('./floating-support-chat-widget', () => ({
  FloatingSupportChatWidget: () => <div data-testid="member-chat">Member support chat</div>,
}));
vi.mock('./interactive-onboarding-tracker', () => ({
  InteractiveOnboardingTracker: () => <div data-testid="onboarding">Guide</div>,
}));

describe('RouteAwareFloatingUtilities — one dock per page', () => {
  afterEach(() => { cleanup(); state.pathname = '/'; });

  it.each(['/admin', '/admin/users', '/admin/logs/errors'])(
    'renders only safe admin help on %s',
    pathname => {
      state.pathname = pathname;
      render(<RouteAwareFloatingUtilities />);
      expect(screen.getByTestId('admin-safe-dock')).toBeDefined();
      expect(screen.queryByTestId('member-chat')).toBeNull();
      expect(screen.queryByTestId('onboarding')).toBeNull();
    }
  );

  it.each(['/', '/wallet', '/support', '/administrator', '/admin-helper'])(
    'retains the normal member support and onboarding on %s',
    pathname => {
      state.pathname = pathname;
      render(<RouteAwareFloatingUtilities />);
      expect(screen.queryByTestId('admin-safe-dock')).toBeNull();
      expect(screen.getByTestId('member-chat')).toBeDefined();
      expect(screen.getByTestId('onboarding')).toBeDefined();
    }
  );
});
