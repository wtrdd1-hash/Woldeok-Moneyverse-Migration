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
class NativePublicationIsolationTest {
 static HttpServer source;static ServletWebServerApplicationContext app;static URI origin;
 static final HttpClient client=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
 static final List<Map<String,List<String>>> headers=new CopyOnWriteArrayList<>();
 static final List<String> reads=new CopyOnWriteArrayList<>();
 static volatile String announcements,photos;static volatile int sourceStatus=200;
 static final String ID="00000000-0000-4000-8000-000000000123";
 @BeforeAll static void start() throws Exception {
  source=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
  source.createContext("/",x->{headers.add(new TreeMap<>(x.getRequestHeaders()));reads.add(x.getRequestURI().toString());byte[] bytes=(x.getRequestURI().getPath().equals("/api/v1/announcements")?announcements:photos).getBytes(StandardCharsets.UTF_8);x.getResponseHeaders().set("Content-Type","application/json");x.sendResponseHeaders(sourceStatus,bytes.length);x.getResponseBody().write(bytes);x.close();});source.start();
  app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class).properties("moneyverse.public.source-origin=http://127.0.0.1:"+source.getAddress().getPort(),"spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1");origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
 }
 @AfterAll static void stop(){if(app!=null)app.close();if(source!=null)source.stop(0);}
 @BeforeEach void reset(){headers.clear();reads.clear();sourceStatus=200;announcements="{\"announcements\":[{\"isPinned\":false,\"imageUrl\":null,\"imageAltText\":null,\"announcementId\":\""+ID+"\",\"title\":\"<script>title</script>\",\"body\":\"Full verified body <img src=x onerror=unsafe()>\",\"publishedAt\":\"2026-01-01T00:00:00Z\"}]}";photos="{\"photos\":[{\"photoId\":\""+ID+"\",\"imageUrl\":\"https://approved.example/qa.jpg\",\"altText\":\"Actual <script>alt</script>\",\"publishedAt\":\"2026-01-01T00:00:00Z\"}]}";}
 static HttpResponse<String> get(String path,String lang,String... extra)throws Exception{var b=HttpRequest.newBuilder(origin.resolve(path)).header("Accept-Language",lang);for(int i=0;i<extra.length;i+=2)b.header(extra[i],extra[i+1]);return client.send(b.GET().build(),HttpResponse.BodyHandlers.ofString());}
 @Test void allAliasesAndFiveLocalesRenderFinishedSourceInSharedChrome()throws Exception{
  for(String family:List.of("announcements","gallery"))for(String suffix:List.of("","/",".html","/index.html"))for(String lang:List.of("en","ko","ja","zh","vi")){var r=get("/"+family+suffix,lang);assertEquals(200,r.statusCode(),family+suffix+lang);assertEquals(lang,r.headers().firstValue("Content-Language").orElse(""));assertTrue(r.body().contains("class=\"topbar\""));assertTrue(r.body().contains("id=\"mv-support-launcher\""));assertTrue(r.body().contains("data-publication-id=\""+ID+"\""));assertFalse(r.body().contains("<script>title</script>"));assertFalse(r.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));}
  for(String bean:List.of("dataSource","jdbcTemplate","userAuthService","adminAuthService","socketIOServer","marketTickerService"))assertFalse(app.containsBean(bean),bean);
 }
 @Test void titlesUseLocalizedTextWithoutNullTemplateSegments()throws Exception{
  var titles=Map.of("en","Announcements","ko","운영 소식","ja","お知らせ","zh","公告","vi","Thông báo");
  for(var entry:titles.entrySet()){
   var a=get("/announcements",entry.getKey());assertEquals(200,a.statusCode());
   assertTrue(a.body().contains("<title data-public-title=\"publicationAnnouncements\">"+entry.getValue()+" | Woldeok Moneyverse</title>"),entry.getKey()+" got="+a.body().substring(a.body().indexOf("<title"),a.body().indexOf("</title>")+8));
   assertFalse(a.body().contains("null | Woldeok Moneyverse"),entry.getKey());
   var g=get("/gallery",entry.getKey());assertEquals(200,g.statusCode());assertFalse(g.body().contains("null | Woldeok Moneyverse"));
  }
 }
 @Test void actualBodyAndApprovedImageAreEscapedAndCspIsRestricted()throws Exception{
  var a=get("/announcements","en");assertTrue(a.body().contains("Full verified body &lt;img"));assertTrue(a.body().contains("<details"));
  var p=get("/gallery","en");assertTrue(p.body().contains("src=\"https://approved.example/qa.jpg\""));assertTrue(p.body().contains("Actual &lt;script&gt;alt&lt;/script&gt;"));assertTrue(p.headers().firstValue("Content-Security-Policy").orElse("").contains("img-src 'self' https://approved.example"));assertFalse(p.headers().firstValue("Content-Security-Policy").orElse("").contains("https:"+";"));
 }
 @Test void safeGetFiltersOnlyVerifiedWindowAndNeverForwardVisitorOrQuery()throws Exception{
  assertEquals(200,get("/announcements?q=absent&actor=qa&url=https://evil.example","en","Cookie","__Host-mv_session=qa","Authorization","Bearer qa","X-User-Id","qa","X-Internal-Token","qa").statusCode());assertEquals(List.of("/api/v1/announcements"),reads);for(String n:List.of("Cookie","Authorization","X-User-Id","X-Internal-Token"))assertFalse(headers.get(0).containsKey(n),n);
  var r=get("/announcements?q=absent","en");assertFalse(r.body().contains("data-publication-id"));assertTrue(r.body().contains("verified window"));assertTrue(r.body().contains("20"));
  assertTrue(get("/gallery?q=Actual","en").body().contains("data-publication-id"));
 }
 @Test void verifiedEmptyAndUnavailableRemainDistinct()throws Exception{
  announcements="{\"announcements\":[]}";var empty=get("/announcements","en");assertEquals(200,empty.statusCode());assertTrue(empty.body().contains("data-publication-empty"));sourceStatus=503;var failed=get("/announcements","en");assertEquals(503,failed.statusCode());assertFalse(failed.body().contains("data-publication-empty"));assertTrue(failed.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
 }
 @Test void oldSyntheticMalformedDuplicateAndFutureRecordsAreUnavailable()throws Exception{
  String valid=announcements;for(String bad:List.of(valid.replace(ID,"ann-01"),"{\"announcements\":{}}",valid.replace("2026-01-01","2099-01-01"),valid.replace("]}",","+valid.substring(valid.indexOf("[{")+1,valid.length()-2)+"]}"),valid.replace("\"body\":","\"body\":null,\"ignored\":"))){announcements=bad;assertEquals(503,get("/announcements","en").statusCode(),bad);}
 }
 @Test void galleryEmptyMalformedDuplicateAndFutureEvidenceStayDistinct()throws Exception{
  String valid=photos;photos="{\"photos\":[]}";var empty=get("/gallery","en");assertEquals(200,empty.statusCode());assertTrue(empty.body().contains("data-publication-empty"));
  for(String bad:List.of("{\"photos\":null}",valid.replace(ID,"photo-01"),valid.replace("2026-01-01","2099-01-01"),valid.replace("]}",","+valid.substring(valid.indexOf("[{" )+1,valid.length()-2)+"]}"),valid.replace("\"altText\":","\"altText\":null,\"ignored\":"))){photos=bad;assertEquals(503,get("/gallery","en").statusCode());}
 }
 @Test void realPinnedOrderAndOptionalAnnouncementMediaArePreserved()throws Exception{
  String row=announcements.substring(announcements.indexOf("[{" )+1,announcements.length()-2);
  String pinned=row.replace("\"isPinned\":false","\"isPinned\":true").replace("\"imageUrl\":null","\"imageUrl\":\"/media/qa-announcement.jpg\"").replace("\"imageAltText\":null","\"imageAltText\":\"Actual <script>image alt</script>\"");
  String second=row.replace(ID,"00000000-0000-4000-8000-000000000124");announcements="{\"announcements\":["+pinned+","+second+"]}";
  var r=get("/announcements","en");assertEquals(200,r.statusCode());assertTrue(r.body().contains("data-publication-pinned"));assertTrue(r.body().contains("src=\"/media/qa-announcement.jpg\""));assertTrue(r.body().contains("Actual &lt;script&gt;image alt&lt;/script&gt;"));assertTrue(r.body().indexOf(ID)<r.body().indexOf("00000000-0000-4000-8000-000000000124"));
  announcements=announcements.replace("\"isPinned\":true","\"isPinned\":\"true\"");assertEquals(503,get("/announcements","en").statusCode());
 }
 @Test void canonicalSameOriginMediaIsRenderedAndCannotEscapeStorageRoot()throws Exception{
  String valid=photos;
  photos=valid.replace("https://approved.example/qa.jpg","/media/qa-folder/actual.jpg");
  var r=get("/gallery","en");assertEquals(200,r.statusCode());assertTrue(r.body().contains("src=\"/media/qa-folder/actual.jpg\""));assertFalse(r.headers().firstValue("Content-Security-Policy").orElse("").contains("https://approved.example"));
  for(String url:List.of("//evil.example/a","/other/a","/media/../a","/media/a/./b","/media/a//b","/media/%2e%2e/a","/media/a?x=1","/media/a#fragment","/media/a\\b","/media/")){photos=valid.replace("https://approved.example/qa.jpg",url);assertEquals(503,get("/gallery","en").statusCode(),url);}
 }
 @Test void unsafeImageUrisNeverRender()throws Exception{
  String valid=photos;for(String url:List.of("http://approved.example/a","https://actor@approved.example/a","https://approved.example:444/a","https://127.0.0.1/a","javascript:alert(1)","https://approved.example/a#fragment","https://approved.example.evil/../a\\bad")){photos=valid.replace("https://approved.example/qa.jpg",url);assertEquals(503,get("/gallery","en").statusCode(),url);}
 }
 @Test void rscMethodsAndApiSiblingsAreDeniedWithoutReads()throws Exception{
  for(String f:List.of("announcements","gallery")){assertEquals(406,get("/"+f,"en","RSC","1").statusCode());assertEquals(406,get("/"+f+"?_rsc=1","en").statusCode());assertEquals(403,client.send(HttpRequest.newBuilder(origin.resolve("/"+f)).POST(HttpRequest.BodyPublishers.noBody()).build(),HttpResponse.BodyHandlers.ofString()).statusCode());assertEquals(200,client.send(HttpRequest.newBuilder(origin.resolve("/"+f)).method("HEAD",HttpRequest.BodyPublishers.noBody()).build(),HttpResponse.BodyHandlers.ofString()).statusCode());}
  reads.clear();assertEquals(403,get("/api/v1/announcements","en").statusCode());assertEquals(403,get("/gallery/unrelated","en").statusCode());assertTrue(reads.isEmpty());
 }
}
