package com.moneyverse.api.domain.board.service;

import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Member board posts and replies through the member_board_* SECURITY DEFINER
 * functions (ported from the NestJS BoardRepository). Rows are mapped to the
 * camelCase shape the Next pages read; a DB outage is 503, never an empty board.
 */
@Service
public class BoardPostsService {
    public static final Pattern STORAGE_KEY = Pattern.compile("^[0-9a-f-]{36}\\.(png|jpg|webp)$");
    private static final int LIST_LIMIT = 50;
    private static final int COMMENT_LIMIT = 200;
    private static final String SUMMARY = "post_id::text AS post_id, title, author_name, created_at, updated_at, comment_count, mine, image_storage_key, image_alt_text";
    private static final String POST = "post_id::text AS post_id, title, body, author_name, author_user_id::text AS author_user_id, created_at, updated_at, mine, image_storage_key, image_alt_text";
    private static final String COMMENT = "comment_id::text AS comment_id, body, author_name, author_user_id::text AS author_user_id, created_at, mine";
    private static final Set<String> REFUSALS = Set.of("22023", "42501", "P0001", "23514", "23505");

    private final JdbcClient jdbc;

    public BoardPostsService(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> list(UUID actor) {
        return run(() -> jdbc.sql("SELECT " + SUMMARY + " FROM public.member_board_list(?::uuid, ?)")
                .param(actor).param(LIST_LIMIT).query().listOfRows().stream().map(BoardPostsService::summary).toList());
    }

    public Optional<Map<String, Object>> get(UUID actor, UUID post) {
        return run(() -> first(jdbc.sql("SELECT " + POST + " FROM public.member_board_get(?::uuid, ?::uuid)")
                .param(actor).param(post).query().listOfRows()).map(BoardPostsService::post));
    }

    public Optional<Map<String, Object>> publicGet(UUID post) {
        return run(() -> first(jdbc.sql("SELECT " + POST + " FROM public.member_board_public_get(?::uuid)")
                .param(post).query().listOfRows()).map(BoardPostsService::post));
    }

    public Map<String, Object> create(UUID actor, String title, String body, UUID key, String imageKey, String imageAlt) {
        return run(() -> first(jdbc.sql("SELECT " + POST + " FROM public.member_board_create_with_image(?::uuid, ?::text, ?::text, ?::uuid, ?::text, ?::text)")
                .param(actor).param(title).param(body).param(key).param(imageKey).param(imageAlt).query().listOfRows())
                .map(BoardPostsService::post).orElseThrow(() -> unavailable("BOARD_RECEIPT_MISSING")));
    }

    public Optional<Map<String, Object>> update(UUID actor, UUID post, String title, String body, UUID key) {
        return run(() -> first(jdbc.sql("SELECT " + POST + " FROM public.member_board_update(?::uuid, ?::uuid, ?::text, ?::text, ?::uuid)")
                .param(actor).param(post).param(title).param(body).param(key).query().listOfRows()).map(BoardPostsService::post));
    }

    public boolean delete(UUID actor, UUID post, UUID key) {
        return run(() -> Boolean.TRUE.equals(jdbc.sql("SELECT public.member_board_delete(?::uuid, ?::uuid, ?::uuid)")
                .param(actor).param(post).param(key).query(Boolean.class).single()));
    }

    public List<Map<String, Object>> comments(UUID actor, UUID post) {
        return run(() -> jdbc.sql("SELECT " + COMMENT + " FROM public.member_board_comment_list(?::uuid, ?::uuid, ?)")
                .param(actor).param(post).param(COMMENT_LIMIT).query().listOfRows().stream().map(BoardPostsService::comment).toList());
    }

    public List<Map<String, Object>> publicComments(UUID post) {
        return run(() -> jdbc.sql("SELECT " + COMMENT + " FROM public.member_board_public_comment_list(?::uuid, ?)")
                .param(post).param(COMMENT_LIMIT).query().listOfRows().stream().map(BoardPostsService::comment).toList());
    }

    public Map<String, Object> reply(UUID actor, UUID post, String body, UUID key) {
        return run(() -> first(jdbc.sql("SELECT comment_id::text AS comment_id, body, author_name, created_at, mine FROM public.member_board_comment_create(?::uuid, ?::uuid, ?::text, ?::uuid)")
                .param(actor).param(post).param(body).param(key).query().listOfRows())
                .map(BoardPostsService::comment).orElseThrow(() -> unavailable("BOARD_RECEIPT_MISSING")));
    }

    public boolean deleteComment(UUID actor, UUID comment, UUID key) {
        return run(() -> Boolean.TRUE.equals(jdbc.sql("SELECT public.member_board_comment_delete(?::uuid, ?::uuid, ?::uuid)")
                .param(actor).param(comment).param(key).query(Boolean.class).single()));
    }

    // ---- row mapping (public for tests) ----

    public static Map<String, Object> summary(Map<String, Object> r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("postId", r.get("post_id"));
        m.put("title", r.get("title"));
        m.put("authorName", r.get("author_name"));
        m.put("createdAt", iso(r.get("created_at")));
        m.put("updatedAt", iso(r.get("updated_at")));
        m.put("commentCount", r.get("comment_count") instanceof Number n ? n.intValue() : 0);
        m.put("mine", Boolean.TRUE.equals(r.get("mine")));
        image(r, m);
        return m;
    }

    public static Map<String, Object> post(Map<String, Object> r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("postId", r.get("post_id"));
        m.put("title", r.get("title"));
        m.put("body", r.get("body"));
        m.put("authorName", r.get("author_name"));
        m.put("authorUserId", r.get("author_user_id"));
        m.put("createdAt", iso(r.get("created_at")));
        m.put("updatedAt", iso(r.get("updated_at")));
        m.put("mine", Boolean.TRUE.equals(r.get("mine")));
        image(r, m);
        return m;
    }

    public static Map<String, Object> comment(Map<String, Object> r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("commentId", r.get("comment_id"));
        m.put("body", r.get("body"));
        m.put("authorName", r.get("author_name"));
        m.put("authorUserId", r.get("author_user_id"));
        m.put("createdAt", iso(r.get("created_at")));
        m.put("mine", Boolean.TRUE.equals(r.get("mine")));
        return m;
    }

    private static void image(Map<String, Object> r, Map<String, Object> m) {
        Object key = r.get("image_storage_key");
        if (key == null) {
            m.put("imageUrl", null);
            m.put("imageAltText", null);
            return;
        }
        if (!(key instanceof String s) || !STORAGE_KEY.matcher(s).matches()) throw unavailable("BOARD_IMAGE_KEY_INVALID");
        m.put("imageUrl", "/media/board/" + s);
        m.put("imageAltText", r.get("image_alt_text"));
    }

    private static String iso(Object value) {
        if (value == null) return null;
        OffsetDateTime t;
        if (value instanceof OffsetDateTime o) t = o;
        else if (value instanceof Timestamp ts) t = ts.toInstant().atOffset(ZoneOffset.UTC);
        else if (value instanceof java.time.Instant i) t = i.atOffset(ZoneOffset.UTC);
        else return value.toString();
        return t.withOffsetSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME).replace("+00:00", "Z");
    }

    private static <T> Optional<T> first(List<T> rows) { return rows.stream().findFirst(); }

    private interface Call<T> { T get(); }

    private static <T> T run(Call<T> call) {
        try {
            return call.get();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            Throwable cause = NestedExceptionUtils.getMostSpecificCause(e);
            if (cause instanceof SQLException sql && sql.getSQLState() != null && REFUSALS.contains(sql.getSQLState())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "BOARD_REQUEST_REFUSED");
            }
            throw unavailable("BOARD_SOURCE_UNAVAILABLE");
        }
    }

    private static ResponseStatusException unavailable(String code) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, code);
    }
}
