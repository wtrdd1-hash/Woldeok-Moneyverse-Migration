package com.moneyverse.api.domain.identity.service;

import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final JdbcTemplate jdbcTemplate;

    public ProfileService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(String userId) {
        String sql = """
            SELECT p.*, u.email 
            FROM profiles p
            LEFT JOIN users u ON p.id = u.id
            WHERE p.id = ?::uuid
            """;
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                UserProfile p = new UserProfile();
                p.setId(rs.getString("id"));
                p.setDisplayName(rs.getString("display_name"));
                p.setEmail(rs.getString("email"));
                p.setImageUrl(rs.getString("image_url"));
                p.setJobType(rs.getString("job_type"));
                p.setJobLevel(rs.getInt("job_level"));
                p.setVisibility(rs.getString("visibility"));
                p.setFeaturedTitle(rs.getString("featured_title"));
                p.setJoinedAt(rs.getTimestamp("joined_at") != null ? rs.getTimestamp("joined_at").toInstant().toString() : Instant.now().toString());
                return p;
            }, userId);
        } catch (Exception e) {
            log.warn("[ProfileService] fallback for user {}: {}", userId, e.getMessage());
            UserProfile fallback = new UserProfile();
            fallback.setId(userId);
            fallback.setDisplayName("시민");
            fallback.setJobType("NONE");
            fallback.setJobLevel(1);
            fallback.setVisibility("PUBLIC");
            fallback.setJoinedAt(Instant.now().toString());
            return fallback;
        }
    }
}
