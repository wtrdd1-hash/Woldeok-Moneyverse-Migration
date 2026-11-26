package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.controller.BankController;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Signed-in E2E 2026-11-25: GET /api/v1/banking/pockets was mapped by both BankController and
 * PocketController (ambiguous handler, 500 for every member), and BankController's transfer
 * called the unjournaled bank_transfer_pocket and echoed the DB error. PocketController owns
 * the pocket routes.
 */
class PocketRouteOwnershipTest {
    @Test void bankControllerNoLongerMapsPocketRoutes() {
        boolean any = Arrays.stream(BankController.class.getDeclaredMethods()).anyMatch(m ->
                (m.isAnnotationPresent(GetMapping.class) && Arrays.stream(m.getAnnotation(GetMapping.class).value()).anyMatch(p -> p.contains("pockets")))
                || (m.isAnnotationPresent(PostMapping.class) && Arrays.stream(m.getAnnotation(PostMapping.class).value()).anyMatch(p -> p.contains("pockets"))));
        assertFalse(any);
    }
}
