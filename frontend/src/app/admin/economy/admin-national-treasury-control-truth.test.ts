import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/admin/economy/admin-national-treasury-control-card.tsx', 'utf8');

describe('admin national treasury console execution truth', () => {
  it('labels browser-only lottery and Taylor actions as simulations', () => {
    expect(source).toContain('SIMULATION ONLY');
    expect(source).toContain('가상 추첨 번호 미리보기');
    expect(source).toContain('가상 금리 계산 미리보기');
    expect(source).toContain('실제 거래·국고·원장에는 반영되지 않았습니다.');
    expect(source).toContain('실제 금융 정책이나 대출 금리는 변경되지 않았습니다.');
  });

  it('does not claim that client-only state is a completed ledger or policy operation', () => {
    expect(source).not.toContain('50% 국고 영구 소각 완료');
    expect(source).not.toContain('전 금융기관 및 가상 담보대출 금리에 실시간 동기화되었습니다.');
    expect(source).not.toContain('모든 파라미터 변경 내역은 감사 원장');
    expect(source).not.toContain('POLICY-SYNC: ACTIVE');
    expect(source).not.toContain('즉시 50% 국고 소각 트랜잭션이 발동됩니다.');
    expect(source).not.toContain('조정 후 즉시 전체 대출 마진콜 및 예금 금리에 반영됩니다.');
  });
});
