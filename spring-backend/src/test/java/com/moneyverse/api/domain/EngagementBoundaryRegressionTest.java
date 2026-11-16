package com.moneyverse.api.domain;

import com.moneyverse.api.domain.engagement.dto.EngagementDtos.BullBearVoteRequest;
import com.moneyverse.api.domain.engagement.service.EngagementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EngagementBoundaryRegressionTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void forgedUserHeaderIsNotSessionForStreak() throws Exception {
        mockMvc.perform(get("/api/engagement/streak")
                .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgedUserHeaderIsNotSessionForWldClaim() throws Exception {
        mockMvc.perform(post("/api/engagement/claim-streak")
                .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgedUserHeaderIsNotSessionForVoting() throws Exception {
        mockMvc.perform(post("/api/engagement/bull-bear")
                .header("X-User-Id", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20")
                .contentType("application/json")
                .content("{\"vote\":\"bull\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void databaseUnavailableNeverReturnsFabricatedStreakBalance() {
        EngagementService service = new EngagementService(mock(JdbcTemplate.class));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.getStreakStatus(UUID.randomUUID()));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void streakWldClaimDoesNotAcknowledgeUnpostedReward() {
        EngagementService service = new EngagementService(mock(JdbcTemplate.class));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.claimStreak(UUID.randomUUID()));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void voteDoesNotAcknowledgeUnpersistedVote() {
        EngagementService service = new EngagementService(mock(JdbcTemplate.class));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.submitBullBearVote(UUID.randomUUID(), new BullBearVoteRequest("bull", "MARKET_OVERALL")));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void featureStatusCannotFabricateQuestProgress() {
        EngagementService service = new EngagementService(mock(JdbcTemplate.class));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.getDopamineStatus(UUID.randomUUID()));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }
}
