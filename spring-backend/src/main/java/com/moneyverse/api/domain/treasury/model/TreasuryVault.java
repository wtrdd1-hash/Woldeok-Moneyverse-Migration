package com.moneyverse.api.domain.treasury.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "treasury_vaults")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreasuryVault {

    @Id
    @Column(name = "vault_code", length = 32, nullable = false)
    private String vaultCode;

    @Column(name = "balance_wld", nullable = false)
    private Long balanceWld;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

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
}
