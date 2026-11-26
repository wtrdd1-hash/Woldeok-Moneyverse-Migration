package com.moneyverse.api.domain.work.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Job profile and active-job switch for /work (APP_SPEC 3.5; route contract 2026-11-26: both
 * missing in Spring, so the work screen never loaded). Ported from NestJS WorkController /
 * WorkRepository: job_get_my_profile and job_switch_active (SECURITY DEFINER, actor from the
 * session), the mastery tier table, and the work feature switch. Direct paid completion stays
 * refused (409) exactly as NestJS: work pays only through assignment settlement.
 */
@RestController
public class JobProfileController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JobProfileController.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Pattern JOB = Pattern.compile("^[a-z_]{2,40}$");
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public JobProfileController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @GetMapping({"/api/v1/work/profile", "/api/work/profile"})
    @Operation(summary = "Current active job and all job masteries")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> profile(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        try {
            String raw = jdbc.sql("SELECT public.job_get_my_profile(?::uuid)::text").param(actor).query(String.class).optional().orElse(null);
            if (raw == null) return ok(null);
            Map<String, Object> profile = JSON.readValue(raw, Map.class);
            if (profile.get("active_job") instanceof Map<?, ?> active) {
                ((Map<String, Object>) active).put("mastery_tier", tier(level(active.get("level"))));
            }
            if (profile.get("all_jobs") instanceof List<?> jobs) {
                for (Object j : jobs) if (j instanceof Map<?, ?> job) ((Map<String, Object>) job).put("mastery_tier", tier(level(job.get("level"))));
            }
            profile.put("qualifications", jdbc.sql("SELECT id::text AS id, job_type::text AS job_type, qualification_code, title, tier, "
                            + "fee_wld::text AS fee_wld, acquired_at::text AS acquired_at FROM public.user_job_qualifications WHERE user_id = ?::uuid ORDER BY acquired_at ASC")
                    .param(actor).query().listOfRows());
            return ok(profile);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw translate(e);
        }
    }

    @PostMapping({"/api/v1/work/active-job", "/api/work/active-job"})
    @Operation(summary = "Switch the active job (session, CSRF; the work switch must be enabled)")
    public ResponseEntity<?> switchJob(HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        String jobType = body != null && body.get("jobType") instanceof String s ? s : null;
        if (jobType == null || !JOB.matcher(jobType).matches()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JOB_TYPE_INVALID");
        try {
            String state = jdbc.sql("SELECT public.feature_switch_state('work')::text").query(String.class).optional().orElse("unknown");
            if (!"enabled".equals(state)) throw new ResponseStatusException(HttpStatus.CONFLICT, "WORK_FEATURE_" + state.toUpperCase(Locale.ROOT));
            Map<String, Object> r = jdbc.sql("SELECT job_type::text AS job_type, level, experience::text AS current_experience, is_active "
                            + "FROM public.job_switch_active(?::uuid, ?::text)")
                    .param(actor).param(jobType).query().listOfRows().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "JOB_SWITCH_RECEIPT_MISSING"));
            return ok(r);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    @PostMapping({"/api/v1/work/tasks/{id}/complete", "/api/work/tasks/{id}/complete"})
    @Operation(summary = "Deprecated direct completion; use assignment-based settlement", deprecated = true)
    public ResponseEntity<?> completeTask(@PathVariable("id") String id) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("code", "work_assignment_required",
                "message", "Direct paid completion is disabled. Create an assignment, wait for the server-authoritative minimum duration, submit it, then verify the reward."));
    }

    static int level(Object v) {
        return v instanceof Number n ? n.intValue() : 1;
    }

    /** NestJS computeMasteryTier. */
    static Map<String, Object> tier(int level) {
        String[][] t = level >= 50 ? new String[][]{{"LEGACY", "레거시 명예", "Legacy Grandmaster"}}
                : level >= 40 ? new String[][]{{"MASTER", "마스터", "Master"}}
                : level >= 30 ? new String[][]{{"EXPERT", "엑스퍼트", "Expert"}}
                : level >= 20 ? new String[][]{{"SPECIALIST", "전문가", "Specialist"}}
                : level >= 10 ? new String[][]{{"PROFESSIONAL", "프로", "Professional"}}
                : level >= 5 ? new String[][]{{"JOURNEYMAN", "숙련", "Journeyman"}}
                : new String[][]{{"APPRENTICE", "견습", "Apprentice"}};
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("code", t[0][0]);
        m.put("nameKo", t[0][1]);
        m.put("nameEn", t[0][2]);
        return m;
    }

    private static ResponseStatusException translate(Exception e) {
        Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof SQLException sql ? sql.getSQLState() : null;
        log.warn("[job-profile] db call failed: {} sqlstate={} {}", c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
        if (state != null && Set.of("22023", "23505", "55000", "P0001").contains(state)) return new ResponseStatusException(HttpStatus.CONFLICT, "JOB_REQUEST_REFUSED");
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "JOB_SOURCE_UNAVAILABLE");
    }

    private static ResponseEntity<?> ok(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
