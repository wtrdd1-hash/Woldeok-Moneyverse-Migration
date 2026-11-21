package com.moneyverse.api.domain.content;

import com.moneyverse.api.domain.content.service.ContentPublicationService;
import java.net.URI;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

/** No local SQL execution: every fixture and privilege refusal is rolled back in disposable CI. */
@Tag("postgres-shop")
class ContentPublicationPostgresIntegrationTest {
    Connection connection;JdbcTemplate jdbc;ContentPublicationService content;
    UUID announcement,newerAnnouncement,photo,draftAnnouncement,futureAnnouncement,draftPhoto,futurePhoto,inactivePhoto,localPhoto,privateLocalPhoto;
    String host,inactiveHost;Instant published;
    @BeforeEach void disposableFixture()throws Exception {
        assertEquals("true",System.getenv("GITHUB_ACTIONS"),"Disposable GitHub CI is required");
        String url=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_URL");assertNotNull(url);
        assertTrue(url.startsWith("jdbc:postgresql://"));URI uri=URI.create(url.substring(5));
        assertTrue(Set.of("127.0.0.1","localhost").contains(uri.getHost()));assertEquals("/woldeok_moneyverse_dev",uri.getPath());
        assertNull(uri.getUserInfo());assertNull(uri.getQuery());assertNull(uri.getFragment());
        String user=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_USER"),password=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_PASSWORD");assertNotNull(user);assertNotNull(password);
        connection=DriverManager.getConnection(url,user,password);connection.setAutoCommit(false);
        jdbc=new JdbcTemplate(new SingleConnectionDataSource(connection,true));
        host="qa-"+UUID.randomUUID()+".example";inactiveHost="inactive-"+UUID.randomUUID()+".example";
        jdbc.update("INSERT INTO public.content_allowed_image_hosts(host,active) VALUES (?,true),(?,false)",host,inactiveHost);
        published=Instant.now().minusSeconds(1).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        announcement=addAnnouncement("published",published);draftAnnouncement=addAnnouncement("draft",null);futureAnnouncement=addAnnouncement("published",Instant.now().plusSeconds(3600));
        newerAnnouncement=addAnnouncement("published",published.plusMillis(500));
        jdbc.update("UPDATE public.announcements SET is_pinned=true,image_storage_key=?,image_alt_text='QA announcement alt' WHERE id=?::uuid",announcement+".jpg",announcement);
        photo=addPhoto("published",published,host);draftPhoto=addPhoto("draft",null,host);futurePhoto=addPhoto("published",Instant.now().plusSeconds(3600),host);inactivePhoto=addPhoto("published",published,inactiveHost);
        localPhoto=addPhoto("published",published,host);privateLocalPhoto=addPhoto("draft",null,host);
        for(UUID id:List.of(localPhoto,privateLocalPhoto))jdbc.update("UPDATE public.photos SET image_url='/media/'||storage_key,image_host=NULL WHERE id=?::uuid",id);
        jdbc.execute("SET LOCAL ROLE moneyverse_app");assertEquals("moneyverse_app",jdbc.queryForObject("SELECT current_user",String.class));content=new ContentPublicationService(jdbc);
    }
    private UUID addAnnouncement(String state,Instant at){UUID id=UUID.randomUUID();jdbc.update("INSERT INTO public.announcements(id,title,body,content_state,published_at) VALUES (?::uuid,'QA canonical title','QA complete body',?,?)",id,state,at==null?null:Timestamp.from(at));return id;}
    private UUID addPhoto(String state,Instant at,String imageHost){UUID id=UUID.randomUUID();jdbc.update("INSERT INTO public.photos(id,storage_key,alt_text,visibility,content_state,published_at,image_host,image_url) VALUES (?::uuid,?,'QA actual alt',?,?,?,?,?)",id,id+".jpg",state.equals("draft")?"private":"public",state,at==null?null:Timestamp.from(at),imageHost,"https://"+imageHost+"/qa.jpg");return id;}
    @AfterEach void rollbackFixture()throws Exception{if(connection!=null)try{connection.rollback();}finally{connection.close();}}
    @Test void actualAnnouncementFieldsContainOnlyPublishedNotFutureRecords(){
        var rows=content.announcements("100");var row=rows.stream().filter(r->announcement.toString().equals(r.get("announcementId"))).findFirst().orElseThrow();
        assertEquals(Set.of("announcementId","title","body","publishedAt","isPinned","imageUrl","imageAltText"),row.keySet());assertEquals("QA canonical title",row.get("title"));assertEquals("QA complete body",row.get("body"));assertEquals(published.toString(),row.get("publishedAt"));
        assertEquals(true,row.get("isPinned"));assertEquals("/media/"+announcement+".jpg",row.get("imageUrl"));assertEquals("QA announcement alt",row.get("imageAltText"));
        var newer=rows.stream().filter(r->newerAnnouncement.toString().equals(r.get("announcementId"))).findFirst().orElseThrow();assertEquals(false,newer.get("isPinned"));assertNull(newer.get("imageUrl"));assertNull(newer.get("imageAltText"));assertTrue(rows.indexOf(row)<rows.indexOf(newer));
        for(UUID hidden:List.of(draftAnnouncement,futureAnnouncement))assertFalse(rows.stream().anyMatch(r->hidden.toString().equals(r.get("announcementId"))));
    }
    @Test void actualPhotoFieldsRequirePublicPublicationAndActiveHost(){
        var rows=content.photos("100");var row=rows.stream().filter(r->photo.toString().equals(r.get("photoId"))).findFirst().orElseThrow();
        assertEquals(Set.of("photoId","imageUrl","altText","publishedAt"),row.keySet());assertEquals("https://"+host+"/qa.jpg",row.get("imageUrl"));assertEquals("QA actual alt",row.get("altText"));assertEquals(published.toString(),row.get("publishedAt"));
        for(UUID hidden:List.of(draftPhoto,futurePhoto,inactivePhoto))assertFalse(rows.stream().anyMatch(r->hidden.toString().equals(r.get("photoId"))));
    }
    @Test void canonicalLocalMediaIsPublicOnlyWhenPublished(){
        var rows=content.photos("100");var row=rows.stream().filter(r->localPhoto.toString().equals(r.get("photoId"))).findFirst().orElseThrow();
        assertEquals("/media/"+localPhoto+".jpg",row.get("imageUrl"));assertFalse(rows.stream().anyMatch(r->privateLocalPhoto.toString().equals(r.get("photoId"))));
    }
    @Test void successfulReadsNeverRequireRawPublicationPrivileges(){
        assertFalse(content.announcements("100").isEmpty());assertFalse(content.photos("100").isEmpty());
        for(String table:List.of("announcements","photos","content_allowed_image_hosts"))for(String privilege:List.of("SELECT","INSERT","UPDATE","DELETE"))assertEquals(Boolean.FALSE,jdbc.queryForObject("SELECT has_table_privilege(current_user,?::text,?::text)",Boolean.class,"public."+table,privilege));
    }
    @Test void missingAnnouncementFunctionGrantReturns503(){
        jdbc.execute("RESET ROLE");jdbc.execute("REVOKE EXECUTE ON FUNCTION public.content_list_published_announcements(integer) FROM moneyverse_app");jdbc.execute("SET LOCAL ROLE moneyverse_app");
        assertEquals(503,assertThrows(ResponseStatusException.class,()->content.announcements(null)).getStatusCode().value());
    }
    @Test void missingPhotoFunctionReturns503(){
        jdbc.execute("RESET ROLE");jdbc.execute("ALTER FUNCTION public.content_list_published_photos(integer) RENAME TO qa_missing_publication_photo_read");jdbc.execute("SET LOCAL ROLE moneyverse_app");
        assertEquals(503,assertThrows(ResponseStatusException.class,()->content.photos(null)).getStatusCode().value());
    }
}
