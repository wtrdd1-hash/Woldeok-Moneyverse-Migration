import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import crypto from 'node:crypto';
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

@Injectable()
export class MintService {
  constructor(@Optional() private readonly discordAlertService?: DiscordAlertService) {}

  private batches: MintBatch[] = [
    {
      id: 'mint-batch-001',
      batchNumber: 'MINT-202610-001',
      amountWld: '500000000', // 5억 WLD
      denomination: '10000',
      productionCostWld: '10000',
      seigniorageWld: '499990000',
      status: 'ACCEPTED_BY_CENTRAL_BANK',
      mintReason: '월덕 머니버스 창립 본원통화(M0) 초도 주조',
      requestedBy: 'SYSTEM_GENESIS',
      verificationHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      acceptedAt: '2026-10-01T00:00:00.000Z',
      centralBankTxId: 'CB-ACCEPT-GENESIS-01',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
  ];

  private burnCertificates: BurnCertificate[] = [
    {
      id: 'burn-cert-001',
      certificateNumber: 'BURN-202610-001',
      amountWld: '1250000',
      sinkCategory: 'TAX',
      burnReason: '부동산 일일 보유세 정기 영구 소각',
      burnedBy: 'SYSTEM_TAX_ENGINE',
      proofTransactionId: 'TX-SINK-PROPERTY-TAX-1014',
      cryptographicProof: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      burnedAt: '2026-10-14T00:00:00.000Z',
    },
  ];

  /**
   * 신규 화폐 주조 (M0 본원통화 주조 요청 생성)
   * 조폐국은 주조만 수행하며, 중앙은행이 인수 및 승인해야 국고 및 시장으로 방출됨
   */
  async createMintBatch(dto: CreateMintBatchDto, requestedBy: string): Promise<MintBatch> {
    const amount = BigInt(dto.amountWld);
    if (amount <= BigInt(0)) {
      throw new BadRequestException('주조 수량은 0보다 커야 합니다.');
    }
    const cost = BigInt(dto.productionCostWld || '0');
    if (cost < BigInt(0) || cost >= amount) {
      throw new BadRequestException('유효하지 않은 주조 비용입니다.');
    }
    const seigniorage = amount - cost;

    const id = `mint-batch-${Date.now()}`;
    const batchNumber = `MINT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(this.batches.length + 1).padStart(3, '0')}`;
    const rawData = `${batchNumber}:${dto.amountWld}:${dto.denomination}:${seigniorage.toString()}:${requestedBy}:${Date.now()}`;
    const verificationHash = `sha256:${crypto.createHash('sha256').update(rawData).digest('hex')}`;

    const newBatch: MintBatch = {
      id,
      batchNumber,
      amountWld: dto.amountWld,
      denomination: dto.denomination,
      productionCostWld: cost.toString(),
      seigniorageWld: seigniorage.toString(),
      status: 'PENDING_CENTRAL_BANK_ACCEPTANCE',
      mintReason: dto.mintReason,
      requestedBy,
      verificationHash,
      createdAt: new Date().toISOString(),
    };

    this.batches.unshift(newBatch);

    // 디스코드 관제 웹훅 알림 전송 (비동기 논블로킹)
    this.discordAlertService?.sendDiscordEmbed({
      title: '🪙 [국가조폐국] 신규 본원통화(M0) 주조 배치 발행',
      description: `새로운 본원통화 주조 배치가 생성되어 중앙은행 인수 결재 대기열에 등록되었습니다.`,
      color: 0xf59e0b, // Amber
      fields: [
        { name: '배치 번호', value: `\`${newBatch.batchNumber}\``, inline: true },
        { name: '발행 액면가', value: `**${Number(newBatch.amountWld).toLocaleString()} WLD**`, inline: true },
        { name: '주조차익 (Seigniorage)', value: `${Number(newBatch.seigniorageWld).toLocaleString()} WLD`, inline: true },
        { name: '보안 무결성 서명 (SHA-256)', value: `\`${newBatch.verificationHash.slice(0, 24)}...\``, inline: false },
        { name: '주조 승인 상태', value: '⏳ **중앙은행 2단계 결재 대기**', inline: true },
        { name: '발행 책임자', value: requestedBy, inline: true },
      ],
      footer: { text: 'Woldeok National Mint Bureau' },
    }).catch(() => {});

    return newBatch;
  }

  async getBatches(): Promise<MintBatch[]> {
    return this.batches;
  }

  async getBatchById(id: string): Promise<MintBatch> {
    const batch = this.batches.find((b) => b.id === id);
    if (!batch) throw new NotFoundException(`Mint batch ${id} not found`);
    return batch;
  }

  /**
   * 중앙은행 인수 완료 처리 (중앙은행 모듈에서 호출)
   */
  async markBatchAccepted(id: string, centralBankTxId: string): Promise<MintBatch> {
    const batch = await this.getBatchById(id);
    if (batch.status !== 'PENDING_CENTRAL_BANK_ACCEPTANCE') {
      throw new BadRequestException(`배치 상태가 이미 처리되었습니다 (${batch.status})`);
    }
    batch.status = 'ACCEPTED_BY_CENTRAL_BANK';
    batch.acceptedAt = new Date().toISOString();
    batch.centralBankTxId = centralBankTxId;
    return batch;
  }

  /**
   * 통화 영구 소각 (Sinks) 집행 및 공인 인증서 발행
   */
  async burnCurrency(dto: BurnCurrencyDto, burnedBy: string): Promise<BurnCertificate> {
    const amount = BigInt(dto.amountWld);
    if (amount <= BigInt(0)) {
      throw new BadRequestException('소각 수량은 0보다 커야 합니다.');
    }

    const id = `burn-cert-${Date.now()}`;
    const certificateNumber = `BURN-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(this.burnCertificates.length + 1).padStart(3, '0')}`;
    const rawData = `${certificateNumber}:${dto.amountWld}:${dto.sinkCategory}:${burnedBy}:${Date.now()}`;
    const cryptographicProof = `sha256:${crypto.createHash('sha256').update(rawData).digest('hex')}`;

    const certificate: BurnCertificate = {
      id,
      certificateNumber,
      amountWld: dto.amountWld,
      sinkCategory: dto.sinkCategory,
      burnReason: dto.burnReason,
      burnedBy,
      proofTransactionId: dto.proofTransactionId,
      cryptographicProof,
      burnedAt: new Date().toISOString(),
    };

    this.burnCertificates.unshift(certificate);

    // 디스코드 관제 웹훅 알림 전송 (비동기 논블로킹)
    this.discordAlertService?.sendDiscordEmbed({
      title: '🔥 [국가조폐국] 시장 과잉 통화 영구 소각(Sink) 공인 집행',
      description: `시중 초과 유동성 흡수 및 디플레이션 안정을 위한 불가역적 영구 소각이 완료되었습니다.`,
      color: 0xef4444, // Red
      fields: [
        { name: '공인 소각 증적 번호', value: `\`${certificate.certificateNumber}\``, inline: true },
        { name: '소각 집행액', value: `**-${Number(certificate.amountWld).toLocaleString()} WLD**`, inline: true },
        { name: '소각 카테고리', value: certificate.sinkCategory, inline: true },
        { name: '소각 원인', value: certificate.burnReason, inline: false },
        { name: '소각 후 통화 정합성', value: '100% 영구 감액 국고 반영', inline: true },
        { name: '소각 집행관', value: burnedBy, inline: true },
      ],
      footer: { text: 'Woldeok National Mint Audit Certification' },
    }).catch(() => {});

    return certificate;
  }

  /**
   * 주조차익(Seigniorage) 및 소각 총괄 원장 반환
   */
  async getSeigniorageLedger() {
    let totalMintedWld = BigInt(0);
    let totalCostWld = BigInt(0);
    let totalSeigniorageWld = BigInt(0);

    for (const b of this.batches) {
      if (b.status === 'ACCEPTED_BY_CENTRAL_BANK') {
        totalMintedWld += BigInt(b.amountWld);
        totalCostWld += BigInt(b.productionCostWld);
        totalSeigniorageWld += BigInt(b.seigniorageWld);
      }
    }

    let totalBurnedWld = BigInt(0);
    for (const c of this.burnCertificates) {
      totalBurnedWld += BigInt(c.amountWld);
    }

    const netCirculationExpansion = totalMintedWld - totalBurnedWld;

    return {
      nationalMintAuthority: '대한민국 국가조폐국 (Woldeok National Mint Bureau)',
      jurisdiction: 'Woldeok Sovereign Monetary Zone',
      totalMintedM0Wld: totalMintedWld.toString(),
      totalProductionCostWld: totalCostWld.toString(),
      totalCumulativeSeigniorageWld: totalSeigniorageWld.toString(),
      totalBurnedDestroyedWld: totalBurnedWld.toString(),
      netCirculationExpansionWld: netCirculationExpansion.toString(),
      activeMintBatchesCount: this.batches.length,
      burnCertificatesCount: this.burnCertificates.length,
      lastAuditedAt: new Date().toISOString(),
    };
  }

  async getAuditCertificates(): Promise<BurnCertificate[]> {
    return this.burnCertificates;
  }
}
