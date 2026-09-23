import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('marketplace server-authority safety', () => {
  it('never falls back to fake auctions when the server is unavailable', () => {
    const auction = source('src/app/marketplace/auction-view.tsx');
    expect(auction).not.toContain('auc_01');
    expect(auction).not.toContain('Fallback to starter');
    expect(auction).not.toContain('mock / offline');
    expect(auction).toContain("setLoadState('error')");
    expect(auction).toContain('임시·예시 매물은 표시하지 않습니다.');
    expect(auction).toContain('입찰 일시 중지');
  });

  it('never synthesizes direct trades or reports failed writes as completed', () => {
    const trade = source('src/app/marketplace/direct-trade-view.tsx');
    expect(trade).not.toContain('trade_01');
    expect(trade).not.toContain("recipientId: 'usr_target'");
    expect(trade).not.toContain('Fallback to starter');
    expect(trade).toContain("if (!res.ok) throw new Error('trade confirmation failed')");
    expect(trade).toContain('직거래 신규 제안 일시 중지');
  });

  it('never invents certified appraisal records locally', () => {
    const appraisal = source('src/app/marketplace/appraisal-view.tsx');
    expect(appraisal).not.toContain('CERT-2026-89A4');
    expect(appraisal).not.toContain('CERT-2026-31F7');
    expect(appraisal).not.toContain('Math.random().toString(36)');
    expect(appraisal).toContain('임시·예시 인증서는 표시하지 않습니다.');
    expect(appraisal).toContain('감정서 신규 발급 일시 중지');
  });

  it('protects the club canvas until authoritative server state is loaded', () => {
    const canvas = source('src/app/clubs/[clubId]/clubhouse-canvas.tsx');
    expect(canvas).toContain("const [loadState, setLoadState]");
    expect(canvas).toContain("if (loadState !== 'ready') return;");
    expect(canvas).toContain("disabled={isSaving || loadState !== 'ready'}");
    expect(canvas).toContain('기존 배치를 보호하기 위해 편집 저장을 차단했습니다.');
  });
});
