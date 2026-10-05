'use client';

import { usePathname } from 'next/navigation';
import { FloatingSupportChatWidget } from '@/components/floating-support-chat-widget';
import { InteractiveOnboardingTracker } from '@/components/interactive-onboarding-tracker';

export function GlobalFloatingLayer() {
  const pathname = usePathname();
  const isAdministratorSurface = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdministratorSurface) return null;

  return (
    <div data-global-floating-layer>
      <FloatingSupportChatWidget />
      <InteractiveOnboardingTracker />
    </div>
  );
}
