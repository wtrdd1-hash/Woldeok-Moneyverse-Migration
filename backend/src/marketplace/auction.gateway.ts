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

export interface AuctionProxyBidPayload {
  readonly id: string;
  readonly auctionId: string;
  readonly itemTitle: string;
  readonly autoBidAmount: number;
  readonly bidderName: string;
  readonly isProxy: boolean;
  readonly isPlusUser: boolean;
  readonly timestamp: string;
}

export interface AuctionOutbidPayload {
  readonly auctionId: string;
  readonly previousBidderId: string;
  readonly previousBidderName: string;
  readonly newHighestBid: number;
  readonly newHighestBidderName: string;
}

export type BidListener = (payload: AuctionBidBroadcastPayload) => void;
export type AntiSnipingListener = (payload: AuctionAntiSnipingPayload) => void;
export type ProxyBidListener = (payload: AuctionProxyBidPayload) => void;
export type OutbidListener = (payload: AuctionOutbidPayload) => void;

@Injectable()
export class AuctionGateway {
  private readonly logger = new Logger(AuctionGateway.name);
  private readonly bidListeners = new Set<BidListener>();
  private readonly antiSnipingListeners = new Set<AntiSnipingListener>();
  private readonly proxyBidListeners = new Set<ProxyBidListener>();
  private readonly outbidListeners = new Set<OutbidListener>();

  onBid(listener: BidListener): () => void {
    this.bidListeners.add(listener);
    return () => this.bidListeners.delete(listener);
  }

  onAntiSniping(listener: AntiSnipingListener): () => void {
    this.antiSnipingListeners.add(listener);
    return () => this.antiSnipingListeners.delete(listener);
  }

  onProxyBid(listener: ProxyBidListener): () => void {
    this.proxyBidListeners.add(listener);
    return () => this.proxyBidListeners.delete(listener);
  }

  onOutbid(listener: OutbidListener): () => void {
    this.outbidListeners.add(listener);
    return () => this.outbidListeners.delete(listener);
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

  broadcastProxyBid(payload: AuctionProxyBidPayload): void {
    for (const listener of this.proxyBidListeners) {
      try {
        listener(payload);
      } catch (err) {
        this.logger.warn(`Error in proxy bid listener: ${(err as Error).message}`);
      }
    }
    this.logger.log(`Broadcasted auto proxy bid for auction ${payload.auctionId}: ${payload.autoBidAmount} WLD by ${payload.bidderName}`);
  }

  broadcastOutbid(payload: AuctionOutbidPayload): void {
    for (const listener of this.outbidListeners) {
      try {
        listener(payload);
      } catch (err) {
        this.logger.warn(`Error in outbid listener: ${(err as Error).message}`);
      }
    }
    this.logger.log(`Broadcasted outbid notification for auction ${payload.auctionId} to ${payload.previousBidderName}`);
  }
}
