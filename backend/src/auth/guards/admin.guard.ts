import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AdminRolesRepository } from '../admin-roles.repository';
import type { RequestWithSession } from '../session.context';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminRoles: AdminRolesRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const userId = request.session?.user_id;
    if (!userId) throw new ForbiddenException('administrator role required');

    const roles = await this.adminRoles.currentRoles(userId);
    if (roles.length === 0) throw new ForbiddenException('administrator role required');

    request.adminRoles = roles;
    return true;
  }
}
