'use client';

import { useEffect, useState } from 'react';

export interface RecipientSearchUser {
  readonly user_id: string;
  readonly display_name: string;
}

interface SearchState {
  readonly query: string;
  readonly users: readonly RecipientSearchUser[];
  readonly loading: boolean;
  readonly error: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseRecipientSearch(payload: unknown, limit: number): readonly RecipientSearchUser[] {
  if (typeof payload !== 'object' || payload === null || !('users' in payload) || !Array.isArray(payload.users) || payload.users.length > limit) {
    throw new Error('Invalid recipient search response');
  }
  const users: RecipientSearchUser[] = [];
  const seen = new Set<string>();
  for (const user of payload.users) {
    if (typeof user !== 'object' || user === null ||
      typeof user.user_id !== 'string' || !UUID.test(user.user_id) ||
      typeof user.display_name !== 'string' || !user.display_name.trim() || user.display_name.length > 200 ||
      seen.has(user.user_id.toLowerCase())) {
      throw new Error('Invalid recipient search row');
    }
    seen.add(user.user_id.toLowerCase());
    users.push({ user_id: user.user_id, display_name: user.display_name });
  }
  return users;
}

export function useRecipientSearch(query: string, limit: 6 | 8) {
  const normalizedQuery = query.trim().slice(0, 50);
  const [state, setState] = useState<SearchState>({ query: '', users: [], loading: false, error: false });

  useEffect(() => {
    if (!normalizedQuery) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(async () => {
      setState({ query: normalizedQuery, users: [], loading: true, error: false });
      try {
        const res = await fetch(`/app-api/v1/chat/search-users?query=${encodeURIComponent(normalizedQuery)}&limit=${limit}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Recipient search unavailable');
        const users = parseRecipientSearch(await res.json(), limit);
        if (!cancelled) setState({ query: normalizedQuery, users, loading: false, error: false });
      } catch {
        if (!cancelled) setState({ query: normalizedQuery, users: [], loading: false, error: true });
      }
    }, 250);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [normalizedQuery, limit]);

  // Never expose a previous query's recipients, even during the debounce window.
  const current = state.query === normalizedQuery && normalizedQuery.length > 0;
  return {
    users: current ? state.users : [],
    isSearching: normalizedQuery.length > 0 && (!current || state.loading),
    error: current && state.error,
  };
}
