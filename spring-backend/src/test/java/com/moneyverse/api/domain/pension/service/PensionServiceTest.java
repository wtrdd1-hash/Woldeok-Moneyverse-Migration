package com.moneyverse.api.domain.pension.service;

import com.moneyverse.api.domain.pension.dto.PensionDtos.PensionOverview;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PensionServiceTest {

    @Autowired
    private PensionService pensionService;

    @Test
    @DisplayName("국민연금 개요 통계 조회 시 기본 지표가 정상 반환되어야 한다")
    void getOverviewTest() {
        PensionOverview overview = pensionService.getOverview();
        assertThat(overview).isNotNull();
        assertThat(overview.getTotalAumWld()).isNotNull();
        assertThat(overview.getBenchmarkAnnualPayoutRate()).isEqualTo("5.20%");
        assertThat(overview.isAnnualPayoutRateCertified()).isTrue();
    }
}
