package com.moneyverse.api.domain.media;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.LoginResult;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase11MediaAndUploadIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAuthService authService;

    // 1x1 valid transparent PNG bytes
    private static final byte[] VALID_PNG = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4, (byte) 0x89,
            0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
            0x78, (byte) 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
            0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            (byte) 0xAE, 0x42, 0x60, (byte) 0x82
    };

    @Test
    @DisplayName("GET /media/{nonexistent}: 미존재 키 조회 시 404 Not Found")
    void testNonexistentMedia() throws Exception {
        mockMvc.perform(get("/media/" + UUID.randomUUID() + ".png"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/photos/uploads: 미인증 접근 시 401 차단")
    void testUploadPhotosUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/photos/uploads"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/content/chat/upload: 미인증 접근 시 401 차단")
    void testUploadChatUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/content/chat/upload"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/board/images/uploads: 미인증 접근 시 401 차단")
    void testUploadBoardImagesUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/board/images/uploads"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/photos/uploads & GET /media: 정상 이미지 업로드 및 바이너리 스트리밍 검증")
    void testUploadAndRetrieveMedia() throws Exception {
        // Register test user
        String email = "testmedia_" + UUID.randomUUID().toString().substring(0, 8) + "@moneyverse.local";
        MockHttpServletResponse res = new MockHttpServletResponse();
        LoginResult login = authService.register(email, "pass1234!", "미디어테스터", res);

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", "image/png", VALID_PNG
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/photos/uploads")
                        .file(file)
                        .cookie(new Cookie("mv_session", login.token())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.storageKey", endsWith(".png")))
                .andExpect(jsonPath("$.mimeType", is("image/png")))
                .andReturn();

        String responseBody = uploadResult.getResponse().getContentAsString();
        String storageKey = responseBody.split("\"storageKey\":\"")[1].split("\"")[0];

        // Retrieve bytes via /media/{key}
        mockMvc.perform(get("/media/" + storageKey))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", is("image/png")))
                .andExpect(header().string("Cache-Control", containsString("immutable")))
                .andExpect(content().bytes(VALID_PNG));
    }
}
