import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

/**
 * Row returned by admin_current_roles, declared
 * `RETURNS TABLE(role public.admin_role)` in
 * packages/database/migrations/007-admin-hardening.sql.
 */
interface AdminRoleRow {
  readonly role: string;
}

@Injectable()
export class AdminRolesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async currentRoles(userId: string): Promise<string[]> {
    if (!this.pool) return [];
    const rows = await queryRows<AdminRoleRow>(
      this.pool,
      'SELECT role FROM public.admin_current_roles($1)',
      [userId],
    );
    return rows.map((row) => row.role);
  }
}
