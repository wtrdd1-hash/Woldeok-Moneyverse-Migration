'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
    const socket = io({ transports: ['websocket', 'polling'] });
    socket.on('online', (value: unknown) => {
      const parsed = Number(value);
      setOnline(Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0);
    });
    return () => {
      socket.close();
    };
  }, []);

  return (
    <span aria-live="polite">{online === null ? '확인 중' : `${online}명 참여 중`}</span>
  );
}
