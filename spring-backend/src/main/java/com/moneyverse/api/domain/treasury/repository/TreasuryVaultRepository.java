package com.moneyverse.api.domain.treasury.repository;

import com.moneyverse.api.domain.treasury.model.TreasuryVault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreasuryVaultRepository extends JpaRepository<TreasuryVault, String> {
    Optional<TreasuryVault> findByVaultCode(String vaultCode);
}
