'use server';

import { mutate } from '@/lib/mutate';
import { verifiedPracticeRound } from '@/lib/showdown-practice';
import type { PracticeShowdownRound } from '@/lib/showdown-practice';

/** Server-held session and one-use CSRF token; the browser cannot choose the dice. */
export async function playMiniShowdownRound(): Promise<PracticeShowdownRound | null> {
  try {
    const result = await mutate<unknown>('/api/v1/engagement/dopamine/mini-showdown', { body: {} });
    return verifiedPracticeRound(result);
  } catch {
    return null;
  }
}
