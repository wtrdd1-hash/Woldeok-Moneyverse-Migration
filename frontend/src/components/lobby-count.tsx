'use client';

import { useEffect, useState } from 'react';
import { acquireSiteSocket, lastOnlineCount, readOnlineCount, releaseSiteSocket } from '@/lib/site-socket';

/**
 * How many members are in the lobby right now.
 *
 * The socket's `online` event is the only source for this number. Until it
 * arrives the page says 확인 중 rather than inventing a zero — the original
 * was explicit about that, and a stated zero when the answer is unknown is a
 * different claim from "nobody is here".
 */
export function LobbyCount() {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const socket = acquireSiteSocket();
    // The socket is shared, so it may already be open and may already have
    // heard a count. Starting from it is the difference between showing the
    // number now and showing 확인 중 until the next person comes or goes.
    setOnline(lastOnlineCount());

    const update = (value: unknown) => setOnline(readOnlineCount(value));
    socket.on('online', update);
    return () => {
      // Never close: other components on the page may still be holding it.
      socket.off('online', update);
      releaseSiteSocket();
    };
  }, []);

  return (
    <span aria-live="polite">{online === null ? '확인 중' : `${online}명 참여 중`}</span>
  );
}
