package com.moneyverse.api.domain.web;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class NativeWalletWebTest {
    @Autowired MockMvc mvc;
    @MockBean UserAuthService auth;
    private void signedIn() {
        var session=new UserAuthService.SessionInfo();
        session.setUserId(UUID.fromString("00000000-0000-0000-0000-000000000101"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
    }
    @Test void guestAndForgedHeaderCannotEnterMemberWallet() throws Exception {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        for(String path:new String[]{"/wallet","/wallet/","/wallet.html","/wallet/index.html"}) {
            mvc.perform(get(path).header("X-User-Id",UUID.randomUUID().toString()))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/login?next=%2Fwallet"));
        }
    }
    @ParameterizedTest @ValueSource(strings={"en","ko","ja","zh","vi"})
    void signedInWalletUsesNativeTemplateAndKeepsTransferControls(String code) throws Exception {
        signedIn();
        mvc.perform(get("/wallet").cookie(new Cookie("wdmv_locale",code)).header("Accept-Language","en"))
            .andExpect(status().isOk()).andExpect(view().name("mv43/wallet"))
            .andExpect(header().string("Content-Language",code))
            .andExpect(header().string("Cache-Control",containsString("no-store")))
            .andExpect(header().string("X-Robots-Tag",containsString("noindex")))
            .andExpect(content().string(containsString("id=\"wallet-transfer-form\"")))
            .andExpect(content().string(containsString("name=\"recipientUserId\"")))
            .andExpect(content().string(containsString("name=\"amountWld\"")))
            .andExpect(content().string(containsString("id=\"wallet-transactions\"")))
            .andExpect(content().string(containsString("id=\"mv-support-panel\"")))
            .andExpect(content().string(not(containsString("/_next/"))));
    }
}
