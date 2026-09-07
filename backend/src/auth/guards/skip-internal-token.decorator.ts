import { SetMetadata } from '@nestjs/common';

export const SKIP_INTERNAL_TOKEN = 'moneyverse:skip-internal-token';

/**
 * Exempts an endpoint from the Next-to-Nest shared-token boundary.
 *
 * This is intentionally narrow: only infrastructure liveness and a webhook
 * that authenticates itself cryptographically should use it. Session/role/
 * CSRF guards remain completely independent of this metadata.
 */
export const SkipInternalToken = () => SetMetadata(SKIP_INTERNAL_TOKEN, true);
