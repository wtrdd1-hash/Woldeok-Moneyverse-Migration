package com.moneyverse.api.domain.earlygame;

import com.moneyverse.api.domain.earlygame.controller.EarlyGameController;
import com.moneyverse.api.domain.earlygame.controller.EarlyGameReadsController;
import com.moneyverse.api.domain.engagement.controller.EngagementController;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import com.moneyverse.api.domain.progression.controller.ProgressionController;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.postgresql.util.PGobject;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Signed-in sweep 2026-11-25: /quests, /progression, /calendar and /account/notifications showed
 * "불러오지 못했어요" because these reads were 503 placeholders or missing, although the NestJS
 * DB functions exist with EXECUTE for the app role. Values must come out the way node-pg gave
 * them to the pages: int8/numeric as strings, json as objects, timestamps as ISO milliseconds.
 */
class EarlyGameReadsTest {
    @Test void valuesMatchTheNodePgShapes() throws Exception {
        PGobject json = new PGobject();
        json.setType("jsonb");
        json.setValue("{\"a\":[1,2]}");
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("big", 12L);
        row.put("num", new BigDecimal("3.50"));
        row.put("int", 7);
        row.put("json", json);
        row.put("at", Timestamp.from(Instant.parse("2026-11-25T01:02:03Z")));
        row.put("none", null);
        Map<String, Object> out = EarlyGameReadsController.nodeShape(row);
        assertEquals("12", out.get("big"));
        assertEquals("3.50", out.get("num"));
        assertEquals(7, out.get("int"));
        assertEquals(Map.of("a", List.of(1, 2)), out.get("json"));
        assertEquals("2026-11-25T01:02:03.000Z", out.get("at"));
        assertTrue(out.containsKey("none"));
    }

    @Test void oldPlaceholdersNoLongerOwnTheReadPaths() {
        assertFalse(hasGet(EarlyGameController.class, "/today"));
        assertFalse(hasGet(EarlyGameController.class, "/first-day"));
        assertFalse(hasGet(ProgressionController.class, ""));
        assertFalse(hasGet(ProgressionController.class, "/early-game"));
        assertFalse(hasGet(EngagementController.class, ""));
    }

    @Test void signedOutCallerNeverReachesTheDatabase() {
        MemberApiGuard guard = mock(MemberApiGuard.class);
        JdbcClient jdbc = mock(JdbcClient.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(guard.actor(request)).thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        var c = new EarlyGameReadsController(jdbc, guard);
        assertThrows(ResponseStatusException.class, () -> c.today(request));
        assertThrows(ResponseStatusException.class, () -> c.engagement(request));
        assertThrows(ResponseStatusException.class, () -> c.credit(request));
        verifyNoInteractions(jdbc);
    }

    private static boolean hasGet(Class<?> type, String path) {
        for (Method m : type.getDeclaredMethods()) {
            GetMapping g = m.getAnnotation(GetMapping.class);
            if (g == null) continue;
            String[] paths = g.value().length > 0 ? g.value() : g.path();
            if (paths.length == 0 && path.isEmpty()) return true;
            if (Arrays.asList(paths).contains(path)) return true;
        }
        return false;
    }
}
