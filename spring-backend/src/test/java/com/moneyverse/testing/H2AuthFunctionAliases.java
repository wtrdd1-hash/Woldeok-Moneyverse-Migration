package com.moneyverse.testing;

import java.sql.*;
import java.util.UUID;

/**
 * H2 stand-ins for the PostgreSQL credential functions (180, 356) so the H2 integration tests
 * exercise the same SQL the API sends. The H2 schema has no user status column, so the
 * "active account" condition is verified against PostgreSQL (capacity sandbox / CI), not here.
 */
public final class H2AuthFunctionAliases {
    private H2AuthFunctionAliases() {}

    // Returns H2's own result set so the UUID column keeps its type (a SimpleResultSet column
    // declared as OTHER failed conversion).
    public static ResultSet credentialForLogin(Connection c, String emailHash) throws SQLException {
        PreparedStatement ps = c.prepareStatement(
                "SELECT user_id, password_verifier FROM auth_local_credentials WHERE email_hash = ? AND disabled_at IS NULL LIMIT 1");
        ps.setString(1, emailHash);
        return ps.executeQuery();
    }

    public static String emailForActor(Connection c, UUID actor) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT email FROM auth_local_credentials WHERE user_id = ? AND disabled_at IS NULL LIMIT 1")) {
            ps.setObject(1, actor);
            try (ResultSet r = ps.executeQuery()) { return r.next() ? r.getString(1) : null; }
        }
    }

    public static String verifierForActor(Connection c, UUID actor, UUID session) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT credential.password_verifier FROM auth_local_credentials credential "
                        + "WHERE credential.user_id = ? AND credential.disabled_at IS NULL AND EXISTS ("
                        + "SELECT 1 FROM auth_sessions s WHERE s.id = ? AND s.user_id = ? AND s.revoked_at IS NULL "
                        + "AND s.expires_at > CURRENT_TIMESTAMP) LIMIT 1")) {
            ps.setObject(1, actor); ps.setObject(2, session); ps.setObject(3, actor);
            try (ResultSet r = ps.executeQuery()) { return r.next() ? r.getString(1) : null; }
        }
    }
}
