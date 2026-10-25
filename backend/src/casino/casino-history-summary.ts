import type { CasinoHistoryRow } from './casino.repository';

/** Aggregation is bounded by the database read model and never coerces WLD to Number. */
export function summarizeCasinoHistory(plays: readonly CasinoHistoryRow[]) {
  if (plays.length > 20) throw new Error('casino history sample exceeded 20 plays');

  let totalStake = 0n;
  let net = 0n;
  let winCount = 0;
  let lossCount = 0;
  let evenCount = 0;
  const seen = new Set<string>();

  for (const play of plays) {
    if (!/^(0|[1-9][0-9]*)$/.test(play.stake_amount) ||
        !/^(0|-?[1-9][0-9]*)$/.test(play.net_amount) ||
        typeof play.play_id !== 'string' || seen.has(play.play_id)) {
      throw new Error('invalid casino history record');
    }
    seen.add(play.play_id);
    const stake = BigInt(play.stake_amount);
    const result = BigInt(play.net_amount);
    totalStake += stake;
    net += result;
    if (result > 0n) winCount += 1;
    else if (result < 0n) lossCount += 1;
    else evenCount += 1;
  }

  return {
    scope: 'last_20_recorded_plays' as const,
    sampleLimit: 20 as const,
    playCount: plays.length,
    totalStakeWld: totalStake.toString(),
    netWld: net.toString(),
    winCount,
    lossCount,
    evenCount,
    plays,
  };
}
