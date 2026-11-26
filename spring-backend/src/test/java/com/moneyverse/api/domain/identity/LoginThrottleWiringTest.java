package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.controller.LocalAuthController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** After repeated wrong passwords an account answers 429 and the password is not even checked. */
class LoginThrottleWiringTest {
    @Test void repeatedFailuresAreThrottledBeforeThePasswordCheck() {
        UserAuthService auth = mock(UserAuthService.class);
        when(auth.login(anyString(), anyString(), any())).thenThrow(new IllegalArgumentException("invalid"));
        LocalAuthController controller = new LocalAuthController(auth);
        HttpServletResponse response = mock(HttpServletResponse.class);
        int unauthorized = 0, throttled = 0;
        for (int i = 0; i < 15; i++) {
            var r = controller.login(Map.of("email", "victim@example.com", "password", "guess" + i), response);
            if (r.getStatusCode() == HttpStatus.UNAUTHORIZED) unauthorized++;
            if (r.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) throttled++;
        }
        assertEquals(LocalAuthController.LOGIN_MAX_FAILURES, unauthorized);
        assertEquals(15 - LocalAuthController.LOGIN_MAX_FAILURES, throttled);
        verify(auth, times(LocalAuthController.LOGIN_MAX_FAILURES)).login(anyString(), anyString(), any());
    }

    @Test void aServerErrorDoesNotLeakTheExceptionMessage() {
        UserAuthService auth = mock(UserAuthService.class);
        when(auth.login(anyString(), anyString(), any())).thenThrow(new IllegalStateException("jdbc:postgresql://secret-host"));
        var r = new LocalAuthController(auth).login(Map.of("email", "a@b.co", "password", "x"), mock(HttpServletResponse.class));
        assertFalse(String.valueOf(r.getBody()).contains("secret-host"));
    }
}
