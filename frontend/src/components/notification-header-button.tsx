'use client';

import React from 'react';
import { NotificationCenterModal } from '@/components/notification-center-modal';
import { useViewer } from '@/lib/use-viewer';

export function NotificationHeaderButton() {
  const viewer = useViewer();

  if (!viewer?.signedIn) return null;

  return <NotificationCenterModal />;
}
