package com.moneyverse.api.domain.status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * The actual public content-status collector is the exclusive source of truth.
 * Latest observation per publicly visible active source only. It must be fresh
 * under each source's DB-configured policy; a stale recorded healthy value is
 * reported as unknown, never as the current condition.  No synthetic success.
 */
@Service
public class StatusTruthService {
    private static final Logger log=LoggerFactory.getLogger(StatusTruthService.class);
    private final JdbcClient jdbc;
    public StatusTruthService(JdbcClient jdbc){this.jdbc=jdbc;}

    public StatusSourceTruthPolicy.StatusResponse publicStatus(){
        Instant now=Instant.now();
        try {
            List<StatusSourceTruthPolicy.StatusRow> rows=jdbc.sql("""
                    SELECT s.source_key, s.display_name, s.stale_after_seconds,
                           last_seen.state, last_seen.observed_at
                    FROM public.content_status_sources AS s
                    LEFT JOIN LATERAL (
                        SELECT snap.state,snap.observed_at
                        FROM public.content_status_snapshots AS snap
                        WHERE snap.source_key=s.source_key
                        ORDER BY snap.observed_at DESC,snap.id DESC LIMIT 1
                    ) AS last_seen ON TRUE
                    WHERE s.public_visible=TRUE AND s.active=TRUE
                    ORDER BY s.sort_order,s.source_key
                    LIMIT 200
                    """).query((rs,i)->{
                        Timestamp timestamp=rs.getTimestamp("observed_at");
                        return StatusSourceTruthPolicy.evaluate(
                                rs.getString("source_key"),rs.getString("display_name"),
                                rs.getString("state"),timestamp==null?null:timestamp.toInstant(),
                                rs.getInt("stale_after_seconds"),now);
                    }).list();
            // Empty public status sources is a legitimate absence of evidence,
            // never an excuse to return a fabricated green or private sources.
            return new StatusSourceTruthPolicy.StatusResponse(List.copyOf(rows));
        }catch(Exception e){
            log.warn("Public status collector source query unavailable; returning 503, never synthetic green");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"STATUS_COLLECTOR_SOURCE_UNAVAILABLE");
        }
    }
}
