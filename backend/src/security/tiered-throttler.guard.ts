import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerRequest } from '@nestjs/throttler';
import { CONFIG } from '../core/config';
import type { AppConfig } from '../core/config';
import { requestClientKey, requestPath, tierFor } from './rate-limit';

/**
 * Applies one budget per request instead of all three.
 *
 * `ThrottlerModule` was configured with three named throttlers — auth,
 * sensitive, read — and the stock guard runs *every* configured throttler
 * against *every* route. Nothing carried `@Throttle` to say which one applied,
 * so each request was counted three times and the tightest budget governed
 * the lot: a public listing meant to allow 240 a minute stopped at 20, and a
 * reader who refreshed a few times found the whole API answering 429. The
 * front end read the resulting failure on the viewer lookup as "signed out"
 * and offered a login button to someone whose session was perfectly valid —
 * while their socket, limited separately, carried on working.
 *
 * `tierFor` already knew which budget a path deserves and was written for
 * exactly this; it had simply never been connected to anything.
 *
 * The tracker matters as much as the tier. Every request reaches this process
 * from the Next.js container, so the socket address is the same for every
 * visitor on the site and a per-IP limit would be one shared allowance. The
 * forwarded address is used instead, on the same terms as the lobby: only
 * when the deployment says a proxy it trusts is rewriting the header.
 */
@Injectable()
export class TieredThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {
    super(options, storageService, reflector);
  }

  protected override async handleRequest(request: ThrottlerRequest): Promise<boolean> {
    const { req } = this.getRequestResponse(request.context);
    const method = typeof req.method === 'string' ? req.method : 'GET';
    const tier = tierFor(requestPath(req), method);
    // Allowing outright is how a throttler is told it does not govern this
    // request: returning true consumes nothing and records nothing.
    if (request.throttler.name !== tier.name) return true;
    return super.handleRequest(request);
  }

  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    return requestClientKey(
      {
        headers: (req.headers ?? {}) as Record<string, string | string[] | undefined>,
        socket: (req.socket ?? {}) as { remoteAddress?: string | undefined },
      },
      { trustForwardedFor: this.config.trustProxyForwardedFor },
    );
  }
}
