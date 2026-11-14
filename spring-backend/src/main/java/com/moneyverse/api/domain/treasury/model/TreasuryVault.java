package com.moneyverse.api.domain.treasury.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "treasury_vaults")
public class TreasuryVault {

    @Id
    @Column(name = "vault_code", length = 32, nullable = false)
    private String vaultCode;

    @Column(name = "balance_wld", nullable = false)
    private Long balanceWld;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TreasuryVault() {
    }

    public TreasuryVault(String vaultCode, Long balanceWld, String description, Instant updatedAt) {
        this.vaultCode = vaultCode;
        this.balanceWld = balanceWld;
        this.description = description;
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String vaultCode;
        private Long balanceWld;
        private String description;
        private Instant updatedAt = Instant.now();

        public Builder vaultCode(String vaultCode) { this.vaultCode = vaultCode; return this; }
        public Builder balanceWld(Long balanceWld) { this.balanceWld = balanceWld; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public TreasuryVault build() { return new TreasuryVault(vaultCode, balanceWld, description, updatedAt); }
    }

    public void credit(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        this.balanceWld += amount;
        this.updatedAt = Instant.now();
    }

    public void debit(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (this.balanceWld < amount) {
            throw new IllegalStateException("Insufficient vault balance: " + this.balanceWld + " < " + amount);
        }
        this.balanceWld -= amount;
        this.updatedAt = Instant.now();
    }

    public String getVaultCode() { return vaultCode; }
    public void setVaultCode(String vaultCode) { this.vaultCode = vaultCode; }
    public Long getBalanceWld() { return balanceWld; }
    public void setBalanceWld(Long balanceWld) { this.balanceWld = balanceWld; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
