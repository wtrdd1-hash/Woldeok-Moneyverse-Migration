package com.moneyverse.api.domain.identity.service;

import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.UUID;

/** Privacy-aware canonical member profile source, not the nonexistent legacy profiles table. */
@Service
public class ProfileService {
    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final JdbcTemplate jdbcTemplate;

    public ProfileService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Transactional(readOnly = true)
    public UserProfile getProfile(String userId) {
        UUID subject = parseSubject(userId);
        return getProfile(userId, subject);
    }

    /** The viewer is the verified server session actor, or null for an anonymous public profile. */
    @Transactional(readOnly = true)
    public UserProfile getProfile(String userId, UUID verifiedViewer) {
        UUID subject = parseSubject(userId);
        String sql = "SELECT display_name, image_url, joined_at, job_type::text, job_level, " +
                "work_completions::text, visibility::text, featured_title " +
                "FROM public.member_profile_view(?::uuid, ?::uuid)";
        try {
            UserProfile result = jdbcTemplate.queryForObject(sql, (rs, n) -> {
                UserProfile profile = new UserProfile();
                profile.setId(subject.toString());
                profile.setDisplayName(rs.getString("display_name"));
                profile.setImageUrl(rs.getString("image_url"));
                profile.setJobType(rs.getString("job_type"));
                profile.setJobLevel((Integer)rs.getObject("job_level"));
                profile.setWorkCompletions(rs.getString("work_completions"));
                profile.setVisibility(rs.getString("visibility"));
                profile.setFeaturedTitle(rs.getString("featured_title"));
                Timestamp joined = rs.getTimestamp("joined_at");
                profile.setJoinedAt(joined == null ? null : joined.toInstant().toString());
                // Email never comes from the public member_profile_view privacy boundary.
                profile.setEmail(null);
                return profile;
            }, verifiedViewer, subject);
            if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND");
            return result;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            // Canonical DB function raises SQLSTATE 28000 if viewer/subject cannot see the profile.
            Throwable current=e;
            while (current!=null) {
                if (current instanceof SQLException sqlError && "28000".equals(sqlError.getSQLState())) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PROFILE_NOT_VISIBLE");
                }
                current=current.getCause();
            }
            log.warn("[ProfileService] canonical member_profile_view unavailable");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PROFILE_SOURCE_UNAVAILABLE");
        }
    }

    private static UUID parseSubject(String text) {
        try { return UUID.fromString(text); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_PROFILE_ID"); }
    }
}
