package com.moneyverse.api.domain.identity.service;

import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.web.server.ResponseStatusException;
import javax.sql.DataSource;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserAuthRegistrationProxySafetyTest {
    @Test void disabledRegistrationReturnsUnavailableEvenWhenTransactionConnectionsAreUnavailable() throws Exception {
        DataSource datasource=mock(DataSource.class);
        when(datasource.getConnection()).thenThrow(new SQLException("Synthetic unavailable connection"));
        var service=new UserAuthService(new JdbcTemplate(datasource));
        var factory=new ProxyFactory(service);
        factory.setProxyTargetClass(true);
        factory.addAdvice(new TransactionInterceptor(new DataSourceTransactionManager(datasource),
            new AnnotationTransactionAttributeSource()));
        var actualProxy=(UserAuthService)factory.getProxy();
        clearInvocations(datasource);
        var failure=assertThrows(ResponseStatusException.class,
            ()->actualProxy.register("synthetic@example.invalid","Synthetic-password-only","Synthetic member",null));
        assertEquals(503,failure.getStatusCode().value());
        verifyNoInteractions(datasource);
    }
}
