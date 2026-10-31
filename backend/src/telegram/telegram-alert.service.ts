import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import { safeFetch } from '../security/ssrf-defense';

export type AlertCategory =
  | 'system'
  | 'website'
  | 'database'
  | 'qa'
  | 'blog'
  | 'finance'
  | 'release'
  | 'github'
  | 'security'
  | 'admin'
  | 'ai'
  | 'treasury'
  | 'casino'
  | 'other';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface TelegramAlertOptions {
  category?: AlertCategory;
  severity?: AlertSeverity;
  title: string;
  lines: string[];
}

export interface TreasuryGrantAlertPayload {
  action: 'APPLY' | 'APPROVE' | 'REJECT' | 'DISBURSED' | 'TARGETED_SUBSIDY' | 'BUDGET_DISTRIBUTION' | 'BUYBACK_BURN';
  grantId?: string;
  applicant?: string;
  targetUser?: string;
  amount?: number | string;
  amountWld?: number | string;
  purpose?: string;
  reason?: string;
  reviewer?: string;
  adminId?: string;
}

export interface SwfAlertPayload {
  action?: 'BUY' | 'SELL' | 'DIVIDEND' | 'POLICY_UPDATE' | 'REBALANCE';
  eventType?: string;
  assetName?: string;
  summary?: string;
  amount?: number | string;
  amountWld?: number | string;
  price?: number | string;
  dividendWld?: number | string;
  sourceVault?: string;
  details?: Record<string, unknown>;
}

export interface AdminLoginAlertPayload {
  adminId: string;
  email?: string;
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: 'PASSWORD' | 'TOTP' | 'SESSION' | 'STEP_UP';
  stepUpVerified?: boolean;
}

export interface UserLoginAlertPayload {
  consentCurrent?: boolean;
  userId?: string;
  displayName?: string;
  email?: string;
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserRegisterAlertPayload {
  userId?: string;
  username?: string;
  displayName?: string;
  provider?: string;
  email?: string;
  ip?: string;
  ipAddress?: string;
}

export interface CasinoJackpotAlertPayload {
  game?: string;
  gameName?: string;
  username?: string;
  userName?: string;
  betAmount?: number | string;
  betAmountWld?: number | string;
  winAmount?: number | string;
  winAmountWld?: number | string;
  multiplier?: number | string;
}

export interface HighValueTransferAlertPayload {
  fromUser: string;
  toUser: string;
  amount?: number | string;
  amountWld?: number | string;
  currency?: string;
  type?: string;
  transactionId?: string;
}

const TOKEN_PATTERN = /\b\d{6,12}:[A-Za-z0-9_-]{20,}\b/g;
const SENSITIVE_PATTERN = /\b(password|secret|token|api[_-]?key|authorization|cookie)\s*[:=]\s*[^\s,;]+/gi;

export function redactSensitive(text: string): string {
  return text
    .replace(TOKEN_PATTERN, '[REDACTED_TOKEN]')
    .replace(SENSITIVE_PATTERN, '$1=[REDACTED]')
    .slice(0, 3200);
}

@Injectable()
export class TelegramAlertService {
  private readonly logger = new Logger(TelegramAlertService.name);
  private cachedBotToken: string | null = null;
  private cachedChatId: string | null = null;

  constructor() {
    this.initCredentials();
  }

  private initCredentials(): void {
    this.cachedBotToken = process.env.TELEGRAM_BOT_TOKEN || null;
    this.cachedChatId = process.env.TELEGRAM_CHAT_ID || null;

    if (!this.cachedBotToken || !this.cachedChatId) {
      try {
        const envPath = '/var/lib/moneyverse-telegram/telegram.env';
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed.startsWith('TELEGRAM_BOT_TOKEN=')) {
              this.cachedBotToken = trimmed.replace('TELEGRAM_BOT_TOKEN=', '').trim().replace(/^['"]|['"]$/g, '');
            }
          }
        }
      } catch (err) {
        this.logger.debug(`Could not read telegram.env: ${err}`);
      }

      try {
        const chatPath = '/var/lib/moneyverse-telegram/chat_id';
        if (fs.existsSync(chatPath)) {
          const content = fs.readFileSync(chatPath, 'utf8').trim();
          if (content && /^\d+$/.test(content)) {
            this.cachedChatId = content;
          }
        }
      } catch (err) {
        this.logger.debug(`Could not read chat_id: ${err}`);
      }
    }
  }

  /**
   * Generates exact second-precision KST timestamp header: ［YYYY-MM-DD HH:MM:SS KST］
   */
  public formatKstTimestamp(date?: Date): string {
    const targetDate = date ?? new Date();
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(targetDate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    return `［${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} KST］`;
  }

  public getExactKstTimestamp(): string {
    return this.formatKstTimestamp();
  }

  public redact(text: string): string {
    return redactSensitive(text);
  }

  /**
   * Dispatches rich formatted message to paired Telegram chat.
   * Supports both sendAlert(opts) and sendAlert(title, lines).
   */
  async sendAlert(optsOrTitle: TelegramAlertOptions | string, optionalLines?: string[]): Promise<boolean> {
    if (!this.cachedBotToken || !this.cachedChatId) {
      this.initCredentials();
    }
    if (!this.cachedBotToken || !this.cachedChatId) {
      this.logger.debug('Telegram alert skipped: bot token or chat ID is not paired');
      return false;
    }

    let opts: TelegramAlertOptions;
    if (typeof optsOrTitle === 'string') {
      opts = {
        title: optsOrTitle,
        lines: optionalLines || [],
      };
    } else {
      opts = optsOrTitle;
    }

    const timestampHeader = this.getExactKstTimestamp();
    const categoryTag = (opts.category || 'other').toUpperCase();
    const severityIcon = opts.severity === 'CRITICAL' ? '🚨' : opts.severity === 'WARNING' ? '⚠️' : '📢';

    const messageLines = [
      timestampHeader,
      `${severityIcon} ［${categoryTag}］ ${opts.title}`,
      '━━━━━━━━━━━━━━━━━━━━',
      ...(opts.lines || []),
    ];

    const rawMessage = messageLines.join('\n');
    const safeMessage = redactSensitive(rawMessage);

    const telegramApiUrl = `https://api.telegram.org/bot${this.cachedBotToken}/sendMessage`;
    try {
      const response = await safeFetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.cachedChatId,
          text: safeMessage,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Telegram API HTTP ${response.status}: ${await response.text()}`);
        return false;
      }
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to dispatch Telegram alert: ${errMsg}`);
      return false;
    }
  }

  // 1. 국고 보조금 알림
  async notifyTreasuryGrant(payload: TreasuryGrantAlertPayload): Promise<boolean> {
    const actionLabel =
      payload.action === 'APPLY'
        ? '국고 보조금 신청 접수'
        : payload.action === 'APPROVE'
        ? '국고 보조금 승인 및 지급 완료'
        : payload.action === 'REJECT'
        ? '국고 보조금 반려'
        : payload.action === 'TARGETED_SUBSIDY'
        ? '타깃 재정 보조금 집행'
        : payload.action === 'BUDGET_DISTRIBUTION'
        ? '부문별 예산 배정'
        : payload.action === 'BUYBACK_BURN'
        ? '국고 역매수 소각 집행'
        : '국고 보조금 승인 및 지급 완료';

    const icon =
      payload.action === 'APPROVE' || payload.action === 'DISBURSED' || payload.action === 'TARGETED_SUBSIDY'
        ? '💰'
        : payload.action === 'REJECT'
        ? '❌'
        : '🏛️';

    const amt = payload.amountWld ?? payload.amount ?? '0';
    const lines = [
      `• 처리 구분: ${actionLabel}`,
      payload.grantId ? `• 보조금 식별자: #${payload.grantId}` : '',
      `• 지원 수량: ${BigInt(amt.toString()).toLocaleString('ko-KR')} WLD`,
      `• 수혜 대상: ${payload.targetUser ?? payload.applicant ?? '공공/시민'}`,
      payload.purpose ? `• 지원 목적: ${payload.purpose}` : '',
      payload.reason ? `• 감사 사유: ${payload.reason}` : '',
      payload.reviewer ? `• 심사 담당: ${payload.reviewer}` : '',
      payload.adminId ? `• 집행 관리자: ${payload.adminId.slice(0, 8)}` : '',
    ].filter(Boolean);

    return this.sendAlert({
      category: 'treasury',
      severity: 'INFO',
      title: `${icon} 국고 재정 알림: ${actionLabel}`,
      lines,
    });
  }

  // 2. 국부펀드(SWF) 자산 운용 알림
  async notifySwfTransaction(payload: SwfAlertPayload): Promise<boolean> {
    const actionLabel =
      payload.action === 'BUY'
        ? 'SWF 주식/채권 포트폴리오 매수'
        : payload.action === 'SELL'
        ? 'SWF 자산 포지션 청산 회수'
        : payload.action === 'DIVIDEND'
        ? 'SWF 배당금 국고 환원 입고'
        : payload.action === 'POLICY_UPDATE'
        ? 'SWF 운용 정책 변경'
        : 'SWF 자산 리밸런싱';

    const amt = payload.amountWld ?? payload.amount ?? '0';
    const lines = [
      `• 운용 내역: ${actionLabel}`,
      payload.assetName ? `• 투자 자산: ${payload.assetName}` : '',
      payload.summary ? `• 요약: ${payload.summary}` : '',
      `• 집행 규모: ${BigInt(amt.toString()).toLocaleString('ko-KR')} WLD`,
      payload.price ? `• 체결 기준가: ${payload.price} WLD` : '',
      payload.sourceVault ? `• 귀속/출처 금고: ${payload.sourceVault}` : '',
    ].filter(Boolean);

    return this.sendAlert({
      category: 'finance',
      severity: 'INFO',
      title: `📈 국부펀드(SWF) 운용 알림: ${actionLabel}`,
      lines,
    });
  }

  async notifySwfEvent(payload: SwfAlertPayload): Promise<boolean> {
    return this.notifySwfTransaction(payload);
  }

  // 3. 관리자 콘솔 로그인 & 2FA 인증 알림
  async notifyAdminLogin(payload: AdminLoginAlertPayload): Promise<boolean> {
    const ip = payload.ipAddress ?? payload.ip ?? 'unknown';
    const isTotp = payload.method === 'TOTP' || payload.stepUpVerified;
    const lines = [
      `• 관리자 ID: ${payload.adminId}`,
      payload.email ? `• 이메일: ${payload.email}` : '',
      `• 접속 IP: ${ip}`,
      payload.userAgent ? `• 브라우저: ${payload.userAgent.slice(0, 80)}` : '',
      `• 인증 방식: ${isTotp ? '2FA/TOTP 스텝업 인증' : '1차 관리자 인증'}`,
    ].filter(Boolean);

    return this.sendAlert({
      category: 'admin',
      severity: 'WARNING',
      title: '🔐 관리자 콘솔 접속 & 인증 완료',
      lines,
    });
  }

  // 4. 일반 유저 로그인 알림
  async notifyUserLogin(payload: UserLoginAlertPayload): Promise<boolean> {
    // Member alerts are OFF until the destination and legal basis have been
    // explicitly approved. This is independent of Telegram bot configuration.
    if (process.env.TELEGRAM_MEMBER_LOGIN_ALERTS_APPROVED !== 'true' || payload.consentCurrent !== true) {
      return false;
    }
    // Never serialize caller-controlled or identifying payload fields to a
    // third-party transport, including IPs and user agents.
    return this.sendAlert({
      category: 'security',
      severity: 'INFO',
      title: '👤 회원 로그인 감지',
      lines: ['• 개인정보를 포함하지 않는 로그인 이벤트'],
    });
  }

  // 5. 신규 회원 가입 알림
  async notifyUserRegister(_payload: UserRegisterAlertPayload): Promise<boolean> {
    // No approved post-verification registration event exists yet. A pending
    // email verification must never trigger an external notification.
    return false;
  }

  async notifyUserRegistered(payload: UserRegisterAlertPayload): Promise<boolean> {
    return this.notifyUserRegister(payload);
  }

  // 6. 카지노 대형 잭팟 알림
  async notifyCasinoJackpot(payload: CasinoJackpotAlertPayload): Promise<boolean> {
    const game = payload.gameName ?? payload.game ?? '카지노 게임';
    const user = payload.userName ?? payload.username ?? '익명의 승부사';
    const bet = payload.betAmountWld ?? payload.betAmount ?? '0';
    const win = payload.winAmountWld ?? payload.winAmount ?? '0';
    const mult = payload.multiplier !== undefined
      ? (typeof payload.multiplier === 'number' ? `${payload.multiplier}x` : String(payload.multiplier).endsWith('x') ? payload.multiplier : `${payload.multiplier}x`)
      : '';

    const lines = [
      `• 게임 종류: ${game}`,
      `• 플레이어: ${user}`,
      `• 베팅 금액: ${BigInt(bet.toString()).toLocaleString('ko-KR')} WLD`,
      `• 당첨 금액: ${BigInt(win.toString()).toLocaleString('ko-KR')} WLD`,
      mult ? `• 배당률: ${mult}` : '',
    ].filter(Boolean);

    return this.sendAlert({
      category: 'casino',
      severity: 'INFO',
      title: '🎰 카지노 잭팟 대박 당첨!',
      lines,
    });
  }

  // 7. 대규모 금융 이체 알림
  async notifyHighValueTransfer(payload: HighValueTransferAlertPayload): Promise<boolean> {
    const amt = payload.amountWld ?? payload.amount ?? '0';
    const lines = [
      `• 거래 유형: ${payload.type ?? 'P2P 지갑 이체'}`,
      `• 송금자: ${payload.fromUser.slice(0, 8)}...`,
      `• 수신자: ${payload.toUser.slice(0, 8)}...`,
      `• 이체 금액: ${BigInt(amt.toString()).toLocaleString('ko-KR')} ${payload.currency || 'WLD'}`,
      payload.transactionId ? `• 트랜잭션: #${payload.transactionId.slice(0, 8)}` : '',
    ].filter(Boolean);

    return this.sendAlert({
      category: 'finance',
      severity: 'WARNING',
      title: '💸 고액 금융 트랜잭션 감지',
      lines,
    });
  }
}
