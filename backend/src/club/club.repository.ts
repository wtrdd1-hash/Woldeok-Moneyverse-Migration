import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ClubInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClubInputError';
  }
}

export interface ClubSummaryRow {
  readonly id: string;
  readonly tag: string;
  readonly name: string;
  readonly description: string;
  readonly owner_id: string;
  readonly owner_name: string;
  readonly join_mode: string;
  readonly status: string;
  readonly level: number;
  readonly experience: string;
  readonly member_count: number;
  readonly created_at: Date;
  readonly is_my_club: boolean;
  readonly my_role: string | null;
}

export interface ClubDetailRow extends ClubSummaryRow {
  readonly charter: string;
  readonly charter_fee_paid: string;
}

export interface ClubMemberRow {
  readonly club_id: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_key: string | null;
  readonly role: string;
  readonly joined_at: Date;
  readonly is_me: boolean;
}

export interface ClubProjectRow {
  readonly id: string;
  readonly club_id: string;
  readonly title: string;
  readonly description: string;
  readonly target_wld: string;
  readonly current_wld: string;
  readonly status: string;
  readonly reward_badge: string | null;
  readonly created_at: Date;
  readonly completed_at: Date | null;
  readonly progress_percent: number;
}

export interface ClubFeedPostRow {
  readonly id: string;
  readonly club_id: string;
  readonly author_id: string;
  readonly author_name: string;
  readonly title: string;
  readonly body: string;
  readonly is_announcement: boolean;
  readonly created_at: Date;
}

export interface CreateClubResult {
  readonly club_id: string;
  readonly tag: string;
  readonly name: string;
  readonly status: string;
  readonly created_at: Date;
}

export interface ContributeProjectResult {
  readonly contribution_id: string;
  readonly accepted_amount: string;
  readonly project_current_wld: string;
  readonly project_status: string;
}

@Injectable()
export class PostgresClubRepository {
  constructor(private readonly client: Queryable) {}

  async createClub(
    actorUserId: string,
    tag: string,
    name: string,
    description: string,
    charter: string,
    joinMode: string,
    idempotencyKey: string,
  ): Promise<CreateClubResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new ClubInputError('idempotencyKey must be a valid UUID');
    if (!tag || tag.length < 2 || tag.length > 8) throw new ClubInputError('tag must be 2-8 uppercase alphanumeric');
    if (!name || name.length < 2 || name.length > 30) throw new ClubInputError('name must be 2-30 characters');

    const row = await queryOne<CreateClubResult>(
      this.client,
      `SELECT club_id, tag, name, status, created_at
       FROM public.club_create($1::uuid, $2::text, $3::text, $4::text, $5::text, $6::text, $7::uuid);`,
      [actorUserId, tag.toUpperCase().trim(), name.trim(), description.trim(), charter.trim(), joinMode, idempotencyKey],
    );
    if (!row) throw new Error('failed to create club');
    return row;
  }

  async listClubs(
    actorUserId?: string,
    search?: string,
    limit = 50,
    offset = 0,
  ): Promise<ClubSummaryRow[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    return queryRows<ClubSummaryRow>(
      this.client,
      `SELECT
         c.id,
         c.tag,
         c.name,
         c.description,
         c.owner_id,
         COALESCE(u.display_name, '클럽장') AS owner_name,
         c.join_mode,
         c.status,
         c.level,
         c.experience::text AS experience,
         c.member_count,
         c.created_at,
         ($1::uuid IS NOT NULL AND cm_actor.user_id IS NOT NULL) AS is_my_club,
         cm_actor.role AS my_role
       FROM public.clubs c
       JOIN public.users u ON u.id = c.owner_id
       LEFT JOIN public.club_members cm_actor ON cm_actor.club_id = c.id AND cm_actor.user_id = $1::uuid
       WHERE c.status = 'active'
         AND ($2::text IS NULL OR c.name ILIKE ('%' || $2::text || '%') OR c.tag ILIKE ('%' || $2::text || '%'))
       ORDER BY c.level DESC, c.member_count DESC, c.created_at DESC
       LIMIT $3 OFFSET $4;`,
      [actorUserId ?? null, search ? search.trim() : null, safeLimit, safeOffset],
    );
  }

  async getClubById(clubId: string, actorUserId?: string): Promise<ClubDetailRow | null> {
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');

    return queryOne<ClubDetailRow>(
      this.client,
      `SELECT
         c.id,
         c.tag,
         c.name,
         c.description,
         c.charter,
         c.charter_fee_paid,
         c.owner_id,
         COALESCE(u.display_name, '클럽장') AS owner_name,
         c.join_mode,
         c.status,
         c.level,
         c.experience::text AS experience,
         c.member_count,
         c.created_at,
         ($2::uuid IS NOT NULL AND cm_actor.user_id IS NOT NULL) AS is_my_club,
         cm_actor.role AS my_role
       FROM public.clubs c
       JOIN public.users u ON u.id = c.owner_id
       LEFT JOIN public.club_members cm_actor ON cm_actor.club_id = c.id AND cm_actor.user_id = $2::uuid
       WHERE c.id = $1::uuid;`,
      [clubId, actorUserId ?? null],
    );
  }

  async joinClub(actorUserId: string, clubId: string): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');

    const club = await queryOne<{ status: string; join_mode: string }>(
      this.client,
      `SELECT status, join_mode FROM public.clubs WHERE id = $1::uuid;`,
      [clubId],
    );
    if (!club || club.status !== 'active') throw new ClubInputError('club is not active');
    if (club.join_mode !== 'public') throw new ClubInputError('club is not open for public join');

    await this.client.query(
      `INSERT INTO public.club_members (club_id, user_id, role)
       VALUES ($1::uuid, $2::uuid, 'member')
       ON CONFLICT (club_id, user_id) DO NOTHING;
       UPDATE public.clubs
       SET member_count = (SELECT count(*) FROM public.club_members WHERE club_id = $1::uuid)
       WHERE id = $1::uuid;`,
      [clubId, actorUserId],
    );
    return true;
  }

  async leaveClub(actorUserId: string, clubId: string): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');

    const member = await queryOne<{ role: string }>(
      this.client,
      `SELECT role FROM public.club_members WHERE club_id = $1::uuid AND user_id = $2::uuid;`,
      [clubId, actorUserId],
    );
    if (!member) throw new ClubInputError('not a member of this club');
    if (member.role === 'owner') throw new ClubInputError('club owner cannot leave without transferring ownership');

    await this.client.query(
      `DELETE FROM public.club_members WHERE club_id = $1::uuid AND user_id = $2::uuid;
       UPDATE public.clubs
       SET member_count = (SELECT count(*) FROM public.club_members WHERE club_id = $1::uuid)
       WHERE id = $1::uuid;`,
      [clubId, actorUserId],
    );
    return true;
  }

  async listClubMembers(
    clubId: string,
    actorUserId?: string,
    limit = 50,
    offset = 0,
  ): Promise<ClubMemberRow[]> {
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    return queryRows<ClubMemberRow>(
      this.client,
      `SELECT
         cm.club_id,
         cm.user_id,
         COALESCE(u.display_name, '클럽원') AS display_name,
         p.avatar_key,
         cm.role,
         cm.joined_at,
         ($2::uuid IS NOT NULL AND cm.user_id = $2::uuid) AS is_me
       FROM public.club_members cm
       JOIN public.users u ON u.id = cm.user_id
       LEFT JOIN public.user_profiles p ON p.user_id = u.id
       WHERE cm.club_id = $1::uuid
       ORDER BY
         CASE cm.role
           WHEN 'owner' THEN 1
           WHEN 'steward' THEN 2
           WHEN 'moderator' THEN 3
           ELSE 4
         END ASC,
         cm.joined_at ASC
       LIMIT $3 OFFSET $4;`,
      [clubId, actorUserId ?? null, safeLimit, safeOffset],
    );
  }

  async updateMemberRole(
    actorUserId: string,
    clubId: string,
    targetUserId: string,
    newRole: 'steward' | 'moderator' | 'member',
  ): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');
    if (!UUID_REGEX.test(targetUserId)) throw new ClubInputError('targetUserId must be a valid UUID');

    const actor = await queryOne<{ role: string }>(
      this.client,
      `SELECT role FROM public.club_members WHERE club_id = $1::uuid AND user_id = $2::uuid;`,
      [clubId, actorUserId],
    );
    if (!actor || (actor.role !== 'owner' && actor.role !== 'steward')) {
      throw new ClubInputError('permission denied: steward or owner required to change roles');
    }

    const target = await queryOne<{ role: string }>(
      this.client,
      `SELECT role FROM public.club_members WHERE club_id = $1::uuid AND user_id = $2::uuid;`,
      [clubId, targetUserId],
    );
    if (!target) throw new ClubInputError('target user is not a member');
    if (target.role === 'owner') throw new ClubInputError('cannot change owner role');

    await this.client.query(
      `UPDATE public.club_members SET role = $3 WHERE club_id = $1::uuid AND user_id = $2::uuid;`,
      [clubId, targetUserId, newRole],
    );
    return true;
  }

  async listClubProjects(clubId: string): Promise<ClubProjectRow[]> {
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');

    return queryRows<ClubProjectRow>(
      this.client,
      `SELECT
         p.id,
         p.club_id,
         p.title,
         p.description,
         p.target_wld,
         p.current_wld,
         p.status,
         p.reward_badge,
         p.created_at,
         p.completed_at,
         ROUND(LEAST(100, (p.current_wld::numeric / NULLIF(p.target_wld::numeric, 0)) * 100))::integer AS progress_percent
       FROM public.club_projects p
       WHERE p.club_id = $1::uuid
       ORDER BY CASE p.status WHEN 'active' THEN 1 ELSE 2 END, p.created_at DESC;`,
      [clubId],
    );
  }

  async contributeToProject(
    actorUserId: string,
    clubId: string,
    projectId: string,
    amountWld: number,
    idempotencyKey: string,
  ): Promise<ContributeProjectResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');
    if (!UUID_REGEX.test(projectId)) throw new ClubInputError('projectId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new ClubInputError('idempotencyKey must be a valid UUID');
    if (amountWld <= 0) throw new ClubInputError('amountWld must be positive');

    const row = await queryOne<ContributeProjectResult>(
      this.client,
      `SELECT contribution_id, accepted_amount::text, project_current_wld, project_status
       FROM public.club_contribute_project($1::uuid, $2::uuid, $3::uuid, $4::numeric, $5::uuid);`,
      [actorUserId, clubId, projectId, amountWld, idempotencyKey],
    );
    if (!row) throw new Error('failed to contribute to project');
    return row;
  }

  async listClubFeed(clubId: string, limit = 50): Promise<ClubFeedPostRow[]> {
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');
    const safeLimit = Math.min(Math.max(1, limit), 100);

    return queryRows<ClubFeedPostRow>(
      this.client,
      `SELECT
         f.id,
         f.club_id,
         f.author_id,
         COALESCE(u.display_name, '회원') AS author_name,
         f.title,
         f.body,
         f.is_announcement,
         f.created_at
       FROM public.club_feed_posts f
       JOIN public.users u ON u.id = f.author_id
       WHERE f.club_id = $1::uuid
       ORDER BY f.is_announcement DESC, f.created_at DESC
       LIMIT $2;`,
      [clubId, safeLimit],
    );
  }

  async createClubFeedPost(
    actorUserId: string,
    clubId: string,
    title: string,
    body: string,
    isAnnouncement = false,
  ): Promise<ClubFeedPostRow> {
    if (!UUID_REGEX.test(actorUserId)) throw new ClubInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(clubId)) throw new ClubInputError('clubId must be a valid UUID');
    if (!title || title.length < 1 || title.length > 100) throw new ClubInputError('title length must be 1-100');
    if (!body || body.length < 1 || body.length > 2000) throw new ClubInputError('body length must be 1-2000');

    // 공지사항 작성은 steward 이상만 가능
    if (isAnnouncement) {
      const member = await queryOne<{ role: string }>(
        this.client,
        `SELECT role FROM public.club_members WHERE club_id = $1::uuid AND user_id = $2::uuid;`,
        [clubId, actorUserId],
      );
      if (!member || (member.role !== 'owner' && member.role !== 'steward')) {
        throw new ClubInputError('permission denied: only steward or owner can post announcements');
      }
    }

    const row = await queryOne<ClubFeedPostRow>(
      this.client,
      `INSERT INTO public.club_feed_posts (club_id, author_id, title, body, is_announcement)
       VALUES ($1::uuid, $2::uuid, $3::text, $4::text, $5::boolean)
       RETURNING id, club_id, author_id, (SELECT COALESCE(display_name, '회원') FROM public.users WHERE id = $2::uuid) AS author_name, title, body, is_announcement, created_at;`,
      [clubId, actorUserId, title.trim(), body.trim(), isAnnouncement],
    );
    if (!row) throw new Error('failed to create feed post');
    return row;
  }
}
