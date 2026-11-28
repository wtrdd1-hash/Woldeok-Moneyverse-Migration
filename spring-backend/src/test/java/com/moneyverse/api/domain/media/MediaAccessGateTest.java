package com.moneyverse.api.domain.media;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.media.controller.BoardImageController;
import com.moneyverse.api.domain.media.controller.ChatUploadController;
import com.moneyverse.api.domain.media.controller.MediaController;
import com.moneyverse.api.domain.media.service.ImageStorageService;
import com.moneyverse.api.domain.media.service.MediaAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * BOLA sweep 2026-11-28: Spring served any well-formed media key to anyone. These pin the database
 * visibility gates the legacy gateway used, and that a refused key is never read from disk.
 */
class MediaAccessGateTest {
    private static final String KEY = "0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png";
    private static final String CHAT_KEY = "chat_0b5c8f5e-6f7a-4c1d-9e2b-3a4b5c6d7e8f.png";
    private static final byte[] PNG = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};

    private final UserAuthService auth = mock(UserAuthService.class);
    private final ImageStorageService storage = mock(ImageStorageService.class);
    private final MediaAccessService access = mock(MediaAccessService.class);
    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private final UUID member = UUID.randomUUID();
    private final UUID session = UUID.randomUUID();

    @BeforeEach void storedBytesExist() {
        when(storage.read(anyString())).thenReturn(Optional.of(PNG));
        when(storage.getMimeTypeFor(anyString())).thenReturn("image/png");
    }

    private void signedIn() {
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(member);
        s.setSessionId(session);
        s.setRoles(List.of());
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    private void anonymous() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
    }

    private static int code(ResponseEntity<?> r) { return r.getStatusCode().value(); }

    // --- chat attachments ---

    @Test void chatMediaRequiresASession() {
        anonymous();
        ChatUploadController c = new ChatUploadController(storage, auth, access);
        assertEquals(401, code(c.getChatMedia(request, CHAT_KEY)));
        verify(storage, never()).read(anyString());
    }

    @Test void chatMediaNotVisibleToThisMemberIsNotFoundAndNeverRead() {
        signedIn();
        when(access.chatMedia(member, CHAT_KEY, session)).thenReturn(false);
        ChatUploadController c = new ChatUploadController(storage, auth, access);
        assertEquals(404, code(c.getChatMedia(request, CHAT_KEY)));
        verify(storage, never()).read(anyString());
    }

    @Test void chatMediaVisibleToAParticipantIsServedPrivately() {
        signedIn();
        when(access.chatMedia(member, CHAT_KEY, session)).thenReturn(true);
        ResponseEntity<byte[]> r = new ChatUploadController(storage, auth, access).getChatMedia(request, CHAT_KEY);
        assertEquals(200, code(r));
        assertEquals("private, no-store", r.getHeaders().getCacheControl());
    }

    @Test void chatUploadRegistersThroughTheFunctionAndRemovesTheFileWhenRefused() throws Exception {
        signedIn();
        when(storage.save(any(byte[].class), eq("chat_")))
                .thenReturn(new ImageStorageService.StoredImage(CHAT_KEY, "image/png", 12, "/media/" + CHAT_KEY));
        when(access.registerChatMedia(member, CHAT_KEY)).thenReturn(false);
        ResponseEntity<?> r = new ChatUploadController(storage, auth, access).uploadChatImage(request, null, PNG);
        assertEquals(503, code(r));
        verify(storage).remove(CHAT_KEY);
    }

    @Test void chatUploadAnswersTheGuardedChatUrl() throws Exception {
        signedIn();
        when(storage.save(any(byte[].class), eq("chat_")))
                .thenReturn(new ImageStorageService.StoredImage(CHAT_KEY, "image/png", 12, "/media/" + CHAT_KEY));
        when(access.registerChatMedia(member, CHAT_KEY)).thenReturn(true);
        ResponseEntity<?> r = new ChatUploadController(storage, auth, access).uploadChatImage(request, null, PNG);
        assertEquals(200, code(r));
        assertEquals("/api/v1/content/chat/media/" + CHAT_KEY, ((Map<?, ?>) r.getBody()).get("url"));
    }

    // --- gallery photos and profile images ---

    @Test void unpublishedPhotoIsNotFoundForOthersAndNeverRead() {
        anonymous();
        when(access.publishedPhoto(KEY)).thenReturn(false);
        MediaController c = new MediaController(storage, auth, access);
        assertEquals(404, code(c.getMedia(request, KEY)));
        verify(storage, never()).read(anyString());
    }

    @Test void publishedPhotoIsCachedPublicly() {
        anonymous();
        when(access.publishedPhoto(KEY)).thenReturn(true);
        ResponseEntity<byte[]> r = new MediaController(storage, auth, access).getMedia(request, KEY);
        assertEquals(200, code(r));
        assertTrue(r.getHeaders().getCacheControl().startsWith("public"));
    }

    @Test void ownSubmissionIsServedToItsOwnerWithoutSharedCaching() {
        signedIn();
        when(access.publishedPhoto(KEY)).thenReturn(false);
        when(access.ownSubmission(member, KEY)).thenReturn(true);
        ResponseEntity<byte[]> r = new MediaController(storage, auth, access).getMedia(request, KEY);
        assertEquals(200, code(r));
        assertEquals("private, no-store", r.getHeaders().getCacheControl());
    }

    @Test void profileImageFollowsItsVisibilityFunction() {
        anonymous();
        when(access.profileImage(null, KEY)).thenReturn(false);
        MediaController c = new MediaController(storage, auth, access);
        assertEquals(404, code(c.getProfileMedia(request, KEY)));
        verify(storage, never()).read(anyString());
    }

    // --- board images ---

    @Test void memberBoardImageRequiresVisibility() {
        signedIn();
        when(access.boardImageForMember(member, KEY)).thenReturn(false);
        BoardImageController c = new BoardImageController(storage, auth, access);
        assertEquals(404, code(c.getBoardImage(request, KEY)));
        verify(storage, never()).read(anyString());
    }

    @Test void publicBoardImageUsesThePublicFunction() {
        anonymous();
        when(access.boardImageForPublic(KEY)).thenReturn(true);
        BoardImageController c = new BoardImageController(storage, auth, access);
        assertEquals(200, code(c.getPublicBoardImage(KEY)));
    }

    @Test void boardUploadRegistersThroughTheFunction() throws Exception {
        signedIn();
        when(storage.save(any(byte[].class)))
                .thenReturn(new ImageStorageService.StoredImage(KEY, "image/png", 12, "/media/" + KEY));
        when(access.registerBoardImage(member, KEY)).thenReturn(false);
        ResponseEntity<?> r = new BoardImageController(storage, auth, access).uploadBoardImage(request, null, PNG);
        assertEquals(503, code(r));
        verify(storage).remove(KEY);
    }

    // --- the service itself ---

    @Test void aFailedVisibilityCheckIsUnavailableNotAllowed() {
        JdbcTemplate db = mock(JdbcTemplate.class);
        when(db.queryForObject(anyString(), eq(Boolean.class), any(Object[].class)))
                .thenThrow(new DataAccessResourceFailureException("down"));
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> new MediaAccessService(db).publishedPhoto(KEY));
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void boardUploadAnswersTheGuardedBoardPathAndPublicImagesCacheBriefly() throws Exception {
        signedIn();
        when(storage.save(any(byte[].class)))
                .thenReturn(new ImageStorageService.StoredImage(KEY, "image/png", 12, "/media/" + KEY));
        when(access.registerBoardImage(member, KEY)).thenReturn(true);
        BoardImageController c = new BoardImageController(storage, auth, access);
        ResponseEntity<?> r = c.uploadBoardImage(request, null, PNG);
        assertEquals("/api/v1/board/images/" + KEY, ((Map<?, ?>) r.getBody()).get("url"));
        when(access.boardImageForPublic(KEY)).thenReturn(true);
        // Same lifetime as the legacy gateway, so a deleted post's image leaves shared caches quickly.
        assertEquals("public, max-age=300", c.getPublicBoardImage(KEY).getHeaders().getCacheControl());
    }
}
