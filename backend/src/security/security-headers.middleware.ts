import type { Request, Response, NextFunction } from 'express';

export interface SecurityHeaderOptions {
  readonly isProduction?: boolean;
}

/**
 * Enterprise-grade Security Response Headers Middleware.
 * Injects defensive HTTP headers into all backend responses.
 */
export function securityHeaders(options: SecurityHeaderOptions = {}) {
  const { isProduction = process.env.NODE_ENV === 'production' } = options;

  return (_req: Request, res: Response, next: NextFunction): void => {
    // 1. Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 2. Prevent Clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // 3. Strict Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 4. Permissions Policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

    // 5. Cross-Origin Opener Policy
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // 6. Modern XSS Protection header (disable buggy legacy audit)
    res.setHeader('X-XSS-Protection', '0');

    // 7. Enforce HTTPS in production via HSTS
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  };
}
