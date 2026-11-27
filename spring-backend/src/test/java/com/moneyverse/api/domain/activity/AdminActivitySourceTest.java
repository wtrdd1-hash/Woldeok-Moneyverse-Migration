package com.moneyverse.api.domain.activity;

import com.moneyverse.api.domain.activity.service.ActivityService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * The administrator activity log and traffic dashboard used to answer generated sample rows and
 * fixed figures (14,280 page views, a constant admin user id). They now come from
 * admin_activity_list_logs / admin_activity_traffic_dashboard (202), which check the role themselves.
 */
class AdminActivitySourceTest {
    @Test void logsComeFromTheRoleCheckedFunctionForTheVerifiedAdministrator() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID admin = UUID.randomUUID();
        new ActivityService(jdbc).adminLogs(admin, null, null, 50, 0);
        verify(jdbc).query(contains("public.admin_activity_list_logs(?::uuid, ?, ?, ?, ?::uuid)"), any(RowMapper.class),
                eq(admin), eq(50), eq(0), isNull(), isNull());
    }

    @Test void trafficComesFromTheRoleCheckedFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID admin = UUID.randomUUID();
        when(jdbc.queryForObject(contains("public.admin_activity_traffic_dashboard(?::uuid, ?, ?)"), eq(String.class), eq(admin), eq("day"), eq(30)))
                .thenReturn("{\"granularity\":\"day\",\"summary\":{\"pageViews\":3}}");
        Map<String, Object> traffic = new ActivityService(jdbc).adminTraffic(admin, "day", 30);
        assertEquals("day", traffic.get("granularity"));
        assertEquals(3, ((Map<?, ?>) traffic.get("summary")).get("pageViews"));
    }

    @Test void unreadableSourcesAreUnavailableNotSamples() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(anyString(), eq(String.class), any(), any(), any())).thenThrow(new DataAccessResourceFailureException("down"));
        assertEquals(503, assertThrows(ResponseStatusException.class,
                () -> new ActivityService(jdbc).adminTraffic(UUID.randomUUID(), "day", 30)).getStatusCode().value());
        assertEquals(401, assertThrows(ResponseStatusException.class,
                () -> new ActivityService(jdbc).adminTraffic(null, "day", 30)).getStatusCode().value());
    }
}
