package com.moneyverse.api.domain.wallet.contract;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/** Live embedded HTTP on a random localhost port and H2 test datasource only. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WalletAnonymousHttpContractTest {
    @Autowired
    private TestRestTemplate http;

    @Test
    void legacyAndCurrentWalletMustRejectAnonymousAndNeverProduceFictitiousMoney() {
        for (String path : new String[]{
            "/api/v1/auth/session", "/api/v1/wallet?recent=50", "/api/v1/bank/loans",
            "/api/v1/rewards/availability", "/api/v1/stocks/portfolio", "/api/v1/stocks/history"}) {
            ResponseEntity<String> response = http.getForEntity(path, String.class);
            assertThat(response.getStatusCode()).describedAs("unauthenticated GET %s", path)
                .isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).doesNotContain("100000");
        }
        assertThat(http.getForEntity("/api/wallet/overview", String.class).getStatusCode())
            .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(http.getForEntity("/api/wallet/balance", String.class).getStatusCode())
            .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(http.exchange("/api/wallet/transfer", HttpMethod.POST, null, String.class).getStatusCode())
            .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
