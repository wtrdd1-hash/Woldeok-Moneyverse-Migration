package com.moneyverse.api.domain.admin.service;

import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SystemLogSourceMetadataTest {
    @Test void unmatchedFilterCannotTurnReadFailureIntoAnEmptySuccess(){
        for(String line:List.of("[WARN] Log file not found on current host: /fixture","[ERROR] Failed to read logs: unavailable","[WARN] Log fetch timed out after 4 seconds","-- No entries --")){
            var result=SystemLogService.responseFor(SystemLogSource.NGINX_ERROR,10,"xyz",List.of(line),Instant.EPOCH);
            assertEquals("UNAVAILABLE",result.status());assertFalse(result.sourceAvailable());assertTrue(result.lines().isEmpty());
        }
    }
    @Test void genuineEmptyAndSuccessfulFilteredReadRetainExplicitSourceEvidence(){
        var empty=SystemLogService.responseFor(SystemLogSource.NGINX_ERROR,10,"xyz",List.of("actual fixture entry"),Instant.EPOCH);
        assertEquals("EMPTY",empty.status());assertTrue(empty.sourceAvailable());assertEquals(0,empty.totalCount());
        var success=SystemLogService.responseFor(SystemLogSource.NGINX_ERROR,10,"fixture",List.of("actual fixture entry"),Instant.EPOCH);
        assertEquals("OK",success.status());assertTrue(success.sourceAvailable());assertEquals(List.of("actual fixture entry"),success.lines());
    }
}
