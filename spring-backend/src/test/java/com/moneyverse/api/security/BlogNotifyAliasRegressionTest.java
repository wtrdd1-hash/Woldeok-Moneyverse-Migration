package com.moneyverse.api.security;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25: /api/v1/blog/notify(+/test) sat outside the admin
 * filter (an explicit exclusion) and ran the Telegram/Discord notifier scripts with
 * caller-chosen title and URL: anyone could send official-looking links. Only the
 * admin-prefixed path may exist, and the filter must not exempt it.
 */
class BlogNotifyAliasRegressionTest {
    @Test void blogNotifyLivesOnlyUnderTheAdminPrefix() throws Exception {
        String controller = Files.readString(Path.of("src/main/java/com/moneyverse/api/domain/admin/controller/BlogNotificationController.java"));
        assertFalse(controller.contains("\"/api/v1/blog/notify"), "non-admin alias still mapped");
        assertFalse(controller.contains("\"/api/blog/notify"), "non-admin alias still mapped");
        String filter = Files.readString(Path.of("src/main/java/com/moneyverse/api/config/AdminApiBoundaryFilter.java"));
        assertFalse(filter.contains("/api/v1/blog/notify"), "admin filter still exempts blog notify");
    }
}
