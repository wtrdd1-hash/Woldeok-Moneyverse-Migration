package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import org.springframework.beans.factory.annotation.Value;

/** Public document reads carry no browser credentials, actor headers or transport secrets. */
public final class PublicSourceClient {
    private static final Set<String> READS=Set.of("/api/v1/status","/api/v1/announcements","/api/v1/content/photos");
    private final URI origin;
    private final ObjectMapper mapper;
    private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).followRedirects(HttpClient.Redirect.NEVER).build();
    public PublicSourceClient(@Value("${moneyverse.public.source-origin:http://127.0.0.1:80}") String configured,ObjectMapper mapper){
        origin=URI.create(configured);this.mapper=mapper;
        if(!"http".equals(origin.getScheme())||!"127.0.0.1".equals(origin.getHost())||origin.getPort()<1||origin.getPort()>65535
            ||origin.getRawUserInfo()!=null||origin.getRawQuery()!=null||origin.getRawFragment()!=null
            ||!(origin.getRawPath().isEmpty()||"/".equals(origin.getRawPath())))
            throw new IllegalArgumentException("Public source must be a fixed IPv4 loopback origin");
    }
    public static final class SourceFailure extends RuntimeException {public SourceFailure(){super("Public source unavailable");}}
    public JsonNode read(String path){
        if(!READS.contains(path))throw new IllegalArgumentException("Public source path is not allowed");
        var request=HttpRequest.newBuilder(origin.resolve(path)).timeout(Duration.ofSeconds(4)).header("Accept","application/json").GET().build();
        var pending=http.sendAsync(request,response->new BoundedBody());
        try{
            var response=pending.get(5,TimeUnit.SECONDS);
            if(response.statusCode()!=200||!response.headers().firstValue("Content-Type").orElse("").matches("(?i)application/json(?:\\s*;.*)?"))throw new SourceFailure();
            JsonNode value=mapper.reader().with(JsonParser.Feature.STRICT_DUPLICATE_DETECTION).with(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).readTree(response.body());
            if(value==null||!value.isObject())throw new SourceFailure();return value;
        }catch(InterruptedException interrupted){Thread.currentThread().interrupt();throw new SourceFailure();}
        catch(Exception failure){throw new SourceFailure();}
        finally{if(!pending.isDone())pending.cancel(true);}
    }
    private static final class BoundedBody implements HttpResponse.BodySubscriber<byte[]> {
        private static final int MAX_BYTES=2*1024*1024;
        private final CompletableFuture<byte[]> body=new CompletableFuture<>();
        private final ByteArrayOutputStream bytes=new ByteArrayOutputStream();
        private Flow.Subscription subscription;
        public CompletionStage<byte[]> getBody(){return body;}
        public void onSubscribe(Flow.Subscription subscription){this.subscription=subscription;subscription.request(1);}
        public void onNext(List<ByteBuffer> buffers){
            for(ByteBuffer buffer:buffers){
                if(buffer.remaining()>MAX_BYTES-bytes.size()){subscription.cancel();body.completeExceptionally(new SourceFailure());return;}
                byte[] chunk=new byte[buffer.remaining()];buffer.get(chunk);bytes.writeBytes(chunk);
            }subscription.request(1);
        }
        public void onError(Throwable failure){body.completeExceptionally(failure);}
        public void onComplete(){body.complete(bytes.toByteArray());}
    }
}
