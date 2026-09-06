import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';
import { queryRows } from '../core/db';

const CHANNEL_ID = '1542465347364589609';
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
   * PII 및 계좌 식별자 마스킹 (앞 4자리, 뒤 4자리만 보존)
   */
  private maskIdentifier(id: string): string {
    if (!id || id.length < 12) return '****';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  }

  /**
   * 디스코드 메시지 전송 (웹훅 URL 우선 + 봇 토큰 폴백)
   */
  async sendDiscordEmbed(embed: DiscordEmbed): Promise<boolean> {
    const webhookUrl = process.env.DISCORD_ALERT_WEBHOOK_URL;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    const payload = {
      embeds: [
        {
          ...embed,
          footer: embed.footer ?? { text: 'Woldeok Moneyverse Economy Sentinel' },
          timestamp: embed.timestamp ?? new Date().toISOString(),
        },
      ],
    };

    // 1. 웹훅 URL 발송
    if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) {
          this.logger.log(`Discord alert delivered via webhook to channel ${CHANNEL_ID}`);
          return true;
        }
        this.logger.warn(`Discord webhook returned status ${res.status}`);
      } catch (error) {
        this.logger.warn('Failed to post to Discord webhook', error);
      }
    }

    // 2. 봇 토큰 채널 메시지 발송 폴백
    if (botToken) {
      try {
        const res = await fetch(
          `${DISCORD_API_ORIGIN}/api/v10/channels/${CHANNEL_ID}/messages`,
          {
            method: 'POST',
            headers: {
              authorization: `Bot ${botToken}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10_000),
          },
        );
        if (res.ok) {
          this.logger.log(`Discord alert delivered via bot API to channel ${CHANNEL_ID}`);
          return true;
        }
        this.logger.warn(`Discord bot message API returned status ${res.status}`);
      } catch (error) {
        this.logger.warn('Failed to post to Discord bot channel message API', error);
      }
    }

    return false;
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
       FROM public.economy_reconciliation_snapshots
       ORDER BY calculated_at DESC
       LIMIT 1`,
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

      await this.sendDiscordEmbed({
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
      });
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

      await this.sendDiscordEmbed({
        title: '🚨 [경보] 비허용 계좌 음수 잔액 발생 (Disallowed Negative Balance)',
        description: '음수 잔액이 허용되지 않은 계좌에서 비정상 마이너스 잔액이 발생했습니다.',
        color: 0xf59e0b, // Amber
        fields: rows.map((r, i) => ({
          name: `계좌 #${i + 1} (${r.account_type})`,
          value: `ID: \`${this.maskIdentifier(r.account_id)}\`\n잔액: **${r.available_amount} WLD**`,
          inline: true,
        })),
      });
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
       FROM public.audit_chain_verifications
       ORDER BY checked_at DESC
       LIMIT 1`,
    );

    const latest = rows[0];
    if (latest && !latest.verified) {
      const alertKey = `audit_corrupted:${latest.checked_at.toISOString()}`;
      if (!this.shouldSend(alertKey)) return;

      await this.sendDiscordEmbed({
        title: '🔴 [치명적 위험] 감사 로그 체인 변조 감지 (Audit Trail Corrupted)',
        description: '불변 감사 로그(audit_logs) 해시 체인 검증에서 불일치 결함이 발견되었습니다.',
        color: 0xdc2626, // Crimson Red
        fields: [
          { name: '검증 시각', value: new Date(latest.checked_at).toLocaleString('ko-KR'), inline: true },
          { name: '실패 사유', value: latest.failure_reason ?? '알 수 없는 해시 불일치', inline: false },
        ],
      });
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
       FROM public.admin_alerts
       WHERE acknowledged_at IS NULL
         AND raised_at > pg_catalog.clock_timestamp() - interval '1 hour'
       ORDER BY raised_at DESC
       LIMIT 3`,
    );

    for (const alert of rows) {
      const alertKey = `admin_alert:${alert.id}`;
      if (!this.shouldSend(alertKey)) continue;

      const color =
        alert.severity === 'critical'
          ? 0xef4444
          : alert.severity === 'warning'
            ? 0xf59e0b
            : 0x3b82f6;

      await this.sendDiscordEmbed({
        title: `⚠️ [관리자 경보] ${alert.kind} (${alert.severity.toUpperCase()})`,
        description: alert.summary,
        color,
        fields: [
          { name: '경보 ID', value: this.maskIdentifier(alert.id), inline: true },
          { name: '발생 시각', value: new Date(alert.raised_at).toLocaleString('ko-KR'), inline: true },
        ],
      });
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
}
