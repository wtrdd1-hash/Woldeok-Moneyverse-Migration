import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CIDR = /^[0-9a-fA-F:.]{2,45}\/(?:[0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;
function uuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new TypeError(`${field} must be a UUID`);
}

export interface LoginContextRow { readonly decision: 'allow' | 'block'; readonly reason: string }
export interface LoginPolicyRow { readonly kind: string; readonly value: string; readonly label: string; readonly recorded_at: Date }

@Injectable()
export class AdminLoginPolicyRepository {
  constructor(private readonly pool: Queryable) {}

  async evaluate(input: { readonly userId: unknown; readonly ipAddress: string | null; readonly deviceHash: string | null }): Promise<LoginContextRow> {
    uuid(input.userId, 'user id');
    const row = await queryOne<LoginContextRow>(this.pool,
      'SELECT decision, reason FROM public.admin_evaluate_login_context($1,$2::inet,$3)',
      [input.userId, input.ipAddress, input.deviceHash]);
    if (!row) throw new Error('admin_evaluate_login_context did not return a row');
    return row;
  }

  async loginPolicy(actor: unknown, target: unknown): Promise<LoginPolicyRow[]> {
    uuid(actor, 'actor user id'); uuid(target, 'target user id');
    return queryRows<LoginPolicyRow>(this.pool,
      'SELECT kind,value,label,recorded_at FROM public.admin_login_policy($1,$2)', [actor,target]);
  }

  async setIpAllowlist(input: { readonly idempotencyKey: unknown; readonly actorUserId: unknown; readonly targetUserId: unknown; readonly networks: readonly string[]; readonly reason: string }): Promise<{ readonly entries: number }> {
    uuid(input.idempotencyKey,'idempotency key'); uuid(input.actorUserId,'actor user id'); uuid(input.targetUserId,'target user id');
    if (input.networks.length > 50 || input.networks.some(n => !CIDR.test(n))) throw new TypeError('invalid administrator network allowlist');
    const row = await queryOne<{ entries: number }>(this.pool,
      'SELECT entries FROM public.admin_set_ip_allowlist($1,$2,$3,$4::text[],$5)',
      [input.idempotencyKey,input.actorUserId,input.targetUserId,[...input.networks],input.reason]);
    return { entries: row?.entries ?? 0 };
  }
}
