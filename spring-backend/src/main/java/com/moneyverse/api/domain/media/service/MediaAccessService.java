package com.moneyverse.api.domain.media.service;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * The database decides who may read or register a stored image (028/112, 094, 122, 173, 175,
 * 176, 295), as the legacy gateway did. Security review 2026-11-28: the Spring media routes served
 * any well-formed key to anyone — private chat attachments, unreviewed photo submissions and images
 * of hidden board posts — and the uploads wrote registry tables the application role cannot touch.
 * A failed check is a 503 (state unknown), never a silent allow.
 */
@Service
public class MediaAccessService {
    private final JdbcTemplate jdbc;

    public MediaAccessService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean publishedPhoto(String key) {
        return ask("SELECT public.content_is_public_storage_key(?)", key);
    }

    public boolean ownSubmission(UUID viewer, String key) {
        return viewer != null && ask("SELECT public.content_storage_key_visible(?::uuid, ?)", viewer.toString(), key);
    }

    public boolean profileImage(UUID viewer, String key) {
        return ask("SELECT public.member_profile_image_visible(?::uuid, ?)", viewer == null ? null : viewer.toString(), key);
    }

    public boolean boardImageForMember(UUID actor, String key) {
        return actor != null && ask("SELECT public.member_board_image_visible(?::uuid, ?)", actor.toString(), key);
    }

    public boolean boardImageForPublic(String key) {
        return ask("SELECT public.member_board_public_image_visible(?)", key);
    }

    public boolean chatMedia(UUID actor, String key, UUID session) {
        return actor != null && ask("SELECT public.chat_media_visible(?::uuid, ?::text, ?::uuid)",
                actor.toString(), key, session == null ? null : session.toString());
    }

    public boolean registerChatMedia(UUID actor, String key) {
        return ask("SELECT public.chat_media_register(?::uuid, ?::text)", actor.toString(), key);
    }

    public boolean registerBoardImage(UUID actor, String key) {
        return ask("SELECT public.member_board_register_image_upload(?::uuid, ?)", actor.toString(), key);
    }

    private boolean ask(String sql, Object... args) {
        try {
            return Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, args));
        } catch (DataAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "MEDIA_ACCESS_UNAVAILABLE");
        }
    }
}
