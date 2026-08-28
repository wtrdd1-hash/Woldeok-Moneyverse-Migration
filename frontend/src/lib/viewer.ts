import 'server-only';

import { cache } from 'react';
import { ApiError, api, apiOrNull } from './api';
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

/**
 * The same question, with "could not tell" kept distinct from "signed out".
 *
 * `currentViewer` folds every failure into SIGNED_OUT, which is right for a
 * page deciding what to render — it has to render something — and wrong for
 * the route the masthead asks. A member who was rate limited, or who asked
 * while the API was restarting, was told they were signed out and shown a
 * login button, with their session cookie untouched the whole time.
 *
 * The API answers 200 with `signedIn: false` for a caller it does not
 * recognise, so anonymity arrives as an answer rather than as an error. Null
 * here therefore means only one thing: nobody knows yet.
 */
export const viewerOrUnknown = cache(async (): Promise<Viewer | null> => {
  try {
    return await api<Viewer>('/api/v1/auth/viewer');
  } catch (error) {
    // 401 would still be an answer, if the API ever chose to give one.
    if (error instanceof ApiError && error.status === 401) return SIGNED_OUT;
    return null;
  }
});

export type { Viewer };
export { isAdministrator } from './viewer-state';
