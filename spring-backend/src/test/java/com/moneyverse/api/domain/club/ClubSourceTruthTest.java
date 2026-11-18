package com.moneyverse.api.domain.club;

import com.moneyverse.api.domain.club.service.ClubService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ClubSourceTruthTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final ClubService service = new ClubService(jdbc);

    @Test void catalogueDatabaseErrorCannotMasqueradeAsValidEmptyClubs() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.listClubs(50));
    }

    @Test void detailDatabaseErrorCannotCreateFakeClub() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.getClub(UUID.randomUUID(), null));
    }

    @Test void unimplementedJoinCannotClaimSuccess() {
        assertThrows(ResponseStatusException.class, () -> service.joinClub(UUID.randomUUID(), UUID.randomUUID()));
    }
}
