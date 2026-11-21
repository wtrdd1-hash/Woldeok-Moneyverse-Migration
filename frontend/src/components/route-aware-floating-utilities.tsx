'use client';

import { usePathname } from 'next/navigation';
import { AdminSupportDock } from '@/components/admin-support-dock';
import { FloatingSupportChatWidget } from '@/components/floating-support-chat-widget';
import { InteractiveOnboardingTracker } from '@/components/interactive-onboarding-tracker';

/**
 * Exactly one global support entry point per page.
 * Admin routes must NEVER mount the member conversation transport until
 * Spring support/chat user identity is secured against forged headers.
 */
export function RouteAwareFloatingUtilities() {
  const pathname = usePathname();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return <AdminSupportDock />;
  }

  return (
    <>
      <InteractiveOnboardingTracker />
      <FloatingSupportChatWidget />
    </>
  );
}
