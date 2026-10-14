import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';
import { queryRows } from '../core/db';
import { safeFetch } from '../security/ssrf-defense';

const DEFAULT_CHANNEL_ID = '1542465347364589609';
const DEFAULT_ADMIN_USER_ID = '886478189520637992';
const CHECK_INTERVAL_MS = 5 * 60_000; // 5분 주기
const DEBOUNCE_WINDOW_MS = 60 * 60_000; // 동일 장애 1시간 디바운싱
const DISCORD_API_ORIGIN = 'https://discord.com';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: DiscordEmbedField[];
  footer?: { text: string };
  timestamp?: string;
}

@Injectable()
export class DiscordAlertService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DiscordAlertService.name);
  private timer: NodeJS.Timeout | null = null;
  private readonly sentAlerts = new Map<string, number>();
  private adminDmChannelId: string | null = null;

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  onModuleInit() {
    // 백엔드 부팅 후 30초 뒤 첫 검사 시작, 이후 5분 주기 실행
    setTimeout(() => {
      this.runHealthChecks().catch((err) => {
        this.logger.error('Initial health check failed', err);
      });
    }, 30_000);

    this.timer = setInterval(() => {
      this.runHealthChecks().catch((err) => {
        this.logger.error('Scheduled health check failed', err);
      });
    }, CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 알림 채널 ID 획득 (환경 변수 우선, 기본값 폴백)
   */
  private getChannelId(): string {
    return (
      process.env.DISCORD_ALERT_CHANNEL_ID ||
      process.env.DISCORD_LOG_CHANNEL_ID ||
      process.env.DISCORD_OUTBOX_CHANNEL_ID ||
      DEFAULT_CHANNEL_ID
    );
  }

  /**
   * 관리자 디스코드 ID 획득
   */
  getAdminUserId(): string {
    return process.env.DISCORD_ADMIN_ALERT_USER_ID || DEFAULT_ADMIN_USER_ID;
  }

  /**
   * PII 및 계좌 식별자 마스킹 (앞 4자리, 뒤 4자리만 보존)
   */
  private maskIdentifier(id: string): string {
    if (!id || id.length < 12) return '****';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  }

  /**
   * 특정 관리자/유저에게 1:1 Direct Message(DM) 전송 (REST API v10)
   */
  async sendAdminDirectMessage(
    embed: DiscordEmbed,
    targetUserId?: string,
  ): Promise<{ success: boolean; channelId?: string; error?: string }> {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      this.logger.warn('Cannot send Discord DM: DISCORD_BOT_TOKEN is not configured');
      return { success: false, error: 'DISCORD_BOT_TOKEN_NOT_CONFIGURED' };
    }

    const userId = targetUserId || this.getAdminUserId();

    try {
      // 1. 유저와의 1:1 DM 채널 조회/생성 (캐시 활용)
      let dmChannelId = this.adminDmChannelId;
      if (!dmChannelId) {
        const createDmRes = await safeFetch(`${DISCORD_API_ORIGIN}/api/v10/users/@me/channels`, {
          method: 'POST',
          headers: {
            authorization: `Bot ${botToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ recipient_id: userId }),
        });

        if (!createDmRes.ok) {
          const errText = await createDmRes.text().catch(() => '');
          this.logger.warn(
            `Failed to open DM channel with user ${userId}: status ${createDmRes.status} ${errText}`,
          );
          return { success: false, error: `OPEN_DM_FAILED_${createDmRes.status}` };
        }

        const dmChannelData = (await createDmRes.json()) as { id?: string };
        if (!dmChannelData.id) {
          return { success: false, error: 'NO_DM_CHANNEL_ID_RETURNED' };
        }
        dmChannelId = dmChannelData.id;
        this.adminDmChannelId = dmChannelId;
      }

      // 2. DM 채널로 메시지 발송
      const payload = {
        embeds: [
          {
            ...embed,
            footer: embed.footer ?? { text: 'Woldeok Moneyverse Admin Direct Sentinel' },
            timestamp: embed.timestamp ?? new Date().toISOString(),
          },
        ],
      };

      const sendMsgRes = await safeFetch(
        `${DISCORD_API_ORIGIN}/api/v10/channels/${dmChannelId}/messages`,
        {
          method: 'POST',
          headers: {
            authorization: `Bot ${botToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (sendMsgRes.ok) {
        this.logger.log(`Direct message successfully sent to admin user ${userId} (DM Channel: ${dmChannelId})`);
        return { success: true, channelId: dmChannelId };
      }

      // 만약 채널이 만료되었거나 에러가 났다면 캐시 무효화 후 1회 재시도
      if (sendMsgRes.status === 404 || sendMsgRes.status === 403) {
        this.adminDmChannelId = null;
      }
      const errText = await sendMsgRes.text().catch(() => '');
      this.logger.warn(`Failed to send message to DM channel ${dmChannelId}: ${sendMsgRes.status} ${errText}`);
      return { success: false, error: `SEND_DM_FAILED_${sendMsgRes.status}` };
    } catch (error) {
      this.logger.error(`Error delivering Discord direct message to user ${userId}`, error);
      return { success: false, error: error instanceof Error ? error.message : 'UNKNOWN_ERROR' };
    }
  }

  /**
   * 디스코드 메시지 전송 (웹훅 URL 우선 + 봇 토큰 폴백 + 중요 알림 관리자 DM 동시 발송)
   */
  async sendDiscordEmbed(embed: DiscordEmbed, isCritical = false): Promise<boolean> {
    const webhookUrl = process.env.DISCORD_ALERT_WEBHOOK_URL;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = this.getChannelId();

    const payload = {
      embeds: [
        {
          ...embed,
          footer: embed.footer ?? { text: 'Woldeok Moneyverse Economy Sentinel' },
          timestamp: embed.timestamp ?? new Date().toISOString(),
        },
      ],
    };

    let delivered = false;

    // 1. 웹훅 URL 발송
    if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      try {
        const res = await safeFetch(webhookUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          this.logger.log(`Discord alert delivered via webhook to channel ${channelId}`);
          delivered = true;
        } else {
          this.logger.warn(`Discord webhook returned status ${res.status}`);
        }
      } catch (error) {
        this.logger.warn('Failed to post to Discord webhook', error);
      }
    }

    // 2. 봇 토큰 채널 메시지 발송 폴백
    if (!delivered && botToken) {
      try {
        const res = await safeFetch(
          `${DISCORD_API_ORIGIN}/api/v10/channels/${channelId}/messages`,
          {
            method: 'POST',
            headers: {
              authorization: `Bot ${botToken}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );
        if (res.ok) {
          this.logger.log(`Discord alert delivered via bot API to channel ${channelId}`);
          delivered = true;
        } else {
          this.logger.warn(`Discord bot message API returned status ${res.status}`);
        }
      } catch (error) {
        this.logger.warn('Failed to post to Discord bot channel message API', error);
      }
    }

    // 3. 중요 경보(Critical) 발생 시 관리자 개인 DM으로도 실시간 직접 전송!
    if (isCritical) {
      this.sendAdminDirectMessage(embed).catch((err) => {
        this.logger.warn('Failed to deliver critical direct message to admin', err);
      });
    }

    return delivered;
  }

  /**
   * 디바운싱 검사 (1시간 쿨다운)
   */
  private shouldSend(alertKey: string): boolean {
    const now = Date.now();
    const lastSent = this.sentAlerts.get(alertKey);
    if (lastSent && now - lastSent < DEBOUNCE_WINDOW_MS) {
      return false;
    }
    this.sentAlerts.set(alertKey, now);

    // 가비지 컬렉션 (2시간 지난 키 정리)
    if (this.sentAlerts.size > 100) {
      for (const [key, timestamp] of this.sentAlerts.entries()) {
        if (now - timestamp > 2 * DEBOUNCE_WINDOW_MS) {
          this.sentAlerts.delete(key);
        }
      }
    }
    return true;
  }

  /**
   * 경제 코어 정기 헬스체크 및 이상 징후 자동 감지
   */
  async runHealthChecks(): Promise<void> {
    try {
      await this.checkReconciliationIntegrity();
      await this.checkDisallowedNegativeBalances();
      await this.checkAuditChainIntegrity();
      await this.checkUnacknowledgedAdminAlerts();
    } catch (error) {
      this.logger.error('Error during scheduled economy sentinel health check', error);
    }
  }

  /**
   * 1. 원장 대사 무결성 점검
   */
  private async checkReconciliationIntegrity(): Promise<void> {
    const rows = await queryRows<{
      id: string;
      integrity_ok: boolean;
      balance_mismatch_account_count: string;
      disallowed_negative_balance_account_count: string;
      ledger_unbalanced_transaction_count: string;
      balance_total_delta_amount: string;
      calculated_at: Date;
    }>(
      this.pool,
      `SELECT id::text, integrity_ok,
              balance_mismatch_account_count::text,
              disallowed_negative_balance_account_count::text,
              ledger_unbalanced_transaction_count::text,
              balance_total_delta_amount::text,
              calculated_at
       FROM public.discord_latest_reconciliation_health()`,
    );

    const latest = rows[0];
    if (!latest) return;

    const hasIssue =
      !latest.integrity_ok ||
      Number(latest.balance_mismatch_account_count) > 0 ||
      Number(latest.disallowed_negative_balance_account_count) > 0 ||
      Number(latest.ledger_unbalanced_transaction_count) > 0 ||
      latest.balance_total_delta_amount !== '0';

    if (hasIssue) {
      const alertKey = `reconciliation_failed:${latest.id}`;
      if (!this.shouldSend(alertKey)) return;

      await this.sendDiscordEmbed(
        {
          title: '🚨 [긴급] 경제 코어 원장 대사 불일치 감지 (Reconciliation Failure)',
          description: '최신 원장 대사 스냅샷에서 불일치 또는 무결성 결함이 감지되었습니다.',
          color: 0xef4444, // Red
          fields: [
            { name: '스냅샷 ID', value: this.maskIdentifier(latest.id), inline: true },
            { name: '무결성 판정', value: latest.integrity_ok ? 'PASS' : 'FAIL', inline: true },
            { name: '불일치 계좌 수', value: `${latest.balance_mismatch_account_count}개`, inline: true },
            { name: '불균형 분개 수', value: `${latest.ledger_unbalanced_transaction_count}개`, inline: true },
            { name: '비허용 음수 계좌', value: `${latest.disallowed_negative_balance_account_count}개`, inline: true },
            { name: '잔액 불일치 총액', value: `${latest.balance_total_delta_amount} WLD`, inline: true },
          ],
        },
        true, // 중요 경보 -> 관리자 DM 동시 발송
      );
    }
  }

  /**
   * 2. 비허용 계좌 음수 잔액 검출
   */
  private async checkDisallowedNegativeBalances(): Promise<void> {
    const rows = await queryRows<{
      account_id: string;
      account_type: string;
      available_amount: string;
    }>(
      this.pool,
      `SELECT a.id::text AS account_id, a.account_type::text AS account_type,
              b.available_amount::text AS available_amount
       FROM public.accounts a
       JOIN public.account_balances b ON b.account_id = a.id
       WHERE a.allow_negative = false
         AND b.available_amount < 0
       LIMIT 5`,
    );

    if (rows.length > 0) {
      const alertKey = `negative_balances:${rows.map((r) => r.account_id).join(',')}`;
      if (!this.shouldSend(alertKey)) return;

      await this.sendDiscordEmbed(
        {
          title: '🚨 [경보] 비허용 계좌 음수 잔액 발생 (Disallowed Negative Balance)',
          description: '음수 잔액이 허용되지 않은 계좌에서 비정상 마이너스 잔액이 발생했습니다.',
          color: 0xf59e0b, // Amber
          fields: rows.map((r, i) => ({
            name: `계좌 #${i + 1} (${r.account_type})`,
            value: `ID: \`${this.maskIdentifier(r.account_id)}\`\n잔액: **${r.available_amount} WLD**`,
            inline: true,
          })),
        },
        true, // 중요 경보 -> 관리자 DM 동시 발송
      );
    }
  }

  /**
   * 3. 감사 체인 무결성 검증
   */
  private async checkAuditChainIntegrity(): Promise<void> {
    const rows = await queryRows<{
      verified: boolean;
      failure_reason: string | null;
      checked_at: Date;
    }>(
      this.pool,
      `SELECT verified, failure_reason, checked_at
       FROM public.discord_latest_audit_chain_health()`,
    );

    const latest = rows[0];
    if (latest && !latest.verified) {
      const alertKey = `audit_corrupted:${latest.checked_at.toISOString()}`;
      if (!this.shouldSend(alertKey)) return;

      await this.sendDiscordEmbed(
        {
          title: '🔴 [치명적 위험] 감사 로그 체인 변조 감지 (Audit Trail Corrupted)',
          description: '불변 감사 로그(audit_logs) 해시 체인 검증에서 불일치 결함이 발견되었습니다.',
          color: 0xdc2626, // Crimson Red
          fields: [
            { name: '검증 시각', value: new Date(latest.checked_at).toLocaleString('ko-KR'), inline: true },
            { name: '실패 사유', value: latest.failure_reason ?? '알 수 없는 해시 불일치', inline: false },
          ],
        },
        true, // 중요 경보 -> 관리자 DM 동시 발송
      );
    }
  }

  /**
   * 4. 미확인 관리자 시스템 경보 전송
   */
  private async checkUnacknowledgedAdminAlerts(): Promise<void> {
    const rows = await queryRows<{
      id: string;
      kind: string;
      severity: string;
      summary: string;
      raised_at: Date;
    }>(
      this.pool,
      `SELECT id::text, kind, severity, summary, raised_at
       FROM public.discord_recent_unacknowledged_alerts()`,
    );

    for (const alert of rows) {
      const alertKey = `admin_alert:${alert.id}`;
      if (!this.shouldSend(alertKey)) continue;

      const isCritical = alert.severity === 'critical';
      const color =
        alert.severity === 'critical'
          ? 0xef4444
          : alert.severity === 'warning'
            ? 0xf59e0b
            : 0x3b82f6;

      await this.sendDiscordEmbed(
        {
          title: `⚠️ [관리자 경보] ${alert.kind} (${alert.severity.toUpperCase()})`,
          description: alert.summary,
          color,
          fields: [
            { name: '경보 ID', value: this.maskIdentifier(alert.id), inline: true },
            { name: '발생 시각', value: new Date(alert.raised_at).toLocaleString('ko-KR'), inline: true },
          ],
        },
        isCritical, // 심각 경보는 관리자 DM 동시 발송
      );
    }
  }

  /**
   * 운영 공지사항 이벤트 발송 (등록, 수정, 핀 토글, 삭제)
   */
  async notifyAnnouncementEvent(input: {
    action: 'created' | 'updated' | 'pinned' | 'unpinned' | 'deleted';
    announcementId: string;
    title: string;
    actorUserId?: string;
  }): Promise<void> {
    const actionLabels: Record<string, { label: string; color: number; emoji: string }> = {
      created: { label: '신규 공지 등록', color: 0x10b981, emoji: '📢' },
      updated: { label: '공지 내용 수정', color: 0x3b82f6, emoji: '✏️' },
      pinned: { label: '상단 공지 고정', color: 0xf59e0b, emoji: '📌' },
      unpinned: { label: '상단 공지 고정 해제', color: 0x6b7280, emoji: '📍' },
      deleted: { label: '공지 삭제', color: 0xef4444, emoji: '🗑️' },
    };

    const info = actionLabels[input.action] ?? { label: input.action, color: 0x3b82f6, emoji: 'ℹ️' };

    await this.sendDiscordEmbed({
      title: `${info.emoji} [운영 공지] ${info.label}`,
      description: `**제목**: ${input.title}`,
      color: info.color,
      fields: [
        { name: '공지 ID', value: `\`${input.announcementId}\``, inline: true },
        ...(input.actorUserId ? [{ name: '작업자', value: `\`${this.maskIdentifier(input.actorUserId)}\``, inline: true }] : []),
      ],
    });
  }

  /**
   * 5. [관리자 DM 직보] 고래 대규모 자금 이동 감지 (5,000만 WLD 이상)
   */
  async alertWhaleMovement(input: {
    txId: string;
    sender: string;
    receiver: string;
    amount: number | string;
    asset?: string;
  }): Promise<{ success: boolean; channelId?: string; error?: string }> {
    const formattedAmount = Number(input.amount).toLocaleString('ko-KR');
    return this.sendAdminDirectMessage({
      title: '🐋 [긴급 직보] 고래 대규모 자금 이동 감지 (Whale Movement Alert)',
      description: `단일 트랜잭션에서 **${formattedAmount} ${input.asset ?? 'WLD'}**의 대규모 자금 이동이 발생했습니다.`,
      color: 0x8b5cf6, // Purple
      fields: [
        { name: '트랜잭션 ID', value: `\`${this.maskIdentifier(input.txId)}\``, inline: true },
        { name: '이체 금액', value: `**${formattedAmount} ${input.asset ?? 'WLD'}**`, inline: true },
        { name: '송신자', value: `\`${this.maskIdentifier(input.sender)}\``, inline: true },
        { name: '수신자', value: `\`${this.maskIdentifier(input.receiver)}\``, inline: true },
        { name: '보안 등급', value: '초고액 관제 모니터링 대상', inline: false },
      ],
    });
  }

  /**
   * 6. [관리자 DM 직보] 카지노 1억 WLD 초대형 잭팟 발생
   */
  async alertCasinoMegaJackpot(input: {
    game: string;
    userId: string;
    betAmount: number | string;
    winAmount: number | string;
    multiplier?: number;
  }): Promise<{ success: boolean; channelId?: string; error?: string }> {
    const formattedWin = Number(input.winAmount).toLocaleString('ko-KR');
    const formattedBet = Number(input.betAmount).toLocaleString('ko-KR');
    return this.sendAdminDirectMessage({
      title: '🎰 [잭팟 직보] 카지노 1억 WLD 초대형 잭팟 터짐 (Mega Jackpot Hit)',
      description: `카지노 **${input.game}**에서 초대형 잭팟(**${formattedWin} WLD**)이 당첨되었습니다!`,
      color: 0xf59e0b, // Amber Gold
      fields: [
        { name: '게임 종목', value: input.game, inline: true },
        { name: '당첨자', value: `\`${this.maskIdentifier(input.userId)}\``, inline: true },
        { name: '배팅 금액', value: `${formattedBet} WLD`, inline: true },
        { name: '총 당첨금', value: `**${formattedWin} WLD**`, inline: true },
        ...(input.multiplier ? [{ name: '배당 배율', value: `**x${input.multiplier}배**`, inline: true }] : []),
        { name: '국고 세금 징수', value: '배당소득세(10%) 국고 자동 원천징수 완료', inline: false },
      ],
    });
  }

  /**
   * 7. [관리자 DM 직보] 국고 지급준비금 결핍 위험 경보 (10억 WLD 미만)
   */
  async alertTreasuryReserveLow(input: {
    currentBalance: number | string;
    threshold: number | string;
    reserveRatio?: string;
  }): Promise<{ success: boolean; channelId?: string; error?: string }> {
    const formattedCur = Number(input.currentBalance).toLocaleString('ko-KR');
    const formattedThresh = Number(input.threshold).toLocaleString('ko-KR');
    return this.sendAdminDirectMessage({
      title: '⚠️ [재정 경보] 국고 지급준비금 안전선 하회 (Treasury Reserve Underflow)',
      description: `중앙 국고 금고 잔액이 안전 운영 임계치(**${formattedThresh} WLD**) 이하로 떨어졌습니다.`,
      color: 0xef4444, // Red
      fields: [
        { name: '현재 국고 잔액', value: `**${formattedCur} WLD**`, inline: true },
        { name: '위험 임계 기준', value: `${formattedThresh} WLD`, inline: true },
        ...(input.reserveRatio ? [{ name: '지급준비율', value: `**${input.reserveRatio}**`, inline: true }] : []),
        { name: '권장 조치', value: '공공 지출 일시 제한 또는 국부펀드(ASWF) 환매 검토 필요', inline: false },
      ],
    });
  }

  /**
   * 8. [관리자 DM 직보] 긴급 킬스위치 가동 상태 변경
   */
  async alertKillSwitchActivated(input: {
    controlName: string;
    activatedBy: string;
    reason?: string;
    action: 'HALTED' | 'RESUMED';
  }): Promise<{ success: boolean; channelId?: string; error?: string }> {
    const isHalted = input.action === 'HALTED';
    return this.sendAdminDirectMessage({
      title: isHalted
        ? '🛑 [비상 관제] 긴급 킬스위치 발동 - 시스템 일시 중단'
        : '🟢 [비상 관제] 긴급 킬스위치 해제 - 시스템 정상 재개',
      description: `관리자에 의해 **${input.controlName}** 제어 스위치가 [${isHalted ? '중단(HALTED)' : '정상화(RESUMED)'}] 상태로 전환되었습니다.`,
      color: isHalted ? 0xdc2626 : 0x10b981,
      fields: [
        { name: '제어 대상', value: input.controlName, inline: true },
        { name: '조작자', value: `\`${this.maskIdentifier(input.activatedBy)}\``, inline: true },
        { name: '실행 사유', value: input.reason || '관리자 수동 비상 관제 조치', inline: false },
      ],
    });
  }

  /**
   * 9. [관리자 DM 직보] 은행 대출 부실화 및 연체 급증 경보
   */
  async alertBankDelinquencySpike(input: {
    delinquentRatio: string;
    defaultedCount: number;
    affectedAmount: string;
  }): Promise<{ success: boolean; channelId?: string; error?: string }> {
    return this.sendAdminDirectMessage({
      title: '📉 [금융 리스크] 은행 대출 연체율 급증 및 뱅크런 조기 경보',
      description: '중앙 은행의 대출 연체율이 위험 구간을 돌파하여 건전성에 적신호가 켜졌습니다.',
      color: 0xf97316, // Orange
      fields: [
        { name: '현재 연체율', value: `**${input.delinquentRatio}**`, inline: true },
        { name: '부실 대출 건수', value: `${input.defaultedCount}건`, inline: true },
        { name: '위험 노출 총액', value: `**${input.affectedAmount} WLD**`, inline: true },
        { name: '대응 매뉴얼', value: '예금보험공사(KDIC) 대위변제 준비금 상태 및 대출 이자율 조정 검토', inline: false },
      ],
    });
  }

  /**
   * 10. [커뮤니티 브로드캐스트] 카지노 대형 잭팟 터짐 실시간 축하 임베드
   */
  async broadcastCasinoJackpot(input: {
    game: string;
    userName: string;
    betAmount: number | string;
    winAmount: number | string;
    multiplier?: number;
  }): Promise<boolean> {
    const formattedWin = Number(input.winAmount).toLocaleString('ko-KR');
    const formattedBet = Number(input.betAmount).toLocaleString('ko-KR');
    return this.sendDiscordEmbed({
      title: '🎰 [대형 잭팟 폭발] 카지노 잭팟 당첨을 축하합니다! 🎉',
      description: `**${input.userName}** 님이 카지노 **${input.game}**에서 무려 **${formattedWin} WLD** 당첨의 주인공이 되셨습니다!`,
      color: 0xf59e0b, // Gold
      fields: [
        { name: '게임 종목', value: input.game, inline: true },
        { name: '행운의 주인공', value: `\`${input.userName}\``, inline: true },
        { name: '배팅 금액', value: `${formattedBet} WLD`, inline: true },
        { name: '총 당첨금', value: `🏆 **${formattedWin} WLD**`, inline: true },
        ...(input.multiplier ? [{ name: '당첨 배율', value: `⚡ **x${input.multiplier}배**`, inline: true }] : []),
        { name: '국고 환수 기여', value: '배당소득세(10%)가 복지 국고로 기여되었습니다.', inline: true },
        {
          name: '👉 나도 잭팟 도전하기',
          value: '[월덕 머니버스 카지노 바로가기](https://easy-scraping.com/casino)',
          inline: false,
        },
      ],
      footer: { text: 'Woldeok Moneyverse Casino Jackpots' },
    });
  }

  /**
   * 11. [커뮤니티 브로드캐스트] 주식 상한가 / 급변동 경보 임베드
   */
  async broadcastStockMarketMover(input: {
    symbol: string;
    name: string;
    currentPrice: number | string;
    changeRatePercent: number;
    volume?: number | string;
    reason?: string;
  }): Promise<boolean> {
    const isSurge = input.changeRatePercent > 0;
    const sign = isSurge ? '+' : '';
    const formattedPrice = Number(input.currentPrice).toLocaleString('ko-KR');
    const alertKey = `stock_mover:${input.symbol}:${Math.floor(Date.now() / (30 * 60_000))}`; // 30분 디바운싱
    if (!this.shouldSend(alertKey)) return false;

    return this.sendDiscordEmbed({
      title: isSurge
        ? `📈 [주식 급등 경보] ${input.name} (${input.symbol}) ${sign}${input.changeRatePercent.toFixed(1)}% 급등! 🚀`
        : `📉 [주식 급락 경보] ${input.name} (${input.symbol}) ${input.changeRatePercent.toFixed(1)}% 급락 변동성 주의! ⚠️`,
      description: `가상 주식 거래소의 **${input.name}** 종목이 강한 매매 유입으로 전일 대비 **${sign}${input.changeRatePercent.toFixed(1)}%** 급변동하고 있습니다.`,
      color: isSurge ? 0xef4444 : 0x3b82f6, // 한국 주식: 빨강 상승, 파랑 하락
      fields: [
        { name: '종목명', value: `${input.name} (\`${input.symbol}\`)`, inline: true },
        { name: '현재가', value: `**${formattedPrice} WLD**`, inline: true },
        { name: '등락률', value: `**${sign}${input.changeRatePercent.toFixed(1)}%**`, inline: true },
        ...(input.volume ? [{ name: '거래량', value: `${Number(input.volume).toLocaleString('ko-KR')}주`, inline: true }] : []),
        { name: '변동 사유', value: input.reason || '호가창 매수/매도 수급 쏠림 현상', inline: false },
        {
          name: '👉 실시간 호가창 확인하기',
          value: `[${input.name} 실시간 차트 및 호가 확인](https://easy-scraping.com/stocks/${input.symbol})`,
          inline: false,
        },
      ],
      footer: { text: 'Woldeok Moneyverse Stock Market Telemetry' },
    });
  }
}

