package com.moneyverse.api.domain.tools;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class SpringCalculatorMathUnitTest {
    private static String metric(SpringCalculatorMath.Input input, String key) {
        assertTrue(input.valid(), input.error());
        return input.result().metrics().stream().filter(m -> m.key().equals(key))
                .findFirst().orElseThrow().value();
    }

    @Test void compoundZeroRateMatchesExistingMonthlyDepositContract() {
        var result=SpringCalculatorMath.compound(Map.of("principal","1000","monthlyDeposit","100", "annualRate","0","years","2","frequency","monthly"));
        assertEquals("3,400",metric(result,"total-final"));
        assertEquals("0",metric(result,"total-interest"));
        assertEquals(2,result.result().yearly().size());
    }

    @Test void compoundDailyMonthlyAnnualHaveGreaterOrEqualSavingsThanContributions() {
        for (String period: new String[]{"daily","monthly","annually"}) {
            var result=SpringCalculatorMath.compound(Map.of("principal","1000","monthlyDeposit","100","annualRate","8.5","years","3","frequency",period));
            assertEquals("4,600",metric(result,"total-deposit"));
            assertEquals(3,result.result().yearly().size());
            assertFalse(result.result().metrics().isEmpty());
        }
    }

    @Test void averageCostAndTargetFeeStayAlignedWithOriginalNextMath() {
        var result=SpringCalculatorMath.stock(Map.of("initialPrice","50","initialQuantity","100","additionalPrice","40","additionalQuantity","150","targetProfitPercent","15","feeRate","0.05"));
        assertEquals("44",metric(result,"average"));
        assertEquals("250",metric(result,"quantity"));
        assertEquals("11,000",metric(result,"cost"));
        assertEquals("50.63",metric(result,"target-price"));
    }

    @Test void untrustedOverlongScientificNegativeAndInvalidPeriodFailClosed() {
        assertFalse(SpringCalculatorMath.compound(Map.of("principal","-1")).valid());
        assertFalse(SpringCalculatorMath.compound(Map.of("principal","1e9")).valid());
        assertFalse(SpringCalculatorMath.compound(Map.of("frequency","weekly")).valid());
        assertFalse(SpringCalculatorMath.compound(Map.of("years","0")).valid());
        assertFalse(SpringCalculatorMath.compound(Map.of("years","1.2")).valid());
        assertFalse(SpringCalculatorMath.compound(Map.of("annualRate","101")).valid());
        assertFalse(SpringCalculatorMath.stock(Map.of("feeRate","100")).valid());
        assertFalse(SpringCalculatorMath.stock(Map.of("initialPrice","999999999999")).valid());
    }

    @Test void zeroQuantityStockDoesNotCrashOrInventTradeReceipts() {
        var result=SpringCalculatorMath.stock(Map.of("initialQuantity","0","additionalQuantity","0"));
        assertEquals("0",metric(result,"quantity"));
        assertEquals("0",metric(result,"average"));
        assertEquals("0",metric(result,"target-price"));
    }
}
