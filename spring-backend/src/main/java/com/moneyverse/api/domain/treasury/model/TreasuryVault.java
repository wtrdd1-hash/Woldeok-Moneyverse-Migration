package com.moneyverse.api.domain.treasury.model;

import jakarta.persistence.*;
import java.math.BigInteger;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "system_treasury_vaults")
public class TreasuryVault {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "balance_wld", nullable = false)
    private String balanceWld = "0";

    @Column(name = "description")
    private String description = "";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TreasuryVault() {
    }

    public TreasuryVault(UUID id, String code, String name, String balanceWld, String description, Instant createdAt, Instant updatedAt) {
        this.id = id != null ? id : UUID.randomUUID();
        this.code = code;
        this.name = name;
        this.balanceWld = balanceWld != null ? balanceWld : "0";
        this.description = description != null ? description : "";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String code;
        private String name;
        private String balanceWld = "0";
        private String description = "";
        private Instant createdAt = Instant.now();
        private Instant updatedAt = Instant.now();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder code(String code) { this.code = code; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder balanceWld(String balanceWld) { this.balanceWld = balanceWld; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public TreasuryVault build() { return new TreasuryVault(id, code, name, balanceWld, description, createdAt, updatedAt); }
    }

    public void credit(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        BigInteger current = new BigInteger(this.balanceWld == null || this.balanceWld.isBlank() ? "0" : this.balanceWld);
        this.balanceWld = current.add(BigInteger.valueOf(amount)).toString();
        this.updatedAt = Instant.now();
    }

    public void debit(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        BigInteger current = new BigInteger(this.balanceWld == null || this.balanceWld.isBlank() ? "0" : this.balanceWld);
        BigInteger debitAmount = BigInteger.valueOf(amount);
        if (current.compareTo(debitAmount) < 0) {
            throw new IllegalStateException("Insufficient vault balance: " + current + " < " + amount);
        }
        this.balanceWld = current.subtract(debitAmount).toString();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBalanceWld() { return balanceWld; }
    public void setBalanceWld(String balanceWld) { this.balanceWld = balanceWld; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
