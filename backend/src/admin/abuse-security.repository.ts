import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

export interface AdminIpBlockRow {
  readonly block_id: string;
  readonly network: string;
  readonly reason: string;
  readonly blocked_by: string;
  readonly blocked_at: Date;
  readonly expires_at: Date | null;
  readonly lifted_by: string | null;
  readonly lifted_at: Date | null;
  readonly active: boolean;
}

export class AbuseSecurityRepository {
  constructor(private readonly pool: Queryable) {}

  permanentSuspend(actor: string, target: string, reason: string, requestId: string | null) {
    return queryOne<{ changed: boolean; revoked_sessions: number }>(
      this.pool,
      `SELECT suspended.changed, suspended.revoked_sessions
       FROM public.admin_permanent_suspend_account($1,$2,$3,$4) AS suspended`,
      [actor, target, reason, requestId],
    );
  }

  ipBlocks(actor: string): Promise<AdminIpBlockRow[]> {
    return queryRows<AdminIpBlockRow>(
      this.pool,
      `SELECT block_id::text, network::text, reason, blocked_by::text,
              blocked_at, expires_at, lifted_by::text, lifted_at, active
       FROM public.admin_list_ip_blocks($1,100)`,
      [actor],
    );
  }

  blockAddress(key: string, actor: string, network: string, reason: string) {
    return queryOne(
      this.pool,
      `SELECT block_id::text, network::text, expires_at
       FROM public.admin_block_address($1,$2,$3::inet,NULL,$4)`,
      [key, actor, network, reason],
    );
  }

  liftAddressBlock(key: string, actor: string, blockId: string, reason: string) {
    return queryOne(
      this.pool,
      `SELECT block_id::text, lifted
       FROM public.admin_lift_address_block($1,$2,$3,$4)`,
      [key, actor, blockId, reason],
    );
  }
}
