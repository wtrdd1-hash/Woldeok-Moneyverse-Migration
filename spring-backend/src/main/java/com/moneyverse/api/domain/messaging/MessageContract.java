package com.moneyverse.api.domain.messaging;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigInteger;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

/** Reject ambiguous intent and incomplete receipts before a UI can report delivery. */
public final class MessageContract {
    private MessageContract() {}
    public static UUID actor(UUID actor) {
        if(actor==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"SESSION_REQUIRED");
        return actor;
    }
    public static UUID key(String raw) {
        if(raw==null||!raw.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"))
            throw invalid("INVALID_IDEMPOTENCY_KEY");
        return UUID.fromString(raw);
    }
    public static void matchingKey(String body,String header) {
        UUID value=key(body);
        if(header!=null&&!value.equals(key(header))) throw invalid("IDEMPOTENCY_KEY_MISMATCH");
    }
    public static String text(String raw,int maximum,boolean chat) {
        if(raw==null||raw.codePointCount(0,raw.length())>maximum) throw invalid("INVALID_MESSAGE");
        for(int i=0;i<raw.length();i++) {
            char c=raw.charAt(i);
            if(c==0||(chat&&Character.isISOControl(c))) throw invalid("INVALID_MESSAGE");
            if(Character.isHighSurrogate(c)) {
                if(i+1>=raw.length()||!Character.isLowSurrogate(raw.charAt(++i))) throw invalid("INVALID_MESSAGE");
            } else if(Character.isLowSurrogate(c)) throw invalid("INVALID_MESSAGE");
        }
        // Match PostgreSQL btrim(text), preserving intentional supported newlines.
        int start=0,end=raw.length();
        while(start<end&&raw.charAt(start)==' ')start++;
        while(end>start&&raw.charAt(end-1)==' ')end--;
        String result=raw.substring(start,end);
        if(result.isBlank()) throw invalid("INVALID_MESSAGE");
        return result;
    }
    public static UUID receiptId(Map<String,Object> row,String key) {
        if(!(row.get(key) instanceof UUID id)) throw unavailable();
        return id;
    }
    public static OffsetDateTime date(Timestamp value) {
        if(value==null) throw unavailable();
        return value.toInstant().atOffset(ZoneOffset.UTC);
    }
    public static OffsetDateTime receiptDate(Map<String,Object> row) {
        if(!(row.get("created_at") instanceof Timestamp value)) throw unavailable();
        return date(value);
    }
    public static String sequence(String raw) {
        if(raw==null||!raw.matches("[1-9][0-9]{0,18}")||new BigInteger(raw).compareTo(BigInteger.valueOf(Long.MAX_VALUE))>0)
            throw unavailable();
        return raw;
    }
    public static int count(String raw) {
        if(raw==null||!raw.matches("0|[1-9][0-9]{0,9}")) throw unavailable();
        long value=Long.parseLong(raw);
        if(value>Integer.MAX_VALUE) throw unavailable();
        return (int)value;
    }
    public static ResponseStatusException invalid(String code) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,code);
    }
    public static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"MESSAGE_SOURCE_UNAVAILABLE");
    }
    public static ResponseStatusException failure(Exception error) {
        if(error instanceof ResponseStatusException response) return response;
        for(Throwable cause=error;cause!=null;cause=cause.getCause()) {
            if(cause instanceof SQLException sql) {
                String state=sql.getSQLState();
                if("42501".equals(state)) {
                    String message=sql.getMessage();
                    if(message!=null&&message.toLowerCase(java.util.Locale.ROOT).contains("permission denied for"))
                        return unavailable();
                    return new ResponseStatusException(HttpStatus.FORBIDDEN,"MESSAGE_ACCESS_DENIED");
                }
                if("28000".equals(state)) return invalid("MESSAGE_RECEIPT_OWNER_MISMATCH");
                if("22023".equals(state)||"23505".equals(state)||"55000".equals(state))
                    return new ResponseStatusException(HttpStatus.CONFLICT,"MESSAGE_REQUEST_REFUSED");
            }
        }
        return unavailable();
    }
}
