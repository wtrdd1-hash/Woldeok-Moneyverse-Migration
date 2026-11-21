package com.moneyverse.frontendpresentation;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Exercise actual renderer HTTP, closed methods and unchanged upstream credential boundaries. */
class NativeShopIsolationTest {
    static HttpServer source;
    static ServletWebServerApplicationContext app;
    static URI origin;
    static final List<Map<String,List<String>>> requests=new CopyOnWriteArrayList<>();
    static final HttpClient client=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    @BeforeAll static void start() throws Exception {
        source=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        source.createContext("/",exchange->{
            requests.add(new TreeMap<>(exchange.getRequestHeaders()));
            String cookie=exchange.getRequestHeaders().getFirst("Cookie");
            int status="__Host-mv_session=qa-admin".equals(cookie)?200:"__Host-mv_session=qa-member".equals(cookie)?403:401;
            String data=status==200?"{\"roles\":[\"superadmin\"]}":"{\"code\":\"denied\"}";
            exchange.getResponseHeaders().set("Content-Type","application/json");
            byte[] bytes=data.getBytes(StandardCharsets.UTF_8);exchange.sendResponseHeaders(status,bytes.length);exchange.getResponseBody().write(bytes);exchange.close();
        });source.start();
        app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class)
            .properties("server.address=127.0.0.1","server.port=0","moneyverse.admin.source-origin=http://127.0.0.1:"+source.getAddress().getPort(),"spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1");
        origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
    }
    @AfterAll static void stop(){if(app!=null)app.close();if(source!=null)source.stop(0);}
    static HttpResponse<String> get(String path,String cookie,String language) throws Exception {
        var request=HttpRequest.newBuilder(origin.resolve(path)).header("Accept-Language",language);
        if(cookie!=null)request.header("Cookie",cookie);
        return client.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void actualNativeShopAndAliasesUseOneShellForAllLocales() throws Exception {
        for(String path:List.of("/admin/shop","/admin/shop/","/admin/shop.html","/admin/shop/index.html"))for(String lang:List.of("en","ko","ja","zh","vi")){
            var response=get(path,"__Host-mv_session=qa-admin",lang);
            assertEquals(200,response.statusCode(),path+" "+lang);
            assertTrue(response.body().contains("id=\"admin-shop-catalog\""));
            assertTrue(response.body().contains("class=\"admin-topbar\""));
            assertTrue(response.body().contains("/assets/mv39/favicon.ico"));
            assertFalse(response.body().contains("item-gold-pass"));
            assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
            assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
            assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
        }
        assertFalse(app.containsBean("dataSource"));
    }
    @Test void trustedServerBindingHasClosedDefaultsAndCannotBeChosenByTheRequest() throws Exception {
        assertTrue(get("/admin/shop?catalogPath=https://example.com", "__Host-mv_session=qa-admin","en").body()
            .contains("data-catalog-endpoint=\"/api/v1/admin/shop/items\""));
        try(var preview=(ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class)
            .properties("moneyverse.admin.source-origin=http://127.0.0.1:"+source.getAddress().getPort(),"spring.main.banner-mode=off")
            .run("--server.port=0","--server.address=127.0.0.1","--moneyverse.admin.catalog-read-path=/_mv/nov18-rebuild-qa/catalog")) {
            var request=HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+preview.getWebServer().getPort()+"/admin/shop?catalogPath=/api/v1/admin/users"))
                .header("Cookie","__Host-mv_session=qa-admin").GET().build();
            var response=client.send(request,HttpResponse.BodyHandlers.ofString());assertEquals(200,response.statusCode());
            assertTrue(response.body().contains("data-catalog-endpoint=\"/_mv/nov18-rebuild-qa/catalog\""));
        }
    }
    @Test void foreignServerBindingIsRefusedAtStartup() {
        var started=new java.util.concurrent.atomic.AtomicReference<ServletWebServerApplicationContext>();
        try {
            assertThrows(org.springframework.beans.factory.BeanCreationException.class,()->started.set(
                (ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class)
                    .properties("spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1",
                        "--moneyverse.admin.catalog-read-path=https://example.com/catalog")));
        }finally{if(started.get()!=null)started.get().close();}
    }
    @Test void anonymousAndMemberCannotReadAdministratorScreen() throws Exception {
        assertEquals(302,get("/admin/shop",null,"en").statusCode());
        assertEquals(403,get("/admin/shop","__Host-mv_session=qa-member","en").statusCode());
        assertEquals(302,get("/admin/shop","__Host-mv_session=expired","en").statusCode());
    }
    @Test void rendererNeverAcceptsACommandOrPublishesBackendApi() throws Exception {
        var request=HttpRequest.newBuilder(origin.resolve("/admin/shop")).header("Cookie","__Host-mv_session=qa-admin")
            .POST(HttpRequest.BodyPublishers.ofString("qa-body")).build();
        assertEquals(403,client.send(request,HttpResponse.BodyHandlers.ofString()).statusCode());
        assertEquals(403,get("/api/v1/admin/shop/items","__Host-mv_session=qa-admin","en").statusCode());
    }
}
