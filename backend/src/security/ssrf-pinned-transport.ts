import type { LookupAddress } from 'node:dns';
import { Agent } from 'undici';

// The transport must never resolve a validated hostname again. Using the
// original URL (rather than an IP URL) retains the TLS SNI, certificate
// hostname verification and HTTP Host header.
const MAX_OUTBOUND_RESPONSE_BYTES = 16 * 1024 * 1024;

async function boundedResponse(response: Response): Promise<Response> {
  // Fetch may transparently decompress response bytes. A reconstructed
  // response must not advertise the upstream compressed length or encoding.
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('transfer-encoding');
  const init: ResponseInit = {
    status: response.status,
    statusText: response.statusText,
    headers,
  };
  if (!response.body) return new Response(null, init);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_OUTBOUND_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('Outbound response exceeds the permitted size');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Response(bytes, init);
}

/**
 * Per-request, direct (non-proxy) dispatcher with a single DNS-validated IP.
 * No implicit global dispatcher, connection pool, proxy environment, or
 * second hostname lookup is permitted.
 */
export async function fetchPinnedUrl(
  url: URL,
  validatedAddresses: readonly LookupAddress[],
  init: RequestInit,
): Promise<Response> {
  const chosen = validatedAddresses[0];
  if (!chosen) throw new Error('No validated outbound address');

  const expectedHost = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const agent = new Agent({
    connections: 1,
    pipelining: 1,
    connect: {
      lookup: ((
        hostname: string,
        options: { all?: boolean },
        callback: (err: Error | null, addressOrAddresses?: any, family?: number) => void,
      ) => {
        if (hostname.toLowerCase() !== expectedHost) {
          callback(new Error('Outbound socket hostname differs from validated destination'), '', 4);
          return;
        }
        if (options.all) {
          callback(null, [{ address: chosen.address, family: chosen.family }]);
        } else {
          callback(null, chosen.address, chosen.family);
        }
      }) as any,
    },
  });

  try {
    const response = await fetch(url.toString(), {
      ...init,
      redirect: 'manual',
      dispatcher: agent,
    } as RequestInit & { dispatcher: Agent });
    // Drain the body while this one-shot Agent is alive, so callers that only
    // inspect .ok/.status cannot leak sockets or bypass the response size cap.
    return await boundedResponse(response);
  } finally {
    await agent.close();
  }
}
