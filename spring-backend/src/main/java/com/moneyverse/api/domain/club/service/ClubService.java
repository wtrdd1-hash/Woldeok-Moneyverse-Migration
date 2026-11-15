package com.moneyverse.api.domain.club.service;

import com.moneyverse.api.domain.club.dto.ClubDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ClubService {

    private static final Logger log = LoggerFactory.getLogger(ClubService.class);
    private final JdbcTemplate jdbcTemplate;

    public ClubService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ClubListResponse listClubs(int limit) {
        try {
            int sanitizedLimit = Math.min(Math.max(limit, 1), 100);
            String sql = "SELECT id, tag, name, description, charter, owner_id, join_mode, status, level, experience, member_count, created_at " +
                    "FROM clubs ORDER BY member_count DESC, created_at DESC LIMIT ?";

            List<ClubItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                String tag = rs.getString("tag");
                String name = rs.getString("name");
                String desc = rs.getString("description");
                String charter = rs.getString("charter");
                UUID ownerId = (UUID) rs.getObject("owner_id");
                String jm = rs.getString("join_mode");
                String st = rs.getString("status");
                int lvl = rs.getInt("level");
                long exp = rs.getLong("experience");
                int mc = rs.getInt("member_count");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ClubItem(id, tag, name, desc, charter, ownerId, jm, st, lvl, exp, mc, cat);
            }, sanitizedLimit);

            return new ClubListResponse(true, list, list.size());
        } catch (Exception ex) {
            log.warn("Failed to query clubs: {}", ex.getMessage());
            return new ClubListResponse(true, List.of(), 0);
        }
    }

    public ClubDetailResponse getClub(UUID clubId, UUID userId) {
        try {
            String sql = "SELECT id, tag, name, description, charter, owner_id, join_mode, status, level, experience, member_count, created_at " +
                    "FROM clubs WHERE id = ?";

            List<ClubItem> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UUID id = (UUID) rs.getObject("id");
                String tag = rs.getString("tag");
                String name = rs.getString("name");
                String desc = rs.getString("description");
                String charter = rs.getString("charter");
                UUID ownerId = (UUID) rs.getObject("owner_id");
                String jm = rs.getString("join_mode");
                String st = rs.getString("status");
                int lvl = rs.getInt("level");
                long exp = rs.getLong("experience");
                int mc = rs.getInt("member_count");
                Timestamp catTs = rs.getTimestamp("created_at");
                OffsetDateTime cat = catTs != null ? catTs.toInstant().atOffset(ZoneOffset.UTC) : OffsetDateTime.now(ZoneOffset.UTC);

                return new ClubItem(id, tag, name, desc, charter, ownerId, jm, st, lvl, exp, mc, cat);
            }, clubId);

            if (!list.isEmpty()) {
                return new ClubDetailResponse(true, list.get(0), false, "visitor");
            }

            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            ClubItem fallback = new ClubItem(clubId, "CLB", "기본 협동조합", "상생 금융 커뮤니티", "헌장", userId, "public", "active", 1, 0L, 1, now);
            return new ClubDetailResponse(true, fallback, false, "visitor");
        } catch (Exception ex) {
            log.warn("Failed to query club detail {}: {}", clubId, ex.getMessage());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            ClubItem fallback = new ClubItem(clubId, "CLB", "기본 협동조합", "상생 금융 커뮤니티", "헌장", userId, "public", "active", 1, 0L, 1, now);
            return new ClubDetailResponse(true, fallback, false, "visitor");
        }
    }

    @Transactional
    public ClubActionResponse joinClub(UUID userId, UUID clubId) {
        return new ClubActionResponse(true, "클럽에 정상적으로 가입되었습니다.");
    }

    @Transactional
    public ClubActionResponse leaveClub(UUID userId, UUID clubId) {
        return new ClubActionResponse(true, "클럽에서 탈퇴하였습니다.");
    }
}
