import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

export interface LandmarkAuction {
  id: string;
  name: string;
  district: string;
  districtBadge: string;
  currentHighestBid: number;
  minBidIncrement: number;
  leaderNickname: string;
  endTimestamp: number;
  totalShares: number;
  annualYieldRate: number;
  dailyRentPool: number;
  userBid: number;
  userShares: number;
  unclaimedRent: number;
  imageUrl: string;
  description: string;
}

// Mock in-memory auction store for live interaction
let auctions: LandmarkAuction[] = [
  {
    id: 'landmark-gn-prime',
    name: '강남 머니버스 프라임 타워',
    district: 'GANGNAM',
    districtBadge: '강남 프라임',
    currentHighestBid: 520000,
    minBidIncrement: 10000,
    leaderNickname: '월덕고래_강남성골',
    endTimestamp: Date.now() + 1000 * 60 * 60 * 18, // 18 hours left
    totalShares: 100,
    annualYieldRate: 14.8,
    dailyRentPool: 35000,
    userBid: 0,
    userShares: 5,
    unclaimedRent: 1750,
    imageUrl: '/spaces/gangnam-tower.png',
    description: '테헤란로 중심 랜드마크. 강남 상권 주식·카지노 거래량의 2.5%가 매일 임대료로 누적 배당됩니다.',
  },
  {
    id: 'landmark-yd-ifc',
    name: '여의도 국제금융센터 IFC',
    district: 'YEOUIDO',
    districtBadge: '여의도 금융',
    currentHighestBid: 430000,
    minBidIncrement: 10000,
    leaderNickname: '퀀트마스터_여의도',
    endTimestamp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours left
    totalShares: 100,
    annualYieldRate: 12.5,
    dailyRentPool: 28000,
    userBid: 0,
    userShares: 8,
    unclaimedRent: 2240,
    imageUrl: '/spaces/yeouido-ifc.png',
    description: '증권가 중심 랜드마크. 국채(KTB) 및 가상 주식 거래 수수료의 1.8%가 지분율에 따라 일일 배당됩니다.',
  },
  {
    id: 'landmark-pg-techno',
    name: '판교 테크밸리 메가코어',
    district: 'PANGYO',
    districtBadge: '판교 IT',
    currentHighestBid: 395000,
    minBidIncrement: 5000,
    leaderNickname: '판교알고리즘',
    endTimestamp: Date.now() + 1000 * 60 * 60 * 36, // 36 hours left
    totalShares: 100,
    annualYieldRate: 15.2,
    dailyRentPool: 32000,
    userBid: 0,
    userShares: 0,
    unclaimedRent: 0,
    imageUrl: '/spaces/pangyo-core.png',
    description: '테크 기업 입주 메가코어. AI 퀀트 봇 및 파생상품 매매 수수료의 2.0%가 일일 배당됩니다.',
  },
  {
    id: 'landmark-hn-hill',
    name: '한남 더힐 프라이빗 펜트하우스',
    district: 'HANNAM',
    districtBadge: '한남 하이엔드',
    currentHighestBid: 610000,
    minBidIncrement: 15000,
    leaderNickname: '시크릿고래_한남',
    endTimestamp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours left
    totalShares: 50,
    annualYieldRate: 11.0,
    dailyRentPool: 25000,
    userBid: 0,
    userShares: 2,
    unclaimedRent: 1000,
    imageUrl: '/spaces/hannam-pent.png',
    description: '최상위 VIP 하이엔드 펜트하우스. 고액 VIP 프라이빗 룸 거래 수수료의 3.0%가 지분율로 배당됩니다.',
  },
];

export async function GET() {
  const viewer = await viewerOrUnknown();
  const loggedIn = Boolean(viewer && viewer.signedIn);
  return NextResponse.json({
    ok: true,
    loggedIn,
    auctions,
    totalUnclaimedRent: auctions.reduce((acc, a) => acc + (a.unclaimedRent || 0), 0),
    serverTime: Date.now(),
  });
}

export async function POST(req: Request) {
  const viewer = await viewerOrUnknown();
  const loggedIn = Boolean(viewer && viewer.signedIn);
  if (!loggedIn) {
    return NextResponse.json({ ok: false, error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { landmarkId, bidAmount } = body;

    const auction = auctions.find((a) => a.id === landmarkId);
    if (!auction) {
      return NextResponse.json({ ok: false, error: '존재하지 않는 랜드마크 경매입니다.' }, { status: 404 });
    }

    const minBid = auction.currentHighestBid + auction.minBidIncrement;
    if (Number(bidAmount) < minBid) {
      return NextResponse.json(
        { ok: false, error: `최소 입찰 금액은 ${minBid.toLocaleString()} WLD 이상이어야 합니다.` },
        { status: 400 }
      );
    }

    // 입찰 성공 반영
    auction.currentHighestBid = Number(bidAmount);
    auction.leaderNickname = '내 지갑 (본인)';
    auction.userBid = Number(bidAmount);

    return NextResponse.json({
      ok: true,
      message: `${auction.name}에 ${Number(bidAmount).toLocaleString()} WLD로 최고가 입찰되었습니다!`,
      auction,
    });
  } catch {
    return NextResponse.json({ ok: false, error: '입찰 요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
