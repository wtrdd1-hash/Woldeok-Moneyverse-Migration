package com.moneyverse.api.domain.board;

import com.moneyverse.api.domain.admin.controller.AdminDiscordController;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Admin event history must never reveal data to a header actor or invent delivery. */
class AdminDiscordSourceTruthTest {
 private final JdbcTemplate jdbc=mock(JdbcTemplate.class);
 private final AdminAuthService auth=mock(AdminAuthService.class);
 private final AdminDiscordController controller=new AdminDiscordController(jdbc,auth);

 @Test void anonymousLegacyAdminPathCannotReadOutbox(){
  var request=new MockHttpServletRequest("GET","/admin/discord-outbox-events");
  request.addHeader("X-User-Id",UUID.randomUUID().toString());
  var response=controller.getDiscordOutboxEvents(request);
  assertEquals(401,response.getStatusCode().value());
  verifyNoInteractions(jdbc);
 }
 @Test void authenticatedEmptyOutboxIsActuallyEmptyNotInventedDeliveredEvent(){
  var request=new MockHttpServletRequest("GET","/admin/discord-outbox-events");
  when(auth.resolveVerifiedAdminActor(request)).thenReturn(Optional.of(UUID.randomUUID()));
  when(jdbc.queryForList(anyString())).thenReturn(List.of());
  var response=controller.getDiscordOutboxEvents(request);
  assertEquals(200,response.getStatusCode().value());
  assertEquals(List.of(),response.getBody().get("events"));
 }
 @Test void sourceOutageIs503NeverFakeDelivered(){
  var request=new MockHttpServletRequest("GET","/admin/discord-outbox-events");
  when(auth.resolveVerifiedAdminActor(request)).thenReturn(Optional.of(UUID.randomUUID()));
  when(jdbc.queryForList(anyString())).thenThrow(new IllegalStateException("DB down"));
  var response=controller.getDiscordOutboxEvents(request);
  assertEquals(503,response.getStatusCode().value());
  assertFalse(response.getBody().toString().contains("delivered"));
 }
}
