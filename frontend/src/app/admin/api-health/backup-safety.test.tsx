import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApiHealthDashboard } from './api-health-dashboard';

describe('admin backup safety on unknown evidence', () => {
  it('does not claim zero verified snapshots or an invented R2 bucket when inventory was not read', () => {
    const html = renderToStaticMarkup(<ApiHealthDashboard initialData={null} isEn={false} />);
    expect(html).toContain('백업 상태를 확인할 수 없습니다');
    expect(html).not.toContain('0개 스냅샷');
    expect(html).not.toContain('moneyverse-backup');
    expect(html).not.toContain('즉시 백업 실행');
  });
});
