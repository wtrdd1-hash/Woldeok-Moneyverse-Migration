package com.moneyverse.api.domain.wallet.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import static org.assertj.core.api.Assertions.assertThat;

class LegacyWalletSafetyTest {
    private final WalletController controller = new WalletController();

    @Test
    void noLegacyWalletRouteMayReturnDummyBalanceOrPerformDirectBalanceMutation() {
        assertThat(controller.overview().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(controller.balance().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(controller.transfer().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(controller.transfer().getBody()).containsEntry("code", "WALLET_LEGACY_ENDPOINT_DISABLED");
    }
}
