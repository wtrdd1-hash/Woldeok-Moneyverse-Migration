package com.moneyverse.api.domain.wallet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.wallet.dto.WalletDtos.TransferRequest;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class WalletCanonicalAmountTest {
    private final ObjectMapper mapper=new ObjectMapper();
    @Test void transferAmountCanCrossJsonBoundaryWithoutLosing38DigitPrecision() {
        String amount="99999999999999999999999999999999999999";
        TransferRequest request=assertDoesNotThrow(()->mapper.readValue(
            "{\"recipientUserId\":\"00000000-0000-0000-0000-000000000101\",\"amountWld\":\""+amount+"\"}",TransferRequest.class));
        assertEquals(amount,request.getAmountWld().toString());
    }
    @Test void onlyPositiveCanonicalIntegerAmountsAreAccepted() throws Exception {
        try(var factory=Validation.buildDefaultValidatorFactory()) {
            for(String amount:new String[]{"0","-1","1.5","1e3"," 10","01","999999999999999999999999999999999999999"}) {
                TransferRequest request=mapper.readValue(
                    "{\"recipientUserId\":\"00000000-0000-0000-0000-000000000101\",\"amountWld\":\""+amount+"\"}",TransferRequest.class);
                assertFalse(factory.getValidator().validate(request).isEmpty(),amount);
            }
        }
    }
}
