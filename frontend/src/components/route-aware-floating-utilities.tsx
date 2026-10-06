'use client';

import { usePathname } from 'next/navigation';
import { FloatingSupportChatWidget } from '@/components/floating-support-chat-widget';
import { InteractiveOnboardingTracker } from '@/components/interactive-onboarding-tracker';

export function RouteAwareFloatingUtilities() {
  const pathname = usePathname();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <InteractiveOnboardingTracker />
      <FloatingSupportChatWidget />
    </>
  );
}
