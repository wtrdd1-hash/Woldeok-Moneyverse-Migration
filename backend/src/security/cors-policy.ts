export interface CorsPolicyOptions {
  readonly baseUrl: string;
  readonly production: boolean;
}

const LOOPBACK_ORIGINS = ['http://127.0.0.1:3000', 'http://localhost:3000'] as const;

const BROWSER_ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'X-CSRF-Token',
  'X-Requested-With',
] as const;

export interface CorsPolicy {
  readonly allowedHeaders: readonly string[];
  readonly allowsOrigin: (origin: string | undefined) => boolean;
}

export function corsPolicy(options: CorsPolicyOptions): CorsPolicy {
  const origins = new Set<string>([new URL(options.baseUrl).origin]);
  if (!options.production) {
    for (const origin of LOOPBACK_ORIGINS) origins.add(origin);
  }

  return {
    allowedHeaders: BROWSER_ALLOWED_HEADERS,
    allowsOrigin: (origin) => origin === undefined || origins.has(origin),
  };
}
