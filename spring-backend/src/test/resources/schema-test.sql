CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(120),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    display_name VARCHAR(120),
    email VARCHAR(255),
    image_url TEXT,
    job_type VARCHAR(50),
    job_level INT DEFAULT 1,
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    featured_title VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY,
    token_hash TEXT NOT NULL,
    csrf_hash TEXT NOT NULL,
    user_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    prelogin_consent_version_id UUID,
    prelogin_age_confirmed BOOLEAN DEFAULT TRUE,
    prelogin_consented_at TIMESTAMP WITH TIME ZONE,
    reauthenticated_at TIMESTAMP WITH TIME ZONE,
    admin_opened_at TIMESTAMP WITH TIME ZONE,
    admin_last_seen_at TIMESTAMP WITH TIME ZONE,
    admin_closed_at TIMESTAMP WITH TIME ZONE,
    admin_rotated_from UUID
);

CREATE TABLE IF NOT EXISTS auth_local_credentials (
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    password_verifier TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    disabled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS auth_security_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_saving_pockets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    balance BIGINT DEFAULT 0,
    target_amount BIGINT,
    target_date DATE,
    theme_color VARCHAR(50) DEFAULT '#3B82F6',
    icon_code VARCHAR(50) DEFAULT 'SAVINGS',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    account_type VARCHAR(50) NOT NULL,
    owner_user_id UUID,
    system_key TEXT,
    currency VARCHAR(10) DEFAULT 'WLD',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    allow_negative BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_balances (
    account_id UUID PRIMARY KEY,
    balance BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
