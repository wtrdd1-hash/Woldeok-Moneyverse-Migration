import { randomUUID } from 'node:crypto';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

export class PvpArenaInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PvpArenaInputError';
  }
}

export interface PvpRoomSummary {
  readonly id: string;
  readonly creatorUserId: string;
  readonly creatorName: string;
  readonly opponentUserId: string | null;
  readonly opponentName: string | null;
  readonly gameType: 'dice' | 'rps' | 'hilo';
  readonly stakeAmount: number;
  readonly feeRate: number;
  readonly status: 'waiting' | 'in_progress' | 'settled' | 'cancelled';
  readonly winnerId: string | null;
  readonly battleResult: any | null;
  readonly createdAt: string;
  readonly settledAt: string | null;
}

export interface CreateRoomParams {
  readonly creatorUserId: string;
  readonly gameType: 'dice' | 'rps' | 'hilo';
  readonly stakeAmount: number;
  readonly creatorMove?: string | undefined;
}

export interface JoinAndPlayParams {
  readonly roomId: string;
  readonly opponentUserId: string;
  readonly opponentMove?: string | undefined;
}

export interface BattleOutcome {
  readonly roomId: string;
  readonly winnerId: string | null;
  readonly isDraw: boolean;
  readonly creatorName: string;
  readonly opponentName: string;
  readonly creatorMove: string;
  readonly opponentMove: string;
  readonly creatorRoll?: number[];
  readonly opponentRoll?: number[];
  readonly creatorScore?: number;
  readonly opponentScore?: number;
  readonly totalPot: number;
  readonly treasuryFee: number;
  readonly winnerPayout: number;
  readonly newBalance: string;
}

export class PvpArenaRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * 대기 중인 1:1 대결방 목록 조회
   */
  async listWaitingRooms(limit = 30): Promise<readonly PvpRoomSummary[]> {
    const rows = await queryRows<any>(
      this.pool,
      `SELECT 
         r.id,
         r.creator_user_id AS "creatorUserId",
         r.creator_name AS "creatorName",
         r.opponent_user_id AS "opponentUserId",
         r.opponent_name AS "opponentName",
         r.game_type AS "gameType",
         r.stake_amount::float AS "stakeAmount",
         r.fee_rate::float AS "feeRate",
         r.status,
         r.winner_id AS "winnerId",
         r.battle_result AS "battleResult",
         r.created_at AS "createdAt",
         r.settled_at AS "settledAt"
       FROM public.pvp_wager_rooms r
       WHERE r.status = 'waiting'
       ORDER BY r.created_at DESC
       LIMIT $1`,
      [limit],
    );
    return rows;
  }

  /**
   * 최근 승부존 전적 및 전광판 조회
   */
  async listRecentBattles(limit = 15): Promise<readonly PvpRoomSummary[]> {
    const rows = await queryRows<any>(
      this.pool,
      `SELECT 
         r.id,
         r.creator_user_id AS "creatorUserId",
         r.creator_name AS "creatorName",
         r.opponent_user_id AS "opponentUserId",
         r.opponent_name AS "opponentName",
         r.game_type AS "gameType",
         r.stake_amount::float AS "stakeAmount",
         r.fee_rate::float AS "feeRate",
         r.status,
         r.winner_id AS "winnerId",
         r.battle_result AS "battleResult",
         r.created_at AS "createdAt",
         r.settled_at AS "settledAt"
       FROM public.pvp_wager_rooms r
       WHERE r.status = 'settled'
       ORDER BY r.settled_at DESC NULLS LAST
       LIMIT $1`,
      [limit],
    );
    return rows;
  }

  /**
   * 유저의 가용 현금 잔액 및 캐시 계좌 ID 조회
   */
  private async getUserCashAccount(userId: string): Promise<{ accountId: string; availableAmount: number; displayName: string }> {
    const row = await queryOne<{ account_id: string; available_amount: string; display_name: string }>(
      this.pool,
      `SELECT 
         a.id AS account_id,
         b.available_amount::text AS available_amount,
         coalesce(i.display_name, '시민') AS display_name
       FROM public.accounts a
       JOIN public.account_balances b ON b.account_id = a.id
       LEFT JOIN public.identities i ON i.user_id = a.owner_user_id
       WHERE a.owner_user_id = $1::uuid
         AND a.account_type = 'USER_CASH'::public.account_type
         AND a.status = 'active'::public.account_status
       LIMIT 1`,
      [userId],
    );

    if (!row) {
      throw new PvpArenaInputError('활성화된 현금 지갑을 찾을 수 없습니다.');
    }

    return {
      accountId: row.account_id,
      availableAmount: parseFloat(row.available_amount || '0'),
      displayName: row.display_name,
    };
  }

  /**
   * 1:1 대결방 생성
   */
  async createRoom(params: CreateRoomParams): Promise<PvpRoomSummary> {
    const { creatorUserId, gameType, stakeAmount, creatorMove } = params;

    if (!['dice', 'rps', 'hilo'].includes(gameType)) {
      throw new PvpArenaInputError('지원되지 않는 게임 종목입니다 (dice, rps, hilo).');
    }

    if (stakeAmount < 1000 || stakeAmount > 50000000) {
      throw new PvpArenaInputError('베팅 금액은 1,000 WLD 이상 50,000,000 WLD 이하여야 합니다.');
    }

    const creatorCash = await this.getUserCashAccount(creatorUserId);
    if (creatorCash.availableAmount < stakeAmount) {
      throw new PvpArenaInputError(`잔액이 부족합니다. (현재 잔액: ${creatorCash.availableAmount.toLocaleString()} WLD)`);
    }

    const defaultMove = creatorMove || (gameType === 'rps' ? 'rock' : gameType === 'hilo' ? 'high' : 'roll');

    const created = await queryOne<any>(
      this.pool,
      `INSERT INTO public.pvp_wager_rooms (
         creator_user_id, creator_name, game_type, stake_amount, fee_rate, creator_move, status
       )
       VALUES ($1::uuid, $2, $3, $4, 0.03, $5, 'waiting')
       RETURNING 
         id,
         creator_user_id AS "creatorUserId",
         creator_name AS "creatorName",
         opponent_user_id AS "opponentUserId",
         opponent_name AS "opponentName",
         game_type AS "gameType",
         stake_amount::float AS "stakeAmount",
         fee_rate::float AS "feeRate",
         status,
         winner_id AS "winnerId",
         battle_result AS "battleResult",
         created_at AS "createdAt",
         settled_at AS "settledAt"`,
      [creatorUserId, creatorCash.displayName, gameType, stakeAmount, defaultMove],
    );

    return created!;
  }

  /**
   * 대결방 취소 (대기 중일 때만 가능)
   */
  async cancelRoom(roomId: string, userId: string): Promise<boolean> {
    const updated = await queryOne<any>(
      this.pool,
      `UPDATE public.pvp_wager_rooms
       SET status = 'cancelled'
       WHERE id = $1::uuid AND creator_user_id = $2::uuid AND status = 'waiting'
       RETURNING id`,
      [roomId, userId],
    );
    return !!updated;
  }

  /**
   * 1:1 대결방 참가 및 즉시 대결 실행 (원장 트랜잭션 & 승패 판정 & 3% 국고 수수료 처리)
   */
  async joinAndPlay(params: JoinAndPlayParams): Promise<BattleOutcome> {
    const { roomId, opponentUserId, opponentMove } = params;

    // 1. 방 조회 및 락 획득
    const room = await queryOne<any>(
      this.pool,
      `SELECT * FROM public.pvp_wager_rooms WHERE id = $1::uuid AND status = 'waiting' FOR UPDATE`,
      [roomId],
    );

    if (!room) {
      throw new PvpArenaInputError('이미 종료되었거나 존재하지 않는 대결방입니다.');
    }

    if (room.creator_user_id === opponentUserId) {
      throw new PvpArenaInputError('자신이 생성한 대결방에는 참가할 수 없습니다.');
    }

    const stakeAmount = parseFloat(room.stake_amount);
    const creatorCash = await this.getUserCashAccount(room.creator_user_id);
    const opponentCash = await this.getUserCashAccount(opponentUserId);

    if (creatorCash.availableAmount < stakeAmount) {
      await queryOne(this.pool, `UPDATE public.pvp_wager_rooms SET status = 'cancelled' WHERE id = $1::uuid`, [roomId]);
      throw new PvpArenaInputError('방 생성자의 잔액이 부족하여 대결이 취소되었습니다.');
    }

    if (opponentCash.availableAmount < stakeAmount) {
      throw new PvpArenaInputError(`참가자의 잔액이 부족합니다. (필요: ${stakeAmount.toLocaleString()} WLD)`);
    }

    // 2. 게임별 공정 승패 판정
    const gameType = room.game_type;
    let winnerId: string | null = null;
    let isDraw = false;
    let battleDetails: any = {};

    const cMove = room.creator_move || 'rock';
    const oMove = opponentMove || (gameType === 'rps' ? 'scissors' : gameType === 'hilo' ? 'low' : 'roll');

    if (gameType === 'dice') {
      // 주사위 3개 굴리기 (각 1~6)
      const cD1 = Math.floor(Math.random() * 6) + 1;
      const cD2 = Math.floor(Math.random() * 6) + 1;
      const cD3 = Math.floor(Math.random() * 6) + 1;
      const cRoll = [cD1, cD2, cD3];
      const cScore = cD1 + cD2 + cD3;

      const oD1 = Math.floor(Math.random() * 6) + 1;
      const oD2 = Math.floor(Math.random() * 6) + 1;
      const oD3 = Math.floor(Math.random() * 6) + 1;
      const oRoll = [oD1, oD2, oD3];
      const oScore = oD1 + oD2 + oD3;

      if (cScore > oScore) {
        winnerId = room.creator_user_id;
      } else if (oScore > cScore) {
        winnerId = opponentUserId;
      } else {
        // 동점 시 서든데스 1개 보너스 롤
        const cBonus = Math.floor(Math.random() * 6) + 1;
        const oBonus = Math.floor(Math.random() * 6) + 1;
        if (cBonus >= oBonus) {
          winnerId = room.creator_user_id;
        } else {
          winnerId = opponentUserId;
        }
      }

      battleDetails = {
        creatorRoll: cRoll,
        creatorScore: cScore,
        opponentRoll: oRoll,
        opponentScore: oScore,
      };
    } else if (gameType === 'rps') {
      // 가위바위보 판정
      if (cMove === oMove) {
        // 무승부 시 50:50 동전 던지기로 결정
        const coin = Math.random() >= 0.5 ? 1 : 0;
        winnerId = coin === 1 ? room.creator_user_id : opponentUserId;
        battleDetails = { tieBrokenByCoin: true };
      } else if (
        (cMove === 'rock' && oMove === 'scissors') ||
        (cMove === 'scissors' && oMove === 'paper') ||
        (cMove === 'paper' && oMove === 'rock')
      ) {
        winnerId = room.creator_user_id;
      } else {
        winnerId = opponentUserId;
      }
      battleDetails = { ...battleDetails, creatorMove: cMove, opponentMove: oMove };
    } else if (gameType === 'hilo') {
      // 1~10 하이로우 카드 뽑기
      const cCard = Math.floor(Math.random() * 10) + 1;
      const oCard = Math.floor(Math.random() * 10) + 1;
      if (cCard > oCard) {
        winnerId = room.creator_user_id;
      } else if (oCard > cCard) {
        winnerId = opponentUserId;
      } else {
        winnerId = Math.random() >= 0.5 ? room.creator_user_id : opponentUserId;
      }
      battleDetails = { creatorCard: cCard, opponentCard: oCard };
    }

    // 3. 자금 원장 정산 (수수료 3% 국고 귀속)
    const totalPot = stakeAmount * 2;
    const feeRate = 0.03;
    const treasuryFee = Math.round(totalPot * feeRate);
    const winnerPayout = totalPot - treasuryFee;
    const loserId = winnerId === room.creator_user_id ? opponentUserId : room.creator_user_id;

    const winnerCash = winnerId === room.creator_user_id ? creatorCash : opponentCash;
    const loserCash = winnerId === room.creator_user_id ? opponentCash : creatorCash;

    // 패자 계좌에서 stakeAmount 차감
    await queryOne(
      this.pool,
      `UPDATE public.account_balances
       SET available_amount = available_amount - $1, updated_at = clock_timestamp()
       WHERE account_id = $2::uuid`,
      [stakeAmount, loserCash.accountId],
    );

    // 승자 계좌에 (winnerPayout - stakeAmount) 순이익 가산 (본인 판돈 보존 + 상대 판돈 - 3% 수수료)
    const winnerNetGain = winnerPayout - stakeAmount;
    await queryOne(
      this.pool,
      `UPDATE public.account_balances
       SET available_amount = available_amount + $1, updated_at = clock_timestamp()
       WHERE account_id = $2::uuid`,
      [winnerNetGain, winnerCash.accountId],
    );

    // 국고 계좌(system_key = 'treasury')에 수수료 3% 귀속
    await queryOne(
      this.pool,
      `UPDATE public.account_balances
       SET available_amount = available_amount + $1, updated_at = clock_timestamp()
       WHERE account_id = (SELECT id FROM public.accounts WHERE system_key = 'treasury' LIMIT 1)`,
      [treasuryFee],
    );

    // 4. 대결방 상태 갱신
    await queryOne(
      this.pool,
      `UPDATE public.pvp_wager_rooms
       SET opponent_user_id = $1::uuid,
           opponent_name = $2,
           opponent_move = $3,
           winner_id = $4::uuid,
           treasury_fee = $5,
           battle_result = $6::jsonb,
           status = 'settled',
           settled_at = clock_timestamp()
       WHERE id = $7::uuid`,
      [
        opponentUserId,
        opponentCash.displayName,
        oMove,
        winnerId,
        treasuryFee,
        JSON.stringify(battleDetails),
        roomId,
      ],
    );

    // 5. 실시간 알림 발송 (승자 & 패자)
    const isWinner = opponentUserId === winnerId;
    await queryOne(
      this.pool,
      `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
       VALUES 
         ($1::uuid, 'PRODUCT_ACTIVITY', $2, $3, '/casino'),
         ($4::uuid, 'PRODUCT_ACTIVITY', $5, $6, '/casino')`,
      [
        winnerId,
        '⚔️ [1:1 승부존 승리!] 대결에서 승리했습니다!',
        `상대방과의 1:1 ${gameType.toUpperCase()} 대결에서 승리하여 상금 ${winnerPayout.toLocaleString()} WLD를 획득했습니다! (국고 수수료 3% 제외)`,
        loserId,
        '⚔️ [1:1 승부존 패배] 다음 승부를 노려보세요!',
        `아쉽습니다! 1:1 ${gameType.toUpperCase()} 대결에서 패배하여 판돈 ${stakeAmount.toLocaleString()} WLD를 잃었습니다.`,
      ],
    );

    // 최신 참가자 잔액 조회
    const finalBalance = await queryOne<{ available_amount: string }>(
      this.pool,
      `SELECT available_amount::text FROM public.account_balances WHERE account_id = $1::uuid`,
      [opponentCash.accountId],
    );

    return {
      roomId,
      winnerId,
      isDraw: false,
      creatorName: room.creator_name,
      opponentName: opponentCash.displayName,
      creatorMove: cMove,
      opponentMove: oMove,
      ...battleDetails,
      totalPot,
      treasuryFee,
      winnerPayout,
      newBalance: finalBalance?.available_amount || '0',
    };
  }
}
