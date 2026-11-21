package com.moneyverse.api.domain.board;

import com.moneyverse.api.domain.board.service.BoardService;
import com.moneyverse.api.domain.board.controller.BoardController;
import com.moneyverse.api.domain.board.dto.BoardDtos.*;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Canonical public DB functions and actual post receipts, never fabricated success. */
class BoardSourceTruthTest {
 private final JdbcTemplate jdbc=mock(JdbcTemplate.class);
 private final BoardService service=new BoardService(jdbc);
 private final UserAuthService auth=mock(UserAuthService.class);
 private final BoardController controller=new BoardController(service,auth);

 @Test void validEmptySourceReturnsActualEmptyNotFakeBoardPosts(){
  when(jdbc.query(contains("member_board_public_list_with_stock"),any(RowMapper.class),any(Object[].class))).thenReturn(List.of());
  BoardPostListResponse result=service.listPosts(null);
  assertTrue(result.ok());assertTrue(result.posts().isEmpty());
 }
 @Test void sourceFailureIs503NotSyntheticNewsOr200(){
  when(jdbc.query(anyString(),any(RowMapper.class),any(Object[].class))).thenThrow(new IllegalStateException("missing canonical function"));
  ResponseStatusException ex=assertThrows(ResponseStatusException.class,()->service.listPosts(null));
  assertEquals(HttpStatus.SERVICE_UNAVAILABLE,ex.getStatusCode());
 }
 @Test void noPostCanSucceedWithoutAnAuthenticatedSessionEvenWithForgedHeaders(){
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  req.addHeader("X-User-Id",UUID.randomUUID().toString());
  req.addHeader("x-actor-user-id",UUID.randomUUID().toString());
  ResponseEntity<?> out=controller.createPost(req,new CreateBoardPostRequest("Valid title","Valid body","general",null,UUID.randomUUID().toString()));
  assertEquals(401,out.getStatusCode().value());
  verifyNoInteractions(jdbc);
 }
 @Test void noCsrfNoMutationAnd403(){
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  SessionInfo session=new SessionInfo();session.setUserId(UUID.randomUUID());session.setCsrfHash(UserAuthService.sha256("valid-csrf-token"));
  when(auth.resolveSession(req)).thenReturn(Optional.of(session));
  ResponseEntity<?> out=controller.createPost(req,new CreateBoardPostRequest("Valid title","Valid body","general",null,UUID.randomUUID().toString()));
  assertEquals(403,out.getStatusCode().value());
  verifyNoInteractions(jdbc);
 }
 @Test void withoutUuidIdempotencyKeyIs400AndMustNotWrite(){
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  SessionInfo session=new SessionInfo();session.setUserId(UUID.randomUUID());session.setCsrfHash(UserAuthService.sha256("valid-csrf-token"));
  req.addHeader("X-CSRF-Token","valid-csrf-token");when(auth.resolveSession(req)).thenReturn(Optional.of(session));
  ResponseEntity<?> out=controller.createPost(req,new CreateBoardPostRequest("Valid title","Valid body","general",null,"invalid-uuid"));
  assertEquals(400,out.getStatusCode().value());verifyNoInteractions(jdbc);
 }
 @Test void canonicalWriteFails503WhenSourceCannotWriteNoFakeReceipt(){
  UUID actor=UUID.randomUUID();UUID key=UUID.randomUUID();
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  SessionInfo session=new SessionInfo();session.setUserId(actor);session.setCsrfHash(UserAuthService.sha256("valid-csrf-token"));
  req.addHeader("X-CSRF-Token","valid-csrf-token");when(auth.resolveSession(req)).thenReturn(Optional.of(session));
  when(jdbc.queryForObject(contains("member_board_create"),any(RowMapper.class),any(Object[].class))).thenThrow(new IllegalStateException("DB unavailable"));
  ResponseStatusException ex=assertThrows(ResponseStatusException.class,()->controller.createPost(req,new CreateBoardPostRequest("Valid title","Valid body","general",null,key.toString())));
  assertEquals(HttpStatus.SERVICE_UNAVAILABLE,ex.getStatusCode());
 }
 @Test void canonicalRealRecordPreservesSourceCountAndUnknownCounters(){
  UUID id=UUID.randomUUID();
  when(jdbc.query(contains("member_board_public_list_with_stock"),any(RowMapper.class),any(Object[].class))).thenAnswer(invocation->{
   @SuppressWarnings("unchecked") RowMapper<BoardPostItem> mapper=invocation.getArgument(1);
   java.sql.ResultSet row=mock(java.sql.ResultSet.class);
   when(row.getString("post_id")).thenReturn(id.toString());
   when(row.getString("title")).thenReturn("Verified DB record");
   when(row.getString("author_name")).thenReturn("Member");
   when(row.getTimestamp("created_at")).thenReturn(java.sql.Timestamp.from(java.time.Instant.parse("2026-11-19T10:00:00Z")));
   when(row.getLong("comment_count")).thenReturn(7L);
   return List.of(mapper.mapRow(row,0));
  });
  var result=service.listPosts(null);
  assertEquals(1,result.posts().size());
  assertEquals(id.toString(),result.posts().get(0).id());
  assertEquals(7,result.posts().get(0).commentCount());
  assertNull(result.posts().get(0).viewCount());assertNull(result.posts().get(0).likeCount());
  assertNull(result.posts().get(0).authorId());
 }
 @Test void realBoardWriteRequiresReturnedDbReceipt(){
  UUID actor=UUID.randomUUID(), key=UUID.randomUUID(),receipt=UUID.randomUUID();
  when(jdbc.queryForObject(contains("member_board_create"),any(RowMapper.class),any(Object[].class))).thenReturn(receipt.toString());
  var result=service.createPost(actor,new CreateBoardPostRequest("Actual title","Actual body","general",null,key.toString()),key);
  assertTrue(result.ok());assertEquals(receipt.toString(),result.postId());
  assertFalse(result.postId().startsWith("post-"));
 }
 @Test void authenticatedAndCsrfVerifiedControllerPassesOnlySessionActorToDb(){
  UUID actor=UUID.randomUUID(),key=UUID.randomUUID(),receipt=UUID.randomUUID();
  BoardService actual=mock(BoardService.class);BoardController ctl=new BoardController(actual,auth);
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  SessionInfo session=new SessionInfo();session.setUserId(actor);session.setCsrfHash(UserAuthService.sha256("valid-csrf-token"));
  when(auth.resolveSession(req)).thenReturn(Optional.of(session));
  when(actual.createPost(eq(actor),any(CreateBoardPostRequest.class),eq(key))).thenReturn(new CreateBoardPostResponse(true,"Verified",receipt.toString()));
  req.addHeader("X-CSRF-Token","valid-csrf-token");
  ResponseEntity<?> out=ctl.createPost(req,new CreateBoardPostRequest("Actual title","Actual body","general",null,key.toString()));
  assertEquals(200,out.getStatusCode().value());
  verify(actual).createPost(eq(actor),any(CreateBoardPostRequest.class),eq(key));
 }
 @Test void forgedHeaderOnValidSessionIs403(){
  MockHttpServletRequest req=new MockHttpServletRequest("POST","/api/v1/board");
  SessionInfo session=new SessionInfo();session.setUserId(UUID.randomUUID());session.setCsrfHash(UserAuthService.sha256("valid-csrf-token"));
  when(auth.resolveSession(req)).thenReturn(Optional.of(session));req.addHeader("X-CSRF-Token","valid-csrf-token");
  req.addHeader("X-User-Id",UUID.randomUUID().toString());
  var out=controller.createPost(req,new CreateBoardPostRequest("Actual title","Actual body","general",null,UUID.randomUUID().toString()));
  assertEquals(403,out.getStatusCode().value());
  verifyNoInteractions(jdbc);
 }

}
