'use server';

import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import type { MarketplaceHolding } from './marketplace';
import { parseAppraisalCertificate, parseAppraisalList, type AppraisalCertificate } from './appraisal-receipt';

export async function loadAppraisals(): Promise<AppraisalCertificate[]> {
  return parseAppraisalList(await api<unknown>('/api/v1/marketplace/appraisals'));
}

export type AppraisalResult =
  | { readonly status: 'confirmed'; readonly certificate: AppraisalCertificate; readonly certificates: AppraisalCertificate[] }
  | { readonly status: 'refused' | 'unknown'; readonly message: string };

export async function requestAppraisal(itemId: string): Promise<AppraisalResult> {
  if (!itemId || itemId.length > 128) {
    return { status: 'refused', message: '감정할 아이템을 확인할 수 없습니다.' };
  }

  let holding: MarketplaceHolding | undefined;
  try {
    const response = await api<{ holdings: MarketplaceHolding[] }>('/api/v1/shop/holdings');
    if (!Array.isArray(response?.holdings)) throw new Error('Invalid holdings');
    holding = response.holdings.find((item) => item.catalog_id === itemId && item.quantity > 0);
  } catch {
    return { status: 'refused', message: '보유 아이템을 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.' };
  }
  if (!holding) return { status: 'refused', message: '현재 보유 중인 아이템만 감정할 수 있습니다.' };

  // The database function owns the WLD fee, settlement, and replay behavior.
  // Do not claim success until the same owner can read back the issued certificate.
  try {
    const result = await mutate<unknown>('/api/v1/marketplace/appraisals', {
      body: { itemId: holding.catalog_id, itemName: holding.name, rarity: holding.rarity },
    });
    const certificate = parseAppraisalCertificate(result);
    if (!certificate || certificate.itemId !== holding.catalog_id || certificate.rarity !== holding.rarity) {
      return { status: 'unknown', message: '감정 요청 결과를 확인할 수 없습니다. 기록을 다시 조회해 주세요.' };
    }
    const certificates = await loadAppraisals();
    const confirmed = certificates.find((item) => item.certId === certificate.certId && item.certHash === certificate.certHash);
    if (!confirmed) {
      return { status: 'unknown', message: '감정 기록이 아직 확인되지 않습니다. 중복 의뢰 대신 목록을 다시 조회해 주세요.' };
    }
    return { status: 'confirmed', certificate: confirmed, certificates };
  } catch {
    return { status: 'unknown', message: '요청 처리 여부가 불확실합니다. 재의뢰 전에 서버 기록을 다시 조회해 주세요.' };
  }
}
