import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const activity = readFileSync('src/app/admin/logs/activity/page.tsx', 'utf8');
const audit = readFileSync('src/app/admin/logs/page.tsx', 'utf8');
const userDetail = readFileSync('src/app/admin/users/[id]/page.tsx', 'utf8');

describe('admin member log routing', () => {
  it('passes the selected member UUID into the activity telemetry API', () => {
    expect(activity).toContain("const userId = typeof params.userId === 'string'");
    expect(activity).toContain("query.set('userId', userId)");
    expect(activity).toContain('name="userId"');
  });

  it('links a user detail directly to that member telemetry', () => {
    expect(userDetail).toContain('/admin/logs/activity?userId=');
    expect(userDetail).toContain('사용자 활동 로그 보기');
    expect(userDetail).toContain('관리 조치 감사 로그');
  });

  it('does not describe an empty admin audit result as absence of all user activity', () => {
    expect(audit).toContain('이 회원을 대상으로 한 관리자 조작 감사 기록은 없습니다.');
    expect(audit).toContain('/admin/logs/activity?userId=');
    expect(audit).toContain('사용자 접속 · 체류 · 클릭 로그 보기');
  });
});
