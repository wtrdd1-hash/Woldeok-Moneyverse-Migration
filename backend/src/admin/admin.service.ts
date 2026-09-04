import { Injectable } from '@nestjs/common';

/**
 * The repository shape this service depends on. It is declared locally
 * (rather than importing `AdminRepository`) so any object exposing the same
 * methods — the real repository or a test double — can be injected.
 */
interface AdminRepositoryLike {
  currentRoles(input: { userId: unknown }): Promise<string[]>;
  recentAuditEvents(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  recentDiscordOutboxEvents(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  users(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  userPortfolio(input: { actorUserId: unknown; targetUserId: unknown }): Promise<unknown>;
  setUserRestriction(input: {
    actorUserId: unknown;
    userId: unknown;
    restricted: unknown;
    reason: unknown;
    requestId?: unknown;
  }): Promise<{ changed: boolean }>;
  recordAuditEvent(input: {
    actorUserId: unknown;
    action: unknown;
    targetId?: unknown;
    requestId?: unknown;
    metadata?: unknown;
  }): Promise<string>;
}

@Injectable()
export class AdminService {
  readonly repository: AdminRepositoryLike;

  constructor({ repository }: { repository: AdminRepositoryLike }) {
    if (!repository) throw new Error('admin repository is required');
    this.repository = repository;
  }

  currentRoles(userId: unknown): Promise<string[]> {
    return this.repository.currentRoles({ userId });
  }

  recentAuditEvents(
    actorUserId: unknown,
    { limit = 30 }: { limit?: unknown } = {},
  ): Promise<unknown[]> {
    return this.repository.recentAuditEvents({ actorUserId, limit });
  }

  recentDiscordOutboxEvents(
    actorUserId: unknown,
    { limit = 30 }: { limit?: unknown } = {},
  ): Promise<unknown[]> {
    return this.repository.recentDiscordOutboxEvents({ actorUserId, limit });
  }

  users(actorUserId: unknown, { limit = 50 }: { limit?: unknown } = {}): Promise<unknown[]> {
    return this.repository.users({ actorUserId, limit });
  }

  userPortfolio(actorUserId: unknown, targetUserId: unknown): Promise<unknown> {
    return this.repository.userPortfolio({ actorUserId, targetUserId });
  }

  setUserRestriction({
    actorUserId,
    userId,
    restricted,
    reason,
    requestId = null,
  }: {
    actorUserId: unknown;
    userId: unknown;
    restricted: unknown;
    reason: unknown;
    requestId?: unknown;
  }): Promise<{ changed: boolean }> {
    return this.repository.setUserRestriction({
      actorUserId,
      userId,
      restricted,
      reason,
      requestId,
    });
  }

  recordAudit({
    actorUserId,
    action,
    targetId = null,
    requestId = null,
    metadata = {},
  }: {
    actorUserId: unknown;
    action: unknown;
    targetId?: unknown;
    requestId?: unknown;
    metadata?: unknown;
  }): Promise<string> {
    return this.repository.recordAuditEvent({
      actorUserId,
      action,
      targetId,
      requestId,
      metadata,
    });
  }
}
