import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Guard failures occur before Nest applies @Header metadata. Set privacy headers
 * first so a denied owner-security request cannot inherit shared-cache defaults.
 * This guard does not authenticate or authorize; the following guards still do.
 */
export class AccountSecurityPrivateResponseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const response = context.switchToHttp().getResponse();
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Robots-Tag', 'noindex');
    response.setHeader('Referrer-Policy', 'no-referrer');
    return true;
  }
}
