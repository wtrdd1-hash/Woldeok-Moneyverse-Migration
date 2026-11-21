package com.moneyverse.api.domain.notification;

import com.moneyverse.api.domain.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NotificationSourceTruthTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final NotificationService service = new NotificationService(jdbc);

    @Test void databaseDownIsNotSuccessEmptyNotificationInbox() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.listNotifications(UUID.randomUUID(), 25, false));
    }

    @Test void databaseDownIsNotZeroUnread() {
        when(jdbc.queryForObject(anyString(), eq(Integer.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.unreadCount(UUID.randomUUID()));
    }

    @Test void updateErrorCannotReturnSuccessfulMarkAllReadReceipt() {
        when(jdbc.update(anyString(), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.markAllReadWithReceipt(UUID.randomUUID()));
    }
}
