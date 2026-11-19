package com.moneyverse.api.domain.notification;

import com.moneyverse.api.domain.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NotificationCanonicalContractTest {
    final JdbcTemplate jdbc=mock(JdbcTemplate.class);
    final NotificationService service=new NotificationService(jdbc);
    final UUID actor=UUID.randomUUID();

    @Test void notificationListUsesActorScopedSecurityDefinerFunction() {
        when(jdbc.query(contains("public.member_notifications_list"),any(RowMapper.class),eq(actor),eq(25),eq(false)))
                .thenReturn(List.of());
        when(jdbc.queryForObject(contains("public.member_notifications_unread_count"),eq(Integer.class),eq(actor))).thenReturn(0);
        when(jdbc.queryForObject(contains("public.member_notifications_total_count"),eq(Integer.class),eq(actor))).thenReturn(0);
        var result=service.listNotifications(actor,25,false);
        assertTrue(result.ok());
        verify(jdbc).query(contains("public.member_notifications_list"),any(RowMapper.class),eq(actor),eq(25),eq(false));
    }

    @Test void unreadCountUsesVerifiedOwnerFunction() {
        when(jdbc.queryForObject(contains("public.member_notifications_unread_count"),eq(Integer.class),eq(actor))).thenReturn(2);
        assertEquals(2,service.unreadCount(actor));
    }
}
