package com.moneyverse.adminpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/** Existing backend authorization remains authoritative; this client never supplies an actor or service token. */
public final class AdminSourceClient {
    private static final int MAX_BODY=2*1024*1024;
    private static final Set<String> ROLES=Set.of("superadmin","admin","operator","approver","server_operator");
    private static final Set<String> PATHS=Set.of("/api/v1/admin/me","/api/v1/admin/users","/api/v1/admin/stocks",
        "/api/v1/admin/controls","/api/v1/admin/logs/system","/api/v1/admin/discord-outbox-events",
        "/api/v1/business/catalog","/api/v1/admin/economy/reconciliations/latest","/api/v1/auth/me");
    private final URI origin;
    private final ObjectMapper mapper;
    private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2))
        .followRedirects(HttpClient.Redirect.NEVER).build();

    public AdminSourceClient(@Value("${moneyverse.admin.source-origin:http://127.0.0.1:4550}") String configured,ObjectMapper mapper) {
        this.origin=URI.create(configured);this.mapper=mapper;
        if(!"http".equals(origin.getScheme()) || !"127.0.0.1".equals(origin.getHost()) || (origin.getPort()<1||origin.getPort()>65535)
            || origin.getUserInfo()!=null || origin.getQuery()!=null || origin.getFragment()!=null
            || !(origin.getPath().isEmpty() || origin.getPath().equals("/")))
            throw new IllegalArgumentException("Administrator source must be a fixed IPv4 loopback origin");
    }
    public static final class SourceFailure extends RuntimeException {
        private final int status;
        public SourceFailure(int status){super("Administrator source unavailable");this.status=status;}
        public int status(){return status;}
    }
    /** Host-cookie precedence matches the backend and cannot switch accounts via a duplicate/legacy fallback. */
    public String sessionCookie(HttpServletRequest request) {
        Map<String,List<String>> values=new HashMap<>();
        var all=request.getHeaders("Cookie");
        while(all!=null && all.hasMoreElements())for(String pair:all.nextElement().split(";")) {
            int equal=pair.indexOf('=');if(equal<0)continue;
            String name=pair.substring(0,equal).trim();
            if(name.equals("__Host-mv_session")||name.equals("mv_session"))
                values.computeIfAbsent(name,k->new ArrayList<>()).add(pair.substring(equal+1).trim());
        }
        String name=values.containsKey("__Host-mv_session")?"__Host-mv_session":"mv_session";
        var found=values.get(name);
        if(found==null || found.size()!=1)return null;
        String value=found.get(0);
        if(value.isEmpty()||value.length()>4096||value.chars().anyMatch(c->c<33||c>126||c==';'||c==','||c=='"'||c=='\\'))return null;
        return name+"="+value;
    }
    public void verifyAdmin(String cookie) {verifyAdmin(cookie,null);}
    public void verifyAdmin(String cookie,String requiredRole) {
        JsonNode proof=read("/api/v1/admin/me",cookie);
        JsonNode roles=proof.path("roles");
        if(!roles.isArray()||roles.isEmpty())throw new SourceFailure(403);
        boolean allowed=false;
        for(JsonNode role:roles)if(role.isTextual()&&ROLES.contains(role.textValue().toLowerCase(Locale.ROOT)))allowed=true;
        if(!allowed)throw new SourceFailure(403);
        if(requiredRole!=null){
            boolean exact=false;for(JsonNode role:roles)if(role.isTextual()&&requiredRole.equalsIgnoreCase(role.textValue()))exact=true;
            if(!exact)throw new SourceFailure(403);
        }
    }
    public JsonNode read(String path,String cookie) {
        URI relative=URI.create(path);
        if(!PATHS.contains(relative.getPath())||relative.isAbsolute()||relative.getRawAuthority()!=null||relative.getRawFragment()!=null)
            throw new IllegalArgumentException("Administrator source path is not allowed");
        if(cookie==null)throw new SourceFailure(401);
        var req=HttpRequest.newBuilder(origin.resolve(relative)).timeout(Duration.ofSeconds(4))
            .header("Cookie",cookie).header("Accept","application/json").GET().build();
        CompletableFuture<HttpResponse<byte[]>> pending=http.sendAsync(req,info->new BoundedBody());
        try {
            var response=pending.get(5,TimeUnit.SECONDS);
            int status=response.statusCode();
            if(status==401||status==403)throw new SourceFailure(status);
            if(status!=200 || !response.headers().firstValue("Content-Type").orElse("").toLowerCase(Locale.ROOT).matches("application/json(?:\\s*;.*)?"))
                throw new SourceFailure(503);
            JsonNode data=mapper.readTree(response.body());
            if(data==null||!data.isObject())throw new SourceFailure(503);
            return data;
        } catch(SourceFailure failure){throw failure;}
        catch(InterruptedException interrupted){Thread.currentThread().interrupt();throw new SourceFailure(503);}
        catch(Exception unavailable){throw new SourceFailure(503);}
        finally {if(!pending.isDone())pending.cancel(true);}
    }
    private static final class BoundedBody implements HttpResponse.BodySubscriber<byte[]> {
        private final CompletableFuture<byte[]> body=new CompletableFuture<>();
        private final ByteArrayOutputStream bytes=new ByteArrayOutputStream();
        private Flow.Subscription subscription;
        public CompletionStage<byte[]> getBody(){return body;}
        public void onSubscribe(Flow.Subscription subscription){this.subscription=subscription;subscription.request(1);}
        public void onNext(List<ByteBuffer> buffers){
            for(ByteBuffer buffer:buffers){
                if(buffer.remaining()>MAX_BODY-bytes.size()){
                    subscription.cancel();body.completeExceptionally(new IllegalStateException("Administrator source exceeded limit"));return;
                }
                byte[] chunk=new byte[buffer.remaining()];buffer.get(chunk);bytes.writeBytes(chunk);
            }
            subscription.request(1);
        }
        public void onError(Throwable error){body.completeExceptionally(error);}
        public void onComplete(){body.complete(bytes.toByteArray());}
    }
}
