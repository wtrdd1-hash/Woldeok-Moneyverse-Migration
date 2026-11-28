package com.moneyverse.api.domain.admin;

import com.moneyverse.api.domain.admin.controller.BlogNotificationController;
import com.moneyverse.api.domain.admin.controller.InternalBlogPublishNotifyController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 2026-11-26: the post-publish hook has failed since the public notify route became admin-only.
 * The replacement is local-only, token-gated, takes only a slug, and announces an article once,
 * built from the database row (migration 355) rather than caller-supplied text or links.
 */
class InternalBlogPublishNotifyTest {
    private static final String TOKEN = "0123456789abcdef0123456789abcdef0123456789abcdef";
    /** SHA-256 fingerprint of the compromised default (the value itself is never kept in the repository). */
    private static final String COMPROMISED_SHA256 = "1eb829e05776a61428a25bc398e69127f67c89e87af0d2176209bc387ed7a9cd";

    private static MockHttpServletRequest req(String remote, String token) {
        var r = new MockHttpServletRequest("POST", "/internal/blog/published-notify");
        r.setRemoteAddr(remote);
        if (token != null) r.addHeader("x-internal-token", token);
        return r;
    }

    @SuppressWarnings("unchecked")
    private static JdbcTemplate jdbcReturning(List<Map<String, Object>> rows) {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(rows);
        return jdbc;
    }

    @Test void firstClaimDispatchesFromTheDatabaseRow() {
        var notifier = mock(BlogNotificationController.class);
        var jdbc = jdbcReturning(List.of(Map.of("slug", "a-1", "title", "DB title", "topic", "ECONOMY", "excerpt", "DB excerpt")));
        var c = new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN);
        assertEquals(202, c.notifyPublished(req("127.0.0.1", TOKEN), Map.of("slug", "a-1", "title", "ignored", "url", "https://evil.example")).getStatusCode().value());
        verify(notifier).notifyPublish(argThat(m -> "DB title".equals(m.get("title"))
                && "https://easy-scraping.com/blog/a-1".equals(m.get("url"))));
    }

    @Test void withoutASlugTheDatabaseChoosesTheNewestUnannouncedArticle() {
        var notifier = mock(BlogNotificationController.class);
        var jdbc = jdbcReturning(List.of(Map.of("slug", "b-2", "title", "Newest", "topic", "CODING", "excerpt", "x")));
        var c = new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN);
        assertEquals(202, c.notifyPublished(req("127.0.0.1", TOKEN), Map.of()).getStatusCode().value());
        verify(jdbc).queryForList(anyString(), (Object) isNull());
        verify(notifier).notifyPublish(argThat(m -> "https://easy-scraping.com/blog/b-2".equals(m.get("url"))));
    }

    @Test void repeatOrUnpublishedSlugDispatchesNothing() {
        var notifier = mock(BlogNotificationController.class);
        var c = new InternalBlogPublishNotifyController(jdbcReturning(List.of()), notifier, TOKEN);
        assertEquals(200, c.notifyPublished(req("127.0.0.1", TOKEN), Map.of("slug", "a-1")).getStatusCode().value());
        verifyNoInteractions(notifier);
    }

    @Test void nonLoopbackWrongTokenOrCommittedDefaultAreRefused() {
        var notifier = mock(BlogNotificationController.class);
        var jdbc = jdbcReturning(List.of(Map.of("slug", "a-1", "title", "t", "topic", "ECONOMY", "excerpt", "e")));
        assertEquals(404, new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN).notifyPublished(req("192.168.100.5", TOKEN), Map.of("slug", "a-1")).getStatusCode().value());
        assertEquals(403, new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN).notifyPublished(req("127.0.0.1", "wrong"), Map.of("slug", "a-1")).getStatusCode().value());
        assertEquals(403, new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN).notifyPublished(req("127.0.0.1", null), Map.of("slug", "a-1")).getStatusCode().value());
        assertEquals(503, new InternalBlogPublishNotifyController(jdbc, notifier, "short").notifyPublished(req("127.0.0.1", "short"), Map.of("slug", "a-1")).getStatusCode().value());
        assertEquals(400, new InternalBlogPublishNotifyController(jdbc, notifier, TOKEN).notifyPublished(req("127.0.0.1", TOKEN), Map.of("slug", "../x")).getStatusCode().value());
        verifyNoInteractions(notifier);
    }

    /** The refused default is identified by fingerprint; it must be the compromised value's. */
    @Test void theRefusedDefaultIsTheCompromisedFingerprint() throws Exception {
        var field = InternalBlogPublishNotifyController.class.getDeclaredField("COMMITTED_DEFAULT_SHA256");
        field.setAccessible(true);
        assertEquals(COMPROMISED_SHA256, field.get(null));
    }
}
