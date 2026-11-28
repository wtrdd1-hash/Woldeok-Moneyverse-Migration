package com.moneyverse.api.domain.club.service;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Club reads ported from the NestJS ClubRepository. A DB failure is 503, never an empty list. */
@Service
public class ClubReadService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ClubReadService.class);
    private static final String ISO = "'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'";
    private static final String CLUB_COLUMNS = "c.id::text AS id, c.tag, c.name, c.description, c.owner_id::text AS owner_id, "
            + "COALESCE(public.member_board_author_name(c.owner_id), '클럽장') AS owner_name, c.join_mode, c.status, c.level, c.experience::text AS experience, "
            + "c.member_count, to_char(c.created_at AT TIME ZONE 'UTC', " + ISO + ") AS created_at, "
            + "(cm_actor.user_id IS NOT NULL) AS is_my_club, cm_actor.role AS my_role";
    private final JdbcClient jdbc;

    public ClubReadService(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> list(UUID actor, String search, int limit, int offset) {
        return run(() -> jdbc.sql("SELECT " + CLUB_COLUMNS + " FROM public.clubs c "
                        + "LEFT JOIN public.club_members cm_actor ON cm_actor.club_id = c.id AND cm_actor.user_id = ?::uuid "
                        + "WHERE c.status = 'active' AND (?::text IS NULL OR c.name ILIKE ('%' || ?::text || '%') OR c.tag ILIKE ('%' || ?::text || '%')) "
                        + "ORDER BY c.level DESC, c.member_count DESC, c.created_at DESC LIMIT ? OFFSET ?")
                .param(actor).param(search).param(search).param(search).param(limit).param(offset).query().listOfRows());
    }

    public Optional<Map<String, Object>> get(UUID club, UUID actor) {
        return run(() -> jdbc.sql("SELECT " + CLUB_COLUMNS + ", c.charter, c.charter_fee_paid FROM public.clubs c "
                        + "LEFT JOIN public.club_members cm_actor ON cm_actor.club_id = c.id AND cm_actor.user_id = ?::uuid WHERE c.id = ?::uuid")
                .param(actor).param(club).query().listOfRows().stream().findFirst());
    }

    public List<Map<String, Object>> members(UUID club, UUID actor, int limit, int offset) {
        return run(() -> jdbc.sql("SELECT cm.club_id::text AS club_id, cm.user_id::text AS user_id, COALESCE(public.member_board_author_name(cm.user_id), '클럽원') AS display_name, "
                        + "public.member_profile_image_for(?::uuid, cm.user_id) AS avatar_key, cm.role, to_char(cm.joined_at AT TIME ZONE 'UTC', " + ISO + ") AS joined_at, (cm.user_id = ?::uuid) AS is_me "
                        + "FROM public.club_members cm "
                        + "WHERE cm.club_id = ?::uuid ORDER BY CASE cm.role WHEN 'owner' THEN 1 WHEN 'steward' THEN 2 WHEN 'moderator' THEN 3 ELSE 4 END, cm.joined_at "
                        + "LIMIT ? OFFSET ?")
                .param(actor).param(actor).param(club).param(limit).param(offset).query().listOfRows());
    }

    public List<Map<String, Object>> projects(UUID club) {
        return run(() -> jdbc.sql("SELECT p.id::text AS id, p.club_id::text AS club_id, p.title, p.description, p.target_wld::text AS target_wld, "
                        + "p.current_wld::text AS current_wld, p.status, p.reward_badge, to_char(p.created_at AT TIME ZONE 'UTC', " + ISO + ") AS created_at, "
                        + "CASE WHEN p.completed_at IS NULL THEN NULL ELSE to_char(p.completed_at AT TIME ZONE 'UTC', " + ISO + ") END AS completed_at, "
                        + "ROUND(LEAST(100, (p.current_wld::numeric / NULLIF(p.target_wld::numeric, 0)) * 100))::integer AS progress_percent "
                        + "FROM public.club_projects p WHERE p.club_id = ?::uuid ORDER BY CASE p.status WHEN 'active' THEN 1 ELSE 2 END, p.created_at DESC")
                .param(club).query().listOfRows());
    }

    public List<Map<String, Object>> feed(UUID club, int limit) {
        return run(() -> jdbc.sql("SELECT f.id::text AS id, f.club_id::text AS club_id, f.author_id::text AS author_id, COALESCE(public.member_board_author_name(f.author_id), '회원') AS author_name, "
                        + "f.title, f.body, f.is_announcement, to_char(f.created_at AT TIME ZONE 'UTC', " + ISO + ") AS created_at "
                        + "FROM public.club_feed_posts f WHERE f.club_id = ?::uuid "
                        + "ORDER BY f.is_announcement DESC, f.created_at DESC LIMIT ?")
                .param(club).param(limit).query().listOfRows());
    }

    public Optional<Map<String, Object>> canvas(UUID club) {
        return run(() -> jdbc.sql("SELECT grid::text AS grid, total_score AS \"totalScore\", to_char(updated_at AT TIME ZONE 'UTC', " + ISO + ") AS \"updatedAt\" "
                        + "FROM public.club_canvas_read(?::uuid)").param(club).query().listOfRows().stream().findFirst());
    }

    private interface Call<T> { T get(); }

    private static <T> T run(Call<T> call) {
        try { return call.get(); }
        catch (RuntimeException e) { logDbFailure("club", e); throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CLUB_SOURCE_UNAVAILABLE"); }
    }

    /** Logs the cause of a refused/unavailable DB call (SQLSTATE + message, no parameters). */
    static void logDbFailure(String where, Throwable e) {
        Throwable c = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof java.sql.SQLException sql ? sql.getSQLState() : "-";
        log.warn("[{}] db call failed: {} sqlstate={} {}", where, c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
    }
}
