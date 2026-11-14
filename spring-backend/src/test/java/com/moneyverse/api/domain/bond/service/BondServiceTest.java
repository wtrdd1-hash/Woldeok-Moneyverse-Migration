package com.moneyverse.api.domain.bond.service;

import com.moneyverse.api.domain.bond.dto.BondDtos.BondOverview;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class BondServiceTest {

    @Autowired
    private BondService bondService;

    @Test
    @DisplayName("가상 국채 개요 조회 시 기본 지표가 정상 반환되어야 한다")
    void getOverviewTest() {
        BondOverview overview = bondService.getOverview();
        assertThat(overview).isNotNull();
        assertThat(overview.getTotalDebtWld()).isNotNull();
    }
}
