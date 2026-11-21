package com.moneyverse.api.domain.status;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class StatusSourceTruthPolicyTest {
    private static final Instant NOW=Instant.parse("2026-11-19T00:00:00Z");

    @Test void freshSourceCanReportItsActualRecordedState() {
        var row=StatusSourceTruthPolicy.evaluate("web","Web", "operational",NOW.minusSeconds(30),180,NOW);
        assertEquals("operational",row.state());
        assertEquals("fresh",row.freshnessState());
        assertEquals(30_000L,row.ageMs());
        assertEquals("status-v1",row.policyVersion());
        assertEquals("2026-11-18T23:59:30.000Z",row.observedAt());
    }

    @Test void stalePreviouslyHealthySourceNeverLooksHealthyToday() {
        var row=StatusSourceTruthPolicy.evaluate("api","Economy API","operational",NOW.minusSeconds(172800),180,NOW);
        assertEquals("unknown",row.state());
        assertEquals("stale",row.freshnessState());
        assertEquals(172800000L,row.ageMs());
        assertNotNull(row.observedAt());
    }

    @Test void absentAndFutureAndInvalidStatesCannotProduceHealthyBadge() {
        var absent=StatusSourceTruthPolicy.evaluate("database","DB",null,null,180,NOW);
        assertEquals("unknown",absent.state());
        assertEquals("unknown",absent.freshnessState());
        assertNull(absent.observedAt());
        assertNull(absent.ageMs());
        var future=StatusSourceTruthPolicy.evaluate("web","Web","operational",NOW.plusSeconds(60),180,NOW);
        assertEquals("unknown",future.state());
        assertEquals("unknown",future.freshnessState());
        var invalid=StatusSourceTruthPolicy.evaluate("web","Web","BOGUS",NOW.minusSeconds(20),180,NOW);
        assertEquals("unknown",invalid.state());
        assertEquals("unknown",invalid.freshnessState());
    }

    @Test void worstFirstNeverAveragesOutConfirmedOutageOrMissing() {
        assertEquals("outage", StatusSourceTruthPolicy.overall(java.util.List.of("operational","unknown","outage")));
        assertEquals("unknown", StatusSourceTruthPolicy.overall(java.util.List.of("operational","unknown")));
        assertEquals("unknown", StatusSourceTruthPolicy.overall(java.util.List.of()));
    }
}
