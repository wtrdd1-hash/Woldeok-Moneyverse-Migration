package com.moneyverse.api.domain.status;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/** Strict v1 public status: a historical good snapshot is never current proof. */
public final class StatusSourceTruthPolicy {
    private StatusSourceTruthPolicy() {}
    private static final Set<String> VALID_STATES=Set.of("operational","degraded","outage","maintenance");
    private static final DateTimeFormatter ISO_MS=DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
    public record StatusRow(String sourceKey,String displayName,String state,String detail,String observedAt,
                            String freshnessState,Long ageMs,String policyVersion) {}
    public record StatusResponse(List<StatusRow> status) {}

    public static StatusRow evaluate(String key,String name,String lastState,Instant observation,int staleSeconds,Instant now) {
        String label=name==null?key:name;
        if(observation==null||observation.isAfter(now)||!VALID_STATES.contains(lastState)||staleSeconds<=0) {
            return new StatusRow(key,label,"unknown",null,null,"unknown",null,"status-v1");
        }
        long ageMs;
        try{ageMs=Math.subtractExact(now.toEpochMilli(),observation.toEpochMilli());}
        catch(ArithmeticException e){return new StatusRow(key,label,"unknown",null,null,"unknown",null,"status-v1");}
        if(ageMs<0)return new StatusRow(key,label,"unknown",null,null,"unknown",null,"status-v1");
        boolean expired=ageMs>(long)staleSeconds*1000L;
        return new StatusRow(key,label,expired?"unknown":lastState,null,ISO_MS.format(observation),
                expired?"stale":"fresh",ageMs,"status-v1");
    }
    public static String overall(List<String> states) {
        if(states.contains("outage"))return "outage";
        if(states.contains("degraded"))return "degraded";
        if(states.contains("maintenance"))return "maintenance";
        if(states.isEmpty()||states.contains("unknown"))return "unknown";
        return "operational";
    }
}
