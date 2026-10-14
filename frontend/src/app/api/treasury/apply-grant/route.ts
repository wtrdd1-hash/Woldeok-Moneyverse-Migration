import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

function getGrantsFilePath(): string {
  const sharedDir = '/srv/moneyverse-data/shared/data';
  if (fs.existsSync('/srv/moneyverse-data/shared')) {
    if (!fs.existsSync(sharedDir)) {
      try {
        fs.mkdirSync(sharedDir, { recursive: true });
      } catch (err) {
        console.debug('[apply-grant] mkdir sharedDir error:', err);
      }
    }
    return path.join(sharedDir, 'treasury-grants.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      console.debug('[apply-grant] mkdir dataDir error:', err);
    }
  }
  return path.join(dataDir, 'treasury-grants.json');
}

export function loadGrants(): TreasuryGrantApplication[] {
  try {
    const filePath = getGrantsFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as TreasuryGrantApplication[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[TreasuryGrants] Failed to read from disk:', err);
  }
  return [];
}

export function saveGrants(grants: TreasuryGrantApplication[]): void {
  try {
    const filePath = getGrantsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(grants, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TreasuryGrants] Failed to write to disk:', err);
  }
}

export async function POST(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요한 서비스입니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      businessName?: string;
      requestedAmountWld?: number;
      businessPlan?: string;
    };

    const businessName = body.businessName?.trim();
    const requestedAmountWld = body.requestedAmountWld || 0;
    const businessPlan = body.businessPlan?.trim();

    if (!businessName || businessName.length < 2) {
      return NextResponse.json(
        { ok: false, message: '기업/프로젝트명은 최소 2자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    if (requestedAmountWld <= 0 || requestedAmountWld > 100000) {
      return NextResponse.json(
        { ok: false, message: '신청 지원금은 1 WLD 이상 100,000 WLD 이하여야 합니다.' },
        { status: 400 }
      );
    }

    if (!businessPlan || businessPlan.length < 10) {
      return NextResponse.json(
        { ok: false, message: '사업 기획서 및 지원 사유는 10자 이상 구체적으로 작성해주세요.' },
        { status: 400 }
      );
    }

    const applicationId = `GRANT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const newGrant: TreasuryGrantApplication = {
      id: applicationId,
      businessName,
      applicantId: 'usr-citizen',
      applicantMasked: 'applicant***citizen',
      requestedAmountWld,
      businessPlan,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    };

    // R07 해결: 신청서를 영속 저장소에 즉시 보존하여 관리자 심사 대시보드와 동기화
    const currentGrants = loadGrants();
    saveGrants([newGrant, ...currentGrants]);

    return NextResponse.json({
      ok: true,
      message: `창업 그랜트 지원금 신청서가 성공적으로 접수되었습니다. (접수번호: ${applicationId}) 관리자 심사 후 지급됩니다.`,
      application: newGrant,
      applicationId,
      businessName,
      requestedAmountWld,
      status: 'PENDING_REVIEW',
      submittedAt: newGrant.submittedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
