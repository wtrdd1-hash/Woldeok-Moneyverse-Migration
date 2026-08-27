import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const ECONOMIC_RISK_ACTIONS = new Set([
  'economy.policy.activate',
  'economy.policy.rollback',
  'economy.daily_reward_policy.update',
  'economy.treasury.adjust',
  'economy.mint.adjust',
  'economy.reconciliation.adjust',
  'economy.account.freeze',
  'economy.account.unfreeze',
]);

/**
 * The repository shape this service depends on. It is declared locally
 * (rather than importing `AdminRepository`) so any object exposing the same
 * methods — the real repository or a test double — can be injected.
 */
interface AdminRepositoryLike {
  currentRoles(input: { userId: unknown }): Promise<string[]>;
  approvalRequests(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  recentAuditEvents(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  recentDiscordOutboxEvents(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  users(input: { actorUserId: unknown; limit?: unknown }): Promise<unknown[]>;
  setUserRestriction(input: {
    actorUserId: unknown;
    userId: unknown;
    restricted: unknown;
    reason: unknown;
    requestId?: unknown;
  }): Promise<{ changed: boolean }>;
  createApprovalRequest(input: {
    requesterId: unknown;
    action: unknown;
    payload: unknown;
    idempotencyKey: unknown;
    requestId?: unknown;
  }): Promise<string>;
  decideApprovalRequest(input: {
    approverId: unknown;
    approvalRequestId: unknown;
    decision: unknown;
    reason?: unknown;
    requestId?: unknown;
  }): Promise<{ approvalRequestId: string; status: string }>;
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

  approvalRequests(
    actorUserId: unknown,
    { limit = 30 }: { limit?: unknown } = {},
  ): Promise<unknown[]> {
    return this.repository.approvalRequests({ actorUserId, limit });
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

  async requestApproval({
    actorUserId,
    action,
    payload,
    idempotencyKey = randomUUID(),
    requestId = null,
  }: {
    actorUserId: unknown;
    action: unknown;
    payload: unknown;
    idempotencyKey?: unknown;
    requestId?: unknown;
  }): Promise<{
    approvalRequestId: string;
    requiresTwoPersonApproval: true;
    economicRisk: boolean;
  }> {
    const approvalRequestId = await this.repository.createApprovalRequest({
      requesterId: actorUserId,
      action,
      payload,
      idempotencyKey,
      requestId,
    });
    return {
      approvalRequestId,
      // The database command only accepts policies explicitly marked as
      // two-person.  `economicRisk` is presentation metadata; PostgreSQL is
      // still the authority that rejects an unsafe or unknown action.
      requiresTwoPersonApproval: true,
      // `Set<string>.has` requires a string argument; a non-string action can
      // never be a member, matching the original untyped `.has(action)` call.
      economicRisk: typeof action === 'string' && ECONOMIC_RISK_ACTIONS.has(action),
    };
  }

  decideApproval({
    actorUserId,
    approvalRequestId,
    decision,
    reason = null,
    requestId = null,
  }: {
    actorUserId: unknown;
    approvalRequestId: unknown;
    decision: unknown;
    reason?: unknown;
    requestId?: unknown;
  }): Promise<{ approvalRequestId: string; status: string }> {
    return this.repository.decideApprovalRequest({
      approverId: actorUserId,
      approvalRequestId,
      decision,
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

export { ECONOMIC_RISK_ACTIONS };
