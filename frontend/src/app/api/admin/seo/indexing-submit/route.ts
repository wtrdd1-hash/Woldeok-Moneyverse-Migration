import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { submitToIndexNow } from '@/lib/indexnow';
import { seoResponse, verifySeoOperator, verifySeoWriteOrigin } from '@/lib/admin-seo-authority';

export const dynamic = 'force-dynamic';

interface IndexingRequestPayload {
  readonly batchSize?: number;
  readonly targetCategory?: 'pseo' | 'calculators' | 'all';
}

/** IndexNow notification requires an elevated operator. It does NOT prove Google indexing. */
export async function POST(req: Request) {
  const wrongOrigin = verifySeoWriteOrigin(req);
  if (wrongOrigin) return wrongOrigin;
  const denied = await verifySeoOperator();
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => ({}))) as IndexingRequestPayload;
    if (
      body.batchSize !== undefined &&
      (!Number.isInteger(body.batchSize) || body.batchSize < 1 || body.batchSize > 200)
    ) {
      return seoResponse({ success: false, error: 'invalid_batch_size' }, 400);
    }
    if (body.targetCategory !== undefined && !['pseo', 'calculators', 'all'].includes(body.targetCategory)) {
      return seoResponse({ success: false, error: 'invalid_target_category' }, 400);
    }
    const targetCategory = body.targetCategory ?? 'all';
    const batchSize = body.batchSize ?? 100;
    const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    const calculatorUrls: string[] = [
      'loan-interest-calculator',
      'compound-calculator',
      'dividend-tax-calculator',
      'capital-gains-tax-calculator',
      'retirement-calculator',
      'salary-calculator',
      'isa-calculator',
      'pension-tax-calculator',
      'youth-leap-calculator',
      'gift-tax-calculator',
      'real-estate-calculator',
      'kimchi-premium-calculator',
    ].map((name) => `${base}/tools/${name}`);
    calculatorUrls.push(`${base}/tools`);
    const pseoUrls: string[] = [];
    if (targetCategory !== 'calculators') {
      for (const slug of ALL_PSEO_POPULAR_SLUGS)
        pseoUrls.push(`${base}/tools/stock-calculator/${slug}`);
    }
    if (targetCategory !== 'pseo') {
      for (const preset of ALL_SEO_PRESETS) {
        if (preset.category === 'compound')
          calculatorUrls.push(`${base}/tools/compound-calculator/${preset.slug}`);
      }
    }
    const urls = [...new Set([
      ...(targetCategory === 'pseo' ? [] : calculatorUrls),
      ...(targetCategory === 'calculators' ? [] : pseoUrls),
    ])];
    const selectedUrls = urls.slice(0, batchSize);
    const result = await submitToIndexNow(selectedUrls);
    if (!result.success) {
      return seoResponse(
        {
          success: false,
          error: 'indexnow_submission_failed',
          indexNowStatus: result.status,
          submittedCount: 0,
          attemptedCount: selectedUrls.length,
          indexingConfirmed: false,
        },
        502,
      );
    }
    return seoResponse(
      {
        success: true,
        message: `IndexNow에 URL ${result.submittedCount}개 변경 통보가 접수되었습니다. 실제 검색엔진 색인은 확인되지 않았습니다.`,
        submittedCount: result.submittedCount,
        attemptedCount: selectedUrls.length,
        totalUrlsAvailable: urls.length,
        targetCategory,
        batchSize: result.submittedCount,
        submittedUrls: selectedUrls.slice(0, 6),
        indexNowSuccess: true,
        indexNowStatus: result.status,
        indexingConfirmed: false,
        timestamp: new Date().toISOString(),
      },
      result.status === 202 ? 202 : 200,
    );
  } catch {
    return seoResponse(
      { success: false, error: 'indexnow_unavailable', indexingConfirmed: false },
      502,
    );
  }
}
