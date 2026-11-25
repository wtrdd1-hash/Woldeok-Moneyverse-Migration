package com.moneyverse.api.contract;

import static org.assertj.core.api.Assertions.assertThat;

import com.moneyverse.api.domain.centralbank.controller.CentralBankController;
import com.moneyverse.api.domain.marketplace.controller.MarketplaceController;
import com.moneyverse.api.domain.pension.controller.PensionController;
import com.moneyverse.api.domain.season.controller.SeasonController;
import java.util.Arrays;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.stream.Stream;

/**
 * QA 2026-11-25: the Next frontend calls /api/v1/... for these domains, but the
 * controllers only answered /api/..., so /pension, central-bank rates,
 * marketplace listings and the current season were all 404 on Test.
 * Every other domain controller already maps both prefixes.
 */
class FrontendV1AliasMappingTest {

    static Stream<Arguments> controllers() {
        return Stream.of(
                Arguments.of(PensionController.class, "pension"),
                Arguments.of(CentralBankController.class, "central-bank"),
                Arguments.of(MarketplaceController.class, "marketplace"),
                Arguments.of(SeasonController.class, "seasons"));
    }

    @ParameterizedTest
    @MethodSource("controllers")
    void mapsBothLegacyAndV1Prefixes(Class<?> controller, String domain) {
        RequestMapping mapping = controller.getAnnotation(RequestMapping.class);
        assertThat(mapping).isNotNull();
        String[] paths = mapping.value().length > 0 ? mapping.value() : mapping.path();
        assertThat(Arrays.asList(paths)).contains("/api/" + domain, "/api/v1/" + domain);
    }
}
