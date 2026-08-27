import type { Server as HttpServer, IncomingMessage } from 'node:http';
import { Server } from 'socket.io';
import { createFixedWindowLimiter } from './rate-limiter';
import type { FixedWindowLimiter } from './rate-limiter';
import { requestClientKey } from '../security/rate-limit';

/**
 * The real-time lobby.
 *
 * Attached to the HTTP server directly rather than declared as a Nest
 * gateway, because every limit below is a property of the *listener* --
 * concurrent sockets, handshakes per minute, connections per session -- and
 * expressing them through the framework's lifecycle would have meant
 * reimplementing each against a different set of hooks. The logic is carried
 * across from the original with its reasoning intact.
 *
 * Nothing said in the lobby is stored. Messages are relayed to the connected
 * sockets and forgotten, which is what the privacy policy promises.
 */

export interface LobbySessions {
  get(token: unknown): Promise<{ readonly id: string; readonly user_id: string | null } | null>;
  hasCurrentUserConsent(sessionId: string): Promise<boolean>;
}

export interface LobbyOptions {
  readonly baseUrl: string;
  readonly trustForwardedFor: boolean;
  readonly sessions: LobbySessions | null;
  /** Reads the session token out of handshake headers, exactly as HTTP does. */
  readonly sessionToken: (headers: IncomingMessage['headers']) => string | undefined;
  readonly limiter?: FixedWindowLimiter;
  readonly now?: () => number;
}

interface LobbySocketData {
  sessionId: string | null;
  canChat: boolean;
  usesLobbySlot: boolean;
  countedLobbyUser: boolean;
  countedUnauthenticatedConnection: boolean;
  messageTimes: number[];
}

/** Concurrent lobby sockets across the whole process. */
export const MAX_LOBBY_CONNECTIONS = 250;
/** Of those, how many may belong to nobody. Keeps room for members. */
export const MAX_UNAUTHENTICATED_LOBBY_CONNECTIONS = 50;
/** One person with several tabs is normal; one session with fifty is not. */
export const MAX_LOBBY_CONNECTIONS_PER_SESSION = 5;
/**
 * A backstop below the accounting above, checked before Engine.IO allocates
 * a transport for the connection at all.
 */
export const MAX_SOCKET_CONNECTIONS = 300;
/**
 * Each accepted handshake costs one session lookup in the database -- the
 * same order of cost as an auth route -- so it gets that tier's budget. A
 * reconnecting tab needs a handful per minute; a flood needs thousands.
 */
export const MAX_SOCKET_HANDSHAKES_PER_MINUTE = 20;

/** Five messages per ten seconds, per socket. */
export const MESSAGE_BURST = 5;
export const MESSAGE_WINDOW_MS = 10_000;
export const MAX_MESSAGE_LENGTH = 180;

export function attachLobby(httpServer: HttpServer, options: LobbyOptions): Server {
  const { baseUrl, trustForwardedFor, sessions, sessionToken } = options;
  const limiter = options.limiter ?? createFixedWindowLimiter();
  const now = options.now ?? (() => Date.now());
  const lobbyOrigin = new URL(baseUrl).origin;

  let liveSocketConnections = 0;
  let lobbyConnections = 0;
  let unauthenticatedLobbyConnections = 0;
  let authenticatedLobbyUsers = 0;
  const lobbySessions = new Map<string, number>();

  const io = new Server(httpServer, {
    // Socket.IO's connection endpoint needs the same origin boundary as the
    // rest of the browser app. Never widen this to a wildcard: a
    // cross-origin page must not be able to open a lobby socket carrying
    // this site's cookie.
    cors: { origin: false },
    maxHttpBufferSize: 8 * 1024,
    pingInterval: 25_000,
    pingTimeout: 20_000,
    // Engine.IO's attach() strips this server's own request and upgrade
    // listeners and re-wraps them, so a handshake never reaches any Nest
    // middleware or guard. allowRequest is the only gate that sees it, which
    // is why the rate limiter is consulted here rather than in a guard.
    allowRequest: (incoming, callback) => {
      try {
        const clientKey = requestClientKey(
          { headers: incoming.headers, socket: incoming.socket },
          { trustForwardedFor },
        );
        if (!limiter.allow(`${clientKey}:socket`, MAX_SOCKET_HANDSHAKES_PER_MINUTE)) {
          callback('too many requests', false);
          return;
        }
        if (liveSocketConnections >= MAX_SOCKET_CONNECTIONS) {
          callback('connection limit reached', false);
          return;
        }
        const origin = incoming.headers.origin;
        callback(null, typeof origin === 'string' && new URL(origin).origin === lobbyOrigin);
      } catch {
        callback(null, false);
      }
    },
  });

  io.engine.on(
    'connection',
    (engineSocket: { once(event: 'close', listener: () => void): void }) => {
      liveSocketConnections += 1;
      engineSocket.once('close', () => {
        liveSocketConnections = Math.max(0, liveSocketConnections - 1);
      });
    },
  );

  io.use((socket, next) => {
    const data = socket.data as LobbySocketData;
    if (lobbyConnections >= MAX_LOBBY_CONNECTIONS) {
      next(new Error('lobby capacity reached'));
      return;
    }
    lobbyConnections += 1;
    data.usesLobbySlot = true;

    const reject = (message: string): void => {
      lobbyConnections = Math.max(0, lobbyConnections - 1);
      data.usesLobbySlot = false;
      next(new Error(message));
    };

    void (async () => {
      try {
        const session = sessions ? await sessions.get(sessionToken(socket.handshake.headers)) : null;
        data.sessionId = session?.id ?? null;
        data.canChat = Boolean(
          session?.user_id && sessions && (await sessions.hasCurrentUserConsent(session.id)),
        );
      } catch {
        // The public landing page stays readable when the session store is
        // unavailable, but it never grants the ability to write a message.
        data.sessionId = null;
        data.canChat = false;
      }

      if (
        !data.canChat &&
        unauthenticatedLobbyConnections >= MAX_UNAUTHENTICATED_LOBBY_CONNECTIONS
      ) {
        reject('unauthenticated lobby capacity reached');
        return;
      }
      if (
        data.canChat &&
        (lobbySessions.get(data.sessionId ?? '') ?? 0) >= MAX_LOBBY_CONNECTIONS_PER_SESSION
      ) {
        reject('per-session lobby capacity reached');
        return;
      }
      next();
    })();
  });

  io.on('connection', (socket) => {
    const data = socket.data as LobbySocketData;
    data.countedLobbyUser = false;
    data.countedUnauthenticatedConnection = false;
    data.messageTimes = [];

    if (data.canChat && data.sessionId) {
      const current = lobbySessions.get(data.sessionId) ?? 0;
      lobbySessions.set(data.sessionId, current + 1);
      // The count is of people, not sockets: a member with three tabs open
      // is one person in the lobby.
      if (current === 0) authenticatedLobbyUsers += 1;
      data.countedLobbyUser = true;
    } else {
      unauthenticatedLobbyConnections += 1;
      data.countedUnauthenticatedConnection = true;
    }

    io.emit('online', authenticatedLobbyUsers);
    socket.emit('lobby:permissions', { canChat: data.canChat });

    socket.on('message', (text: unknown) => {
      void (async () => {
        let hasCurrentConsent = false;
        try {
          hasCurrentConsent = Boolean(
            data.sessionId && sessions && (await sessions.hasCurrentUserConsent(data.sessionId)),
          );
        } catch {
          socket.emit(
            'message:error',
            '지금은 로비 메시지를 확인할 수 없어요. 잠시 후 다시 시도해 주세요.',
          );
          return;
        }
        // Re-checked per message, not trusted from the handshake: a policy
        // published while a socket is open must take effect on that socket.
        if (!hasCurrentConsent) {
          data.canChat = false;
          socket.emit(
            'message:error',
            '로그인과 최신 정책 동의 후에 로비 메시지를 보낼 수 있어요.',
          );
          return;
        }

        const at = now();
        data.messageTimes = (data.messageTimes ?? []).filter(
          (time) => at - time < MESSAGE_WINDOW_MS,
        );
        if (data.messageTimes.length >= MESSAGE_BURST) {
          socket.emit(
            'message:error',
            '메시지가 너무 빠릅니다. 잠시 후 다시 보내 주세요.',
          );
          return;
        }

        const safeText = sanitizeMessage(text);
        if (!safeText) return;
        data.messageTimes.push(at);
        io.emit('message', safeText);
      })();
    });

    socket.on('disconnect', () => {
      if (data.usesLobbySlot) lobbyConnections = Math.max(0, lobbyConnections - 1);
      if (data.countedUnauthenticatedConnection) {
        unauthenticatedLobbyConnections = Math.max(0, unauthenticatedLobbyConnections - 1);
      }
      if (data.countedLobbyUser && data.sessionId) {
        const current = lobbySessions.get(data.sessionId) ?? 0;
        if (current <= 1) {
          lobbySessions.delete(data.sessionId);
          authenticatedLobbyUsers = Math.max(0, authenticatedLobbyUsers - 1);
        } else {
          lobbySessions.set(data.sessionId, current - 1);
        }
      }
      io.emit('online', authenticatedLobbyUsers);
    });
  });

  return io;
}

/**
 * Strips C0 control characters and angle brackets, then bounds the length.
 *
 * Not an HTML escape -- the browser inserts this as a text node, never as
 * markup. It removes the characters that would let a message forge line
 * structure in a log or a terminal that later reads one.
 */
export function sanitizeMessage(text: unknown): string {
  return String(text ?? '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}
