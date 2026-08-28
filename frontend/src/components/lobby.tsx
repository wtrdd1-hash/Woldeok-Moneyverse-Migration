'use client';

import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/cn';
import {
  acquireSiteSocket,
  lastLobbyPermissions,
  lastOnlineCount,
  readOnlineCount,
  releaseSiteSocket,
} from '@/lib/site-socket';

/**
 * The real-time lobby.
 *
 * It connects to this origin, not to the API: the edge routes `/socket.io/`
 * to the backend while everything else goes to Next, so the browser keeps one
 * origin, one cookie, and one CSRF boundary.
 *
 * Nothing here is persisted. The server relays a message to whoever is
 * connected and forgets it, which is what the privacy policy promises, so the
 * list starts empty on every load and that is correct rather than a bug.
 *
 * Whether this visitor may write is the server's answer, delivered as
 * `lobby:permissions`. The control stays disabled until it arrives — assuming
 * permission and finding out on rejection would show a member a working
 * composer that silently drops what they typed.
 */

const MAX_MESSAGE_LENGTH = 180;

interface LobbyMessage {
  readonly id: number;
  readonly text: string;
  readonly at: string;
}

type Connection = 'connecting' | 'open' | 'degraded' | 'closed';

const CONNECTION_LABEL: Readonly<Record<Connection, string>> = {
  connecting: '로비에 연결하는 중…',
  open: '로비에 연결됐어요.',
  degraded: '연결이 끊겼어요. 다시 연결하고 있습니다…',
  closed: '지금은 로비에 연결할 수 없어요.',
};

export function Lobby() {
  const [connection, setConnection] = useState<Connection>('connecting');
  const [canChat, setCanChat] = useState(false);
  const [online, setOnline] = useState<number | null>(null);
  const [messages, setMessages] = useState<readonly LobbyMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const socket = useRef<Socket | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    // Shared with the headcount above it and with the market's price feed, so
    // the home page opens one socket rather than two. It may already be
    // connected, in which case no `connect` event is coming and the state has
    // to be read rather than waited for.
    const connected = acquireSiteSocket();
    socket.current = connected;
    setConnection(connected.connected ? 'open' : 'connecting');
    setOnline(lastOnlineCount());
    setCanChat(lastLobbyPermissions() === true);

    const opened = () => setConnection('open');
    const dropped = () => setConnection('degraded');
    const failed = () => setConnection('closed');
    const permissions = (value: { canChat?: boolean }) => setCanChat(value?.canChat === true);
    const refused = (message: unknown) =>
      setNotice(typeof message === 'string' ? message : '메시지를 보낼 수 없어요.');
    // This event is the only source for the count. Until it arrives the page
    // says 확인 중 rather than inventing a zero.
    const headcount = (value: unknown) => setOnline(readOnlineCount(value));
    const said = (value: unknown) => {
      const text = String(value ?? '')
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH);
      if (!text) return;
      nextId.current += 1;
      const id = nextId.current;
      setMessages((current) =>
        // Bounded: a long-lived tab in a busy lobby would otherwise grow this
        // list without limit.
        [...current, { id, text, at: new Date().toISOString() }].slice(-100),
      );
    };

    connected.on('connect', opened);
    connected.on('disconnect', dropped);
    connected.on('connect_error', failed);
    connected.on('lobby:permissions', permissions);
    connected.on('message:error', refused);
    connected.on('online', headcount);
    connected.on('message', said);

    return () => {
      // Listeners off, socket left open: it is shared, and closing it here
      // would take the headcount and the market feed down with it.
      connected.off('connect', opened);
      connected.off('disconnect', dropped);
      connected.off('connect_error', failed);
      connected.off('lobby:permissions', permissions);
      connected.off('message:error', refused);
      connected.off('online', headcount);
      connected.off('message', said);
      socket.current = null;
      releaseSiteSocket();
    };
  }, []);

  function send(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !canChat || connection !== 'open') return;
    socket.current?.emit('message', text.slice(0, MAX_MESSAGE_LENGTH));
    setDraft('');
    setNotice(null);
  }

  const label = canChat
    ? CONNECTION_LABEL[connection]
    : connection === 'open'
      ? '읽기 전용 로비예요. 로그인 후 메시지를 보낼 수 있어요.'
      : CONNECTION_LABEL[connection];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <span
            aria-hidden
            className={cn(
              'size-2 rounded-full',
              connection === 'open'
                ? 'bg-primary'
                : connection === 'connecting'
                  ? 'bg-muted-foreground'
                  : 'bg-destructive',
            )}
          />
          {label}
        </p>
        <Badge variant="outline" className="font-normal">
          {online === null ? '참여자 확인 중' : `${online}명 참여 중`}
        </Badge>
      </div>

      <ScrollArea className="h-48 rounded-md border">
        <div className="grid gap-1 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 오간 이야기가 없어요. 먼저 인사해 보세요.
            </p>
          ) : (
            messages.map((message) => (
              <p key={message.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 break-words">{message.text}</span>
                <time dateTime={message.at} className="shrink-0 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(message.at))}
                </time>
              </p>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={send} className="flex flex-wrap items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={!canChat || connection !== 'open'}
          placeholder={canChat ? '짧게 인사해 주세요' : '로그인 후 메시지를 보낼 수 있어요'}
          aria-label="로비 메시지"
          className="min-h-11 flex-1"
        />
        <span className="tabular text-xs text-muted-foreground">
          {draft.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <Button type="submit" disabled={!canChat || connection !== 'open' || draft.trim() === ''} className="min-h-11">
          보내기
        </Button>
      </form>

      {notice && (
        <p role="status" aria-live="polite" className="text-xs text-destructive">
          {notice}
        </p>
      )}
    </div>
  );
}
