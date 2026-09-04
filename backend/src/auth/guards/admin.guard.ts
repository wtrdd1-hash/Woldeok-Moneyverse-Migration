import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AdminRolesRepository } from '../admin-roles.repository';
import type { RequestWithSession } from '../session.context';
import { EncryptionService } from '../../security/encryption.service';
import { PG_POOL } from '../../core/pool.provider';
import type { Queryable } from '../../core/db';
import { queryRows } from '../../core/db';

const WHITELIST_SUBJECTS = new Set([
  '889085646768078850',
  '886478189520637992',
  '1545280111258107934',
  '100343387892064653551',
  'woldeog12@gmail.com',
  'jungchwimisaenghwal63@gmail.com',
]);

const REVOKED_SUBJECTS = new Set([
  '1481258930909872239', // Karlie (권한 영구 박탈)
  '717219505562189885',  // 717219505562189885 (권한 영구 박탈)
]);

interface UserIdentityRow {
  readonly provider: string;
  readonly provider_subject: string;
  readonly display_name: string;
}

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly encryption: EncryptionService;

  constructor(
    private readonly adminRoles: AdminRolesRepository,
    @Optional() @Inject(PG_POOL) private readonly pool?: Queryable | null,
    @Optional() encryptionService?: EncryptionService,
  ) {
    this.encryption = encryptionService ?? new EncryptionService();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const userId = request.session?.user_id;
    if (!userId) throw new ForbiddenException('administrator role required');

    const roles = await this.adminRoles.currentRoles(userId);
    if (roles.length === 0) throw new ForbiddenException('administrator role required');

    // 승인된 관리자 화이트리스트 강제 검증 (풀이 주입된 경우)
    if (this.pool) {
      const identities = await queryRows<UserIdentityRow>(
        this.pool,
        'SELECT provider, provider_subject, display_name FROM public.identities WHERE user_id = $1',
        [userId],
      );

      let isWhitelisted = false;

      for (const id of identities) {
        const decSubject = this.encryption.decrypt(id.provider_subject) ?? id.provider_subject;
        const decName = this.encryption.decrypt(id.display_name) ?? id.display_name;

        // 권한 박탈 계정은 즉시 차단
        if (REVOKED_SUBJECTS.has(decSubject) || REVOKED_SUBJECTS.has(decName)) {
          throw new ForbiddenException('Administrator access has been revoked for this account');
        }

        if (
          WHITELIST_SUBJECTS.has(decSubject) ||
          WHITELIST_SUBJECTS.has(decName) ||
          WHITELIST_SUBJECTS.has(id.provider_subject)
        ) {
          isWhitelisted = true;
        }
      }

      if (!isWhitelisted && identities.length > 0) {
        throw new ForbiddenException('Access denied: Unauthorized administrator account');
      }
    }

    request.adminRoles = roles;
    return true;
  }
}
