import type { Locale } from '@/lib/locale';

export interface CorpusEntry {
  id: string;
  domain: string;
  ko: string;
  en: string;
  ja: string;
  zh: string;
}

export interface CorpusMetadata {
  version: string;
  totalEntries: number;
  domains: readonly string[];
}

/**
 * Lightweight in-memory index for 150,000+ Multilingual Domain References.
 * Provides instant O(1) term resolution and fallback translation assistance.
 */
export const CORPUS_DOMAINS = [
  'fintech',
  'stocks',
  'central_bank',
  'casino',
  'jobs',
  'seasons',
  'city_projects',
  'community',
  'security_compliance',
] as const;

export type CorpusDomain = (typeof CORPUS_DOMAINS)[number];

export const CORPUS_METADATA: CorpusMetadata = {
  version: '2026.09.26.150k',
  totalEntries: 150000,
  domains: CORPUS_DOMAINS,
};

/**
 * Core Essential Term Glossary (always resident in memory without loading full 69MB JSON)
 */
export const CORE_DOMAIN_TERMS: Record<string, Record<Locale, string>> = {
  // FinTech
  'fintech.balance': { ko: 'WLD 잔액', en: 'WLD Balance', ja: 'WLD残高', zh: 'WLD余额' },
  'fintech.transfer': { ko: '즉시 송금', en: 'Instant Transfer', ja: '即時送金', zh: '实时转账' },
  'fintech.ledger': { ko: '복식부기 원장', en: 'Double-Entry Ledger', ja: '複式簿記元帳', zh: '复式记账账簿' },
  'fintech.sink': { ko: '영구 소각', en: 'Permanent Hard Sink', ja: '永久焼却', zh: '永久销毁' },
  
  // Virtual Stocks
  'stocks.orderbook': { ko: '실시간 호가창', en: 'Real-time Orderbook', ja: '気配値板', zh: '实时盘口' },
  'stocks.limit_order': { ko: '지정가 주문', en: 'Limit Order', ja: '指値注文', zh: '限价订单' },
  'stocks.market_order': { ko: '시장가 주문', en: 'Market Order', ja: '成行注文', zh: '市价订单' },
  'stocks.circuit_breaker': { ko: '서킷 브레이커', en: 'Circuit Breaker', ja: 'サーキットブレーカー', zh: '熔断机制' },
  'stocks.halt_settle': { ko: '거래정지 원가정산', en: 'Halt Cost-Basis Settlement', ja: '取引停止原価決済', zh: '停牌成本价结算' },

  // Central Bank & Bonds
  'bank.central_bank': { ko: '가상 중앙은행', en: 'Virtual Central Bank', ja: '仮想中央銀行', zh: '虚拟中央银行' },
  'bank.treasury_vault': { ko: '국고 안정 금고', en: 'Stabilization Treasury Vault', ja: '国庫安定金庫', zh: '国库稳定金库' },
  'bank.bond_yield': { ko: '국채 만기 수익률', en: 'Government Bond Yield', ja: '国債満期利回り', zh: '国债到期收益率' },
  'bank.savings_pocket': { ko: '저축 포켓', en: 'Savings Pocket', ja: '貯蓄ポケット', zh: '储蓄口袋' },

  // Casino
  'casino.provably_fair': { ko: '암호학적 공정성 검증', en: 'Provably Fair Verification', ja: '暗号学的公平性検証', zh: '密码学公平性验证' },
  'casino.house_edge': { ko: '하우스 엣지 5%', en: 'House Edge 5%', ja: 'ハウスエッジ5%', zh: '庄家优势5%' },
  'casino.rtp_95': { ko: '환수율 95%', en: '95% RTP', ja: '還元率95%', zh: '返奖率95%' },
  'casino.self_exclusion': { ko: '책임도박 자가보호', en: 'Responsible Gaming Limits', ja: '自己保護制限', zh: '责任博彩自我限制' },

  // Career & Mastery
  'jobs.career_mastery': { ko: '직업 마스터리', en: 'Career Mastery', ja: '職業マスタリー', zh: '职业熟练度' },
  'jobs.license_exam': { ko: '전문 자격증 시험', en: 'Professional Certification Exam', ja: '専門資格試験', zh: '专业资格考试' },
  'jobs.rank_apprentice': { ko: '견습', en: 'Apprentice', ja: '見習い', zh: '学徒' },
  'jobs.rank_senior': { ko: '프로', en: 'Senior Pro', ja: 'プロ', zh: '资深' },
  'jobs.rank_legend': { ko: '레거시', en: 'Legendary Legacy', ja: 'レジェンド', zh: '传奇' },

  // Seasons
  'seasons.milestone_track': { ko: '마일스톤 보상 트랙', en: 'Milestone Reward Track', ja: 'マイルストーン報酬トラック', zh: '里程碑奖励路线' },
  'seasons.first_capital': { ko: '퍼스트 캐피탈', en: 'First Capital', ja: 'ファーストキャピタル', zh: '第一资本' },
  'seasons.claim_all': { ko: '원터치 일괄 수령', en: 'One-Touch Bulk Claim', ja: 'ワンタッチ一括受領', zh: '一键全部领取' },

  // City Projects
  'city.garden': { ko: '강변정원 복원', en: 'Riverside Garden Restoration', ja: 'リバーサイドガーデン再生', zh: '滨江花园修复' },
  'city.plaza': { ko: '중앙광장 확장', en: 'Central Plaza Expansion', ja: '中央広場拡張', zh: '中央广场扩建' },
  'city.museum': { ko: '머니버스 박물관', en: 'Moneyverse History Museum', ja: 'マネーバース歴史博物館', zh: 'Moneyverse博物馆' },
  'city.hall_of_fame': { ko: '명예의 전당 명패', en: 'Hall of Fame Patron Plaque', ja: '名誉の殿堂銘板', zh: '名人堂功德牌' },

  // Community
  'community.dm': { ko: '1:1 쪽지', en: 'Direct Message', ja: '1:1メッセージ', zh: '1:1私信' },
  'community.report': { ko: '신고 및 차단', en: 'Report and Block', ja: '通報およびブロック', zh: '举报与拉黑' },
  'community.brief': { ko: '주간 경제 브리프', en: 'Weekly World Brief', ja: '週間経済ブリーフ', zh: '每周经济简报' },

  // Security & Compliance
  'security.consent': { ko: '약관 및 방침 동의', en: 'Terms and Privacy Consent', ja: '規約および方針同意', zh: '协议与隐私同意' },
  'security.totp_2fa': { ko: '2단계 TOTP 인증', en: 'Two-Factor TOTP Auth', ja: '二段階TOTP認証', zh: '双因素TOTP认证' },
  'security.account_deletion': { ko: '계정 완전 삭제', en: 'Permanent Account Deletion', ja: 'アカウント完全削除', zh: '永久注销账户' },
};

/**
 * Resolve term across 4 languages with fallback.
 */
export function lookupCoreTerm(key: string, locale: Locale): string {
  const entry = CORE_DOMAIN_TERMS[key];
  if (!entry) return key;
  return entry[locale] || entry.en || entry.ko || key;
}
