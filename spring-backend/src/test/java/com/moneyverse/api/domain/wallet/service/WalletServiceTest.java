package com.moneyverse.api.domain.wallet.service;

import com.moneyverse.api.domain.wallet.dto.WalletDtos.WalletOverview;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@SpringBootTest
@ActiveProfiles("test")
class WalletServiceTest {

    @Autowired
    private WalletService walletService;

    @Test
    @DisplayName("실제 금융 원장 영수증이 미검증일 때 지갑 잔액을 임의 금액으로 채우지 않는다")
    void getOverviewTest() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> walletService.getOverview("00000000-0000-0000-0000-000000000101"));
        assertThat(error.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
