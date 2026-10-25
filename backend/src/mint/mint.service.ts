import { Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import { BurnCurrencyDto, CreateMintBatchDto } from './mint.dto';
import { DiscordAlertService } from '../discord/discord-alert.service';

export interface MintBatch {
  id: string;
  batchNumber: string;
  amountWld: string;
  denomination: string;
  productionCostWld: string;
  seigniorageWld: string;
  status: 'PENDING_CENTRAL_BANK_ACCEPTANCE' | 'ACCEPTED_BY_CENTRAL_BANK' | 'REJECTED';
  mintReason: string;
  requestedBy: string;
  verificationHash: string;
  acceptedAt?: string | undefined;
  centralBankTxId?: string | undefined;
  createdAt: string;
}

export interface BurnCertificate {
  id: string;
  certificateNumber: string;
  amountWld: string;
  sinkCategory: string;
  burnReason: string;
  burnedBy: string;
  proofTransactionId?: string | undefined;
  cryptographicProof: string;
  burnedAt: string;
}

export interface MintLedgerSummary {
  nationalMintAuthority: string;
  jurisdiction: string;
  totalMintedM0Wld: string;
  totalProductionCostWld: string;
  totalCumulativeSeigniorageWld: string;
  totalBurnedDestroyedWld: string;
  netCirculationExpansionWld: string;
  activeMintBatchesCount: number;
  burnCertificatesCount: number;
  lastAuditedAt: string;
}

/**
 * No authoritative mint/burn settlement or immutable certificate read model is
 * wired to this service. The former process-local records included a fictional
 * genesis issuance and tax burn; exposing them as audited WLD is unsafe.
 * Restore these routes only after DB-owned, ledger-linked issuance/burn functions
 * and independent certificate verification are available.
 */
@Injectable()
export class MintService {
  constructor(@Optional() _discordAlertService?: DiscordAlertService) {}

  private unavailable(): never {
    throw new ServiceUnavailableException({
      code: 'MINT_LEDGER_EVIDENCE_UNAVAILABLE',
      message: 'Mint, burn and monetary certificate records require verified ledger settlement.',
    });
  }

  async createMintBatch(_dto: CreateMintBatchDto, _requestedBy: string): Promise<MintBatch> {
    return this.unavailable();
  }

  async getBatches(): Promise<MintBatch[]> {
    return this.unavailable();
  }

  async getBatchById(_id: string): Promise<MintBatch> {
    return this.unavailable();
  }

  async markBatchAccepted(_id: string, _centralBankTxId: string): Promise<MintBatch> {
    return this.unavailable();
  }

  async burnCurrency(_dto: BurnCurrencyDto, _burnedBy: string): Promise<BurnCertificate> {
    return this.unavailable();
  }

  async getSeigniorageLedger(): Promise<MintLedgerSummary> {
    return this.unavailable();
  }

  async getAuditCertificates(): Promise<BurnCertificate[]> {
    return this.unavailable();
  }
}
