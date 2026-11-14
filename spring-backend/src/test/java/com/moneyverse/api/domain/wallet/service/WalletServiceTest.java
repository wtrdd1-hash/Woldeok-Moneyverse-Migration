package com.moneyverse.api.domain.wallet.service;

import com.moneyverse.api.domain.wallet.dto.WalletDtos.WalletOverview;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class WalletServiceTest {

    @Autowired
    private WalletService walletService;

    @Test
    @DisplayName("지갑 개요 조회 시 통화 및 가용 잔액이 정상 반환되어야 한다")
    void getOverviewTest() {
        WalletOverview ov = walletService.getOverview("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        assertThat(ov).isNotNull();
        assertThat(ov.getCurrency()).isEqualTo("WLD");
    }
}
