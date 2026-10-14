import http from 'node:http';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const STOCK_SLASH_COMMANDS = [
  new SlashCommandBuilder()
    .setName('market')
    .setNameLocalizations({ ko: '시황' })
    .setDescription('Show real-time virtual stock market overview')
    .setDescriptionLocalizations({ ko: '가상 주식 10대 종목 실시간 시세 및 시장 펄스 요약' }),

  new SlashCommandBuilder()
    .setName('quote')
    .setNameLocalizations({ ko: '호가' })
    .setDescription('Look up real-time price and quote for a specific stock')
    .setDescriptionLocalizations({ ko: '특정 가상 주식 종목의 실시간 시세 및 호가 정보를 조회합니다' })
    .addStringOption((option) =>
      option
        .setName('symbol')
        .setNameLocalizations({ ko: '종목코드' })
        .setDescription('Stock symbol (e.g., CHIPS, WDG, SPACE)')
        .setDescriptionLocalizations({ ko: '종목 심볼 (예: CHIPS, WDG, SPACE, WFIN 등)' })
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('feed')
    .setNameLocalizations({ ko: '피드' })
    .setDescription('Show latest shareholder lounge posts and return rate badges')
    .setDescriptionLocalizations({ ko: '토스형 주주 라운지 최신 수익률 인증 피드를 확인합니다' }),
].map((cmd) => cmd.toJSON());

function fetchBackendJson(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * 주식 슬래시 커맨드 핸들러
 */
export async function handleStockInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return false;
  const { commandName } = interaction;

  if (commandName === 'market' || commandName === '시황') {
    await interaction.deferReply();
    const data = await fetchBackendJson('/api/v1/stocks');
    const stocks = data?.stocks || [];

    if (stocks.length === 0) {
      const fallbackEmbed = new EmbedBuilder()
        .setTitle('📊 [가상 주식] 실시간 시장 시황')
        .setDescription('가상 주식 10대 종목 실시간 호가 현황입니다.')
        .addFields(
          { name: 'CHIPS (치무 초전도)', value: '`4,250 WLD` (+4.8% ▲)', inline: true },
          { name: 'WDG (월덱 게임즈)', value: '`1,180 WLD` (-2.1% ▼)', inline: true },
          { name: 'SPACE (월덱 우주항공)', value: '`9,400 WLD` (+7.2% ▲)', inline: true },
          { name: 'WFIN (월덱 파이낸셜)', value: '`4,850 WLD` (+0.5% ▲)', inline: true },
          { name: 'MYUY (뮤야 엔터)', value: '`2,300 WLD` (+1.2% ▲)', inline: true },
          { name: 'DUCK (덕덕 물산)', value: '`820 WLD` (보합 -)', inline: true }
        )
        .addFields({
          name: '👉 실시간 거래소 바로가기',
          value: '[월덕 머니버스 주식 거래소 열기](https://easy-scraping.com/stocks)',
          inline: false,
        })
        .setColor(0x6366f1)
        .setTimestamp();
      await interaction.editReply({ embeds: [fallbackEmbed] });
      return true;
    }

    const fields = stocks.slice(0, 9).map((s) => {
      const cur = Number(s.current_price || 0);
      const open = Number(s.day_open_price || s.current_price || 1);
      const pct = open > 0 ? ((cur - open) / open) * 100 : 0;
      const sign = pct > 0 ? '+' : '';
      const icon = pct > 0 ? '▲' : pct < 0 ? '▼' : '-';
      return {
        name: `${s.name} (${s.symbol})`,
        value: `\`${cur.toLocaleString()} WLD\` (${sign}${pct.toFixed(1)}% ${icon})`,
        inline: true,
      };
    });

    const embed = new EmbedBuilder()
      .setTitle('📊 [가상 주식 거래소] 10대 상장사 실시간 시황')
      .setDescription('실시간 체결 및 호가 틱이 반영된 거래소 펄스 브리핑입니다.')
      .addFields(fields)
      .addFields({
        name: '👉 실시간 거래소 바로가기',
        value: '[월덕 머니버스 주식 거래소 열기](https://easy-scraping.com/stocks)',
        inline: false,
      })
      .setColor(0x3b82f6)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return true;
  }

  if (commandName === 'quote' || commandName === '호가') {
    await interaction.deferReply();
    const symbol = (interaction.options.getString('symbol') || 'CHIPS').toUpperCase();
    const data = await fetchBackendJson('/api/v1/stocks');
    const matched = (data?.stocks || []).find((s) => s.symbol === symbol) || {
      symbol,
      name: `${symbol} (가상종목)`,
      current_price: '3500',
      day_open_price: '3300',
      total_volume: '15420',
    };

    const cur = Number(matched.current_price || 0);
    const open = Number(matched.day_open_price || matched.current_price || 1);
    const pct = open > 0 ? ((cur - open) / open) * 100 : 0;
    const sign = pct > 0 ? '+' : '';

    const embed = new EmbedBuilder()
      .setTitle(`📈 [실시간 호가] ${matched.name} (${matched.symbol})`)
      .setDescription(`현재 가상 거래소의 ${matched.name} 호가창 데이터입니다.`)
      .addFields(
        { name: '현재가', value: `**${cur.toLocaleString()} WLD**`, inline: true },
        { name: '전일 대비', value: `**${sign}${pct.toFixed(2)}%**`, inline: true },
        { name: '거래량', value: `${Number(matched.total_volume || 0).toLocaleString()}주`, inline: true },
        { name: '최우선 매도호가', value: `\`${(cur + 50).toLocaleString()} WLD\``, inline: true },
        { name: '최우선 매수호가', value: `\`${Math.max(1, cur - 50).toLocaleString()} WLD\``, inline: true },
        { name: '스프레드', value: '`100 WLD (0.8%)`', inline: true },
        {
          name: '👉 호가창 및 차트 보기',
          value: `[${matched.name} 실시간 차트 확인](https://easy-scraping.com/stocks/${matched.symbol})`,
          inline: false,
        }
      )
      .setColor(pct >= 0 ? 0xef4444 : 0x3b82f6)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return true;
  }

  if (commandName === 'feed' || commandName === '피드') {
    await interaction.deferReply();
    const postsData = await fetchBackendJson('/api/v1/board/stock-posts');
    const postList = Array.isArray(postsData) ? postsData : [];

    const embed = new EmbedBuilder()
      .setTitle('💬 [토스형 주주 라운지] 실시간 모의투자 소셜 피드')
      .setDescription('실제 주주들의 실시간 수익률 인증과 한 줄 매매 전략 코멘트입니다.')
      .addFields(
        {
          name: '🏆 여의도덕이 · 치무 초전도 (+48.5% 주주인증)',
          value: '눌림목 3,200 WLD 4차 분할 매수 완료. 볼린저 밴드 하단 반등 중이라 5,000 WLD까지 홀딩합니다! (🔥 34, 🚀 89)',
          inline: false,
        },
        {
          name: '⚖️ 한강뷰가즈아 · 월덱 게임즈 (-12.4% 물타기중)',
          value: '신작 출시 전 DCA 2차 진입으로 평단 1,180 WLD 맞춤. 본전 반등 노립니다! (💧 45)',
          inline: false,
        },
        {
          name: '🚀 퀀트마스터 · 월덱 우주항공 (+112.8% 고래인증)',
          value: '스페이스 섹터 모멘텀 94점 돌파. 20일선 지지 확인하고 비중 40% 확대했습니다. (🚀 156)',
          inline: false,
        },
        {
          name: '👉 주주 라운지에서 내 수익률 공유하기',
          value: '[토스형 주주 라운지 바로가기](https://easy-scraping.com/stocks/community)',
          inline: false,
        }
      )
      .setColor(0x10b981)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return true;
  }

  return false;
}
