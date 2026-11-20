package com.moneyverse.api.domain.identity.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserAuthRegistrationSafetyTest {
    @Test void unsupportedRegistrationCannotCreateUnjournaledMemberCash() {
        JdbcTemplate database=mock(JdbcTemplate.class);
        var service=new UserAuthService(database);
        var response=new MockHttpServletResponse();
        ResponseStatusException failure=assertThrows(ResponseStatusException.class,
            ()->service.register("synthetic-registration@example.invalid","Synthetic-password-only-2026","Synthetic member",response));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,failure.getStatusCode());
        verifyNoInteractions(database);
        assertTrue(response.getHeaders("Set-Cookie").isEmpty());
    }

    @Test void registrationIsUnavailableBeforeAnyPartialProfileCredentialOrSessionWrite() {
        JdbcTemplate database=mock(JdbcTemplate.class);
        var service=new UserAuthService(database);
        Throwable failure=assertThrows(Throwable.class,()->service.register(null,null,null,null));
        assertInstanceOf(ResponseStatusException.class,failure);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,((ResponseStatusException)failure).getStatusCode());
        verifyNoInteractions(database);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings={"/api/v1/auth/local/register","/api/auth/local/register"})
    void bothHttpAliasesExposeUnavailableWithoutLeakingInternalsOrWriting(String path) throws Exception {
        JdbcTemplate database=mock(JdbcTemplate.class);
        var mvc=org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
            new com.moneyverse.api.domain.identity.controller.LocalAuthController(new UserAuthService(database))).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path)
                .contentType("application/json")
                .content("{\"email\":\"synthetic-registration@example.invalid\",\"password\":\"Synthetic-password-only-2026\"}"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isServiceUnavailable())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Cache-Control","private, no-store"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().doesNotExist("Set-Cookie"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.code").value("LOCAL_REGISTRATION_CONTRACT_UNAVAILABLE"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.detail").doesNotExist());
        verifyNoInteractions(database);
    }
}
