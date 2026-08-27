import 'server-only';

import { cache } from 'react';
import { apiOrNull } from './api';
import type { Viewer } from './viewer-state';
import { SIGNED_OUT } from './viewer-state';

/**
 * `cache` deduplicates this within one render: the route handler asks, and so
 * may a page deciding what to show a signed-out reader, and both should not
 * become two round trips to the API.
 *
 * An unreachable API degrades to "signed out" rather than throwing the page
 * away. Nothing here is a permission boundary — the API re-decides every
 * permission on every request.
 */
export const currentViewer = cache(async (): Promise<Viewer> => {
  return (await apiOrNull<Viewer>('/api/v1/auth/viewer')) ?? SIGNED_OUT;
});

export type { Viewer };
export { isAdministrator } from './viewer-state';
