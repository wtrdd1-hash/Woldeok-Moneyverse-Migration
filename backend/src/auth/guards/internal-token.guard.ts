import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';
import type { AppConfig } from '../../core/config';
import { CONFIG } from '../../core/config';
import type { RequestWithSession } from '../session.context';
import { SKIP_INTERNAL_TOKEN } from './skip-internal-token.decorator';

/**
 * Defence in depth for the Next-to-NestJS hop. The API is not published to
 * the internet at all; this guard is the second lock, not the first. The
 * comparison is constant time so the token cannot be recovered a byte at a
 * time, and the length check comes first because timingSafeEqual throws on
 * mismatched lengths.
 */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Keep local development and framework e2e tests directly reachable. The
    // shared token is a production network boundary, not a developer login.
    if (!this.config.production) return true;

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_INTERNAL_TOKEN, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const presented = request.headers['x-internal-token'];
    if (typeof presented !== 'string') throw new UnauthorizedException('internal token required');

    const expected = Buffer.from(this.config.internalToken, 'utf8');
    const actual = Buffer.from(presented, 'utf8');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException('internal token rejected');
    }
    return true;
  }
}
