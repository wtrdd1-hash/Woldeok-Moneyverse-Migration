package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Identity headers are never legitimately sent by a client (no BFF, bot or page in this repository
 * sends them), yet handlers outside the member/admin boundary filters still read them. Inventory
 * 2026-11-26: 45 such handler/route pairs; the live ones already ignore the header, but the mint
 * and central-bank writes take it as the actor and are only safe because their service is
 * unavailable. Strip the headers everywhere the boundary filter has not substituted a verified
 * actor, so re-enabling one of those services cannot reopen actor spoofing.
 */
@SpringBootTest(properties={"moneyverse.app-base-url=https://easy-scraping.com","moneyverse.scheduling.enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActorHeaderSanitizingFilterTest {
    @Autowired MockMvc mvc;

    private static final String FORGED = "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";

    @Test void forgedActorHeadersAreInvisibleOutsideTheBoundary() throws Exception {
        var request = new MockHttpServletRequest("PUT", "/api/v1/central-bank/base-rate");
        request.addHeader("X-User-Id", FORGED);
        request.addHeader("x-actor-user-id", FORGED);
        request.addHeader("X-Admin-Id", FORGED);
        request.addHeader("Accept", "application/json");
        var chain = new MockFilterChain();
        new ActorHeaderSanitizingFilter().doFilter(request, new MockHttpServletResponse(), chain);
        var seen = (jakarta.servlet.http.HttpServletRequest) chain.getRequest();
        assertNotNull(seen);
        for (String h : new String[]{"X-User-Id", "x-user-id", "x-actor-user-id", "X-Admin-Id", "x-admin-id"}) {
            assertNull(seen.getHeader(h), h + " must not reach the handler");
            assertFalse(seen.getHeaders(h).hasMoreElements(), h + " must not be enumerable");
        }
        assertFalse(Collections.list(seen.getHeaderNames()).stream().anyMatch(n -> n.equalsIgnoreCase("x-admin-id")));
        assertEquals("application/json", seen.getHeader("Accept"), "other headers are untouched");
    }

    @Test void verifiedActorSubstitutedByTheBoundaryIsKept() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/account/settings");
        request.addHeader("X-User-Id", FORGED);
        request.addHeader("X-Admin-Id", FORGED);
        request.setAttribute(SensitiveApiBoundaryFilter.VERIFIED_ACTOR_ATTRIBUTE, Boolean.TRUE);
        var chain = new MockFilterChain();
        new ActorHeaderSanitizingFilter().doFilter(request, new MockHttpServletResponse(), chain);
        var seen = (jakarta.servlet.http.HttpServletRequest) chain.getRequest();
        // The boundary substitutes X-User-Id / x-actor-user-id; nothing ever substitutes X-Admin-Id,
        // so it stays hidden on verified member paths too (review finding 2026-11-26).
        assertEquals(FORGED, seen.getHeader("X-User-Id"));
        assertNull(seen.getHeader("X-Admin-Id"));
        assertFalse(seen.getHeaders("x-admin-id").hasMoreElements());
    }

    @Test void mintWriteNoLongerTakesItsActorFromAHeader() throws Exception {
        mvc.perform(post("/api/v1/mint/burn").header("X-User-Id", FORGED)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
