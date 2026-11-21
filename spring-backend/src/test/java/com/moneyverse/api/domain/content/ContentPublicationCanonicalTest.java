package com.moneyverse.api.domain.content;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class ContentPublicationCanonicalTest {
 @Autowired MockMvc mvc; @MockBean JdbcTemplate jdbc;
 static final String ID="00000000-0000-4000-8000-000000000123";
 @BeforeEach void unavailable(){when(jdbc.query(anyString(),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class))).thenThrow(new IllegalStateException("QA unavailable"));}
 @Test void sourceFailureCannotBecomeSyntheticAnnouncementOrEmptyGallery() throws Exception {
  for(String path:List.of("/api/v1/announcements","/api/v1/content/photos"))mvc.perform(get(path)).andExpect(status().isServiceUnavailable());
 }
 @Test void invalidLimitsAreRejectedBeforeSourceAccess() throws Exception {
  for(String path:List.of("/api/v1/announcements","/api/v1/content/photos"))for(String value:List.of("0","101","abc","1.5","2147483648",""))mvc.perform(get(path).param("limit",value)).andExpect(status().isBadRequest());
  verify(jdbc,never()).query(contains("content_list_published_"),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class));
 }
 @Test void canonicalColumnsAndAliasesKeepPublicationTimeWithoutInventedPinsOrCreation() throws Exception {
  var rs=mock(java.sql.ResultSet.class);when(rs.getString(anyString())).thenAnswer(c->switch((String)c.getArgument(0)){case "announcement_id","photo_id"->ID;case "title"->"QA title";case "body"->"Full verified body";case "image_url"->"/media/qa.jpg";case "image_alt_text","alt_text"->"Actual alt";default->null;});
  when(rs.getObject("is_pinned",Boolean.class)).thenReturn(true);
  when(rs.getTimestamp("published_at")).thenReturn(Timestamp.from(Instant.parse("2026-01-01T00:00:00Z")));
  when(jdbc.query(anyString(),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class))).thenAnswer(c->{String sql=c.getArgument(0);assertTrue(sql.contains("public.content_list_published_"));assertTrue(sql.contains("(?::integer)"));assertFalse(sql.contains("FROM public.announcements"));org.springframework.jdbc.core.RowMapper<?> mapper=c.getArgument(1);return List.of(mapper.mapRow(rs,0));});
  for(String path:List.of("/api/v1/announcements","/api/announcements","/api/v1/content/announcements"))mvc.perform(get(path)).andExpect(status().isOk()).andExpect(jsonPath("$.announcements[0].announcementId").value(ID)).andExpect(jsonPath("$.announcements[0].body").value("Full verified body")).andExpect(jsonPath("$.announcements[0].publishedAt").value("2026-01-01T00:00:00Z")).andExpect(jsonPath("$.announcements[0].createdAt").doesNotExist()).andExpect(jsonPath("$.announcements[0].isPinned").value(true)).andExpect(jsonPath("$.announcements[0].imageUrl").value("/media/qa.jpg")).andExpect(jsonPath("$.announcements[0].imageAltText").value("Actual alt"));
  mvc.perform(get("/api/v1/content/photos")).andExpect(status().isOk()).andExpect(jsonPath("$.photos[0].photoId").value(ID)).andExpect(jsonPath("$.photos[0].imageUrl").value("/media/qa.jpg")).andExpect(jsonPath("$.photos[0].altText").value("Actual alt"));
 }
 @Test void fabricatedContentStatusIsGone() throws Exception {mvc.perform(get("/api/v1/content/status")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.status.systemOperational").doesNotExist());}
}
