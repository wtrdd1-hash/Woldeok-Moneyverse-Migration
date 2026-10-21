import { safeFetch } from '../security/ssrf-defense';

const DISCORD_API_ORIGIN = 'https://discord.com';
const DEFAULT_ADMIN_USER_ID = '886478189520637992';

export interface AdminDiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface AdminDiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: AdminDiscordEmbedField[];
  footer?: { text: string };
  timestamp?: string;
}

// Memory cache for user's 1:1 DM channel
let cachedAdminDmChannelId: string | null = null;

/**
 * Send an authorized admin a high-priority direct message (1:1 DM) on Discord.
 * Always delivers directly to the configured admin account regardless of channel routing.
 */
export async function sendDirectAdminAlert(
  embed: AdminDiscordEmbed,
  overrideUserId?: string,
): Promise<{ success: boolean; channelId?: string; error?: string }> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return { success: false, error: 'DISCORD_BOT_TOKEN_NOT_CONFIGURED' };
  }

  const userId = overrideUserId || process.env.DISCORD_ADMIN_ALERT_USER_ID || DEFAULT_ADMIN_USER_ID;

  try {
    // 1. Get or create 1:1 DM channel
    let dmChannelId = cachedAdminDmChannelId;
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
        return { success: false, error: `OPEN_DM_FAILED_${createDmRes.status}` };
      }

      const dmChannelData = (await createDmRes.json()) as { id?: string };
      if (!dmChannelData.id) {
        return { success: false, error: 'NO_DM_CHANNEL_ID_RETURNED' };
      }
      dmChannelId = dmChannelData.id;
      cachedAdminDmChannelId = dmChannelId;
    }

    // 2. Send embed message
    const payload = {
      allowed_mentions: { parse: [] },
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
      return { success: true, channelId: dmChannelId };
    }

    if (sendMsgRes.status === 404 || sendMsgRes.status === 403) {
      cachedAdminDmChannelId = null;
    }
    return { success: false, error: `SEND_DM_FAILED_${sendMsgRes.status}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'UNKNOWN_ERROR' };
  }
}
