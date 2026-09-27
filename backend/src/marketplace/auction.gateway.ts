import { Injectable, Logger } from '@nestjs/common';

export interface AuctionBidBroadcastPayload {
  readonly id: string;
  readonly auctionId: string;
  readonly itemTitle: string;
  readonly itemRarity: string;
  readonly bidAmount: number;
  readonly bidderName: string;
  readonly isPlusUser: boolean;
  readonly burnFeePercent: number;
  readonly timestamp: string;
}

export interface AuctionAntiSnipingPayload {
  readonly auctionId: string;
  readonly extendedMinutes: number;
  readonly newEndsAt: string;
  readonly reason: string;
}

export type BidListener = (payload: AuctionBidBroadcastPayload) => void;
export type AntiSnipingListener = (payload: AuctionAntiSnipingPayload) => void;

@Injectable()
export class AuctionGateway {
  private readonly logger = new Logger(AuctionGateway.name);
  private readonly bidListeners = new Set<BidListener>();
  private readonly antiSnipingListeners = new Set<AntiSnipingListener>();

  onBid(listener: BidListener): () => void {
    this.bidListeners.add(listener);
    return () => this.bidListeners.delete(listener);
  }

  onAntiSniping(listener: AntiSnipingListener): () => void {
    this.antiSnipingListeners.add(listener);
    return () => this.antiSnipingListeners.delete(listener);
  }

  broadcastBid(payload: AuctionBidBroadcastPayload): void {
    for (const listener of this.bidListeners) {
      try {
        listener(payload);
      } catch (err) {
        this.logger.warn(`Error in bid listener: ${(err as Error).message}`);
      }
    }
    this.logger.log(`Broadcasted bid for auction ${payload.auctionId}: ${payload.bidAmount} WLD by ${payload.bidderName}`);
  }

  broadcastAntiSnipingExtended(payload: AuctionAntiSnipingPayload): void {
    for (const listener of this.antiSnipingListeners) {
      try {
        listener(payload);
      } catch (err) {
        this.logger.warn(`Error in anti-sniping listener: ${(err as Error).message}`);
      }
    }
    this.logger.log(`Broadcasted anti-sniping extension for auction ${payload.auctionId} -> ${payload.newEndsAt}`);
  }
}
